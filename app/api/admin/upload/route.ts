import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getAdmin, sameOrigin } from "@/lib/auth";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "ไม่อนุญาตคำขอนี้" }, { status: 403 });
  if (!await getAdmin()) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  if (!process.env.CLOUDINARY_URL) return NextResponse.json({ error: "กรุณาตั้งค่า CLOUDINARY_URL ก่อนอัปโหลด" }, { status: 503 });
  if (Number(request.headers.get("content-length")) > 4 * 1024 * 1024) return NextResponse.json({ error: "รูปภาพต้องมีขนาดไม่เกิน 3 MB" }, { status: 413 });
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size > 3 * 1024 * 1024 || file.size === 0 || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) return NextResponse.json({ error: "เลือกภาพ JPG, PNG หรือ WebP ขนาดไม่เกิน 3 MB" }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    const isPng = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const isWebp = bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
    if (!isJpeg && !isPng && !isWebp) return NextResponse.json({ error: "ไฟล์นี้ไม่ใช่รูปภาพที่รองรับ" }, { status: 400 });
    const result = await cloudinary.uploader.upload(`data:${file.type};base64,${bytes.toString("base64")}`, { folder: "sompong-battery", resource_type: "image", allowed_formats: ["jpg", "png", "webp"], transformation: [{ width: 1800, height: 1800, crop: "limit" }] });
    return NextResponse.json({ url: result.secure_url });
  } catch { return NextResponse.json({ error: "อัปโหลดไม่สำเร็จ กรุณาตรวจสอบการตั้งค่า Cloudinary" }, { status: 500 }); }
}
