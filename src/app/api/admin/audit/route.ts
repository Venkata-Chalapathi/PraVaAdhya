import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: Fetch paginated admin audit activity logs
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "ALL"; // ALL, LOGIN, UPDATE_MENU, etc.
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);
    const skip = (page - 1) * limit;

    const query: any = {};
    if (action !== "ALL") {
      query.action = action;
    }

    const logs = await prisma.auditLog.findMany({
      where: query,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const totalCount = await prisma.auditLog.count({ where: query });

    return NextResponse.json({
      success: true,
      logs,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Failed to read audit logs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch audit trails." },
      { status: 500 }
    );
  }
}
