import { cmsFetch } from "./client";
import { mapArticle, type StrapiEntry } from "./mappers";
import type { Article } from "./types";

const POPULATE = { author: true, category: true, cover: true };
type ListResponse = { data: StrapiEntry[] };

export async function listArticles(
  q: { page?: number; pageSize?: number } = {},
): Promise<Article[]> {
  const res = await cmsFetch<ListResponse>(
    "/articles",
    {
      status: "published",
      sort: ["publishedDate:desc"],
      populate: POPULATE,
      pagination: { page: q.page ?? 1, pageSize: q.pageSize ?? 100 },
    },
    { tags: ["articles"] },
  );
  return res.data.map(mapArticle);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const res = await cmsFetch<ListResponse>(
    "/articles",
    {
      status: "published",
      filters: { slug: { $eq: slug } },
      populate: POPULATE,
      pagination: { page: 1, pageSize: 1 },
    },
    { tags: ["articles"] },
  );
  return res.data[0] ? mapArticle(res.data[0]) : null;
}
