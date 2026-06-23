import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: Gather complete analytics payload for Owner/Admin dashboard
export async function GET() {
  try {
    const now = new Date();
    
    // Start boundaries
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOf7DaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOf30DaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startOf1YearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    // 1. Revenue calculations (Daily, Weekly, Monthly, Yearly)
    const dailyOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startOfToday },
        status: "DELIVERED",
      },
      select: { totalAmount: true },
    });
    const dailyRevenue = dailyOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const weeklyOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startOf7DaysAgo },
        status: "DELIVERED",
      },
      select: { totalAmount: true },
    });
    const weeklyRevenue = weeklyOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const monthlyOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startOf30DaysAgo },
        status: "DELIVERED",
      },
      select: { totalAmount: true },
    });
    const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const yearlyOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startOf1YearAgo },
        status: "DELIVERED",
      },
      select: { totalAmount: true },
    });
    const yearlyRevenue = yearlyOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // 2. Average Order Value (AOV)
    const totalDeliveredOrdersCount = await prisma.order.count({
      where: { status: "DELIVERED" }
    });
    const totalAllRevenue = await prisma.order.aggregate({
      where: { status: "DELIVERED" },
      _sum: { totalAmount: true }
    });
    const totalRevValue = totalAllRevenue._sum.totalAmount || 0;
    const averageOrderValue = totalDeliveredOrdersCount > 0 
      ? Math.round(totalRevValue / totalDeliveredOrdersCount) 
      : 0;

    // 3. Order status breakdowns
    const ordersGroup = await prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
    });
    
    const orderStats = {
      PENDING: 0,
      ACTIVE: 0, // CONFIRMED, PREPARING, READY, OUT_FOR_DELIVERY
      COMPLETED: 0, // DELIVERED
      CANCELLED: 0,
    };

    ordersGroup.forEach((g) => {
      const cnt = g._count._all;
      if (g.status === "PENDING") {
        orderStats.PENDING += cnt;
      } else if (g.status === "DELIVERED") {
        orderStats.COMPLETED += cnt;
      } else if (g.status === "CANCELLED") {
        orderStats.CANCELLED += cnt;
      } else {
        orderStats.ACTIVE += cnt;
      }
    });

    // 4. Reservation statistics
    const reservationsGroup = await prisma.reservation.groupBy({
      by: ["status"],
      _count: { _all: true },
    });

    const resStats = {
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      CANCELLED: 0,
    };

    reservationsGroup.forEach((g) => {
      const cnt = g._count._all;
      const status = g.status.toUpperCase();
      if (status === "PENDING") resStats.PENDING = cnt;
      else if (status === "APPROVED") resStats.APPROVED = cnt;
      else if (status === "REJECTED") resStats.REJECTED = cnt;
      else if (status === "CANCELLED") resStats.CANCELLED = cnt;
    });

    const totalReservations = await prisma.reservation.count();
    const approvedReservations = resStats.APPROVED;
    const reservationConversionRate = totalReservations > 0
      ? Math.round((approvedReservations / totalReservations) * 100)
      : 0;

    // 5. Table Occupancy & Util
    const totalTablesCount = await prisma.table.count();
    const occupiedTablesCount = await prisma.table.count({
      where: { status: { in: ["OCCUPIED", "RESERVED"] } },
    });
    const tableUtilization = totalTablesCount > 0 
      ? Math.round((occupiedTablesCount / totalTablesCount) * 100) 
      : 0;

    // Calculate capacity-based average occupancy
    const totalCapacityAggregate = await prisma.table.aggregate({
      _sum: { capacity: true }
    });
    const occupiedCapacityAggregate = await prisma.table.aggregate({
      where: { status: { in: ["OCCUPIED", "RESERVED"] } },
      _sum: { capacity: true }
    });
    const totalCapacity = totalCapacityAggregate._sum.capacity || 1;
    const occupiedCapacity = occupiedCapacityAggregate._sum.capacity || 0;
    const averageTableOccupancy = Math.round((occupiedCapacity / totalCapacity) * 100);

    // 6. New vs. Returning Customers
    const totalCustomersCount = await prisma.customer.count();
    const returningCustomersCount = await prisma.customer.count({
      where: { totalOrders: { gt: 1 } }
    });
    const newCustomersCount = totalCustomersCount - returningCustomersCount;

    // 7. Popular Dishes (top 5 by quantity) and Least Ordered (bottom 5)
    const itemsGroup = await prisma.orderItem.groupBy({
      by: ["menuItemId"],
      _sum: { quantity: true },
      orderBy: {
        _sum: { quantity: "desc" },
      },
    });

    const popularDishes = [];
    const leastOrderedDishes = [];

    // Top 5
    const top5 = itemsGroup.slice(0, 5);
    for (const item of top5) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId },
        select: { name: true, price: true },
      });
      if (menuItem) {
        popularDishes.push({
          name: menuItem.name,
          quantity: item._sum.quantity || 0,
          revenue: (item._sum.quantity || 0) * menuItem.price,
        });
      }
    }

    // Bottom 5 (Reverse slice)
    const bottom5 = itemsGroup.slice(-5).reverse();
    for (const item of bottom5) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId },
        select: { name: true, price: true },
      });
      if (menuItem) {
        leastOrderedDishes.push({
          name: menuItem.name,
          quantity: item._sum.quantity || 0,
          revenue: (item._sum.quantity || 0) * menuItem.price,
        });
      }
    }

    // 8. 7-Day Trend analysis
    const trends = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      const orderCount = await prisma.order.count({
        where: {
          createdAt: { gte: startOfDay, lte: endOfDay },
          status: "DELIVERED",
        },
      });

      const resCount = await prisma.reservation.count({
        where: {
          createdAt: { gte: startOfDay, lte: endOfDay },
          status: "APPROVED",
        },
      });

      trends.push({
        date: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
        orders: orderCount,
        reservations: resCount,
      });
    }

    return NextResponse.json({
      success: true,
      stats: {
        revenue: {
          daily: dailyRevenue,
          weekly: weeklyRevenue,
          monthly: monthlyRevenue,
          yearly: yearlyRevenue,
        },
        averageOrderValue,
        orders: orderStats,
        reservations: resStats,
        reservationConversionRate,
        tableUtilization,
        averageTableOccupancy,
        customers: {
          total: totalCustomersCount,
          new: newCustomersCount,
          returning: returningCustomersCount,
        },
        popularDishes,
        leastOrderedDishes,
        trends,
      },
    });
  } catch (error) {
    console.error("Error generating admin statistics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to gather statistics." },
      { status: 500 }
    );
  }
}
