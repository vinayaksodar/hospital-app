import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host");

  // Use lvh.me:3000 for local development without /etc/hosts
  const mainDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || "lvh.me:3000";
  console.log("middleware hit");
  console.log(host);
  console.log(mainDomain);

  // Route for gadad-hospital
  if (host === `gadadhospital.${mainDomain}` && !pathname.startsWith("/gadadhospital")) {
    url.pathname = `/gadadhospital${pathname}`;
    console.log(url);
    return NextResponse.rewrite(url);
  }

  // Add other hospital domains here as needed
  // else if (host === `other-hospital.${mainDomain}`) {
  //   url.pathname = `/other-hospital${pathname}`;
  //   return NextResponse.rewrite(url);
  // }

  // If no subdomain matches, it's a request to the main domain.
  // Let it pass through to the default `app` directory pages.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - admin (admin routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|admin|_next/static|_next/image|favicon.ico).*)",
  ],
};
