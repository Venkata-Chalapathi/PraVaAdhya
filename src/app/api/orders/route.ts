import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyJWT } from "@/lib/auth-crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, address, items, notes } = body;

    if (!name || !email || !phone || !address || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Missing required checkout fields." },
        { status: 400 }
      );
    }

    // 1. Authenticate user if cookie exists (link order to registered customer account)
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    let userId: string | null = null;
    if (token) {
      const payload = await verifyJWT(token);
      if (payload) userId = payload.userId;
    }

    // 2. Fetch prices from database (server validation) to prevent client price tampering
    const menuItemIds = items.map((i) => i.menuItemId);
    const dbMenuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
    });

    const menuItemsMap = new Map(dbMenuItems.map((i) => [i.id, i]));
    
    let subtotal = 0;
    const validatedItems: { menuItemId: string; quantity: number; price: number }[] = [];

    for (const item of items) {
      const dbItem = menuItemsMap.get(item.menuItemId);
      if (!dbItem) {
        return NextResponse.json(
          { success: false, message: `Dishes with ID ${item.menuItemId} no longer exists.` },
          { status: 400 }
        );
      }
      if (!dbItem.isAvailable) {
        return NextResponse.json(
          { success: false, message: `Dish '${dbItem.name}' is currently out of stock.` },
          { status: 400 }
        );
      }

      subtotal += dbItem.price * item.quantity;
      validatedItems.push({
        menuItemId: dbItem.id,
        quantity: item.quantity,
        price: dbItem.price,
      });
    }

    // 3. Load dynamic GST & Delivery settings from database
    const settingsList = await prisma.setting.findMany();
    const settingsMap = new Map(settingsList.map((s) => [s.key, s.value]));
    
    const gstRate = Number(settingsMap.get("gst_percentage") || 0);
    const deliveryFee = Number(settingsMap.get("delivery_fee") || 0);

    const gstAmount = Math.round(subtotal * (gstRate / 100));
    const totalAmount = subtotal + gstAmount + deliveryFee;

    // 4. Database transactional insert (ensuring database consistency)
    const resultOrder = await prisma.$transaction(async (tx) => {
      // Create or resolve customer profile by email
      let customer = await tx.customer.findUnique({
        where: { email },
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            name,
            email,
            phone,
            userId,
          },
        });
      } else {
        // Update customer profile linkage and order counters
        await tx.customer.update({
          where: { id: customer.id },
          data: {
            phone,
            name, // update name if changed
            userId: userId || customer.userId, // link user account if not yet linked
            totalOrders: { increment: 1 },
            lastOrderDate: new Date(),
          },
        });
      }

      // Create Order
      const order = await tx.order.create({
        data: {
          customerId: customer.id,
          totalAmount,
          status: "PENDING",
          notes,
          items: {
            create: validatedItems.map((v) => ({
              menuItemId: v.menuItemId,
              quantity: v.quantity,
              price: v.price,
            })),
          },
        },
      });

      // Create Admin notification log
      await tx.notification.create({
        data: {
          type: "NEW_ORDER",
          message: `New Order #${order.id.slice(-6).toUpperCase()} placed by ${name} (₹${totalAmount})`,
        },
      });

      return order;
    });

    return NextResponse.json({
      success: true,
      message: "Order placed successfully!",
      orderId: resultOrder.id,
      totalAmount: resultOrder.totalAmount,
    });
  } catch (error) {
    console.error("Checkout process failed:", error);
    return NextResponse.json(
      { success: false, message: "An internal error occurred during checkout." },
      { status: 500 }
    );
  }
}
