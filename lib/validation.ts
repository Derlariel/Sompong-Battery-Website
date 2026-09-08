import { z } from "zod";

export function isSafeLink(value: string) {
  return /^\/(?!\/|\\)[^\\]*$/.test(value) || /^tel:\+?[0-9-]+$/.test(value) || (() => {
    try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; }
  })();
}
export function isImageUrl(value: string) {
  try { const url = new URL(value); return url.protocol === "https:" && url.hostname === "res.cloudinary.com" && !url.username && !url.password; } catch { return false; }
}
const text = (max: number) => z.string().trim().min(1, "กรุณากรอกข้อมูล").max(max);
const optionalId = z.string().trim().max(100).nullable().optional().transform(v => v || null);
const imageUrl = z.string().max(2000).refine(v => !v || isImageUrl(v), "ใช้ URL รูปภาพ HTTPS จาก Cloudinary");
export const schemas = {
  posts: z.object({ title: text(200), content: text(20000), areaSlug: optionalId }),
  photos: z.object({ url: imageUrl.refine(Boolean, "กรุณาอัปโหลดรูปภาพ"), alt: text(300), postId: optionalId }),
  "hero-slides": z.object({ title: text(200), subtitle: z.string().trim().max(500), imageUrl, linkUrl: z.string().max(2000).refine(isSafeLink, "ลิงก์ไม่ถูกต้อง"), sortOrder: z.coerce.number().int().min(0).max(9999) }),
  "service-areas": z.object({ name: text(100), slug: text(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "ใช้ตัวอักษร a-z ตัวเลข และขีดกลาง"), description: text(10000) }),
  settings: z.object({
    gtmContainerId: z.string().trim().regex(/^(GTM-[A-Z0-9]+)?$/, "GTM ID ไม่ถูกต้อง"),
    googleAdsConvId: z.string().trim().regex(/^(AW-[0-9]+)?$/, "Conversion ID ต้องขึ้นต้นด้วย AW-"),
    googleAdsConvLabel: z.string().trim().max(200).regex(/^[A-Za-z0-9_-]*$/),
    lineConvLabel: z.string().trim().max(200).regex(/^[A-Za-z0-9_-]*$/),
  }),
};
export type Resource = keyof typeof schemas;
export const loginSchema = z.object({ username: text(100), password: z.string().min(1).max(72) });
