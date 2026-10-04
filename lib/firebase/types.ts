export type Area = { id: string; slug: string; name: string; description: string };
export type HeroSlide = { id: string; imageUrl: string; title: string; subtitle: string; linkUrl: string; sortOrder?: number };
export type Photo = { id: string; url: string; alt: string; publicId: string | null; postId: string | null; createdAt: Date };
export type Post = { id: string; title: string; content: string; areaSlug: string | null; createdAt: Date; updatedAt: Date; photos: Photo[]; area: Area | null };
export type SiteSettings = { id: string; gtmContainerId: string; googleAdsConvId: string; googleAdsConvLabel: string; lineConvLabel: string };
export type ClickEvent = { id: string; type: "CALL_CLICK" | "LINE_CLICK"; channel: "call" | "line"; page: string; path: string; areaSlug?: string; utmSource?: string; utmMedium?: string; utmCampaign?: string; createdAt: Date };
