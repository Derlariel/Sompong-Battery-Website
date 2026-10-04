import "server-only";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { prisma } from "./prisma";
import { defaultAreas, defaultPortfolioPhotos, defaultSettings, defaultSlides } from "./defaults";
import { resolveTrackingSettings } from "./settings";
import { firestoreAreas, firestorePortfolioPage, firestorePosts, firestoreSettings, firestoreSlides } from "./firebase/firestore";
import type { Area, HeroSlide, Post } from "./firebase/types";

export const HOME_PORTFOLIO_LIMIT = 8;
export const PORTFOLIO_PAGE_SIZE = 12;
export type PublicPortfolioPhoto = { id: string; url: string; alt: string; width?: number; height?: number; postTitle?: string; areaName?: string };

const firebaseEnabled = () => process.env.DATA_SOURCE === "firebase";
const allowPrismaFallback = () => process.env.FIREBASE_FALLBACK_TO_PRISMA === "true";

async function firebaseOrFallback<T>(firebaseRead: () => Promise<T>, prismaRead: () => Promise<T>) {
  if (!firebaseEnabled()) return prismaRead();
  try { return await firebaseRead(); }
  catch (error) {
    if (!allowPrismaFallback()) throw error;
    console.error("Firestore read failed; using staged Prisma fallback", error instanceof Error ? error.name : "UnknownError");
    return prismaRead();
  }
}

const cachedFirebaseSettings = unstable_cache(firestoreSettings, ["site-settings"], { tags: ["settings"], revalidate: 300 });
const cachedFirebaseAreas = unstable_cache(firestoreAreas, ["service-areas"], { tags: ["service-areas"], revalidate: 300 });
const cachedFirebaseSlides = unstable_cache(firestoreSlides, ["hero-slides"], { tags: ["hero-slides"], revalidate: 300 });
const cachedFirebaseHomePosts = unstable_cache(() => firestorePosts({ limit: 3 }), ["home-posts"], { tags: ["posts", "photos", "service-areas"], revalidate: 300 });

export const getSettings = cache(async () => {
  const saved = await firebaseOrFallback(cachedFirebaseSettings, () => process.env.DATABASE_URL ? prisma.siteSetting.findUnique({ where: { id: "singleton" } }) : Promise.resolve(null));
  return { ...defaultSettings, ...resolveTrackingSettings(saved) };
});

export const getAreas = cache(async (): Promise<Area[]> => {
  const saved = await firebaseOrFallback(cachedFirebaseAreas, async () => process.env.DATABASE_URL ? prisma.serviceArea.findMany() : []);
  const savedBySlug = new Map(saved.map(item => [item.slug, item]));
  const defaults = defaultAreas.map(item => ({ ...item, ...savedBySlug.get(item.slug) }));
  const defaultSlugs = new Set<string>(defaultAreas.map(item => item.slug));
  return [...defaults, ...saved.filter(item => !defaultSlugs.has(item.slug))];
});

async function prismaPortfolioPage(page: number, pageSize: number) {
  const skip = (page - 1) * pageSize;
  if (!process.env.DATABASE_URL) return { count: 0, savedDefaultUrls: [] as string[], photos: [] as PublicPortfolioPhoto[] };
  const defaultUrls = defaultPortfolioPhotos.map(photo => photo.url);
  const [count, savedDefaults, photos] = await Promise.all([
    prisma.photo.count(), prisma.photo.findMany({ where: { url: { in: defaultUrls } }, select: { url: true } }),
    prisma.photo.findMany({ skip, take: pageSize, include: { post: { select: { title: true, area: { select: { name: true } } } } }, orderBy: [{ createdAt: "desc" }, { id: "desc" }] }),
  ]);
  return { count, savedDefaultUrls: savedDefaults.map(item => item.url), photos: photos.map(item => ({ id: item.id, url: item.url, alt: item.alt, postTitle: item.post?.title, areaName: item.post?.area?.name })) };
}

export async function getPortfolioPage(page: number, pageSize = PORTFOLIO_PAGE_SIZE) {
  const currentPage = Number.isSafeInteger(page) && page > 0 ? page : 1;
  const safePageSize = Math.min(Math.max(pageSize, 1), 24);
  const skip = (currentPage - 1) * safePageSize;
  const result = await firebaseOrFallback(
    () => unstable_cache(() => firestorePortfolioPage(currentPage, safePageSize, defaultPortfolioPhotos.map(item => item.url)), ["portfolio-v2", String(currentPage), String(safePageSize)], { tags: ["photos", "posts", "service-areas"], revalidate: 300 })(),
    () => prismaPortfolioPage(currentPage, safePageSize),
  );
  const savedDefaultUrls = new Set(Array.isArray(result.savedDefaultUrls) ? result.savedDefaultUrls : []);
  const fallbackPhotos = defaultPortfolioPhotos.filter(item => !savedDefaultUrls.has(item.url));
  const fallbackStart = Math.max(0, skip - result.count);
  const fallbackTake = Math.max(0, safePageSize - result.photos.length);
  const photos: PublicPortfolioPhoto[] = [...result.photos, ...fallbackPhotos.slice(fallbackStart, fallbackStart + fallbackTake)];
  const totalItems = result.count + fallbackPhotos.length;
  return { photos, currentPage, totalItems, totalPages: Math.max(1, Math.ceil(totalItems / safePageSize)) };
}

async function prismaHomePosts(): Promise<Post[]> {
  if (!process.env.DATABASE_URL) return [];
  return prisma.post.findMany({ take: 3, include: { photos: { take: 1, orderBy: { createdAt: "asc" } }, area: true }, orderBy: { createdAt: "desc" } }) as unknown as Post[];
}

export const getContent = cache(async (): Promise<{ areas: Area[]; slides: HeroSlide[]; posts: Post[]; photos: PublicPortfolioPhoto[]; portfolioTotal: number }> => {
  const [areas, slides, posts, portfolio] = await Promise.all([
    getAreas(),
    firebaseOrFallback(cachedFirebaseSlides, async () => process.env.DATABASE_URL ? prisma.heroSlide.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }) : defaultSlides),
    firebaseOrFallback(cachedFirebaseHomePosts, prismaHomePosts), getPortfolioPage(1, HOME_PORTFOLIO_LIMIT),
  ]);
  return { areas, slides, posts, photos: portfolio.photos, portfolioTotal: portfolio.totalItems };
});

export const getAreaContent = cache(async (slug: string): Promise<{ area: Area | null; posts: Post[] }> => {
  const [areas, posts] = await Promise.all([
    getAreas(),
    firebaseOrFallback(
      () => unstable_cache(() => firestorePosts({ areaSlug: slug, limit: 6 }), ["area-posts", slug], { tags: ["posts", "photos", "service-areas", `service-area:${slug}`], revalidate: 300 })(),
      async () => process.env.DATABASE_URL ? prisma.post.findMany({ where: { areaSlug: slug }, take: 6, include: { photos: { orderBy: { createdAt: "asc" } }, area: true }, orderBy: { createdAt: "desc" } }) as unknown as Post[] : [],
    ),
  ]);
  return { area: areas.find(item => item.slug === slug) ?? null, posts };
});
