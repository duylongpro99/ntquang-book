import { cmsFetch } from "./client";
import { mapCategoryNode, type StrapiEntry } from "./mappers";
import type { CategoryItem } from "./types";

async function fetchCounts(): Promise<Map<string, number>> {
  const res = await cmsFetch<{ data: StrapiEntry[] }>(
    "/books",
    {
      status: "published",
      fields: ["id"],
      populate: { category: { fields: ["slug"] } },
      pagination: { page: 1, pageSize: 100 },
    },
    { tags: ["books", "categories"] },
  );
  const counts = new Map<string, number>();
  for (const b of res.data) {
    const slug = b.category?.slug;
    if (slug) counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }
  return counts;
}

export async function getCategoryTree(): Promise<CategoryItem[]> {
  const [catRes, counts] = await Promise.all([
    cmsFetch<{ data: StrapiEntry[] }>(
      "/categories",
      {
        populate: { parent: { fields: ["slug"] } },
        sort: ["id:asc"],
        pagination: { page: 1, pageSize: 200 },
      },
      { tags: ["categories"] },
    ),
    fetchCounts(),
  ]);
  const tops = catRes.data.filter((c) => !c.parent);
  const childrenOf = (slug: string) => catRes.data.filter((c) => c.parent?.slug === slug);
  return tops.map((top) => {
    const children = childrenOf(top.slug).map((c) =>
      mapCategoryNode(c, undefined, counts.get(c.slug) ?? 0),
    );
    const total = children.reduce((n, c) => n + (c.count ?? 0), 0) + (counts.get(top.slug) ?? 0);
    return mapCategoryNode(top, children, total);
  });
}

export async function getCategoryBySlug(slugPath: string): Promise<CategoryItem | null> {
  const clean = slugPath.replace(/^\/+|\/+$/g, "");
  const tree = await getCategoryTree();
  for (const top of tree) {
    if (top.slug === clean || top.id === clean) return top;
    for (const c of top.children ?? []) if (c.slug === clean || c.id === clean) return c;
  }
  return null;
}
