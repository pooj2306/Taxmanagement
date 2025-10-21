import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Minimal gating example: redirect /chat, /video, /games, /calendar, /diary if not logged in
// For MVP we check for presence of a cookie (supabase uses `sb:token`). For production, use server-side check.

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const protectedPrefixes = ["/chat", "/video", "/games", "/calendar", "/diary"]; 
  const isProtected = protectedPrefixes.some((p) => url.pathname.startsWith(p));

  if (isProtected) {
    const hasToken = req.cookies.get("sb:token");
    if (!hasToken) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*", "/video/:path*", "/games/:path*", "/calendar/:path*", "/diary/:path*"],
};
