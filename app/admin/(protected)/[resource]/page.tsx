import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resourceLabels, type ContentRow } from "@/lib/admin";
import { defaultSettings } from "@/lib/defaults";
import type { Resource } from "@/lib/validation";
import ContentManager from "@/components/admin/ContentManager";
export default async function ResourcePage({ params }: { params: Promise<{ resource: string }> }) {
  await requireAdmin();
  const { resource: key } = await params;
  if (!Object.hasOwn(resourceLabels, key)) notFound();
  const resource = key as Resource;
  let rows: ContentRow[] = [];
  switch (resource) {
    case "posts": rows = (await prisma.post.findMany({ orderBy: { createdAt: "desc" } })).map(({ id, title, content, areaSlug }) => ({ id, title, content, areaSlug })); break;
    case "photos": rows = (await prisma.photo.findMany({ orderBy: { createdAt: "desc" } })).map(({ id, url, alt, postId }) => ({ id, url, alt, postId })); break;
    case "hero-slides": rows = await prisma.heroSlide.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }); break;
    case "service-areas": rows = await prisma.serviceArea.findMany({ orderBy: { name: "asc" } }); break;
    case "settings": rows = [await prisma.siteSetting.findUnique({ where: { id: "singleton" } }) ?? defaultSettings]; break;
  }
  const [areas, posts] = await Promise.all([prisma.serviceArea.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } }), prisma.post.findMany({ select: { id: true, title: true }, orderBy: { createdAt: "desc" } })]);
  return <ContentManager key={resource} resource={resource} rows={rows} areas={areas} posts={posts} />;
}
