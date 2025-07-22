import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Public paths that don't require authentication
  const isPublicPath =
    nextUrl.pathname.startsWith("/auth") ||
    nextUrl.pathname === "/" ||
    nextUrl.pathname.startsWith("/api/auth");

  // If user is not logged in and trying to access a protected route
  if (!isLoggedIn && !isPublicPath) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }

  // If user is logged in and trying to access auth pages, redirect to dashboard
  if (
    isLoggedIn &&
    nextUrl.pathname.startsWith("/auth") &&
    nextUrl.pathname !== "/auth/error"
  ) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
