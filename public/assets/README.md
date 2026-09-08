# Visual assets

The business README does not prescribe an assets path. This project uses Next.js's `public/` convention: files here are served at `/assets/...`.

```text
public/assets/
  images/
    hero/           # Homepage banner photographs
    portfolio/      # Completed job photographs
    service-areas/  # District-specific photographs
  icons/            # Reviewed UI icons
  branding/         # Approved logos and other brand resources
```

Use descriptive lowercase kebab-case filenames, such as `images/hero/on-site-battery.webp`. In the admin image field, enter `/assets/images/hero/on-site-battery.webp` (omit `public/`). The file must exist before saving. Supported CMS image extensions: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, `.gif`. Prefer compressed WebP/AVIF, about 1600 × 900 for hero photos and 1200 × 800 for work photos. Add meaningful Thai alternative text for portfolio photos; hero images use the slide heading.

These directories are for repository-managed public resources. Changes require a new deployment. The existing admin upload button continues to upload to Cloudinary for immediate publishing without changing repository files. Cloudinary URLs also work in image fields.

Store only approved public images with appropriate reuse rights. Keep source design documents, secrets, and private customer information outside `public/`. SVG icons/logos must be reviewed and imported directly by developers; arbitrary SVG uploads and SVG CMS image URLs are not allowed.

The `.gitkeep` files retain empty directories. No work photography was provided, so these folders do not contain invented customer jobs or images referenced by the live UI.
