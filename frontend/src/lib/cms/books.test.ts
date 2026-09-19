import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./categories", () => ({
  getCategoryTree: vi.fn().mockResolvedValue([
    { id: "noi-khoa", name: "Nội", slug: "noi-khoa", children: [
      { id: "x", name: "X", slug: "noi-khoa/x" }, { id: "y", name: "Y", slug: "noi-khoa/y" },
    ] },
  ]),
}));

const client = { cmsFetch: vi.fn() };
vi.mock("./client", () => ({ cmsFetch: (...a: unknown[]) => client.cmsFetch(...a), absolute: (u: string) => u }));

import { buildBookFilters, listBooks } from "./books";

afterEach(() => vi.clearAllMocks());

describe("buildBookFilters", () => {
  it("maps language/format/flags", () => {
    expect(buildBookFilters({ language: "English", format: "PDF", isFeatured: true }))
      .toEqual({ language: { $eq: "English" }, format: { $eq: "PDF" }, isFeatured: { $eq: true } });
  });
  it("maps featuredOrNew to $or", () => {
    expect(buildBookFilters({ featuredOrNew: true }))
      .toEqual({ $or: [{ isFeatured: { $eq: true } }, { isNew: { $eq: true } }] });
  });
  it("uses $in of descendant slugs for a top-level category", () => {
    expect(buildBookFilters({ category: "noi-khoa" }, ["noi-khoa", "noi-khoa/x", "noi-khoa/y"]))
      .toEqual({ category: { slug: { $in: ["noi-khoa", "noi-khoa/x", "noi-khoa/y"] } } });
  });
});

describe("listBooks", () => {
  it("requests published books with populate, sort, pagination and maps results", async () => {
    client.cmsFetch.mockResolvedValue({
      data: [{ documentId: "d1", slug: "s", title: "T", byline: "A", category: { slug: "x", name: "X" },
        publisher: { name: "P" }, coverUrl: "c", downloadUrl: "u", dateAdded: "2024-01-01" }],
      meta: { pagination: { total: 1, pageCount: 1 } },
    });
    const res = await listBooks({ sort: "title", page: 2, pageSize: 8 });
    const [path, query] = client.cmsFetch.mock.calls[0];
    expect(path).toBe("/books");
    expect(query.sort).toEqual(["title:asc"]);
    expect(query.pagination).toEqual({ page: 2, pageSize: 8 });
    expect(query.status).toBe("published");
    expect(res.total).toBe(1);
    expect(res.books[0].id).toBe("d1");
  });
  it("uses $eq for leaf category (no children)", async () => {
    client.cmsFetch.mockResolvedValue({
      data: [],
      meta: { pagination: { total: 0, pageCount: 0 } },
    });
    await listBooks({ category: "noi-khoa/x" });
    const [, query] = client.cmsFetch.mock.calls[0];
    expect(query.filters.category).toEqual({ slug: { $eq: "noi-khoa/x" } });
  });
  it("uses $in of descendants for top-level category with children", async () => {
    client.cmsFetch.mockResolvedValue({
      data: [],
      meta: { pagination: { total: 0, pageCount: 0 } },
    });
    await listBooks({ category: "noi-khoa" });
    const [, query] = client.cmsFetch.mock.calls[0];
    expect(query.filters.category).toEqual({ slug: { $in: ["noi-khoa", "noi-khoa/x", "noi-khoa/y"] } });
  });
});
