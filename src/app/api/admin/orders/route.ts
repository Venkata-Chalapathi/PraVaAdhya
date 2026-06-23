import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: Fetch all orders in the system with customer details and items
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        items: {
          include: {
            menuItem: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Error reading admin orders list:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders." },
      { status: 500 }
    );
  }
}

// PATCH: Update order lifecycle status (Pending -> Confirmed -> Preparing -> Ready -> Out For Delivery -> Delivered -> Cancelled)
export async function PATCH(request: Request) {
  try {
    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: "Order ID and Status are required." },
        { status: 400 }
      );
    }

    const normStatus = status.toUpperCase();
    const allowedStatuses = [
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "READY",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(normStatus)) {
      return NextResponse.json({ success: false, error: "Invalid status value." }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: normStatus },
    });

    return NextResponse.json({
      success: true,
      message: `Order #${orderId.slice(-6).toUpperCase()} status updated to ${normStatus}.`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order status." },
      { status: 500 }
    );
  }
}
