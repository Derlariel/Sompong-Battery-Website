import assert from "node:assert/strict";

const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
// Run against the read-only preview with no DATABASE_URL configured.
for (const path of ["/", "/service-area/bang-na", "/service-area/phra-nakhon", "/admin/login", "/sitemap.xml", "/robots.txt"]) {
  const response = await fetch(base + path, { redirect: "manual" });
  assert.equal(response.status, 200, path);
  const body = await response.text();
  if (path === "/") {
    assert.match(body, /tel:0872527842/);
    assert.match(body, /https:\/\/line.me\/ti\/p\/~sompong7842/);
    assert.equal((body.match(/href="\/service-area\//g) || []).length, 50);
    assert.match(body, /<h1/);
  }
  if (path.startsWith("/service-area/")) {
    const name = path.endsWith("bang-na") ? "บางนา" : "พระนคร";
    assert.match(body, new RegExp(`<title>[^<]*${name}`));
    assert.match(body, /application\/ld\+json/);
    assert.ok(body.includes(`rel="canonical" href="${process.env.SITE_URL || "http://127.0.0.1:3000"}${path}"`));
  }
  if (path === "/sitemap.xml") assert.equal((body.match(/<loc>/g) || []).length, 51);
  if (path === "/robots.txt") assert.match(body, /Disallow: \/admin/);
  console.log(`PASS ${path}`);
}
for (const path of ["/admin", "/admin/posts", "/admin/photos", "/admin/hero-slides", "/admin/service-areas", "/admin/settings"]) {
  const response = await fetch(base + path, { redirect: "manual" });
  assert.equal(response.status, 307, path);
  assert.equal(response.headers.get("location"), "/admin/login");
  console.log(`PASS protected ${path}`);
}
const unknown = await fetch(base + "/service-area/not-a-district");
assert.equal(unknown.status, 404);
for (const [origin, expected] of [[base, 401], ["https://untrusted.example", 403]]) {
  const response = await fetch(base + "/api/admin/posts", { method: "POST", headers: { "content-type": "application/json", origin }, body: JSON.stringify({ title: "test", content: "test" }) });
  assert.equal(response.status, expected);
  console.log(`PASS mutation protection ${expected}`);
}
console.log("Preview route smoke checks passed.");
