import { afterEach, describe, expect, it, vi } from "vitest";
import { trackContact } from "../lib/gtag";
const config = { gtmContainerId: "", googleAdsConvId: "AW-123", googleAdsConvLabel: "call-label", lineConvLabel: "line-label" };
describe("contact conversion tracking", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("uses distinct call and LINE conversions", () => {
    const gtag = vi.fn(); vi.stubGlobal("window", { gtag, location: { pathname: "/" } }); vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    trackContact("call", config); trackContact("line", config);
    expect(gtag).toHaveBeenNthCalledWith(1, "event", "conversion", expect.objectContaining({ send_to: "AW-123/call-label" }));
    expect(gtag).toHaveBeenNthCalledWith(2, "event", "conversion", expect.objectContaining({ send_to: "AW-123/line-label" }));
  });
  it("uses only the data layer when GTM manages conversions", () => {
    const gtag = vi.fn(); const dataLayer: unknown[] = []; vi.stubGlobal("window", { gtag, dataLayer, location: { pathname: "/" } }); vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    trackContact("call", { ...config, gtmContainerId: "GTM-ABC" });
    expect(dataLayer).toEqual([{ event: "conversion", contact_channel: "call", conversion_id: "123", conversion_label: "call-label", send_to: "AW-123/call-label" }]); expect(gtag).not.toHaveBeenCalled();
  });
  it("works with no analytics configured", () => {
    vi.stubGlobal("window", { location: { pathname: "/" } }); vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    expect(() => trackContact("call", { ...config, googleAdsConvId: "" })).not.toThrow();
  });
  it("queues direct conversion events before gtag loads", () => {
    const dataLayer: IArguments[] = []; vi.stubGlobal("window", { dataLayer, location: { pathname: "/" } }); vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    trackContact("line", config);
    expect(Array.from(dataLayer[0])).toEqual(["event", "conversion", { send_to: "AW-123/line-label", transport_type: "beacon" }]);
  });
});
