import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";

  const mainDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || "lvh.me:3000";

  console.log("middleware hit", { host, mainDomain });

  // -------------------------------
  // 1. LOCAL DEVELOPMENT (lvh.me)
  // -------------------------------
  if (host.endsWith("lvh.me:3000")) {
    // Example: gadadhospital.lvh.me:3000
    const subdomain = host.split(".")[0];

    if (
      subdomain === "gadadhospital" &&
      !pathname.startsWith("/gadadhospital")
    ) {
      url.pathname = `/gadadhospital${pathname}`;
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
  }

  // -------------------------------
  // 2. VERCEL DEPLOYMENT
  // -------------------------------
  // Vercel preview/prod always serve on: <project>.vercel.app
  if (host.endsWith(".vercel.app")) {
    // Treat main domain as gadadhospital
    if (!pathname.startsWith("/gadadhospital")) {
      url.pathname = `/gadadhospital${pathname}`;
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
  }

  // -------------------------------
  // Default: pass through
  // -------------------------------
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|admin|signin|signup|_next/static|_next/image|favicon.ico).*)",
  ],
};
