export type TrackingConfig = { gtmContainerId: string; googleAdsConvId: string; googleAdsConvLabel: string; lineConvLabel: string };
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
export function trackContact(channel: "call" | "line", config: TrackingConfig) {
  const label = channel === "call" ? config.googleAdsConvLabel : config.lineConvLabel;
  if (/^GTM-[A-Z0-9]+$/.test(config.gtmContainerId)) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "conversion", contact_channel: channel,
      conversion_id: config.googleAdsConvId.replace(/^AW-/, ""), conversion_label: label,
      send_to: config.googleAdsConvId && label ? `${config.googleAdsConvId}/${label}` : "",
    });
  } else if (/^AW-[0-9]+$/.test(config.googleAdsConvId) && label) {
    const args = ["event", "conversion", { send_to: `${config.googleAdsConvId}/${label}`, transport_type: "beacon" }];
    if (window.gtag) window.gtag(...args);
    else {
      window.dataLayer = window.dataLayer || [];
      // Preserve early clicks until Google's script is ready to consume its arguments queue.
      const enqueue: (...commands: unknown[]) => void = function () {
        // eslint-disable-next-line prefer-rest-params -- Google tag expects its standard arguments-object command queue.
        window.dataLayer!.push(arguments);
      };
      enqueue(...args);
    }
  }
}
