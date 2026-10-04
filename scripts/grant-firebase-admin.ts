import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { firebaseAdminAuth } from "../lib/firebase/admin-core";

if (existsSync(".env")) loadEnvFile(".env");

async function main() {
  const email = process.argv.find((value, index) => index > 1 && value.includes("@"));
  if (!email || !email.includes("@")) throw new Error("Usage: bun run firebase:grant-admin -- admin@example.com");
  const auth = firebaseAdminAuth();
  const user = await auth.getUserByEmail(email);
  await auth.setCustomUserClaims(user.uid, { ...user.customClaims, admin: true });
  await auth.revokeRefreshTokens(user.uid);
  console.log("Admin claim granted. Sign in again to receive the new claim.");
}

main().catch(error => { console.error(error instanceof Error ? error.message : "Unable to grant admin claim"); process.exitCode = 1; });
