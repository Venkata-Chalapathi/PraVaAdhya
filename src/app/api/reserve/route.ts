import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

// Validate inputs
const reservationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().min(10, "Phone number must be at least 10 digits."),
  date: z.string().min(1, "Please select a date."),
  time: z.string().min(1, "Please select a time."),
  partySize: z.coerce
    .number()
    .min(1, "Party size must be at least 1.")
    .max(12, "For groups larger than 12, please contact the restaurant directly."),
  notes: z.string().optional(),
  customerId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Zod validation
    const validatedData = reservationSchema.parse(body);
    
    // Simulate database write delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Resolve or create Customer record
    let finalCustomerId = validatedData.customerId;

    if (!finalCustomerId) {
      // Lookup customer by email
      const existingCustomer = await prisma.customer.findUnique({
        where: { email: validatedData.email },
      });

      if (existingCustomer) {
        finalCustomerId = existingCustomer.id;
      } else {
        // Create new customer profile
        const newCustomer = await prisma.customer.create({
          data: {
            name: validatedData.name,
            email: validatedData.email,
            phone: validatedData.phone,
          },
        });
        finalCustomerId = newCustomer.id;
      }
    }

    // Create reservation record
    const reservation = await prisma.reservation.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        date: validatedData.date,
        time: validatedData.time,
        guests: validatedData.partySize,
        notes: validatedData.notes || null,
        status: "PENDING",
        customerId: finalCustomerId,
      },
    });

    // Create real-time notification alert for admin dashboard
    await prisma.notification.create({
      data: {
        type: "NEW_RESERVATION",
        message: `New booking request #${reservation.id.slice(-6).toUpperCase()} by ${validatedData.name} for ${validatedData.partySize} guests on ${validatedData.date} at ${validatedData.time}.`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Your reservation request for a party of ${validatedData.partySize} on ${validatedData.date} at ${validatedData.time} is successfully submitted. We will notify you once it's approved.`,
      reservation,
    });
  } catch (error) {
    console.error("Reservation creation error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed.",
          errors: error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: "An unexpected system error occurred while securing your table." },
      { status: 500 }
    );
  }
}
