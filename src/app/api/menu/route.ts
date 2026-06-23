import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleDbError } from "@/lib/db-error-logging";

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
      ];
    }

    console.log("=== API MENU DEBUG START ===");
    console.log("DATABASE_URL:", process.env.DATABASE_URL ? process.env.DATABASE_URL.split("@")[1] : "None");
    
    try {
      const dbUser = await prisma.$queryRawUnsafe<any[]>(`SELECT current_user, current_role, session_user;`);
      console.log("Database Current User/Role:", dbUser[0]);
    } catch (dbUserErr: any) {
      console.log("Failed to query current user/role:", dbUserErr.message);
    }

    const totalDbCount = await prisma.menuItem.count().catch(err => {
      console.log("Failed to count menuItems:", err.message);
      return -1;
    });
    console.log("Total MenuItem Count in Database:", totalDbCount);

    const items = await prisma.menuItem.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    console.log("Query whereClause:", JSON.stringify(whereClause));
    console.log("Items returned from query:", items.length);
    console.log("=== API MENU DEBUG END ===");

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
