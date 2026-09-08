export type TrackingConfig = { gtmContainerId: string; googleAdsConvId: string; googleAdsConvLabel: string; lineConvLabel: string };
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
export function trackContact(channel: "call" | "line", config: TrackingConfig) {
  const label = channel === "call" ? config.googleAdsConvLabel : config.lineConvLabel;
  if (config.gtmContainerId) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "contact_click", contact_channel: channel });
  } else if (config.googleAdsConvId && label) {
    window.gtag?.("event", "conversion", { send_to: `${config.googleAdsConvId}/${label}`, transport_type: "beacon" });
  }
}
