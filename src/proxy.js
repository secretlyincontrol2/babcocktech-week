import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req) {
  const secret = process.env.NEXTAUTH_SECRET;
  
  // Use getToken with secureCookie: true if on Vercel (HTTPS)
  const token = await getToken({ 
    req, 
    secret,
    secureCookie: process.env.NODE_ENV === "production" || req.nextUrl.protocol === "https:",
  });

  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!token || token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
  }

  if (pathname.startsWith("/judge")) {
    if (!token || (token.role !== "JUDGE" && token.role !== "ADMIN")) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/judge/:path*"],
};
