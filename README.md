# Sompong Battery — Project Scope

> This document is intended to be used as the **Business Scope** section inside `AGENTS.md`, so that an AI coding agent (Claude Code / Cursor / Copilot, Codex ,etc.) understands the business context and scope before starting development.

## 1. Overview

**Project name:** Sompong Battery
**Website type:** Portfolio / lead-generation website for an on-site car battery replacement service
**Target audience:** Owners of all types of vehicles in Bangkok and surrounding areas who need urgent/emergency car battery replacement
**Business goal:** Get customers to contact the business as fast as possible via **Phone call / LINE**, and support **Google Ads** campaigns with proper conversion tracking as advised by the Google Ads support team

---

## 2. Recommended Tech Stack

| Layer | Technology | Reasoning |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | Strong SEO support via SSR/SSG — critical here since this site relies heavily on organic search + Google Ads. Built-in Image Optimization and Metadata API. |
| Package Manager | **bun** (recommended) or **yarn** (if the team is more familiar with it) | bun installs/builds significantly faster than npm, which fits a project of this size well. |
| Styling | **Tailwind CSS + shadcn/ui** | Fast to iterate on the design system while keeping UI consistency. |
| Hero / Carousel | **Swiper.js** (`swiper/react`) | As specified in the requirements, used for the sliding Hero Banner. |
| Database | **PostgreSQL** (e.g. Supabase / Neon) | Stores Posts, Photos, Service Areas, and Admin Users. |
| ORM | **Prisma** | Type-safe, easy migrations, integrates cleanly with Next.js API Routes / Server Actions. |
| Auth (Admin) | **NextAuth.js (Auth.js) – Credentials Provider**, or a custom JWT session | Per the requirement "no need for heavy auth" — just a username/password login for the admin panel, no OAuth/2FA needed. |
| Image Upload | **Cloudinary** or **UploadThing** | Lets the admin upload work photos ("Add Photo") without managing storage infrastructure directly. |
| Analytics / Ads | **Google Tag Manager + gtag.js (Google Ads Conversion Tracking)** | Wires up conversion tracking on the call/LINE buttons per Google Ads' recommendation. |
| Deployment | **Vercel** | Best-in-class fit for Next.js, supports ISR — useful given the large number of service-area pages. |

### Project setup commands

```bash
# Using bun
bun create next-app@latest sompong-battery --typescript --tailwind --app
cd sompong-battery
bun add swiper prisma @prisma/client next-auth
bun add -d @types/node

# Or using yarn
yarn create next-app sompong-battery --typescript --tailwind --app
cd sompong-battery
yarn add swiper prisma @prisma/client next-auth
```

---

## 3. Site Scope — Public Site

### 3.1 Hero Section
- A **Swiper/Carousel** Hero Banner (autoplay, dots/arrows) showing featured work photos or key marketing copy
- Each slide should be editable from the admin panel (image, text, button link)

### 3.2 Our Services Section
- Describes the service in detail
- Must always include at least 2 **action buttons** placed prominently (sticky/floating on mobile is recommended):
  - **Call** button → `tel:0872527842`
  - **LINE** button → `https://line.me/ti/p/~sompong7842`

### 3.3 Service Coverage Information
Split into 3 content blocks:

1. **Service within Bangkok** — coverage near you within 30 minutes, available 24/7 with no days off, fast dispatch within 30 minutes, including free consultation, inspection, and battery replacement
2. **24-hour on-site car battery replacement** — for when a car won't start; call anytime, 24/7, for consultation, inspection, and replacement performed by specialist automotive technicians
3. **Payment methods** — bank/mobile transfer or cash on-site

### 3.4 Service Area Directory
- Lists all Bangkok districts (per the ~50-district list provided) as links to each area's page
- Each district should have its own dedicated page (`/service-area/[slug]`) for **local SEO** purposes — rather than the current query-string tag approach, this should be a real **static/dynamic route that search engines can index**, with district-specific metadata (title, description, LocalBusiness schema)
- District pages should pull content (description, local work examples if available) from the CMS/admin panel rather than being hardcoded

### 3.5 Contact Information / Footer
- Phone: `087-252-7842`
- LINE ID: `sompong7842`
- Should remain fixed/sticky and visible while scrolling on mobile, since the primary conversion goal is a phone call or chat

### 3.6 SEO & Performance (Non-functional, critical for this business)
- Every page (especially district pages) must have dynamic `<title>` / `<meta description>` / Open Graph tags
- Use Next.js `generateMetadata` per page
- Add `LocalBusiness` / `Service` structured data (schema.org)
- Core Web Vitals must be strong (images optimized via `next/image`, lazy-loaded Swiper)
- Mobile-first design, since most customers search and call from their phone while stranded on the road

