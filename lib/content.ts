import "server-only";
import { cache } from "react";
import { prisma } from "./prisma";
import { defaultAreas, defaultSettings, defaultSlides } from "./defaults";

export const getContent = cache(async () => {
  if (!process.env.DATABASE_URL) {
    if (process.env.VERCEL_ENV === "production") throw new Error("DATABASE_URL is required for production deployment.");
    return { areas: defaultAreas, slides: defaultSlides, settings: defaultSettings, posts: [] as Awaited<ReturnType<typeof getPosts>>, photos: [] as Awaited<ReturnType<typeof getPhotos>> };
  }
  const [areas, slides, settings, posts, photos] = await Promise.all([
    prisma.serviceArea.findMany({ orderBy: { name: "asc" } }),
    prisma.heroSlide.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }),
    prisma.siteSetting.findUnique({ where: { id: "singleton" } }), getPosts(), getPhotos(),
  ]);
  return { areas, slides, settings: settings ?? defaultSettings, posts, photos };
});
function getPosts() { return prisma.post.findMany({ include: { photos: true, area: true }, orderBy: { createdAt: "desc" } }); }
function getPhotos() { return prisma.photo.findMany({ orderBy: { createdAt: "desc" } }); }
