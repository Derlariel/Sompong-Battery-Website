import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sameOrigin } from "@/lib/origin";
import { writeClickEvent } from "@/lib/firebase/firestore";

const clickSchema = z.object({
  channel: z.enum(["call", "line"]),
  path: z.string().startsWith("/").max(300),
  areaSlug: z.string().max(100).optional(),
  utmSource: z.string().max(200).optional(),
  utmMedium: z.string().max(200).optional(),
  utmCampaign: z.string().max(200).optional(),
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
    if (process.env.DATA_SOURCE === "firebase") {
      const { channel, path, ...campaign } = parsed.data;
      await writeClickEvent({ channel, type: channel === "call" ? "CALL_CLICK" : "LINE_CLICK", path, page: path, ...campaign });
    } else await prisma.clickEvent.create({ data: { channel: parsed.data.channel, path: parsed.data.path } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Click tracking failed", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json({ error: "บันทึกสถิติไม่สำเร็จ" }, { status: 500 });
  }
}
