import { afterEach, describe, expect, it, vi } from "vitest";
import { signSession, verifySession } from "../lib/session";
describe("admin session", () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers(); });
  it("verifies signed sessions and rejects tampering", async () => {
    vi.stubEnv("NEXTAUTH_SECRET", "test-only-secret-that-is-more-than-32-characters");
    const token = await signSession("admin-123");
    expect(await verifySession(token)).toBe("admin-123");
    const parts = token.split("."); parts[1] = Buffer.from('{"sub":"other-admin"}').toString("base64url");
    expect(await verifySession(parts.join("."))).toBeNull();
  });
  it("expires after eight hours", async () => {
    vi.stubEnv("NEXTAUTH_SECRET", "test-only-secret-that-is-more-than-32-characters");
    vi.useFakeTimers();
    const token = await signSession("admin-123");
    vi.setSystemTime(Date.now() + 9 * 60 * 60 * 1000);
    expect(await verifySession(token)).toBeNull();
  });
  it("fails closed when no strong secret exists", async () => {
    vi.stubEnv("NEXTAUTH_SECRET", "weak");
    await expect(signSession("admin")).rejects.toThrow();
    expect(await verifySession("invalid")).toBeNull();
  });
});
