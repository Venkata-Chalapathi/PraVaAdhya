import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: Fetch all reservations with linked table and customer profile details
export async function GET() {
  try {
    const reservations = await prisma.reservation.findMany({
      include: {
        table: true,
      },
      orderBy: [
        { date: "desc" },
        { time: "desc" },
      ],
    });
    return NextResponse.json({ success: true, reservations });
  } catch (error) {
    console.error("Error reading reservations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reservations." },
      { status: 500 }
    );
  }
}

// PATCH: Approve, Reject, Assign, Reassign, Seated/Occupied, or Release table bookings
export async function PATCH(request: Request) {
  try {
    const { reservationId, action, tableId } = await request.json();

    if (!reservationId || !action) {
      return NextResponse.json(
        { success: false, error: "Reservation ID and Action are required." },
        { status: 400 }
      );
    }

    const normAction = action.toUpperCase();
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      return NextResponse.json({ success: false, error: "Reservation not found." }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      let message = "";
      
      switch (normAction) {
        case "APPROVE":
          await tx.reservation.update({
            where: { id: reservationId },
            data: { status: "APPROVED", tableId: tableId || reservation.tableId },
          });
          if (tableId) {
            await tx.table.update({
              where: { id: tableId },
              data: { status: "RESERVED" },
            });
          }
          message = "Reservation request approved.";
          break;
          
        case "REJECT":
          await tx.reservation.update({
            where: { id: reservationId },
            data: { status: "REJECTED" },
          });
          // Release previous table if assigned
          if (reservation.tableId) {
            await tx.table.update({
              where: { id: reservation.tableId },
              data: { status: "AVAILABLE" },
            });
          }
          message = "Reservation request rejected.";
          break;
          
        case "ASSIGN_TABLE":
          if (!tableId) throw new Error("Table ID is required for table allocation.");
          
          // Release previous table if existed
          if (reservation.tableId && reservation.tableId !== tableId) {
            await tx.table.update({
              where: { id: reservation.tableId },
              data: { status: "AVAILABLE" },
            });
          }
          
          await tx.reservation.update({
            where: { id: reservationId },
            data: { tableId, status: "APPROVED" },
          });
          
          await tx.table.update({
            where: { id: tableId },
            data: { status: "RESERVED" },
          });
          message = "Table assigned successfully.";
          break;

        case "MARK_OCCUPIED":
          if (!reservation.tableId) {
            throw new Error("No table has been allocated to this booking yet.");
          }
          await tx.table.update({
            where: { id: reservation.tableId },
            data: { status: "OCCUPIED" },
          });
          message = "Guests seated. Table status updated to Occupied.";
          break;

        case "RELEASE_TABLE":
          if (!reservation.tableId) {
            throw new Error("No table is allocated to release.");
          }
          await tx.table.update({
            where: { id: reservation.tableId },
            data: { status: "AVAILABLE" },
          });
          message = "Table released. Status set back to Available.";
          break;
          
        case "CANCEL":
          await tx.reservation.update({
            where: { id: reservationId },
            data: { status: "CANCELLED" },
          });
          
          if (reservation.tableId) {
            await tx.table.update({
              where: { id: reservation.tableId },
              data: { status: "AVAILABLE" },
            });
          }
          
          // Log cancellation notification alert for owner
          await tx.notification.create({
            data: {
              type: "RESERVATION_CANCELLATION",
              message: `Booking #${reservationId.slice(-6).toUpperCase()} for ${reservation.name} has been cancelled.`,
            },
          });
          message = "Reservation cancelled successfully.";
          break;

        default:
          throw new Error("Invalid reservation action.");
      }

      return { success: true, message };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Reservation status change failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update reservation status." },
      { status: 500 }
    );
  }
}
