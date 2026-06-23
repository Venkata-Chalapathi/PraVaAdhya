import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const connectionString = process.env.DATABASE_URL || "undefined";
    const directUrl = process.env.DIRECT_URL || "undefined";
    
    // 1. Current Session User details
    let dbUser: any = {};
    try {
      const dbUserRes = await prisma.$queryRawUnsafe<any[]>(
        `SELECT current_user, current_role, session_user, version();`
      );
      dbUser = dbUserRes[0] || {};
    } catch (e: any) {
      dbUser = { error: e.message };
    }

    // 2. Counts
    let menuItemCount = -1;
    let categoryCount = -1;
    let settingCount = -1;
    try {
      menuItemCount = await prisma.menuItem.count();
      categoryCount = await prisma.category.count();
      settingCount = await prisma.setting.count();
    } catch (e: any) {
      console.error("Count error:", e.message);
    }

    // 3. MenuItem samples
    let itemsSample: any[] = [];
    try {
      itemsSample = await prisma.menuItem.findMany({
        take: 5,
        include: { category: true }
      });
    } catch (e: any) {
      console.error("FindMany error:", e.message);
    }

    // 4. Check RLS status on MenuItem
    let rlsStatus: any = {};
    try {
      const rlsRes = await prisma.$queryRawUnsafe<any[]>(
        `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'MenuItem';`
      );
      rlsStatus = rlsRes[0] || {};
    } catch (e: any) {
      rlsStatus = { error: e.message };
    }

    return NextResponse.json({
      success: true,
      env: {
        DATABASE_URL_HOST: connectionString.split("@")[1] || "None",
        DIRECT_URL_HOST: directUrl.split("@")[1] || "None",
      },
      dbUser,
      counts: {
        menuItem: menuItemCount,
        category: categoryCount,
        setting: settingCount
      },
      rlsStatus,
      itemsSample
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
