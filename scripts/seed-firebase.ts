import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { firestore } from "../lib/firebase/admin-core";
import { defaultAreas, defaultSettings, defaultSlides } from "../lib/defaults";
import { resolveTrackingSettings } from "../lib/settings";

if (existsSync(".env")) loadEnvFile(".env");

async function main() {
  const db = firestore();
  const entries = [
    ...defaultAreas.map(item => ({ reference: db.collection("serviceAreas").doc(item.slug), data: item })),
    ...defaultSlides.map(item => ({ reference: db.collection("heroSlides").doc(item.id), data: item })),
    { reference: db.collection("siteSettings").doc("main"), data: { ...defaultSettings, ...resolveTrackingSettings() } },
  ];
  let created = 0;
  for (let offset = 0; offset < entries.length; offset += 450) {
    const group = entries.slice(offset, offset + 450);
    const states = await Promise.all(group.map(item => item.reference.get()));
    const missing = group.filter((_, index) => !states[index].exists);
    const batch = db.batch();
    missing.forEach(item => batch.create(item.reference, item.data));
    if (missing.length) await batch.commit();
    created += missing.length;
  }
  console.log(`Firebase seed complete: ${created} documents created; existing content preserved.`);
}

main().catch(error => { console.error("Firebase seed failed", error instanceof Error ? error.message : "Unknown error"); process.exitCode = 1; });
