import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: Fetch customers list, handle search, filters, and paginate results
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const minOrders = Number(searchParams.get("minOrders") || 0);
    const minSpending = Number(searchParams.get("minSpending") || 0);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const skip = (page - 1) * limit;

    // Build Prisma search query
    const whereQuery: any = {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ],
    };

    // We can filter by orders count or spending by loading them and sorting,
    // or by loading customers and mapping totals in code (since typical datasets are manageable)
    const allCustomers = await prisma.customer.findMany({
      where: whereQuery,
      include: {
        orders: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
        },
        reservations: {
          select: {
            id: true,
            date: true,
            time: true,
            guests: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Map statistics
    const mapped = allCustomers.map((cust) => {
      const completedOrders = cust.orders.filter(o => o.status === "DELIVERED");
      const totalOrders = cust.orders.length;
      const totalSpending = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const lastOrderDate = cust.orders.length > 0 
        ? new Date(Math.max(...cust.orders.map(o => new Date(o.createdAt).getTime()))) 
        : null;
      const reservationCount = cust.reservations.length;

      return {
        id: cust.id,
        name: cust.name,
        email: cust.email,
        phone: cust.phone,
        totalOrders,
        totalSpending,
        lastOrderDate,
        reservationCount,
        orders: cust.orders,
        reservations: cust.reservations,
      };
    });

    // Filter mapped statistics based on parameters
    let filtered = mapped.filter((cust) => {
      return cust.totalOrders >= minOrders && cust.totalSpending >= minSpending;
    });

    const totalCount = filtered.length;
    const paginated = filtered.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      customers: paginated,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Failed to read customers statistics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch customer directories." },
      { status: 500 }
    );
  }
}
