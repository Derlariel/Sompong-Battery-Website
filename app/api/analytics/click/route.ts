import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sameOrigin } from "@/lib/origin";

const clickSchema = z.object({
  channel: z.enum(["call", "line"]),
  path: z.string().startsWith("/").max(300),
});

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "ไม่อนุญาตคำขอนี้" }, { status: 403 });
  }

  try {
    const parsed = clickSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
    }
    await prisma.clickEvent.create({ data: parsed.data });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Click tracking failed", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json({ error: "บันทึกสถิติไม่สำเร็จ" }, { status: 500 });
  }
}
