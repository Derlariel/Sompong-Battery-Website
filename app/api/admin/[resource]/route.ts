import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getAdmin, sameOrigin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { schemas } from "@/lib/validation";
type Context = { params: Promise<{ resource: string }> };
async function mutate(request: Request, context: Context) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "ไม่อนุญาตคำขอนี้" }, { status: 403 });
  if (!await getAdmin()) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  const { resource } = await context.params;
  if (!Object.hasOwn(schemas, resource)) return NextResponse.json({ error: "ไม่พบข้อมูล" }, { status: 404 });
  try {
    const body = await request.json();
    const id = typeof body.id === "string" && body.id.length <= 100 ? body.id : undefined;
    if (request.method === "DELETE") {
      if (!id || resource === "settings") return NextResponse.json({ error: "ไม่สามารถลบข้อมูลนี้ได้" }, { status: 400 });
      switch (resource) {
        case "posts": await prisma.post.delete({ where: { id } }); break;
        case "photos": await prisma.photo.delete({ where: { id } }); break;
        case "hero-slides": await prisma.heroSlide.delete({ where: { id } }); break;
        case "service-areas": await prisma.serviceArea.delete({ where: { id } }); break;
      }
    } else {
      switch (resource) {
        case "posts": { const data = schemas.posts.parse(body); if (id) await prisma.post.update({ where: { id }, data }); else await prisma.post.create({ data }); break; }
        case "photos": { const data = schemas.photos.parse(body); if (id) await prisma.photo.update({ where: { id }, data }); else await prisma.photo.create({ data }); break; }
        case "hero-slides": { const data = schemas["hero-slides"].parse(body); if (id) await prisma.heroSlide.update({ where: { id }, data }); else await prisma.heroSlide.create({ data }); break; }
        case "service-areas": { const data = schemas["service-areas"].parse(body); if (id) await prisma.serviceArea.update({ where: { id }, data }); else await prisma.serviceArea.create({ data }); break; }
        case "settings": { const data = schemas.settings.parse(body); await prisma.siteSetting.upsert({ where: { id: "singleton" }, create: data, update: data }); break; }
      }
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบช่องที่กรอกและรูปแบบลิงก์" }, { status: 400 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && ["P2002", "P2003", "P2025"].includes(error.code)) return NextResponse.json({ error: "ข้อมูลซ้ำ หรือข้อมูลที่อ้างอิงถูกลบแล้ว กรุณาโหลดหน้าใหม่" }, { status: 409 });
    return NextResponse.json({ error: "บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง" }, { status: 500 });
  }
}
export const POST = mutate;
export const DELETE = mutate;
