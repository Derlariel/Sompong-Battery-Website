import { access, stat } from "node:fs/promises";
import assert from "node:assert/strict";

const files = [
  "README.md", "AGENTS.md", "app/layout.tsx", "app/(public)/page.tsx", "app/(public)/layout.tsx",
  "app/(public)/service-area/[slug]/page.tsx", "app/admin/layout.tsx", "app/admin/login/page.tsx",
  "app/admin/(protected)/layout.tsx", "app/admin/(protected)/page.tsx",
  ...["posts", "photos", "hero-slides", "service-areas", "settings"].map(name => `app/admin/(protected)/${name}/page.tsx`),
  ...["posts", "photos", "service-areas"].map(name => `app/api/${name}/route.ts`),
  "app/api/auth/login/route.ts", "app/api/auth/logout/route.ts", "app/api/admin/upload/route.ts",
  "components/HeroSwiper.tsx", "components/ServiceCard.tsx", "components/ContactCTA.tsx",
  "lib/prisma.ts", "lib/auth.ts", "lib/gtag.ts", "prisma/schema.prisma", "public/assets/README.md",
];
for (const file of files) await access(file);
const directories = ["components/admin", "public/assets/images/hero", "public/assets/images/portfolio", "public/assets/images/service-areas", "public/assets/icons", "public/assets/branding"];
for (const directory of directories) assert.ok((await stat(directory)).isDirectory(), directory);
console.log(`Verified ${files.length} files and ${directories.length} directories.`);
console.log("README mappings: admin pages retain the URL-transparent (protected) group; custom JWT login/logout replaces the optional NextAuth catch-all.");
