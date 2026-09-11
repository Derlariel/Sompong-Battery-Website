import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { getAdmin, sameOrigin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { schemas } from "@/lib/validation";
import { isLocalImage } from "./assets";
import { localImageExists } from "./asset-files";
export async function mutateResource(request: Request, resource: string) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "ไม่อนุญาตคำขอนี้" }, { status: 403 });
  if (!await getAdmin()) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  if (!Object.hasOwn(schemas, resource)) return NextResponse.json({ error: "ไม่พบข้อมูล" }, { status: 404 });
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
    const id = typeof body.id === "string" && body.id.length <= 100 ? body.id : undefined;
    if (request.method === "PUT" && !id) return NextResponse.json({ error: "กรุณาระบุรายการที่ต้องการแก้ไข" }, { status: 400 });
    const images = resource === "photos" ? [body.url] : resource === "hero-slides" ? [body.imageUrl] : resource === "posts" && Array.isArray(body.photos) ? body.photos.map((photo: unknown) => typeof photo === "object" && photo !== null && "url" in photo ? photo.url : undefined) : [];
    for (const image of images) {
      if (request.method !== "DELETE" && typeof image === "string" && isLocalImage(image) && !await localImageExists(image)) {
        return NextResponse.json({ error: "ไม่พบรูปภาพ กรุณาเพิ่มไฟล์ใน public/assets ก่อนบันทึก" }, { status: 400 });
      }
    }
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
        case "posts": {
          const { photos, ...data } = schemas.posts.parse(body);
          const existingPhotos = photos.filter(photo => photo.id).map(photo => ({ where: { id: photo.id! }, data: { url: photo.url, alt: photo.alt } }));
          const newPhotos = photos.filter(photo => !photo.id).map(({ url, alt }) => ({ url, alt }));
          const saved = id
            ? await prisma.post.update({ where: { id }, data: { ...data, photos: { deleteMany: { id: { notIn: photos.flatMap(photo => photo.id ? [photo.id] : []) } }, update: existingPhotos, create: newPhotos } } })
            : await prisma.post.create({ data: { ...data, photos: { create: newPhotos } } });
          revalidatePath("/", "layout");
          return NextResponse.json({ ok: true, id: saved.id });
        }
        case "photos": { const data = schemas.photos.parse(body); if (id) await prisma.photo.update({ where: { id }, data }); else await prisma.photo.create({ data }); break; }
        case "hero-slides": { const data = schemas["hero-slides"].parse(body); if (id) await prisma.heroSlide.update({ where: { id }, data }); else await prisma.heroSlide.create({ data }); break; }
        case "service-areas": { const data = schemas["service-areas"].parse(body); if (id) await prisma.serviceArea.update({ where: { id }, data }); else await prisma.serviceArea.create({ data }); break; }
        case "settings": { const data = schemas.settings.parse(body); await prisma.siteSetting.upsert({ where: { id: "singleton" }, create: data, update: data }); break; }
      }
    }
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบช่องที่กรอกและรูปแบบลิงก์" }, { status: 400 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && ["P2002", "P2003", "P2025"].includes(error.code)) return NextResponse.json({ error: "ข้อมูลซ้ำ หรือข้อมูลที่อ้างอิงถูกลบแล้ว กรุณาโหลดหน้าใหม่" }, { status: 409 });
    return NextResponse.json({ error: "บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง" }, { status: 500 });
  }
}
export async function readResource(resource: string) {
  if (!await getAdmin()) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  try {
    let data;
    switch (resource) {
      case "posts": data = await prisma.post.findMany({ include: { photos: true }, orderBy: { createdAt: "desc" } }); break;
      case "photos": data = await prisma.photo.findMany({ orderBy: { createdAt: "desc" } }); break;
      case "service-areas": data = await prisma.serviceArea.findMany({ orderBy: { name: "asc" } }); break;
      default: return NextResponse.json({ error: "ไม่พบข้อมูล" }, { status: 404 });
    }
    return NextResponse.json({ data }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "โหลดข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง" }, { status: 500 }); }
}
