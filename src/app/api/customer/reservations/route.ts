import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyJWT } from "@/lib/auth-crypto";

// GET: Fetch all reservations belonging to the authenticated customer
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Access Denied: Unauthenticated." }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload || !payload.customerId) {
      return NextResponse.json({ error: "Access Denied: Unauthorized profile lookup." }, { status: 401 });
    }

    const reservations = await prisma.reservation.findMany({
      where: { customerId: payload.customerId },
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
    console.error("Error reading customer bookings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reservation history." },
      { status: 500 }
    );
  }
}

// PATCH: Allow customers to cancel their own active table reservation securely
export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Access Denied: Unauthenticated." }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload || !payload.customerId) {
      return NextResponse.json({ error: "Access Denied: Unauthorized operation." }, { status: 401 });
    }

    const { reservationId, action } = await request.json();
    if (!reservationId || action !== "CANCEL") {
      return NextResponse.json({ error: "Reservation ID and action CANCEL are required." }, { status: 400 });
    }

    // Verify the reservation exists and belongs to this customer
    const reservation = await prisma.reservation.findFirst({
      where: {
        id: reservationId,
        customerId: payload.customerId,
      },
    });

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found or access denied." }, { status: 404 });
    }

    if (reservation.status === "CANCELLED" || reservation.status === "REJECTED") {
      return NextResponse.json({ error: "Reservation is already cancelled or rejected." }, { status: 400 });
    }

    // Update reservation and release table inside a transaction
    await prisma.$transaction(async (tx) => {
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

      // Push reservation cancellation alert to owners
      await tx.notification.create({
        data: {
          type: "RESERVATION_CANCELLATION",
          message: `Booking #${reservationId.slice(-6).toUpperCase()} cancelled by customer ${reservation.name}`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Reservation cancelled successfully.",
    });
  } catch (error) {
    console.error("Error cancelling customer reservation:", error);
    return NextResponse.json(
      { error: "Failed to process reservation cancellation." },
      { status: 500 }
    );
  }
}
