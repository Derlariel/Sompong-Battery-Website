# Sompong Battery setup

The business specification remains in `README.md`. This implementation uses Next.js 15 App Router, TypeScript, Tailwind CSS, a shadcn-style Radix button, Swiper, Prisma/PostgreSQL, signed JWT admin sessions, and Cloudinary uploads. All customer-facing content is Thai.

## Run locally

Use Node.js 22 or newer and Bun. If Bun is unavailable, prefix Bun commands with `npm.cmd exec --yes --package=bun --` on Windows (for example, `npm.cmd exec --yes --package=bun -- bun dev`).

```sh
bun install --frozen-lockfile
bun dev
```

Open http://127.0.0.1:3000. Without `DATABASE_URL`, public pages show read-only starter content and all 50 district pages. Admin login stays disabled. No fake admin account, browser-local CMS, or sample customer jobs are provided.

## Connect PostgreSQL and create an admin

1. Copy `.env.example` to `.env` and fill in `DATABASE_URL` for a PostgreSQL database. Use a direct connection for migrations if your provider's pooled endpoint does not support them.
2. Set `NEXTAUTH_SECRET` to a cryptographically random value of at least 32 characters. Generate one with `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`.
3. Set both `SITE_URL` and `NEXTAUTH_URL` to the exact browser origin, such as `http://127.0.0.1:3000`. This is used for canonical URLs and mutation origin checks. Do not mix `localhost` and `127.0.0.1`.
4. Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` (at least 12 characters and at most 72 UTF-8 bytes).
5. Apply the included migration and seed the content:

```sh
bun run db:deploy
bun run db:seed
bun dev
```

Sign in at `/admin/login`. Re-running the seed preserves edited content and existing passwords. To add another admin, change the seed credentials to a new username and run it again. Remove `ADMIN_PASSWORD` from the runtime environment after seeding. Rotate existing passwords using a controlled database maintenance script with bcrypt hashing; there is no public registration or password reset endpoint.

## Manage content

- **Posts:** create, edit, delete portfolio entries and optionally assign a district.
- **Photos:** upload or enter a Cloudinary image URL, write descriptive alt text, and optionally attach it to a post. Unattached photos appear in the home gallery. Deleting a post detaches its photos. Deleting a photo removes its database entry; the recoverable source file remains in Cloudinary. Remove unused source assets there when appropriate.
- **Hero slides:** edit headings, copy, optional image, and destination link. Change the numeric display order to reorder slides. If all slides are removed, the home page retains a contact-focused fallback.
- **Service areas:** edit district content and slugs. Changes appear on `/service-area/[slug]`, including metadata and structured data. Changing a slug changes the URL; plan redirects before changing indexed slugs.
- **Settings:** configure analytics as described below.

No work photos are supplied in the specification, so no fabricated jobs or stock photos are presented as completed work. Upload actual work images through the admin panel. The initial hero is typographic and supports uploaded photos.

## Cloudinary

Set the server-only `CLOUDINARY_URL` from your Cloudinary account (`cloudinary://API_KEY:API_SECRET@CLOUD_NAME`). Uploads are authenticated, accept JPG/PNG/WebP with verified file signatures, and have a 3 MB limit to fit Vercel's request size limits. Images are resized to a maximum of 1800 × 1800 and served through `next/image`. Do not expose the Cloudinary secret using a `NEXT_PUBLIC_` variable.

## Google Ads tracking

Set IDs and labels through `/admin/settings`. The database settings are authoritative; the `NEXT_PUBLIC_*` example keys from the business spec are not required by this implementation.

**GTM mode (recommended):** enter a `GTM-...` container ID. Each Call/LINE click pushes `contact_click` to the data layer with `contact_channel` set to `call` or `line`. In GTM:

1. Install the Google tag for the Ads account and a Conversion Linker.
2. Create a Data Layer Variable named `contact_channel`.
3. Create two Custom Event triggers for `contact_click`, filtered to `call` and `line` respectively.
4. Create one Google Ads Conversion Tracking tag per channel with the conversion ID and label supplied by the Google Ads team. Assign the matching trigger. The ID/label values stored in the admin panel apply to direct mode; GTM tag configuration is managed in GTM.
5. Validate both buttons using Tag Assistant before publishing the container.

**Direct mode:** leave GTM blank, then enter `AW-...`, the Call conversion label, and the LINE label. The app loads gtag and sends one `conversion` event per configured channel. Missing labels disable that channel's tracking. Using GTM disables direct events to avoid duplicate conversions. Links continue working when analytics is absent or blocked. Click tracking measures intent to contact, not a completed call or sale.

## Validation

```sh
bun run lint
bun run typecheck
bun run test
bun run build
```

With the read-only preview running, `node tests/smoke.mjs` checks public routes, district metadata, the sitemap, admin redirects, and unauthorized writes over HTTP.

Tests cover CMS input validation, all district seed slugs, session signature/tampering/expiration, admin API authorization and CRUD dispatch, and distinct Call/LINE analytics events. Real database persistence, Cloudinary credentials, and Ads delivery additionally require a configured environment.

## Deploy to Vercel

Import this repository into Vercel as a Next.js project. Use `bun install --frozen-lockfile` and `bun run build`. Set `DATABASE_URL`, `NEXTAUTH_SECRET`, `CLOUDINARY_URL`, and both URL variables to the final HTTPS origin. Apply `bun run db:deploy` through a controlled deployment step, and seed once against that database before opening the site. Do not run migrations or seeding automatically on every build. Production Vercel deployments require a database; build-time previews do not silently mask a configured database failure.

Admin cookies are HttpOnly, SameSite=Lax, Secure in production, and expire after eight hours. Server-side admin checks guard all protected pages and write endpoints. Login attempts are throttled per username in PostgreSQL (10 per 15-minute window). Add host-level rate limiting for a public deployment to supplement the account throttle. Serve production over HTTPS.

The project has no customer accounts, online booking, payment processing, or multilingual routes, as requested in the scope.
