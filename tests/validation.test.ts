import { describe, expect, it } from "vitest";
import { isSafeLink, schemas } from "../lib/validation";
import { defaultAreas } from "../lib/defaults";
describe("CMS validation", () => {
  it("accepts the 50 unique Bangkok service-area seed records", () => {
    expect(defaultAreas).toHaveLength(50);
    expect(new Set(defaultAreas.map(a => a.slug)).size).toBe(50);
    for (const area of defaultAreas) expect(schemas["service-areas"].safeParse(area).success).toBe(true);
  });
  it.each(["javascript:alert(1)", "//evil.example", "/\\evil.example", "data:text/html,test", "https://user:pass@evil.example"])('rejects unsafe hero link %s', value => expect(isSafeLink(value)).toBe(false));
  it.each(["tel:0872527842", "https://line.me/ti/p/~sompong7842", "/#services"])("allows contact and internal links %s", value => expect(isSafeLink(value)).toBe(true));
  it("rejects unsupported image hosts and invalid district slugs", () => {
    expect(schemas.photos.safeParse({ url: "https://evil.example/a.jpg", alt: "a" }).success).toBe(false);
    expect(schemas["service-areas"].safeParse({ name: "test", slug: "../admin", description: "test" }).success).toBe(false);
  });
  it("rejects script injection in analytics IDs", () => {
    expect(schemas.settings.safeParse({ gtmContainerId: "GTM-1');alert(1)//", googleAdsConvId: "", googleAdsConvLabel: "", lineConvLabel: "" }).success).toBe(false);
  });
});
