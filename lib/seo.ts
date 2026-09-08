export function siteUrl() { return process.env.SITE_URL || "http://127.0.0.1:3000"; }
export function businessSchema(area?: { name: string; slug: string }) {
  return { "@context": "https://schema.org", "@type": "AutomotiveBusiness", "@id": `${siteUrl()}/#business`, name: "สมปองแบตเตอรี่", telephone: "+66872527842", url: siteUrl(), areaServed: area ? `เขต${area.name} กรุงเทพมหานคร` : "กรุงเทพมหานครและปริมณฑล", openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "00:00", closes: "23:59" }], paymentAccepted: "Cash, Bank Transfer" };
}
export function jsonLd(value: unknown) { return JSON.stringify(value).replace(/</g, "\\u003c"); }
