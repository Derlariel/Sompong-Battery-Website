import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { PrismaClient } from "@prisma/client";
import { Timestamp, type DocumentReference } from "firebase-admin/firestore";
import { firestore } from "../lib/firebase/admin-core";

if (existsSync(".env")) loadEnvFile(".env");
const dryRun = process.argv.includes("--dry-run");
const prisma = new PrismaClient();

type Write = { reference: DocumentReference; data: Record<string, unknown> };

async function createMissing(writes: Write[]) {
  let created = 0;
  for (let offset = 0; offset < writes.length; offset += 450) {
    const group = writes.slice(offset, offset + 450);
    const states = await Promise.all(group.map(item => item.reference.get()));
    const missing = group.filter((_, index) => !states[index].exists);
    if (!missing.length) continue;
    const batch = firestore().batch();
    missing.forEach(item => batch.create(item.reference, item.data));
    await batch.commit();
    created += missing.length;
  }
  return created;
}

async function main() {
  const [posts, photos, slides, areas, settings, clicks, visits] = await Promise.all([
    prisma.post.findMany(), prisma.photo.findMany(), prisma.heroSlide.findMany(), prisma.serviceArea.findMany(), prisma.siteSetting.findMany(), prisma.clickEvent.findMany(), prisma.visitEvent.findMany(),
  ]);
  const counts = { posts: posts.length, photos: photos.length, heroSlides: slides.length, serviceAreas: areas.length, siteSettings: settings.length, clickEvents: clicks.length, visitEvents: visits.length };
  console.log("Source counts", counts);
  if (dryRun) { console.log("Dry run complete; no Firebase writes were attempted."); return; }
  const db = firestore();
  const writes: Record<keyof typeof counts, Write[]> = {
    posts: posts.map(item => ({ reference: db.collection("posts").doc(item.id), data: { title: item.title, content: item.content, areaSlug: item.areaSlug, createdAt: Timestamp.fromDate(item.createdAt), updatedAt: Timestamp.fromDate(item.updatedAt) } })),
    photos: photos.map(item => ({ reference: db.collection("photos").doc(item.id), data: { url: item.url, alt: item.alt, publicId: item.publicId, postId: item.postId, createdAt: Timestamp.fromDate(item.createdAt) } })),
    heroSlides: slides.map(item => ({ reference: db.collection("heroSlides").doc(item.id), data: { imageUrl: item.imageUrl, title: item.title, subtitle: item.subtitle, linkUrl: item.linkUrl, sortOrder: item.sortOrder } })),
    serviceAreas: areas.map(item => ({ reference: db.collection("serviceAreas").doc(item.slug), data: { slug: item.slug, name: item.name, description: item.description } })),
    siteSettings: settings.map(item => ({ reference: db.collection("siteSettings").doc("main"), data: { gtmContainerId: item.gtmContainerId, googleAdsConvId: item.googleAdsConvId, googleAdsConvLabel: item.googleAdsConvLabel, lineConvLabel: item.lineConvLabel } })),
    clickEvents: clicks.map(item => ({ reference: db.collection("clickEvents").doc(item.id), data: { type: item.channel === "line" ? "LINE_CLICK" : "CALL_CLICK", channel: item.channel, page: item.path, path: item.path, createdAt: Timestamp.fromDate(item.createdAt) } })),
    visitEvents: visits.map(item => ({ reference: db.collection("visitEvents").doc(item.id), data: { path: item.path, createdAt: Timestamp.fromDate(item.createdAt) } })),
  };
  const created = Object.fromEntries(await Promise.all(Object.entries(writes).map(async ([name, items]) => [name, await createMissing(items)])));
  console.log("Created counts", created);
  console.log("Existing target documents were preserved. Supabase data was not modified.");
}

main().catch(error => { console.error("Migration failed", error instanceof Error ? error.message : "Unknown error"); process.exitCode = 1; }).finally(() => prisma.$disconnect());
