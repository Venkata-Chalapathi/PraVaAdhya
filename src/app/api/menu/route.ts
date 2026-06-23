import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleDbError } from "@/lib/db-error-logging";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const items = await prisma.menuItem.findMany({
      include: {
        category: true,
      },
    });
    console.log("MenuItem count:", items.length);
    return NextResponse.json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    handleDbError("GET /api/menu", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch menu items." },
      { status: 500 }
    );
  }
}
