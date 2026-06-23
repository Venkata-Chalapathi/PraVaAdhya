import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: Fetch admin notifications (supports priority and status filtering, paginated)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "UNREAD"; // UNREAD, READ, ARCHIVED, ALL
    const priority = searchParams.get("priority") || "ALL"; // INFO, WARNING, CRITICAL, ALL
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);
    const skip = (page - 1) * limit;

    const query: any = {};
    if (status !== "ALL") {
      query.status = status;
    }
    if (priority !== "ALL") {
      query.priority = priority;
    }

    const notifications = await prisma.notification.findMany({
      where: query,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const totalCount = await prisma.notification.count({ where: query });
    const unreadCount = await prisma.notification.count({
      where: { status: "UNREAD" },
    });

    return NextResponse.json({
      success: true,
      notifications,
      totalCount,
      unreadCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error reading admin alerts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notification logs." },
      { status: 500 }
    );
  }
}

// PATCH: Mark notification status (individual or bulk update to READ/ARCHIVED)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { notificationId, action } = body; // action: READ, ARCHIVED, READ_ALL

    if (action === "READ_ALL") {
      await prisma.notification.updateMany({
        where: { status: "UNREAD" },
        data: { status: "READ" },
      });
      return NextResponse.json({ success: true, message: "All notifications marked as read." });
    }

    if (!notificationId || !action) {
      return NextResponse.json(
        { success: false, error: "Notification ID and Action are required." },
        { status: 400 }
      );
    }

    const normAction = action.toUpperCase();
    if (normAction !== "READ" && normAction !== "ARCHIVED") {
      return NextResponse.json({ success: false, error: "Invalid status action." }, { status: 400 });
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { status: normAction },
    });

    return NextResponse.json({ success: true, notification: updated });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update notification logs." },
      { status: 500 }
    );
  }
}

// DELETE: Delete notification logs (individual or bulk delete archived)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const scope = searchParams.get("scope"); // ARCHIVED or individual

    if (scope === "ARCHIVED") {
      await prisma.notification.deleteMany({
        where: { status: "ARCHIVED" },
      });
      return NextResponse.json({ success: true, message: "Archived alerts logs deleted." });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "Notification ID is required." }, { status: 400 });
    }

    await prisma.notification.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Notification deleted successfully." });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete notification logs." },
      { status: 500 }
    );
  }
}
