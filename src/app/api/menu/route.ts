import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleDbError } from "@/lib/db-error-logging";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    // Construct the dynamic database where-clause
    const whereClause: any = {};

    // Filter by category name
    if (category && category !== "All") {
      whereClause.category = {
        name: category,
      };
    }

    // Filter by search string matching name or description
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { teluguName: { contains: search, mode: "insensitive" } },
      ];
    }

    const items = await prisma.menuItem.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
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
