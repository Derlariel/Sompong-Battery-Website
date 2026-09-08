import type { Resource } from "./validation";
export const resourceLabels: Record<Resource, string> = { posts: "ผลงาน / บทความ", photos: "คลังรูปภาพ", "hero-slides": "สไลด์หน้าแรก", "service-areas": "พื้นที่ให้บริการ", settings: "ตั้งค่า Google Ads" };
export type ContentRow = { id: string; [key: string]: string | number | null };
