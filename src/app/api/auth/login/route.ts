import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signAccessToken, signRefreshToken } from "@/lib/auth-crypto";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // Retrieve user, role, and customer profile details
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        customerProfile: true,
      },
    });

    if (!user) {
      // Create system audit log for auth failures
      await prisma.auditLog.create({
        data: {
          action: "CUSTOMER_LOGIN",
          details: `Failed login attempt: Email ${email} not registered.`,
        },
      });
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Compare password hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Log auth failure
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          role: user.role.name,
          action: "CUSTOMER_LOGIN",
          details: `Failed login attempt for user: ${email} (incorrect password).`,
        },
      });
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role.name,
      name: user.name,
      customerId: user.customerProfile?.id || null,
    };

    // Sign Access and Refresh tokens
    const accessToken = await signAccessToken(tokenPayload);
    const refreshToken = await signRefreshToken({ userId: user.id });

    // Store refresh token in database (for rotation safeguards)
    const sevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: sevenDays,
      },
    });

    // Write audit event
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        role: user.role.name,
        action: user.role.name === "ADMIN" ? "SETTINGS_UPDATED" : "CUSTOMER_LOGIN",
        details: `Successful login session initialized for user: ${email}`,
      },
    });

    // Create response with cookies
    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        customerId: user.customerProfile?.id || null,
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
    console.error("Error logging in:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}
