export type TrackingConfig = { gtmContainerId: string; googleAdsConvId: string; googleAdsConvLabel: string; lineConvLabel: string };
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
export function trackContact(channel: "call" | "line", config: TrackingConfig) {
  const path = window.location?.pathname || "/";
  const query = new URLSearchParams(window.location?.search || "");
  const areaSlug = path.startsWith("/service-area/") ? path.split("/")[2] : undefined;
  void fetch("/api/analytics/click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ channel, path, areaSlug, utmSource: query.get("utm_source") || undefined, utmMedium: query.get("utm_medium") || undefined, utmCampaign: query.get("utm_campaign") || undefined }),
    keepalive: true,
  }).catch(() => undefined);

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
