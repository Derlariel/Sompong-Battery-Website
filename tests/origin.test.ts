import { afterEach, describe, expect, it, vi } from "vitest";
import { sameOrigin } from "../lib/origin";
describe("request origin", () => {
  afterEach(() => vi.unstubAllEnvs());
  it("accepts the local preview origin even when Next rewrites the internal URL", () => {
    vi.stubEnv("SITE_URL", ""); vi.stubEnv("NEXTAUTH_URL", "");
    expect(sameOrigin(new Request("http://localhost:3000/api/admin/posts", { headers: { origin: "http://127.0.0.1:3000" } }))).toBe(true);
  });
  it("does not trust a spoofed Host header or a missing Origin", () => {
    vi.stubEnv("SITE_URL", "https://sompong.example");
    expect(sameOrigin(new Request("http://internal/api", { headers: { origin: "https://evil.example", host: "evil.example" } }))).toBe(false);
    expect(sameOrigin(new Request("http://internal/api"))).toBe(false);
    expect(sameOrigin(new Request("http://internal/api", { headers: { origin: "https://sompong.example" } }))).toBe(true);
  });
});
