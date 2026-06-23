import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signAccessToken, signRefreshToken, validatePasswordStrength } from "@/lib/auth-crypto";

export async function POST(request: Request) {
  try {
    const { name, email, password, phone } = await request.json();

    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { error: "Name, email, password, and phone number are required." },
        { status: 400 }
      );
    }

    // 1. Password Strength Validation
    const strengthCheck = validatePasswordStrength(password);
    if (!strengthCheck.isValid) {
      return NextResponse.json(
        { error: strengthCheck.error },
        { status: 400 }
      );
    }

    // Check if email already registered
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already registered. Please login." },
        { status: 400 }
      );
    }

    // Resolve or create Customer Role
    let customerRole = await prisma.role.findUnique({
      where: { name: "CUSTOMER" },
    });

    if (!customerRole) {
      customerRole = await prisma.role.create({
        data: { name: "CUSTOMER" },
      });
    }

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create User account and Customer profile inside a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          roleId: customerRole!.id,
        },
      });

      const customer = await tx.customer.create({
        data: {
          name,
          email,
          phone,
          userId: user.id,
        },
      });

      // Log registration event in audit log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          role: "CUSTOMER",
          action: "CUSTOMER_REGISTER",
          details: `New customer account registered: ${email}`,
        },
      });

      return { user, customer };
    });

    const tokenPayload = {
      userId: result.user.id,
      email: result.user.email,
      role: "CUSTOMER",
      name: result.user.name,
      customerId: result.customer.id,
    };

    // Sign Access and Refresh tokens
    const accessToken = await signAccessToken(tokenPayload);
    const refreshToken = await signRefreshToken({ userId: result.user.id });

    // Store refresh token in database (rotation control)
    const sevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: result.user.id,
        expiresAt: sevenDays,
      },
    });

    // Create response with cookies
    const response = NextResponse.json({
      success: true,
      message: "Customer registered successfully.",
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: "CUSTOMER",
        customerId: result.customer.id,
      },
    });

    // Set secure Access Cookie (HttpOnly, SameSite=Lax, Secure)
    response.cookies.set("auth_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 900, // 15 mins
      path: "/",
    });

    // Set secure Refresh Cookie (HttpOnly, SameSite=Lax, Secure)
    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 604800, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { error: "An error occurred during account registration." },
      { status: 500 }
    );
  }
}
