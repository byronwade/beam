import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const isApi = req.nextUrl.pathname.startsWith("/api/");
  const isNext = req.nextUrl.pathname.startsWith("/_next");
  const isStatic = req.nextUrl.pathname.startsWith("/static") || req.nextUrl.pathname.startsWith("/favicon");

  // Only rewrite subdomain traffic (not localhost or primary domain pages)
  const isLocalhost = host.includes("localhost");
  const isPrimary = host.startsWith("beam.byronwade.com") || isLocalhost;

  if (!isPrimary && !isApi && !isNext && !isStatic) {
    const url = req.nextUrl.clone();
    url.pathname = "/api/tunnel";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|static|favicon\\.ico).*)"],
};








