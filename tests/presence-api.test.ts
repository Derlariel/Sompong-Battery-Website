import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ sameOrigin: vi.fn(), count: vi.fn(), create: vi.fn() }));
vi.mock("@/lib/origin", () => ({ sameOrigin: mocks.sameOrigin }));
vi.mock("@/lib/prisma", () => ({ prisma: { visitEvent: { create: mocks.create, count: mocks.count } } }));

import { GET, POST } from "../app/api/analytics/presence/route";
import { visitPeriods } from "../lib/visit-periods";

const request = (body: unknown) => new Request("https://sompong.example/api/analytics/presence", {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: "https://sompong.example" },
  body: JSON.stringify(body),
});

describe("real-time visitor presence", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.sameOrigin.mockReturnValue(true);
    mocks.create.mockResolvedValue({});
  });

  it("records one page visit", async () => {
    const response = await POST(request({ path: "/service-area/bang-na" }));
    expect(response.status).toBe(204);
    expect(mocks.create).toHaveBeenCalledWith({ data: { path: "/service-area/bang-na" } });
  });

  it("rejects cross-origin and invalid visits", async () => {
    mocks.sameOrigin.mockReturnValue(false);
    expect((await POST(request({ path: "/" }))).status).toBe(403);

    mocks.sameOrigin.mockReturnValue(true);
    expect((await POST(request({ path: "https://example.com" }))).status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("returns daily weekly monthly and total counts", async () => {
    mocks.count.mockResolvedValueOnce(8).mockResolvedValueOnce(32).mockResolvedValueOnce(134).mockResolvedValueOnce(45014);
    const response = await GET();
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toEqual({ daily: 8, weekly: 32, monthly: 134, total: 45014 });
  });

  it("uses Monday and Bangkok midnight as period boundaries", () => {
    const periods = visitPeriods(new Date("2026-09-11T12:00:00Z"));
    expect(periods.today.toISOString()).toBe("2026-09-10T17:00:00.000Z");
    expect(periods.week.toISOString()).toBe("2026-09-06T17:00:00.000Z");
    expect(periods.month.toISOString()).toBe("2026-08-31T17:00:00.000Z");
  });
});
