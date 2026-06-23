import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const reviewSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(5, "Comment must be at least 5 characters."),
  orderId: z.string().optional(),
  customerId: z.string().optional(),
});

// GET: Fetch reviews (supports customer reviews history or public testimonials)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    if (customerId) {
      const customerReviews = await prisma.review.findMany({
        where: { customerId },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ success: true, reviews: customerReviews });
    }

    const reviews = await prisma.review.findMany({
      where: {
        status: "APPROVED",
        isFeatured: true,
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error("Failed to fetch public reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch testimonials." },
      { status: 500 }
    );
  }
}

// POST: Customers submit a rating and review
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = reviewSchema.parse(body);

    // Safeguard: Prevent duplicate reviews for the same completed order
    if (validatedData.orderId) {
      const existingReview = await prisma.review.findUnique({
        where: { orderId: validatedData.orderId },
      });

      if (existingReview) {
        return NextResponse.json(
          { success: false, message: "A review has already been submitted for this order." },
          { status: 400 }
        );
      }

      // Verify that the order exists, is completed (DELIVERED), and matches customer details
      const order = await prisma.order.findUnique({
        where: { id: validatedData.orderId },
      });

      if (!order) {
        return NextResponse.json({ success: false, message: "Associated order not found." }, { status: 400 });
      }

      if (order.status !== "DELIVERED") {
        return NextResponse.json(
          { success: false, message: "Reviews can only be submitted for completed/delivered orders." },
          { status: 400 }
        );
      }
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        rating: validatedData.rating,
        comment: validatedData.comment,
        orderId: validatedData.orderId || null,
        customerId: validatedData.customerId || null,
        status: "PENDING", // Enforce moderation
      },
    });

    // Create notification alert for the dashboard
    await prisma.notification.create({
      data: {
        type: "NEW_REVIEW",
        priority: "INFO",
        message: `New review request from ${validatedData.name} (${validatedData.rating} stars) awaiting moderation.`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Thank you! Your review has been submitted and is currently awaiting moderation.",
      review,
    });
  } catch (error) {
    console.error("Failed to submit review:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Validation failed.", errors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred while saving your review." },
      { status: 500 }
    );
  }
}
