import { afterEach, describe, expect, it, vi } from "vitest";
import { trackContact } from "../lib/gtag";
const config = { gtmContainerId: "", googleAdsConvId: "AW-123", googleAdsConvLabel: "call-label", lineConvLabel: "line-label" };
describe("contact conversion tracking", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("uses distinct call and LINE conversions", () => {
    const gtag = vi.fn(); vi.stubGlobal("window", { gtag });
    trackContact("call", config); trackContact("line", config);
    expect(gtag).toHaveBeenNthCalledWith(1, "event", "conversion", expect.objectContaining({ send_to: "AW-123/call-label" }));
    expect(gtag).toHaveBeenNthCalledWith(2, "event", "conversion", expect.objectContaining({ send_to: "AW-123/line-label" }));
  });
  it("uses only the data layer when GTM manages conversions", () => {
    const gtag = vi.fn(); const dataLayer: unknown[] = []; vi.stubGlobal("window", { gtag, dataLayer });
    trackContact("call", { ...config, gtmContainerId: "GTM-ABC" });
    expect(dataLayer).toEqual([{ event: "contact_click", contact_channel: "call" }]); expect(gtag).not.toHaveBeenCalled();
  });
  it("works with no analytics configured", () => {
    vi.stubGlobal("window", {});
    expect(() => trackContact("call", { ...config, googleAdsConvId: "" })).not.toThrow();
  });
});
