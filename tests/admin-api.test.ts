import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ getAdmin: vi.fn(), sameOrigin: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() }));
vi.mock("@/lib/auth", () => ({ getAdmin: mocks.getAdmin, sameOrigin: mocks.sameOrigin }));
vi.mock("@/lib/prisma", () => ({ prisma: { post: { create: mocks.create, update: mocks.update, delete: mocks.remove } } }));
import { POST, DELETE } from "../app/api/admin/[resource]/route";
const context = { params: Promise.resolve({ resource: "posts" }) };
function request(body: unknown, method = "POST") { return new Request("http://localhost:3000/api/admin/posts", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); }
describe("admin mutations", () => {
  beforeEach(() => { vi.resetAllMocks(); mocks.sameOrigin.mockReturnValue(true); mocks.getAdmin.mockResolvedValue({ id: "admin" }); });
  it("rejects unauthenticated writes and deletes", async () => {
    mocks.getAdmin.mockResolvedValue(null);
    expect((await POST(request({ title: "test" }), context)).status).toBe(401);
    expect((await DELETE(request({ id: "post" }, "DELETE"), context)).status).toBe(401);
    expect(mocks.create).not.toHaveBeenCalled(); expect(mocks.remove).not.toHaveBeenCalled();
  });
  it("rejects cross-origin mutations", async () => {
    mocks.sameOrigin.mockReturnValue(false);
    expect((await POST(request({}), context)).status).toBe(403);
    expect(mocks.getAdmin).not.toHaveBeenCalled();
  });
  it("validates fields before writing", async () => {
    expect((await POST(request({ title: "", content: "" }), context)).status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("creates and updates validated posts", async () => {
    const data = { title: "เปลี่ยนแบตเตอรี่", content: "บริการเขตบางนา", areaSlug: null };
    expect((await POST(request(data), context)).status).toBe(200);
    expect(mocks.create).toHaveBeenCalledWith({ data });
    expect((await POST(request({ ...data, id: "existing" }), context)).status).toBe(200);
    expect(mocks.update).toHaveBeenCalledWith({ where: { id: "existing" }, data });
  });
});
