# Repository Guidelines

## Project Structure & Module Organization

This repository is at the specification stage; `README.md` defines the business scope, architecture, and initial data model. Follow its proposed Next.js App Router layout: public routes in `app/(public)/`, administration pages in `app/admin/`, route handlers in `app/api/`, reusable UI in `components/`, shared services in `lib/`, and database files in `prisma/`. Keep static assets in `public/`. Place tests beside covered code or in `tests/`, using one approach consistently.

## Build, Test, and Development Commands

The application has not yet been scaffolded, so no package scripts currently exist. Use Bun as the preferred package manager once `package.json` is added. Expected commands are:

- `bun install` - install locked dependencies.
- `bun dev` - run the local development server.
- `bun run build` - create a production build and catch route or type errors.
- `bun run lint` - run the configured linter.
- `bun test` - run tests after a runner is configured.
- `bunx prisma migrate dev` - apply local schema changes and create migrations.

Commit the generated lockfile and update this section if script names differ.

## Coding Style & Naming Conventions

Use TypeScript with two-space indentation. Prefer Server Components; add `"use client"` only when browser state or APIs require it. Name components in PascalCase (`ContactCTA.tsx`), helpers in camelCase (`trackConversion`), and route folders with lowercase URL-safe slugs. Keep domain logic out of pages and centralize database, authentication, and analytics helpers in `lib/`. Run the formatter and linter before committing once configured.

## Testing Guidelines

No test framework or coverage threshold exists yet. Prioritize admin route protection, content CRUD, service-area metadata, and Call/LINE conversion events. Use names such as `ContactCTA.test.tsx` and add regression coverage for bug fixes. Run lint, tests, and a production build before opening a pull request.

## Commit & Pull Request Guidelines

History contains only `Initial commit`, so no convention exists yet. Use short, imperative subjects, optionally with Conventional Commit prefixes, such as `feat: add district landing pages`. Keep commits focused. Pull requests should explain the visible change, note configuration or migration steps, link issues, include screenshots for UI work, and report validation commands.

## Security & Configuration

Never commit `.env*`, credentials, admin passwords, or provider secrets. Store only example keys in `.env.example`. Hash passwords, validate uploaded content, protect every `/admin/*` route, and keep server-only values out of `NEXT_PUBLIC_*` variables.
