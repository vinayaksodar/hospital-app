import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // These paths should be universal and not be rewritten
  if (pathname.startsWith("/signin") || pathname.startsWith("/signup")) {
    return NextResponse.next();
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    // If the user is not authenticated, redirect to sign-in.
    if (!req.auth) {
      const newUrl = new URL("/signin", req.url);
      newUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(newUrl);
    }
    // If the user is authenticated but is not an admin, redirect to the home page.
    if (req.auth.user.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    // If the user is an admin, let them proceed.
    return NextResponse.next();
  }

  // Multi-tenancy logic for subdomains (excluding admin, signin, signup routes)
  const host = req.headers.get("host");

  // Use lvh.me:3000 for local development without /etc/hosts
  const mainDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || "lvh.me:3000";

  // Route for gadad-hospital
  if (
    host === `gadadhospital.${mainDomain}` &&
    !pathname.startsWith("/gadadhospital")
  ) {
    const newPath = `/gadadhospital${pathname}`;
    return NextResponse.rewrite(new URL(newPath, req.url));
  }

  // If no subdomain matches, or for other routes, continue.
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
