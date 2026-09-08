import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type ContentRow } from "@/lib/admin";
import { getSettings } from "@/lib/content";
import type { Resource } from "@/lib/validation";
import ContentManager from "@/components/admin/ContentManager";
export default async function ResourcePage({ resource }: { resource: Resource }) {
  await requireAdmin();
  let rows: ContentRow[] = [];
  switch (resource) {
    case "posts": rows = (await prisma.post.findMany({ include: { photos: { orderBy: { createdAt: "asc" } } }, orderBy: { createdAt: "desc" } })).map(({ id, title, content, areaSlug, photos }) => ({ id, title, content, areaSlug, photos: photos.map(({ id: photoId, url, alt }) => ({ id: photoId, url, alt })) })); break;
    case "photos": rows = (await prisma.photo.findMany({ orderBy: { createdAt: "desc" } })).map(({ id, url, alt, postId }) => ({ id, url, alt, postId })); break;
    case "hero-slides": rows = await prisma.heroSlide.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }); break;
    case "service-areas": rows = await prisma.serviceArea.findMany({ orderBy: { name: "asc" } }); break;
    case "settings": rows = [await getSettings()]; break;
  }
  const [areas, posts] = await Promise.all([prisma.serviceArea.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } }), prisma.post.findMany({ select: { id: true, title: true }, orderBy: { createdAt: "desc" } })]);
  return <ContentManager key={resource} resource={resource} rows={rows} areas={areas} posts={posts} />;
}
