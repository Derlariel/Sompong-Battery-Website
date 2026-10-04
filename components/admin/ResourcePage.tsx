import { prisma } from "@/lib/prisma";
import { type ContentRow } from "@/lib/admin";
import { getSettings } from "@/lib/content";
import type { Resource } from "@/lib/validation";
import ContentManager from "@/components/admin/ContentManager";
import { firestoreAdminResource } from "@/lib/firebase/firestore";
import { requireAdmin } from "@/lib/auth";
export default async function ResourcePage({ resource }: { resource: Resource }) {
  await requireAdmin();
  let rows: ContentRow[] = [];
  if (process.env.DATA_SOURCE === "firebase") rows = await firestoreAdminResource(resource) as ContentRow[];
  else switch (resource) {
    case "posts": rows = (await prisma.post.findMany({ include: { photos: { orderBy: { createdAt: "asc" } } }, orderBy: { createdAt: "desc" } })).map(({ id, title, content, areaSlug, photos }) => ({ id, title, content, areaSlug, photos: photos.map(({ id: photoId, url, alt }) => ({ id: photoId, url, alt })) })); break;
    case "photos": rows = (await prisma.photo.findMany({ orderBy: { createdAt: "desc" } })).map(({ id, url, alt, postId }) => ({ id, url, alt, postId })); break;
    case "hero-slides": rows = await prisma.heroSlide.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }); break;
    case "service-areas": rows = await prisma.serviceArea.findMany({ orderBy: { name: "asc" } }); break;
    case "settings": rows = [await getSettings()]; break;
  }
  let areas: { slug: string; name: string }[];
  let posts: { id: string; title: string }[];
  if (process.env.DATA_SOURCE === "firebase") {
    const [areaRows, postRows] = await Promise.all([firestoreAdminResource("service-areas"), firestoreAdminResource("posts")]);
    areas = (areaRows as Array<{ slug: string; name: string }>).map(item => ({ slug: item.slug, name: item.name }));
    posts = (postRows as Array<{ id: string; title: string }>).map(item => ({ id: item.id, title: item.title }));
  } else [areas, posts] = await Promise.all([prisma.serviceArea.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } }), prisma.post.findMany({ select: { id: true, title: true }, orderBy: { createdAt: "desc" } })]);
  return <ContentManager key={resource} resource={resource} rows={rows} areas={areas} posts={posts} />;
}
