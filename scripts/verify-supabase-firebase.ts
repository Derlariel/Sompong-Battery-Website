import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { PrismaClient } from "@prisma/client";
import { Timestamp } from "firebase-admin/firestore";
import { firestore } from "../lib/firebase/admin-core";

if (existsSync(".env")) loadEnvFile(".env");
const prisma = new PrismaClient();
const comparableDate = (value: unknown) => value instanceof Timestamp ? value.toDate().toISOString() : value instanceof Date ? value.toISOString() : value;

async function main() {
  const db = firestore();
  type RecordValue = Record<string, unknown>;
  type Definition = { name: string; target: string; id: (item: RecordValue) => string; fields: string[]; count: () => Promise<number>; samples: () => Promise<RecordValue[]> };
  const definitions: Definition[] = [
    { name: "posts", target: "posts", id: item => String(item.id), fields: ["title", "content", "areaSlug", "createdAt", "updatedAt"], count: () => prisma.post.count(), samples: async () => prisma.post.findMany({ take: 3, orderBy: { id: "asc" } }) as unknown as RecordValue[] },
    { name: "photos", target: "photos", id: item => String(item.id), fields: ["url", "alt", "publicId", "postId", "createdAt"], count: () => prisma.photo.count(), samples: async () => prisma.photo.findMany({ take: 3, orderBy: { id: "asc" } }) as unknown as RecordValue[] },
    { name: "heroSlides", target: "heroSlides", id: item => String(item.id), fields: ["imageUrl", "title", "subtitle", "linkUrl", "sortOrder"], count: () => prisma.heroSlide.count(), samples: async () => prisma.heroSlide.findMany({ take: 3, orderBy: { id: "asc" } }) as unknown as RecordValue[] },
    { name: "serviceAreas", target: "serviceAreas", id: item => String(item.slug), fields: ["slug", "name", "description"], count: () => prisma.serviceArea.count(), samples: async () => prisma.serviceArea.findMany({ take: 3, orderBy: { id: "asc" } }) as unknown as RecordValue[] },
    { name: "siteSettings", target: "siteSettings", id: () => "main", fields: ["gtmContainerId", "googleAdsConvId", "googleAdsConvLabel", "lineConvLabel"], count: () => prisma.siteSetting.count(), samples: async () => prisma.siteSetting.findMany({ take: 3, orderBy: { id: "asc" } }) as unknown as RecordValue[] },
    { name: "clickEvents", target: "clickEvents", id: item => String(item.id), fields: ["channel", "path", "createdAt"], count: () => prisma.clickEvent.count(), samples: async () => prisma.clickEvent.findMany({ take: 3, orderBy: { id: "asc" } }) as unknown as RecordValue[] },
    { name: "visitEvents", target: "visitEvents", id: item => String(item.id), fields: ["path", "createdAt"], count: () => prisma.visitEvent.count(), samples: async () => prisma.visitEvent.findMany({ take: 3, orderBy: { id: "asc" } }) as unknown as RecordValue[] },
  ];
  let failed = false;
  for (const definition of definitions) {
    const [sourceCount, targetCount, samples] = await Promise.all([
      definition.count(), db.collection(definition.target).count().get(), definition.samples(),
    ]);
    const targetValue = targetCount.data().count;
    const fieldsMatch = (await Promise.all(samples.map(async sample => {
      const document = await db.collection(definition.target).doc(definition.id(sample)).get();
      const data = document.data();
      return document.exists && definition.fields.every(field => comparableDate(data?.[field]) === comparableDate(sample[field]));
    }))).every(Boolean);
    console.log(`${definition.name}: source=${sourceCount} firebase=${targetValue} samples=${fieldsMatch ? "match" : "mismatch"}`);
    if (sourceCount !== targetValue || !fieldsMatch) failed = true;
  }
  if (failed) throw new Error("Verification failed: counts or sampled fields differ.");
  console.log("Verification passed for counts and sampled fields.");
}

main().catch(error => { console.error(error instanceof Error ? error.message : "Verification failed"); process.exitCode = 1; }).finally(() => prisma.$disconnect());
