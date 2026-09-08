import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sameOrigin, sessionCookie } from "@/lib/auth";
import { signSession } from "@/lib/session";
import { loginSchema } from "@/lib/validation";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "ไม่อนุญาตคำขอนี้" }, { status: 403 });
  if (!process.env.DATABASE_URL || !process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET.length < 32) return NextResponse.json({ error: "กรุณาตั้งค่าฐานข้อมูลและระบบเข้าสู่ระบบก่อนใช้งาน" }, { status: 503 });
  try {
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, { status: 400 });
    const { username, password } = parsed.data;
    const bucket = Math.floor(Date.now() / (15 * 60 * 1000));
    const id = createHash("sha256").update(`${username}:${bucket}`).digest("hex");
    const attempt = await prisma.loginAttempt.upsert({ where: { id }, update: { count: { increment: 1 } }, create: { id, expiresAt: new Date((bucket + 1) * 15 * 60 * 1000) } });
    if (attempt.count > 10) return NextResponse.json({ error: "ลองเข้าสู่ระบบหลายครั้งเกินไป กรุณาลองใหม่ใน 15 นาที" }, { status: 429, headers: { "Retry-After": "900" } });
    const user = await prisma.adminUser.findUnique({ where: { username } });
    const valid = await compare(password, user?.passwordHash ?? "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxuJyPXBlxeCVsjppkNpMjE8Jje");
    if (!user || !valid) return NextResponse.json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
    await prisma.loginAttempt.deleteMany({ where: { OR: [{ id }, { expiresAt: { lt: new Date() } }] } });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(sessionCookie, await signSession(user.id), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 8 * 60 * 60 });
    return response;
  } catch (error) {
    console.error("Login failed", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json({ error: "ไม่สามารถเข้าสู่ระบบได้ กรุณาลองอีกครั้ง" }, { status: 500 });
  }
}
