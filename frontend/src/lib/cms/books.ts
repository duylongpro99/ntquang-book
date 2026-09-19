import { cmsFetch } from "./client";
import { getCategoryTree } from "./categories";
import { mapBook, type StrapiEntry } from "./mappers";
import type { Book, CategoryItem } from "./types";

export type BookQuery = {
  category?: string; language?: string; format?: string;
  isNew?: boolean; isFeatured?: boolean; featuredOrNew?: boolean;
  sort?: "newest" | "downloads" | "rating" | "title";
  page?: number; pageSize?: number; limit?: number;
};
export type Paged<T> = { books: T[]; total: number; pageCount: number };

const SORT: Record<NonNullable<BookQuery["sort"]>, string> = {
  newest: "dateAdded:desc", downloads: "downloadCount:desc",
  rating: "rating:desc", title: "title:asc",
};

const POPULATE = {
  category: { populate: ["parent"] }, authors: true, publisher: true,
  tableOfContents: true, cover: true, file: true,
};

export function buildBookFilters(q: BookQuery, descendantSlugs?: string[]): Record<string, unknown> {
  const f: Record<string, unknown> = {};
  if (q.language) f.language = { $eq: q.language };
  if (q.format) f.format = { $eq: q.format };
  if (q.isNew) f.isNew = { $eq: true };
  if (q.isFeatured) f.isFeatured = { $eq: true };
  if (q.featuredOrNew) f.$or = [{ isFeatured: { $eq: true } }, { isNew: { $eq: true } }];
  if (q.category) {
    f.category = descendantSlugs?.length
      ? { slug: { $in: descendantSlugs } }
      : { slug: { $eq: q.category } };
  }
  return f;
}

function findNode(tree: CategoryItem[], slug: string): CategoryItem | undefined {
  for (const top of tree) {
    if (top.slug === slug) return top;
    for (const c of top.children ?? []) if (c.slug === slug) return c;
  }
  return undefined;
}

async function descendantSlugsFor(slug: string): Promise<string[] | undefined> {
  const node = findNode(await getCategoryTree(), slug);
  if (node?.children?.length) return [slug, ...node.children.map((c) => c.slug)];
  return undefined;
}

type ListResponse = { data: StrapiEntry[]; meta?: { pagination?: { total: number; pageCount: number } } };

export async function listBooks(q: BookQuery = {}): Promise<Paged<Book>> {
  const descendants = q.category ? await descendantSlugsFor(q.category) : undefined;
  const pagination = q.limit != null
    ? { page: 1, pageSize: q.limit }
    : { page: q.page ?? 1, pageSize: q.pageSize ?? 8 };
  const res = await cmsFetch<ListResponse>("/books", {
    status: "published",
    filters: buildBookFilters(q, descendants),
    sort: [SORT[q.sort ?? "newest"]],
    populate: POPULATE,
    pagination,
  }, { tags: ["books"] });
  return {
    books: res.data.map(mapBook),
    total: res.meta?.pagination?.total ?? res.data.length,
    pageCount: res.meta?.pagination?.pageCount ?? 1,
  };
}

export async function getBookBySlug(slug: string): Promise<Book | null> {
  const res = await cmsFetch<ListResponse>("/books", {
    status: "published", filters: { slug: { $eq: slug } }, populate: POPULATE,
    pagination: { page: 1, pageSize: 1 },
  }, { tags: ["books"] });
  return res.data[0] ? mapBook(res.data[0]) : null;
}

export async function getRelatedBooks(book: Book, limit = 6): Promise<Book[]> {
  const res = await listBooks({ category: book.categorySlug, limit: limit + 1 });
  return res.books.filter((b) => b.id !== book.id).slice(0, limit);
}

export async function searchBooks(q: {
  query: string; sort?: BookQuery["sort"]; page?: number; pageSize?: number; limit?: number;
}): Promise<Paged<Book>> {
  const term = q.query.trim();
  if (!term) return { books: [], total: 0, pageCount: 0 };
  const pagination = q.limit != null
    ? { page: 1, pageSize: q.limit }
    : { page: q.page ?? 1, pageSize: q.pageSize ?? 8 };
  const res = await cmsFetch<ListResponse>("/books", {
    status: "published",
    filters: { $or: [
      { title: { $containsi: term } },
      { byline: { $containsi: term } },
      { description: { $containsi: term } },
      { publisher: { name: { $containsi: term } } },
      { category: { name: { $containsi: term } } },
    ] },
    sort: [SORT[q.sort ?? "newest"]],
    populate: POPULATE,
    pagination,
  }, { tags: ["books"] });
  return {
    books: res.data.map(mapBook),
    total: res.meta?.pagination?.total ?? res.data.length,
    pageCount: res.meta?.pagination?.pageCount ?? 1,
  };
}
