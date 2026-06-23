import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleDbError } from "@/lib/db-error-logging";

export async function GET(request: Request) {
  try {
    const items = await prisma.menuItem.findMany({
      include: {
        category: true,
      },
    });
    console.log("Menu items found:", items.length);
    return NextResponse.json(items);
  } catch (error) {
    handleDbError("GET /api/menu", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch menu items." },
      { status: 500 }
    );
  }
}
