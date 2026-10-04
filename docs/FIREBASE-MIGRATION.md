# Firebase migration runbook

The application contains both data paths during cutover. `DATA_SOURCE=prisma` preserves the current production behavior. `DATA_SOURCE=firebase` enables Firebase Authentication, Firestore reads/writes, analytics, and dashboard queries. Keep Supabase and the Prisma dependencies until the production checklist below passes.

## Firebase setup

1. Create a Firebase project, enable Email/Password in Authentication, and create the administrator in Firebase Authentication. Do not create a password document in Firestore.
2. Create Cloud Firestore. Deploy `firestore.rules` and `firestore.indexes.json`. Browser database access is denied; the Next.js server uses Firebase Admin SDK.
3. Configure the environment variable names listed in `.env.example`. Store the service-account private key only in server-side `FIREBASE_PRIVATE_KEY`; on Vercel it may contain literal `\n`, which the app converts to newlines. Never use a `NEXT_PUBLIC_` prefix for Admin credentials.
4. Grant the existing Firebase Auth user the `admin: true` custom claim:

   ```sh
   bun run firebase:grant-admin -- admin@sompong-battery.com
   ```

   Sign out and in after changing claims. A Firebase user without the claim is denied by the server.

## Data and seed

The idempotent seed creates only missing service areas, hero slides, and `siteSettings/main`:

```sh
bun run firebase:seed
```

The migration never deletes either database and never migrates `AdminUser`, password hashes, or `LoginAttempt`:

```sh
bun run migrate:firebase --dry-run
bun run migrate:firebase
bun run verify:firebase
```

Migration uses existing IDs for posts, photos, hero slides, click events, and visit events. Service-area slugs become document IDs. `photos.postId` and `posts.areaSlug` preserve relationships. Existing Firestore documents are skipped, not overwritten. Writes use batches below Firestore's limit. Verification compares every collection count and samples non-sensitive fields and timestamps.

## Controlled cutover

1. Deploy Firebase code with `DATA_SOURCE=prisma`.
2. Run the dry run, migration, and verification commands against production credentials.
3. On a preview deployment set `DATA_SOURCE=firebase` and `FIREBASE_FALLBACK_TO_PRISMA=true`.
4. Verify public pages, all service-area URLs and SEO, Firebase admin login/session/logout, every CRUD area, Call/LINE tracking, GTM/Ads, visitor statistics, and dashboard counts.
5. Set `DATA_SOURCE=firebase` in production. Keep the temporary fallback while monitoring; Firestore write failures are returned to admin, while contact links navigate independently of the fire-and-forget tracking request.
6. After stable production verification, set `FIREBASE_FALLBACK_TO_PRISMA=false`. Verify again.
7. Only then remove Prisma/Supabase code, dependencies, scripts, environment variables, migrations, legacy bcrypt/JWT auth, and the cutover switch in a separate cleanup change.

`LoginAttempt` is not recreated: Firebase Authentication owns password verification and abuse protection. Add platform-level rate limiting later only if production telemetry demonstrates a need. Existing local and Cloudinary image URLs remain unchanged; Firebase Storage is intentionally deferred.

## Cache behavior

Public settings, hero slides, service areas, posts, and portfolio data use the Next.js data cache with five-minute revalidation. Admin mutations invalidate only the relevant tags (`settings`, `hero-slides`, `service-areas`, `posts`, and `photos`, plus the affected area tag). There are no realtime listeners or polling Firestore queries.

Dashboard totals use Firestore aggregation queries. Only the bounded 30-day chart window and eight recent click events download documents.

## Production acceptance checklist

- `bun run verify:firebase` passes with matching counts and samples.
- Homepage, portfolio, sitemap, robots, metadata, canonical URLs, LocalBusiness and Service schema work.
- Admin and non-admin authorization tests pass with secure HttpOnly, Secure-in-production, SameSite=Lax cookies.
- Posts, photos, hero slides, service areas, and settings CRUD work.
- Call and LINE links navigate even when `/api/analytics/click` fails; Firestore events and GTM/Ads events work when available.
- Vercel production deployment and Cloudflare domain are verified and monitored.

Until every item passes: **DO NOT REMOVE OR DISABLE SUPABASE**.
