import type { MetadataRoute } from "next";
import { getAreas } from "@/lib/content";
import { siteUrl } from "@/lib/seo";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const areas = await getAreas();
  return [{ url: siteUrl(), changeFrequency: "weekly", priority: 1 }, { url: `${siteUrl()}/portfolio`, changeFrequency: "weekly", priority: 0.8 }, ...areas.map(area => ({ url: `${siteUrl()}/service-area/${area.slug}`, changeFrequency: "weekly" as const, priority: 0.8 }))];
}
