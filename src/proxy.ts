import { NextResponse, type NextRequest } from "next/server";

const CANONICAL_HOST = "najih.abouaaliahmed.com";

export default function proxy(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const hostname = host.split(":")[0].toLowerCase();

  if (hostname === `www.${CANONICAL_HOST}`) {
    const url = req.nextUrl.clone();
    url.hostname = CANONICAL_HOST;
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};