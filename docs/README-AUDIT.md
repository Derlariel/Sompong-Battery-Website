# README implementation audit

The entire business README was compared with the repository before editing. Its architecture and schema sections describe a **suggested** structure and an **initial draft**; the table distinguishes missing functionality from supported implementation choices. No customer accounts, booking, online payments, multilingual routes, OAuth, or 2FA have been introduced.

## Findings and resolutions

| README section | Initial finding | Implementation / verification |
| --- | --- | --- |
| 1. Business goal and audience | Thai lead-generation pages and correct contact details existed. | Preserved; direct Call/LINE actions added to services and error states. |
| 2. Framework and tooling | Next.js 15, TypeScript, Bun lockfile, Tailwind, Radix/shadcn-style button, Swiper, Prisma/PostgreSQL and Cloudinary already present. Custom JWT is an explicitly allowed auth option. | Preserved dependencies and deployment target. No unnecessary framework or database replacement. |
| 3.1. Hero | Autoplay/arrows existed; no dots, multiple H1s, and LINE slide destinations were ignored. | Added selectable dots, a single H1, working slide destinations, 44px controls, motion-preference handling, and responsive image sizes. Keyboard focus on content stops autoplay. |
| 3.2. Services | Service descriptions existed, but cards were inline and actions only scrolled to the footer. | Extracted `ServiceCard.tsx`; added direct Call and LINE actions inside the services section. |
| 3.3. Coverage | Three coverage/payment blocks existed; some promised information was elsewhere. | Blocks explicitly cover 24/7 availability, holidays, free advice/checks, dispatch timing, technician service, cash and transfer. The existing travel/traffic qualifier remains. |
| 3.4. District directory | Fifty districts, CMS-driven routes, descriptions and associated jobs already existed. | Preserved; sitemap and district routes checked. Starter content is used only without a configured database, and Vercel production requires a database. |
| 3.5. Footer/mobile contact | Correct phone and LINE link existed; fixed LINE action did not show the ID. | Sticky actions retained, with visible LINE ID; safe-area spacing retained. |
| 3.6. SEO/performance | District metadata, JSON-LD, sitemap, robots, `next/image` and dynamic Swiper import existed. Home metadata was only partially page-specific. | Explicit home metadata added; district metadata retained; admin pages have individual titles and remain noindex. Hero responsive sizing and single-H1 markup verified. Real Core Web Vitals require browser/field measurement; no unmeasured performance score is claimed. |
| 4.1. Authentication | Username/password, hashed passwords, signed expiring cookies, multi-admin model and guarded writes existed. | Preserved. Protected layouts and page-level guards remain; new API endpoints use the same guards. |
| 4.2. Posts/photos | CRUD, upload, post associations and photo-library display existed. Image validation allowed only Cloudinary. | Local `/assets/...` raster images now validate and preview; missing local files are rejected. Cloudinary uploads remain unchanged. Delete confirmations and recoverable original media remain. |
| 4.2. Slides/areas/dashboard | Slide CRUD/numeric ordering, district CRUD and optional count dashboard existed through a generic route. | Named page directories added; shared content manager retained. Current admin navigation is indicated. Changing sort order still reorders slides. |
| 4.3. Google Ads | Analytics lived in the public layout; GTM received `contact_click` without saved IDs/labels; early direct clicks could be lost; README environment defaults were unused. | Root-layout initialization, `conversion` data-layer events with channel/ID/label, queued early gtag events, and environment defaults added. Saved settings override defaults, including deliberately blank values. GTM trigger migration is documented in SETUP.md. |
| 5. Structure | Missing named admin folders, three named API handlers, `ServiceCard.tsx` and any asset directory. | Added named pages and API handlers; shared code lives in `components/admin/ResourcePage.tsx` and `lib/admin-api.ts`. Existing `/api/admin/[resource]` writes remain compatible. See two mappings below. |
| 6. Data model | All six business models existed, plus login throttling. `passwordHash`, photo alt text, LINE label and relational constraints extend the draft. | Preserved schema and data; no destructive migration. Seed still preserves existing CMS edits and users, and now initializes settings from environment defaults. |
| 7. Non-goals | Already respected. | Preserved. |
| 8. Environment | All listed example keys existed; public analytics keys were ignored. | Supported as initial defaults. Additional optional labels are documented. Secrets remain server-only and ignored by Git. |
| 9. Contact details | `087-252-7842`, `tel:0872527842`, `sompong7842`, and the specified LINE URL were correct. | Preserved and checked in markup/route tests. |
| New assets request | The original README specified no assets path. | Added and documented `public/assets/images/{hero,portfolio,service-areas}`, `icons`, and `branding`, consistent with Next.js and AGENTS.md. No nonexistent image is referenced by the UI. |

## Folder mappings

```text
app/
  (public)/page.tsx, layout.tsx, service-area/[slug]/page.tsx
  admin/
    layout.tsx
    login/page.tsx
    (protected)/
      layout.tsx, page.tsx
      posts/page.tsx
      photos/page.tsx
      hero-slides/page.tsx
      service-areas/page.tsx
      settings/page.tsx
  api/
    auth/login/route.ts, auth/logout/route.ts
    posts/route.ts, photos/route.ts, service-areas/route.ts
    admin/[resource]/route.ts, admin/upload/route.ts
components/
  HeroSwiper.tsx, ServiceCard.tsx, ContactCTA.tsx, admin/...
lib/
  prisma.ts, auth.ts, gtag.ts, admin-api.ts, assets.ts, ...
prisma/
  schema.prisma, seed.ts, migrations/...
public/assets/
  images/hero/, images/portfolio/, images/service-areas/, icons/, branding/
```

Two intentional mappings remain: `(protected)` adds no URL segment and separates guarded admin screens from the public login page; the allowed custom JWT option uses `api/auth/login` and `logout`, so there is no misleading `[...nextauth]` handler or unused NextAuth dependency. The suggested structure is satisfied by these documented equivalents, not by claiming a byte-for-byte folder match.

Named `/api/posts`, `/api/photos`, and `/api/service-areas` support authenticated GET/POST/PUT/DELETE. POST creates or updates by `id`; PUT requires `id`; DELETE requires `id`. They share validation and write handling with the existing admin endpoints. API reads return `{ data }` with `Cache-Control: no-store`.

## Validation and remaining external checks

Run `bun run verify:structure`, `bun run lint`, `bun run typecheck`, `bun run test`, and `bun run build`. Against the read-only local preview, run `node tests/smoke.mjs` for public routes, all fifty district links, metadata, assets, admin redirects, and API authorization. Tests prioritize authorization, asset traversal/missing files, analytics configuration and early clicks; rendered component tests cover slide links and heading/dot markup.

Live PostgreSQL CRUD, Cloudinary delivery, Ads/Tag Assistant verification, Vercel publication and measured Core Web Vitals need their configured services. The Browser skill reported no connected browser, so visual layout and interactive keyboard/touch QA remain unverified here. These are explicit validation limits, not claims of completed external testing.

Local development/architecture/UX/design-system/testing/QA skills informed the shared route design, contact hierarchy, accessible controls and regression scope. Some supplied skill files are ZIP packages with `.md` names; their embedded instructions were read without changing those files.
