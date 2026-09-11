import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sameOrigin } from "@/lib/origin";
import { visitPeriods } from "@/lib/visit-periods";

const presenceSchema = z.object({ path: z.string().startsWith("/").max(300) });

export async function GET() {
  try {
    const periods = visitPeriods();
    const [daily, weekly, monthly, total] = await Promise.all([
      prisma.visitEvent.count({ where: { createdAt: { gte: periods.today } } }),
      prisma.visitEvent.count({ where: { createdAt: { gte: periods.week } } }),
      prisma.visitEvent.count({ where: { createdAt: { gte: periods.month } } }),
      prisma.visitEvent.count(),
    ]);
    return NextResponse.json({ daily, weekly, monthly, total }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Presence count failed", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json({ error: "โหลดจำนวนผู้ใช้งานไม่สำเร็จ" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "ไม่อนุญาตคำขอนี้" }, { status: 403 });

  try {
    const parsed = presenceSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
    await prisma.visitEvent.create({ data: parsed.data });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Presence tracking failed", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json({ error: "บันทึกผู้ใช้งานไม่สำเร็จ" }, { status: 500 });
  }
}
