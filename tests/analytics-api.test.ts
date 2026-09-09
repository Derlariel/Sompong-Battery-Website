import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ sameOrigin: vi.fn(), create: vi.fn() }));
vi.mock("@/lib/origin", () => ({ sameOrigin: mocks.sameOrigin }));
vi.mock("@/lib/prisma", () => ({ prisma: { clickEvent: { create: mocks.create } } }));

import { POST } from "../app/api/analytics/click/route";

function request(body: unknown) {
  return new Request("https://sompong.example/api/analytics/click", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://sompong.example" },
    body: JSON.stringify(body),
  });
}

describe("contact click analytics", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.sameOrigin.mockReturnValue(true);
    mocks.create.mockResolvedValue({ id: "event" });
  });

  it("records only the channel and page path", async () => {
    const response = await POST(request({ channel: "call", path: "/service-area/bang-na" }));
    expect(response.status).toBe(204);
    expect(mocks.create).toHaveBeenCalledWith({ data: { channel: "call", path: "/service-area/bang-na" } });
  });

  it("rejects cross-origin and malformed events", async () => {
    mocks.sameOrigin.mockReturnValue(false);
    expect((await POST(request({ channel: "line", path: "/" }))).status).toBe(403);
    mocks.sameOrigin.mockReturnValue(true);
    expect((await POST(request({ channel: "email", path: "https://evil.example" }))).status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });
});
