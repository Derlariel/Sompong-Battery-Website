import assert from "node:assert/strict";

const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
// Run against the read-only preview with no DATABASE_URL configured.
let districtPaths = [];
for (const path of ["/", "/service-area/bang-na", "/service-area/phra-nakhon", "/admin/login", "/sitemap.xml", "/robots.txt", "/assets/README.md"]) {
  const response = await fetch(base + path, { redirect: "manual" });
  assert.equal(response.status, 200, path);
  const body = await response.text();
  if (path === "/") {
    assert.match(body, /tel:0872527842/);
    assert.match(body, /https:\/\/line.me\/ti\/p\/~sompong7842/);
    assert.equal((body.match(/href="\/service-area\//g) || []).length, 50);
    assert.match(body, /<h1/);
    assert.equal((body.match(/<h1\b/g) || []).length, 1);
    districtPaths = [...body.matchAll(/href="(\/service-area\/[^"?]+)"/g)].map(match => match[1]);
    const serviceSection = body.split('id="services"')[1]?.split("</section>")[0];
    assert.ok(serviceSection?.includes('href="tel:0872527842"'));
    assert.ok(serviceSection?.includes('href="https://line.me/ti/p/~sompong7842"'));
    assert.match(body, /aria-label="ไปยังสไลด์ 2"/);
  }
  if (path.startsWith("/service-area/")) {
    const name = path.endsWith("bang-na") ? "บางนา" : "พระนคร";
    assert.match(body, new RegExp(`<title>[^<]*${name}`));
    assert.match(body, /application\/ld\+json/);
    assert.ok(body.includes(`rel="canonical" href="${process.env.SITE_URL || "http://127.0.0.1:3000"}${path}"`));
  }
  if (path === "/sitemap.xml") assert.equal((body.match(/<loc>/g) || []).length, 52);
  if (path === "/robots.txt") assert.match(body, /Disallow: \/admin/);
  console.log(`PASS ${path}`);
}
for (let offset = 0; offset < districtPaths.length; offset += 5) {
  await Promise.all(districtPaths.slice(offset, offset + 5).map(async path => {
    const response = await fetch(base + path);
    assert.equal(response.status, 200, path);
  }));
}
console.log(`PASS all ${districtPaths.length} service-area pages`);
for (const path of ["/admin", "/admin/posts", "/admin/photos", "/admin/hero-slides", "/admin/service-areas", "/admin/settings"]) {
  const response = await fetch(base + path, { redirect: "manual" });
  assert.equal(response.status, 307, path);
  assert.equal(response.headers.get("location"), "/admin/login");
  console.log(`PASS protected ${path}`);
}
const unknown = await fetch(base + "/service-area/not-a-district");
assert.equal(unknown.status, 404);
for (const endpoint of ["/api/admin/posts", "/api/posts", "/api/photos", "/api/service-areas"]) {
  assert.equal((await fetch(base + endpoint)).status, 401);
  for (const [origin, expected] of [[base, 401], ["https://untrusted.example", 403]]) {
    const response = await fetch(base + endpoint, { method: "POST", headers: { "content-type": "application/json", origin }, body: JSON.stringify({ title: "test", content: "test" }) });
    assert.equal(response.status, expected);
  }
  console.log(`PASS read/write protection ${endpoint}`);
}
console.log("Preview route smoke checks passed.");
