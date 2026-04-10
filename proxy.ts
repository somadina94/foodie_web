import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_ROLE, COOKIE_TOKEN, dashboardPathForRole } from "@/lib/constants";

const protectedPrefixes: { prefix: string; roles: string[] }[] = [
  { prefix: "/customer", roles: ["user"] },
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/vendor", roles: ["vendor"] },
  { prefix: "/rider", roles: ["rider"] },
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_TOKEN)?.value;
  const role = request.cookies.get(COOKIE_ROLE)?.value;

  for (const { prefix, roles } of protectedPrefixes) {
    if (!pathname.startsWith(prefix)) continue;
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (!role || !roles.includes(role)) {
      return NextResponse.redirect(
        new URL(dashboardPathForRole(role), request.url),
      );
    }
    break;
  }

  if (pathname === "/login" || pathname === "/signup") {
    if (token && role) {
      return NextResponse.redirect(
        new URL(dashboardPathForRole(role), request.url),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/customer/:path*",
    "/admin/:path*",
    "/vendor/:path*",
    "/rider/:path*",
    "/login",
    "/signup",
  ],
};
