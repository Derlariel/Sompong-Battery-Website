import "server-only";
import { cache } from "react";
import { prisma } from "./prisma";
import { defaultAreas, defaultPortfolioPhotos, defaultSettings, defaultSlides } from "./defaults";
import { resolveTrackingSettings } from "./settings";

export const HOME_PORTFOLIO_LIMIT = 8;
export const PORTFOLIO_PAGE_SIZE = 12;

export type PublicPortfolioPhoto = {
  id: string;
  url: string;
  alt: string;
  width?: number;
  height?: number;
  postTitle?: string;
  areaName?: string;
};

export const getSettings = cache(async () => {
  const saved = process.env.DATABASE_URL ? await prisma.siteSetting.findUnique({ where: { id: "singleton" } }) : null;
  return { ...defaultSettings, ...resolveTrackingSettings(saved) };
});

export const getAreas = cache(async () => process.env.DATABASE_URL
  ? prisma.serviceArea.findMany({ orderBy: { name: "asc" } })
  : defaultAreas);

export async function getPortfolioPage(page: number, pageSize = PORTFOLIO_PAGE_SIZE) {
  const currentPage = Number.isSafeInteger(page) && page > 0 ? page : 1;
  const safePageSize = Math.min(Math.max(pageSize, 1), 24);
  const skip = (currentPage - 1) * safePageSize;
  if (!process.env.DATABASE_URL) {
    const totalItems = defaultPortfolioPhotos.length;
    return {
      photos: defaultPortfolioPhotos.slice(skip, skip + safePageSize),
      currentPage,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / safePageSize)),
    };
  }

  const defaultUrls = defaultPortfolioPhotos.map(photo => photo.url);
  const [databaseCount, savedDefaults, databasePhotos] = await Promise.all([
    prisma.photo.count(),
    prisma.photo.findMany({ where: { url: { in: defaultUrls } }, select: { url: true } }),
    prisma.photo.findMany({
      skip,
      take: safePageSize,
      include: { post: { select: { title: true, area: { select: { name: true } } } } },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    }),
  ]);
  const savedDefaultUrls = new Set(savedDefaults.map(photo => photo.url));
  const fallbackPhotos = defaultPortfolioPhotos.filter(photo => !savedDefaultUrls.has(photo.url));
  const fallbackStart = Math.max(0, skip - databaseCount);
  const fallbackTake = Math.max(0, safePageSize - databasePhotos.length);
  const photos: PublicPortfolioPhoto[] = [
    ...databasePhotos.map(photo => ({ id: photo.id, url: photo.url, alt: photo.alt, postTitle: photo.post?.title, areaName: photo.post?.area?.name })),
    ...fallbackPhotos.slice(fallbackStart, fallbackStart + fallbackTake),
  ];
  const totalItems = databaseCount + fallbackPhotos.length;
  return { photos, currentPage, totalItems, totalPages: Math.max(1, Math.ceil(totalItems / safePageSize)) };
}

export const getContent = cache(async () => {
  if (!process.env.DATABASE_URL) {
    if (process.env.VERCEL_ENV === "production") throw new Error("DATABASE_URL is required for production deployment.");
    const portfolio = await getPortfolioPage(1, HOME_PORTFOLIO_LIMIT);
    return { areas: defaultAreas, slides: defaultSlides, settings: await getSettings(), posts: [] as Awaited<ReturnType<typeof getHomePosts>>, photos: portfolio.photos, portfolioTotal: portfolio.totalItems };
  }
  const [areas, slides, settings, posts, portfolio] = await Promise.all([
    getAreas(),
    prisma.heroSlide.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }),
    getSettings(), getHomePosts(), getPortfolioPage(1, HOME_PORTFOLIO_LIMIT),
  ]);
  return { areas, slides, settings: settings ?? defaultSettings, posts, photos: portfolio.photos, portfolioTotal: portfolio.totalItems };
});
function getHomePosts() { return prisma.post.findMany({ take: 3, include: { photos: { take: 1, orderBy: { createdAt: "asc" } }, area: true }, orderBy: { createdAt: "desc" } }); }

export const getAreaContent = cache(async (slug: string) => {
  if (!process.env.DATABASE_URL) return { area: defaultAreas.find(area => area.slug === slug) ?? null, posts: [] as Awaited<ReturnType<typeof getAreaPosts>> };
  const [area, posts] = await Promise.all([
    prisma.serviceArea.findUnique({ where: { slug } }),
    getAreaPosts(slug),
  ]);
  return { area, posts };
});

function getAreaPosts(slug: string) {
  return prisma.post.findMany({ where: { areaSlug: slug }, take: 6, include: { photos: { orderBy: { createdAt: "asc" } }, area: true }, orderBy: { createdAt: "desc" } });
}
