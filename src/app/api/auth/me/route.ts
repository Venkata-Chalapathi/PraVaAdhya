import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyJWT, signAccessToken, signRefreshToken } from "@/lib/auth-crypto";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("auth_token")?.value;
    const refreshToken = cookieStore.get("refresh_token")?.value;

    // 1. Check if Access Token is present and valid
    if (accessToken) {
      const payload = await verifyJWT(accessToken);
      if (payload) {
        return NextResponse.json({
          user: {
            id: payload.userId,
            name: payload.name,
            email: payload.email,
            role: payload.role,
            customerId: payload.customerId,
          },
        });
      }
    }

    // 2. If Access Token is missing/expired, check Refresh Token
    if (!refreshToken) {
      return NextResponse.json({ user: null });
    }

    const refreshPayload = await verifyJWT(refreshToken);
    if (!refreshPayload) {
      // Invalidate invalid token
      return clearAuthSession("Invalid refresh token signature.");
    }

    // Check refresh token in database
    const dbToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
          include: {
            role: true,
            customerProfile: true,
          },
        },
      },
    });

    if (!dbToken) {
      return clearAuthSession("Refresh token not found in database.");
    }

    // Check if token has expired
    if (new Date() > dbToken.expiresAt) {
      await prisma.refreshToken.delete({ where: { id: dbToken.id } });
      return clearAuthSession("Refresh token expired.");
    }

    // 3. Token Replay / Reuse Detection (Rotation Security)
    if (dbToken.rotated) {
      console.warn(`[Security] Detected rotated token reuse for user: ${dbToken.userId}. Revoking all sessions.`);
      
      // Revoke ALL refresh tokens for this user immediately!
      await prisma.refreshToken.deleteMany({
        where: { userId: dbToken.userId },
      });
      
      await prisma.auditLog.create({
        data: {
          userId: dbToken.userId,
          role: dbToken.user.role.name,
          action: "PASSWORD_RESET",
          details: `Security alert: Rotated refresh token replay attempt detected. Terminated all active user sessions.`,
        },
      });

      return clearAuthSession("Token replay detected. Sessions terminated.");
    }

    // 4. Perform Refresh Token Rotation (RTR)
    const user = dbToken.user;
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role.name,
      name: user.name,
      customerId: user.customerProfile?.id || null,
    };

    // Sign new access and refresh tokens
    const newAccessToken = await signAccessToken(tokenPayload);
    const newRefreshToken = await signRefreshToken({ userId: user.id });

    // Mark current token as rotated and insert new refresh token inside transaction
    const sevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: dbToken.id },
        data: { rotated: true },
      }),
      prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: user.id,
          expiresAt: sevenDays,
        },
      }),
    ]);

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        customerId: user.customerProfile?.id || null,
      },
    });

    // Set cookies with new rotated tokens
    response.cookies.set("auth_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 900, // 15 mins
      path: "/",
    });

    response.cookies.set("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 604800, // 7 days
      path: "/",
    });

    console.log(`[RTR] Rotated refresh token session for user: ${user.email}`);
    return response;
  } catch (error) {
    console.error("Error verifying current user session:", error);
    return NextResponse.json({ user: null });
  }
}

// Clears cookies and returns null user
async function clearAuthSession(reason: string) {
  console.log(`[Auth] Clearing session cookies: ${reason}`);
  const response = NextResponse.json({ user: null });
  response.cookies.set("auth_token", "", { expires: new Date(0), path: "/" });
  response.cookies.set("refresh_token", "", { expires: new Date(0), path: "/" });
  return response;
}
