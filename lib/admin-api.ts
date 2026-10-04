import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { Prisma } from "@prisma/client";
import { getAdmin, sameOrigin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFirestoreResource, firestoreAdminResource, saveFirestoreResource } from "@/lib/firebase/firestore";
import { schemas } from "@/lib/validation";
import { isLocalImage } from "./assets";
import { localImageExists } from "./asset-files";

function invalidate(resource: string, areaSlug?: string | null) {
  const tags: Record<string, string[]> = {
    posts: ["posts", "photos"], photos: ["photos", "posts"], "hero-slides": ["hero-slides"],
    "service-areas": ["service-areas", "posts"], settings: ["settings"],
  };
  tags[resource]?.forEach(tag => revalidateTag(tag));
  if (areaSlug) revalidateTag(`service-area:${areaSlug}`);
}

async function prismaMutation(resource: string, method: string, id: string | undefined, body: Record<string, unknown>) {
  if (method === "DELETE") {
    if (!id || resource === "settings") throw new Error("INVALID_DELETE");
    if (resource === "posts") await prisma.post.delete({ where: { id } });
    else if (resource === "photos") await prisma.photo.delete({ where: { id } });
    else if (resource === "hero-slides") await prisma.heroSlide.delete({ where: { id } });
    else if (resource === "service-areas") await prisma.serviceArea.delete({ where: { id } });
    return id;
  }
  if (resource === "posts") {
    const { photos, ...data } = schemas.posts.parse(body);
    const existingPhotos = photos.filter(photo => photo.id).map(photo => ({ where: { id: photo.id! }, data: { url: photo.url, alt: photo.alt } }));
    const newPhotos = photos.filter(photo => !photo.id).map(({ url, alt }) => ({ url, alt }));
    const saved = id
      ? await prisma.post.update({ where: { id }, data: { ...data, photos: { deleteMany: { id: { notIn: photos.flatMap(photo => photo.id ? [photo.id] : []) } }, update: existingPhotos, create: newPhotos } } })
      : await prisma.post.create({ data: { ...data, photos: { create: newPhotos } } });
    return saved.id;
  }
  if (resource === "photos") { const data = schemas.photos.parse(body); return id ? (await prisma.photo.update({ where: { id }, data })).id : (await prisma.photo.create({ data })).id; }
  if (resource === "hero-slides") { const data = schemas["hero-slides"].parse(body); return id ? (await prisma.heroSlide.update({ where: { id }, data })).id : (await prisma.heroSlide.create({ data })).id; }
  if (resource === "service-areas") { const data = schemas["service-areas"].parse(body); return id ? (await prisma.serviceArea.update({ where: { id }, data })).id : (await prisma.serviceArea.create({ data })).id; }
  const data = schemas.settings.parse(body);
  return (await prisma.siteSetting.upsert({ where: { id: "singleton" }, create: data, update: data })).id;
}

export async function mutateResource(request: Request, resource: string) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "ไม่อนุญาตคำขอนี้" }, { status: 403 });
  if (!await getAdmin()) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  if (!Object.hasOwn(schemas, resource)) return NextResponse.json({ error: "ไม่พบข้อมูล" }, { status: 404 });
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
    const id = typeof body.id === "string" && body.id.length <= 100 ? body.id : undefined;
    if (request.method === "PUT" && !id) return NextResponse.json({ error: "กรุณาระบุรายการที่ต้องการแก้ไข" }, { status: 400 });
    if (request.method === "DELETE" && (!id || resource === "settings")) return NextResponse.json({ error: "ไม่สามารถลบข้อมูลนี้ได้" }, { status: 400 });
    const images = resource === "photos" ? [body.url] : resource === "hero-slides" ? [body.imageUrl] : resource === "posts" && Array.isArray(body.photos) ? body.photos.map((photo: unknown) => typeof photo === "object" && photo !== null && "url" in photo ? photo.url : undefined) : [];
    for (const image of images) if (request.method !== "DELETE" && typeof image === "string" && isLocalImage(image) && !await localImageExists(image)) return NextResponse.json({ error: "ไม่พบรูปภาพ กรุณาเพิ่มไฟล์ใน public/assets ก่อนบันทึก" }, { status: 400 });

    let savedId: string | undefined;
    if (process.env.DATA_SOURCE === "firebase") {
      if (request.method === "DELETE") await deleteFirestoreResource(resource, id!);
      else {
        const parsed = schemas[resource as keyof typeof schemas].parse(body);
        savedId = await saveFirestoreResource(resource, { ...parsed, id });
      }
    } else savedId = await prismaMutation(resource, request.method, id, body);
    invalidate(resource, typeof body.areaSlug === "string" ? body.areaSlug : null);
    return NextResponse.json({ ok: true, ...(savedId ? { id: savedId } : {}) });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบช่องที่กรอกและรูปแบบลิงก์" }, { status: 400 });
    if (error instanceof Error && error.message === "INVALID_DELETE") return NextResponse.json({ error: "ไม่สามารถลบข้อมูลนี้ได้" }, { status: 400 });
    if (error instanceof Error && error.message === "ALREADY_EXISTS") return NextResponse.json({ error: "ชื่อใน URL นี้มีอยู่แล้ว" }, { status: 409 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && ["P2002", "P2003", "P2025"].includes(error.code)) return NextResponse.json({ error: "ข้อมูลซ้ำ หรือข้อมูลที่อ้างอิงถูกลบแล้ว กรุณาโหลดหน้าใหม่" }, { status: 409 });
    console.error("Admin mutation failed", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json({ error: "บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง" }, { status: 500 });
  }
}

export async function readResource(resource: string) {
  if (!await getAdmin()) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  try {
    let data;
    if (process.env.DATA_SOURCE === "firebase") data = await firestoreAdminResource(resource);
    else if (resource === "posts") data = await prisma.post.findMany({ include: { photos: true }, orderBy: { createdAt: "desc" } });
    else if (resource === "photos") data = await prisma.photo.findMany({ orderBy: { createdAt: "desc" } });
    else if (resource === "service-areas") data = await prisma.serviceArea.findMany({ orderBy: { name: "asc" } });
    else return NextResponse.json({ error: "ไม่พบข้อมูล" }, { status: 404 });
    return NextResponse.json({ data }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "โหลดข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง" }, { status: 500 }); }
}
