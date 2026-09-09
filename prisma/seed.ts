import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { defaultAreas, defaultSettings, defaultSlides } from "../lib/defaults";
import { resolveTrackingSettings } from "../lib/settings";

if (existsSync(".env")) loadEnvFile(".env");
const db = new PrismaClient();
async function main() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password || password.length < 12 || Buffer.byteLength(password) > 72) {
    throw new Error("Set ADMIN_USERNAME and a 12–72 byte ADMIN_PASSWORD before seeding.");
  }
  const passwordHash = await hash(password, 12);

  await db.serviceArea.createMany({
    data: defaultAreas.map(({ slug, name, description }) => ({ slug, name, description })),
    skipDuplicates: true,
  });
  await db.heroSlide.createMany({ data: defaultSlides, skipDuplicates: true });
  await Promise.all([
    db.siteSetting.upsert({
      where: { id: "singleton" },
      update: {},
      create: { ...defaultSettings, ...resolveTrackingSettings() },
    }),
    db.adminUser.upsert({
      where: { username },
      update: {},
      create: { username, passwordHash },
    }),
  ]);
  console.log("Seed complete: 50 districts, hero slides, settings and administrator. Existing content preserved.");
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => db.$disconnect());
