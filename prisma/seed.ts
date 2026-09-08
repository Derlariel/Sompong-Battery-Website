import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { defaultAreas, defaultSettings, defaultSlides } from "../lib/defaults";

if (existsSync(".env")) loadEnvFile(".env");
const db = new PrismaClient();
async function main() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password || password.length < 12 || Buffer.byteLength(password) > 72) {
    throw new Error("Set ADMIN_USERNAME and a 12–72 byte ADMIN_PASSWORD before seeding.");
  }
  await db.$transaction(async tx => {
    for (const { slug, name, description } of defaultAreas) {
      const area = { slug, name, description };
      await tx.serviceArea.upsert({ where: { slug: area.slug }, update: {}, create: area });
    }
    for (const slide of defaultSlides) {
      await tx.heroSlide.upsert({ where: { id: slide.id }, update: {}, create: slide });
    }
    await tx.siteSetting.upsert({ where: { id: "singleton" }, update: {}, create: defaultSettings });
    await tx.adminUser.upsert({ where: { username }, update: {}, create: { username, passwordHash: await hash(password, 12) } });
  }, { timeout: 30000 });
  console.log("Seed complete: 50 districts, hero slides, settings and administrator. Existing content preserved.");
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => db.$disconnect());
