import { afterEach, expect, it, vi } from "vitest";

const client = { cmsFetch: vi.fn() };
vi.mock("./client", () => ({
  cmsFetch: (...a: unknown[]) => client.cmsFetch(...a),
  absolute: (u: string) => u,
}));

import { getCategoryBySlug, getCategoryTree } from "./categories";

afterEach(() => vi.clearAllMocks());

// First call → categories; second call → books-for-count tally.
function stub() {
  client.cmsFetch
    .mockResolvedValueOnce({
      data: [
        { documentId: "1", name: "Nội", slug: "noi-khoa", parent: null },
        {
          documentId: "2",
          name: "Tim",
          slug: "noi-khoa/tim",
          parent: { slug: "noi-khoa" },
        },
        {
          documentId: "3",
          name: "Hô hấp",
          slug: "noi-khoa/ho-hap",
          parent: { slug: "noi-khoa" },
        },
      ],
    })
    .mockResolvedValueOnce({
      data: [
        { category: { slug: "noi-khoa/tim" } },
        { category: { slug: "noi-khoa/tim" } },
        { category: { slug: "noi-khoa/ho-hap" } },
      ],
    });
}

it("builds a 2-level tree with derived counts (top = sum of children)", async () => {
  stub();
  const tree = await getCategoryTree();
  expect(tree).toEqual([
    {
      id: "noi-khoa",
      name: "Nội",
      slug: "noi-khoa",
      count: 3,
      children: [
        {
          id: "noi-khoa/tim",
          name: "Tim",
          slug: "noi-khoa/tim",
          count: 2,
        },
        {
          id: "noi-khoa/ho-hap",
          name: "Hô hấp",
          slug: "noi-khoa/ho-hap",
          count: 1,
        },
      ],
    },
  ]);
});

it("resolves a full slug path to its node", async () => {
  stub();
  expect((await getCategoryBySlug("/noi-khoa/tim/"))?.name).toBe("Tim");
});
