import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveTrackingSettings } from "../lib/settings";
describe("analytics configuration", () => {
  afterEach(() => vi.unstubAllEnvs());
  it("uses the README environment variables when no settings row exists", () => {
    vi.stubEnv("NEXT_PUBLIC_GTM_ID", "GTM-EXAMPLE"); vi.stubEnv("NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID", "AW-123");
    expect(resolveTrackingSettings()).toMatchObject({ gtmContainerId: "GTM-EXAMPLE", googleAdsConvId: "AW-123" });
  });
  it("respects saved blank settings so admins can disable tracking", () => {
    vi.stubEnv("NEXT_PUBLIC_GTM_ID", "GTM-EXAMPLE");
    const saved = { gtmContainerId: "", googleAdsConvId: "", googleAdsConvLabel: "", lineConvLabel: "" };
    expect(resolveTrackingSettings(saved)).toEqual(saved);
  });
});
