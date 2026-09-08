import type { TrackingConfig } from "./gtag";
export function resolveTrackingSettings(saved?: TrackingConfig | null): TrackingConfig {
  // A saved empty value is intentional (it disables tracking); only absent rows use environment defaults.
  if (saved) return saved;
  return {
    gtmContainerId: process.env.NEXT_PUBLIC_GTM_ID || "",
    googleAdsConvId: process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID || "",
    googleAdsConvLabel: process.env.GOOGLE_ADS_CONVERSION_LABEL || "",
    lineConvLabel: process.env.GOOGLE_ADS_LINE_CONVERSION_LABEL || "",
  };
}
