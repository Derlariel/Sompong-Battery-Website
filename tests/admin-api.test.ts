import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ getAdmin: vi.fn(), sameOrigin: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn(), findMany: vi.fn(), localImageExists: vi.fn(), revalidatePath: vi.fn() }));
vi.mock("@/lib/auth", () => ({ getAdmin: mocks.getAdmin, sameOrigin: mocks.sameOrigin }));
vi.mock("@/lib/prisma", () => ({ prisma: { post: { create: mocks.create, update: mocks.update, delete: mocks.remove, findMany: mocks.findMany }, photo: { create: mocks.create, findMany: mocks.findMany }, serviceArea: { findMany: mocks.findMany } } }));
vi.mock("@/lib/asset-files", () => ({ localImageExists: mocks.localImageExists }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
import { POST, DELETE } from "../app/api/admin/[resource]/route";
import * as postsApi from "../app/api/posts/route";
import * as photosApi from "../app/api/photos/route";
import * as areasApi from "../app/api/service-areas/route";
const context = { params: Promise.resolve({ resource: "posts" }) };
function request(body: unknown, method = "POST") { return new Request("http://localhost:3000/api/admin/posts", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); }
describe("admin mutations", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.sameOrigin.mockReturnValue(true);
    mocks.getAdmin.mockResolvedValue({ id: "admin" });
    mocks.create.mockResolvedValue({ id: "saved" });
    mocks.update.mockResolvedValue({ id: "existing" });
  });
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
    expect(mocks.create).toHaveBeenCalledWith({ data: { ...data, photos: { create: [] } } });
    expect((await POST(request({ ...data, id: "existing" }), context)).status).toBe(200);
    expect(mocks.update).toHaveBeenCalledWith({ where: { id: "existing" }, data: { ...data, photos: { deleteMany: { id: { notIn: [] } }, update: [], create: [] } } });
  });
  it("saves new and existing photos together with a post", async () => {
    mocks.localImageExists.mockResolvedValue(true);
    const photos = [
      { id: "photo-1", url: "/assets/images/portfolio/13421.jpg", alt: "ช่างเปลี่ยนแบตเตอรี่รถยนต์" },
      { url: "https://res.cloudinary.com/demo/image/upload/new.jpg", alt: "แบตเตอรี่ที่ติดตั้งเรียบร้อย" },
    ];
    expect((await POST(request({ id: "existing", title: "งานบางนา", content: "รายละเอียดงาน", areaSlug: "bang-na", photos }), context)).status).toBe(200);
    expect(mocks.update).toHaveBeenCalledWith({
      where: { id: "existing" },
      data: {
        title: "งานบางนา",
        content: "รายละเอียดงาน",
        areaSlug: "bang-na",
        photos: {
          deleteMany: { id: { notIn: ["photo-1"] } },
          update: [{ where: { id: "photo-1" }, data: { url: "/assets/images/portfolio/13421.jpg", alt: "ช่างเปลี่ยนแบตเตอรี่รถยนต์" } }],
          create: [{ url: "https://res.cloudinary.com/demo/image/upload/new.jpg", alt: "แบตเตอรี่ที่ติดตั้งเรียบร้อย" }],
        },
      },
    });
  });
  it.each([postsApi, photosApi, areasApi])("protects the named API read and write routes", async api => {
    mocks.getAdmin.mockResolvedValue(null);
    expect((await api.GET()).status).toBe(401);
    expect((await api.POST(request({}))).status).toBe(401);
    expect((await api.DELETE(request({ id: "item" }, "DELETE"))).status).toBe(401);
  });
  it("lists content through the named route without caching admin responses", async () => {
    const data = [{ id: "post", title: "งานบางนา", photos: [] }];
    mocks.findMany.mockResolvedValue(data);
    const response = await postsApi.GET();
    expect(await response.json()).toEqual({ data });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
  it("rejects missing local images before saving a photo", async () => {
    mocks.localImageExists.mockResolvedValue(false);
    const response = await photosApi.POST(request({ url: "/assets/images/portfolio/missing.webp", alt: "งานเปลี่ยนแบตเตอรี่" }));
    expect(response.status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("saves a local image that exists on disk", async () => {
    mocks.localImageExists.mockResolvedValue(true);
    const data = { url: "/assets/images/portfolio/bang-na.webp", alt: "งานเปลี่ยนแบตเตอรี่", postId: null };
    expect((await photosApi.POST(request(data))).status).toBe(200);
    expect(mocks.create).toHaveBeenCalledWith({ data });
  });
  it("does not turn a malformed update into a new record", async () => {
    expect((await postsApi.PUT(request({ title: "งาน", content: "รายละเอียด" }, "PUT"))).status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });
});
