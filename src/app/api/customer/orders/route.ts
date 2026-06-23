import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyJWT } from "@/lib/auth-crypto";

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

    const orders = await prisma.order.findMany({
      where: { customerId: payload.customerId },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Error reading customer orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order history." },
      { status: 500 }
    );
  }
}
