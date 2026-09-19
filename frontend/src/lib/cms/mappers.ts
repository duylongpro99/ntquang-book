import type { ColorTokens, ThemeConfig } from "@/src/config/theme";
import { absolute } from "./client";
import type { Article, Book, CategoryItem } from "./types";

// biome-ignore lint/suspicious/noExplicitAny: Strapi response entries are intentionally dynamically shaped (spec §4)
export type StrapiEntry = Record<string, any>;

/**
 * 'yyyy-mm-dd' → 'dd/mm/yyyy'. Inverse of the seed's parseSeedDate.
 * Tolerant on the render path: a null/empty/malformed date yields '' rather
 * than throwing, so a single bad CMS row can't 500 the whole news page.
 */
export function formatCmsDate(iso: string | null | undefined): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((iso ?? "").trim());
  if (!m) return "";
  const [, y, mo, d] = m;
  return `${d}/${mo}/${y}`;
}

export function mapBook(e: StrapiEntry): Book {
  const parentSlug = e.category?.parent?.slug;
  const toc: string[] = (e.tableOfContents ?? []).map((t: { text: string }) => t.text);
  const book: Book = {
    id: e.documentId,
    slug: e.slug,
    title: e.title,
    author: e.byline,
    publisher: e.publisher?.name,
    year: e.year,
    pages: e.pages,
    fileSize: e.fileSize,
    format: e.format,
    language: e.language,
    sku: e.sku,
    rating: e.rating ?? 0,
    ratingCount: e.ratingCount ?? 0,
    categorySlug: e.category?.slug,
    categoryName: e.category?.name,
    cover: e.coverUrl ?? absolute(e.cover?.url) ?? "",
    description: e.description,
    downloadCount: e.downloadCount ?? 0,
    downloadUrl: e.downloadUrl ?? absolute(e.file?.url) ?? "",
    dateAdded: e.dateAdded,
  };
  if (e.editor != null) book.editor = e.editor;
  if (parentSlug != null) book.parentCategorySlug = parentSlug;
  if (toc.length > 0) book.tableOfContents = toc;
  if (e.isFeatured) book.isFeatured = true;
  if (e.isNew) book.isNew = true;
  return book;
}

export function mapArticle(e: StrapiEntry): Article {
  return {
    id: e.documentId,
    slug: e.slug,
    title: e.title,
    category: e.category?.name,
    excerpt: e.excerpt,
    content: e.content,
    author: e.byline,
    publishedAt: formatCmsDate(e.publishedDate),
    cover: e.coverUrl ?? absolute(e.cover?.url) ?? "",
    readTime: e.readTime,
  };
}

/** branding.theme-tokens component → ColorTokens (16 fields, 1:1). */
function mapTokens(t: StrapiEntry): ColorTokens {
  return {
    bg: t.bg,
    surface: t.surface,
    surfaceMuted: t.surfaceMuted,
    border: t.border,
    text: t.text,
    textMuted: t.textMuted,
    primary: t.primary,
    primaryHover: t.primaryHover,
    primaryContrast: t.primaryContrast,
    accent: t.accent,
    accentContrast: t.accentContrast,
    success: t.success,
    warning: t.warning,
    danger: t.danger,
    info: t.info,
    focusRing: t.focusRing,
  };
}

/** branding single type → ThemeConfig (palette only; logo/site meta unused in Phase 4). */
export function mapBranding(e: StrapiEntry): ThemeConfig {
  return {
    id: "cms-branding",
    name: e.name,
    description: e.description ?? "",
    accentLabel: e.accentLabel ?? "",
    light: mapTokens(e.light),
    dark: mapTokens(e.dark),
  };
}

export function mapCategoryNode(
  e: StrapiEntry,
  children?: CategoryItem[],
  count?: number,
): CategoryItem {
  const node: CategoryItem = { id: e.slug, name: e.name, slug: e.slug };
  if (count != null) node.count = count;
  if (children && children.length > 0) node.children = children;
  return node;
}
