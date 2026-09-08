import { describe, expect, it } from "vitest";
import { isImageUrl, isLocalImage } from "../lib/assets";
import { schemas } from "../lib/validation";

describe("public image resources", () => {
  it.each(["/assets/images/hero/battery.webp", "/assets/images/portfolio/bang-na.jpg", "/assets/branding/logo.png"])("accepts a safe local image: %s", url => {
    expect(isLocalImage(url)).toBe(true);
    expect(schemas.photos.safeParse({ url, alt: "รูปภาพบริการ" }).success).toBe(true);
  });
  it.each(["/assets/../secret.jpg", "/assets/%2e%2e/private.png", "//evil.example/a.png", "/assets/images/a.svg", "/assets/images/a.png?url=https://evil.example", "/assets/images/..\\secret.png", "/api/admin/private.png", "/assets/a.html"])("rejects unsafe local paths: %s", url => expect(isImageUrl(url)).toBe(false));
  it("preserves Cloudinary image support", () => {
    expect(isImageUrl("https://res.cloudinary.com/demo/image/upload/sample.jpg")).toBe(true);
    expect(isImageUrl("https://res.cloudinary.com.evil.example/photo.jpg")).toBe(false);
  });
});