---

## 4. Admin Backend

### 4.1 Authentication
- Simple login: **username + password only** (no OTP/2FA/OAuth as specified)
- Protect every route under `/admin/*` with a session/JWT
- Support one or multiple admin users (design the user table to support multiple users from the start, even if there's only one admin initially)

### 4.2 Content Management (editing the public site from the backend)
Must support at minimum:
- **Post / Portfolio items**: Create, Edit, Delete, List (e.g. "Battery replacement job in [district] on [date]...")
- **Photo**: upload photos attached to a Post, or a separate photo library; edit/delete photos
- **Hero Banner Slides**: add/edit/delete/reorder slides (image, text, link)
- **Service Area**: manage the list/content of each service district (for the SEO purposes described in section 3.4)
- An overview dashboard (total posts, recent activity) is a nice-to-have, not a required MVP feature

### 4.3 Google Ads Integration
- Embed a **Google Tag (gtag.js)** via Google Tag Manager at the root layout level
- Set up **conversion tracking** on the Call / LINE buttons per the Google Ads support team's recommendation (fire a `conversion` event when the button is clicked)
- The admin panel should include a settings area where the **Google Ads Conversion ID / Label** and **GTM Container ID** can be entered without touching code (stored as config in the database, or an environment variable editable through a Settings page)

---

## 5. Suggested Project Structure

```
sompong-battery/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                 # Home: Hero, Services, Coverage, Contact
│   │   ├── service-area/
│   │   │   └── [slug]/page.tsx      # District page (SEO)
│   │   └── layout.tsx
│   ├── admin/
│   │   ├── login/page.tsx
│   │   ├── posts/                   # Portfolio CRUD
│   │   ├── photos/                  # Photo management
│   │   ├── hero-slides/             # Hero Banner management
│   │   ├── service-areas/           # Service district management
│   │   ├── settings/                # Google Ads / GTM config
│   │   └── layout.tsx               # Protected layout
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── posts/route.ts
│       ├── photos/route.ts
│       └── service-areas/route.ts
├── components/
│   ├── HeroSwiper.tsx
│   ├── ServiceCard.tsx
│   ├── ContactCTA.tsx                # Sticky call/LINE buttons
│   └── admin/...
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   └── gtag.ts                       # Conversion event tracking helper
├── prisma/
│   └── schema.prisma
├── public/
│   └── assets/                      # Public images, icons, and branding (see section 10)
└── AGENTS.md                         # References this document as scope
```

## 6. Data Model (initial draft)

```prisma
model AdminUser {
  id       String  @id @default(cuid())
  username String  @unique
  password String  // hashed with bcrypt/argon2
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String
  photos    Photo[]
  areaSlug  String?  // reference to a service area, if applicable
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Photo {
  id     String @id @default(cuid())
  url    String
  postId String?
  post   Post?  @relation(fields: [postId], references: [id])
}

model HeroSlide {
  id        String @id @default(cuid())
  imageUrl  String
  title     String?
  linkUrl   String?
  sortOrder Int    @default(0)
}

model ServiceArea {
  id          String @id @default(cuid())
  slug        String @unique   // e.g. "phra-nakhon"
  name        String            // "Phra Nakhon District"
  description String?
}

model SiteSetting {
  id                  String @id @default("singleton")
  gtmContainerId      String?
  googleAdsConvId     String?
  googleAdsConvLabel  String?
}
```

---

## 7. Non-goals (out of scope for this MVP)
- No online customer account/booking system (customers reach out via phone/LINE)
- No online payment processing (bank transfer or cash on-site only)
- No multi-language support (Thai only)
- No 2FA/OAuth for the admin panel

---

## 8. Environment Variables (example)

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
NEXT_PUBLIC_GTM_ID=
NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID=
CLOUDINARY_URL=
```

---

## 9. Business Contact Info (for use on the live site)
- Phone: **087-252-7842**
- LINE ID: **sompong7842**

---

## 10. Repository Visual Assets

Store repository-managed visual resources under `public/assets/` so Next.js can serve them at `/assets/...`:

```text
public/assets/
├── images/
│   ├── hero/
│   ├── portfolio/
│   └── service-areas/
├── icons/
├── branding/
└── README.md
```

Use lowercase kebab-case filenames. For example, a file at `public/assets/images/hero/on-site-battery.webp` can be entered in an admin image field as `/assets/images/hero/on-site-battery.webp`. The file must exist before saving. Cloudinary uploads remain available for publishing photos without a repository deployment. See [asset guidance](public/assets/README.md) for formats and image sizes, [setup instructions](SETUP.md) for configuration, and the [implementation audit](docs/README-AUDIT.md) for requirement coverage and the custom-JWT/protected-route-group mappings.
