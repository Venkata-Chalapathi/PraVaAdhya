import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/lib/auth-crypto";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let authentication endpoints, setup routes, and static assets bypass middleware checks
  if (
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/admin/setup") ||
    pathname.startsWith("/api/admin/setup") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Intercept Admin panel pages
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      const url = new URL("/admin/login", request.url);
      return NextResponse.redirect(url);
    }

    const payload = await verifyJWT(token);
    if (!payload || payload.role !== "ADMIN") {
      const url = new URL("/admin/login", request.url);
      // Invalidate bad cookie if role mismatch
      const response = NextResponse.redirect(url);
      response.cookies.set("auth_token", "", { expires: new Date(0), path: "/" });
      return response;
    }
  }

  // Intercept Admin panel API routes
  if (pathname.startsWith("/api/admin")) {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Access Denied: Unauthenticated." }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Access Denied: Unauthorized." }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
