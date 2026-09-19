import { afterEach, expect, it, vi } from "vitest";

const client = { cmsFetch: vi.fn() };
vi.mock("./client", () => ({
  cmsFetch: (...a: unknown[]) => client.cmsFetch(...a),
  absolute: (u: string) => u,
}));

import { getArticleBySlug, listArticles } from "./articles";

afterEach(() => vi.clearAllMocks());

const row = {
  documentId: "a1",
  slug: "s",
  title: "T",
  category: { name: "C" },
  excerpt: "e",
  content: "<p>c</p>",
  byline: "B",
  publishedDate: "2024-02-25",
  coverUrl: "cv",
  readTime: "5",
};

it("lists published articles newest-first and maps them", async () => {
  client.cmsFetch.mockResolvedValue({ data: [row] });
  const res = await listArticles();
  const [path, query] = client.cmsFetch.mock.calls[0];
  expect(path).toBe("/articles");
  expect(query.sort).toEqual(["publishedDate:desc"]);
  expect(query.status).toBe("published");
  expect(res[0]).toMatchObject({ id: "a1", author: "B", publishedAt: "25/02/2024" });
});

it("returns null when a slug is not found", async () => {
  client.cmsFetch.mockResolvedValue({ data: [] });
  expect(await getArticleBySlug("nope")).toBeNull();
});
