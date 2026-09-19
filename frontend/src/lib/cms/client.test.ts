import { afterEach, describe, expect, it, vi } from "vitest";
import { absolute, buildQueryString, cmsFetch } from "./client";

const OLD = { url: process.env.CMS_URL, tok: process.env.CMS_API_TOKEN };
afterEach(() => {
  process.env.CMS_URL = OLD.url;
  process.env.CMS_API_TOKEN = OLD.tok;
  vi.restoreAllMocks();
});

describe("buildQueryString", () => {
  it("encodes nested Strapi filters", () => {
    const qs = buildQueryString({ filters: { slug: { $eq: "a" } }, sort: ["title:asc"] });
    expect(qs).toBe("filters[slug][$eq]=a&sort[0]=title:asc");
  });
  it("returns empty string for empty query", () => {
    expect(buildQueryString({})).toBe("");
  });
});

describe("absolute", () => {
  it("passes through external URLs", () => {
    process.env.CMS_URL = "http://localhost:1337";
    expect(absolute("https://x.com/a.jpg")).toBe("https://x.com/a.jpg");
  });
  it("prefixes relative media paths with CMS_URL", () => {
    process.env.CMS_URL = "http://localhost:1337";
    expect(absolute("/uploads/a.jpg")).toBe("http://localhost:1337/uploads/a.jpg");
  });
  it("returns undefined for empty input", () => {
    expect(absolute(null)).toBeUndefined();
  });
});

describe("cmsFetch", () => {
  it("throws a clear error when env is missing", async () => {
    process.env.CMS_URL = "";
    process.env.CMS_API_TOKEN = "";
    await expect(cmsFetch("/books")).rejects.toThrow(/CMS_URL/);
  });
  it("calls the CMS with bearer auth and next cache opts", async () => {
    process.env.CMS_URL = "http://localhost:1337";
    process.env.CMS_API_TOKEN = "tok";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);
    await cmsFetch("/books", { sort: ["title:asc"] }, { revalidate: 30, tags: ["books"] });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:1337/api/books?sort[0]=title:asc");
    expect(init.headers.Authorization).toBe("Bearer tok");
    expect(init.next).toEqual({ revalidate: 30, tags: ["books"] });
  });
  it("throws on non-ok responses", async () => {
    process.env.CMS_URL = "http://localhost:1337";
    process.env.CMS_API_TOKEN = "tok";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 404, statusText: "Not Found" }),
    );
    await expect(cmsFetch("/books")).rejects.toThrow(/404/);
  });
});
