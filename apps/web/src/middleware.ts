import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Decode JWT payload without verifying (verification happens on API)
function decodeJWT(token: string): { role?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload;
  } catch {
    return null;
  }
}

const AGENCY_ROUTES = ["/agency"];
const MODEL_ROUTES = ["/model"];
const FAN_ROUTES = ["/fan"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAgencyRoute = AGENCY_ROUTES.some((r) => pathname.startsWith(r));
  const isModelRoute = MODEL_ROUTES.some((r) => pathname.startsWith(r));
  const isFanRoute = FAN_ROUTES.some((r) => pathname.startsWith(r));

  if (!isAgencyRoute && !isModelRoute && !isFanRoute) {
    return NextResponse.next();
  }

  // Check for token in cookie (set at login) or allow client-side check
  const token = request.cookies.get("token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = decodeJWT(token);
  if (!payload) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const role = payload.role;

  if (isAgencyRoute && role !== "AGENCY" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isModelRoute && role !== "MODEL" && role !== "AGENCY" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isFanRoute && role !== "FAN" && role !== "AGENCY" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/agency/:path*", "/model/:path*", "/fan/:path*"],
};
