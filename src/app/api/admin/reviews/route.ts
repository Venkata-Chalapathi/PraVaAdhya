import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: List all reviews (moderation view) with optional status filter
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "ALL"; // ALL, PENDING, APPROVED, HIDDEN
    const rating = searchParams.get("rating") ? Number(searchParams.get("rating")) : null;
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const skip = (page - 1) * limit;

    const query: any = {};
    if (status !== "ALL") {
      query.status = status;
    }
    if (rating !== null) {
      query.rating = rating;
    }

    const reviews = await prisma.review.findMany({
      where: query,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const totalCount = await prisma.review.count({ where: query });
    
    // Aggregate star ratings distributions
    const totalReviewsCount = await prisma.review.count();
    const ratingsAggregate = await prisma.review.groupBy({
      by: ["rating"],
      _count: true,
    });

    const starDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;
    ratingsAggregate.forEach((group) => {
      const star = group.rating as 1 | 2 | 3 | 4 | 5;
      if (star >= 1 && star <= 5) {
        starDistribution[star] = group._count;
        sum += star * group._count;
      }
    });

    const averageRating = totalReviewsCount > 0 ? Number((sum / totalReviewsCount).toFixed(2)) : 0;

    return NextResponse.json({
      success: true,
      reviews,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      analytics: {
        starDistribution,
        averageRating,
        totalReviewsCount,
      },
    });
  } catch (error) {
    console.error("Failed to read reviews for admin:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load review logs." },
      { status: 500 }
    );
  }
}

// PATCH: Approve, Hide, or Feature reviews
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { reviewId, action } = body;

    if (!reviewId || !action) {
      return NextResponse.json({ success: false, error: "Review ID and Action are required." }, { status: 400 });
    }

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      return NextResponse.json({ success: false, error: "Review not found." }, { status: 404 });
    }

    let updatedReview;
    let auditAction = "";
    let auditDetails = "";

    switch (action.toUpperCase()) {
      case "APPROVE":
        updatedReview = await prisma.review.update({
          where: { id: reviewId },
          data: { status: "APPROVED" },
        });
        auditAction = "REVIEW_APPROVED";
        auditDetails = `Approved review by ${review.name} (${review.rating} stars)`;
        break;

      case "HIDE":
        updatedReview = await prisma.review.update({
          where: { id: reviewId },
          data: { status: "HIDDEN", isFeatured: false },
        });
        auditAction = "REVIEW_REJECTED";
        auditDetails = `Hid review by ${review.name} (${review.rating} stars)`;
        break;

      case "FEATURE":
        updatedReview = await prisma.review.update({
          where: { id: reviewId },
          data: { isFeatured: !review.isFeatured, status: "APPROVED" }, // Auto-approve if featured
        });
        auditAction = "SETTINGS_UPDATED";
        auditDetails = `${updatedReview.isFeatured ? "Featured" : "Un-featured"} review by ${review.name}`;
        break;

      default:
        return NextResponse.json({ success: false, error: "Invalid review moderation action." }, { status: 400 });
    }

    // Log administrative action
    await prisma.auditLog.create({
      data: {
        action: auditAction,
        details: auditDetails,
      },
    });

    return NextResponse.json({ success: true, review: updatedReview });
  } catch (error) {
    console.error("Failed to moderate review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to execute review moderation." },
      { status: 500 }
    );
  }
}
