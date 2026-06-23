import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: Fetch all 20 physical tables
export async function GET() {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { number: "asc" },
    });
    return NextResponse.json({ success: true, tables });
  } catch (error) {
    console.error("Error reading tables:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dining tables." },
      { status: 500 }
    );
  }
}

// PATCH: Modify table capacity or manual status override (Available, Reserved, Occupied, Maintenance)
export async function PATCH(request: Request) {
  try {
    const { tableId, status, capacity } = await request.json();

    if (!tableId) {
      return NextResponse.json({ success: false, error: "Table ID is required." }, { status: 400 });
    }

    const updateData: any = {};
    if (status) {
      const allowedStatuses = ["AVAILABLE", "RESERVED", "OCCUPIED", "MAINTENANCE"];
      if (!allowedStatuses.includes(status.toUpperCase())) {
        return NextResponse.json({ success: false, error: "Invalid status value." }, { status: 400 });
      }
      updateData.status = status.toUpperCase();
    }

    if (capacity !== undefined) {
      const parsedCapacity = Number(capacity);
      if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
        return NextResponse.json({ success: false, error: "Capacity must be positive." }, { status: 400 });
      }
      updateData.capacity = parsedCapacity;
    }

    const updatedTable = await prisma.table.update({
      where: { id: tableId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `Table #${updatedTable.number} status updated successfully.`,
      table: updatedTable,
    });
  } catch (error) {
    console.error("Error updating table status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update table configuration." },
      { status: 500 }
    );
  }
}
