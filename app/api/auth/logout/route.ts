import { NextResponse } from "next/server";
import { sameOrigin, sessionCookie } from "@/lib/auth";
import { siteUrl } from "@/lib/seo";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return new NextResponse("Forbidden", { status: 403 });
  const response = NextResponse.redirect(new URL("/admin/login", siteUrl()), 303);
  response.cookies.set(sessionCookie, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
