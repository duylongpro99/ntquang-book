import type { Core } from '@strapi/strapi';
import { BOOKS_DATA, ARTICLES_DATA, CATEGORIES_TREE } from './seed/source';
import { reflattenBook, reflattenArticle } from './seed/reflatten';

const EXPECTED_CATEGORIES =
  CATEGORIES_TREE.reduce((n, top) => n + 1 + (top.children?.length ?? 0), 0); // 56

/** slug → canonical category name, walking top-level + children of CATEGORIES_TREE. */
const CANONICAL_NAME_BY_SLUG = new Map<string, string>();
for (const top of CATEGORIES_TREE) {
  CANONICAL_NAME_BY_SLUG.set(top.slug, top.name);
  for (const child of top.children ?? []) CANONICAL_NAME_BY_SLUG.set(child.slug, child.name);
}

/** Recursively sort object keys so structurally-equal values compare equal regardless of
 *  key insertion order. Arrays keep their element order (order is meaningful there). */
function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value !== null && typeof value === 'object') {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      sorted[key] = canonicalize((value as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return value;
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(canonicalize(a)) === JSON.stringify(canonicalize(b));
}

/** Verify counts and re-flatten round-trip against the source arrays. */
export async function verify(strapi: Core.Strapi): Promise<{ ok: boolean; errors: string[] }> {
  const errors: string[] = [];

  const check = async (uid: string, expected: number, label: string, published = false) => {
    const rows = await strapi.documents(uid as any).findMany({
      pagination: { limit: -1 }, ...(published ? { status: 'published' as const } : {}),
    });
    if (rows.length !== expected) errors.push(`count ${label}: expected ${expected}, got ${rows.length}`);
  };

  await check('api::category.category', EXPECTED_CATEGORIES, 'categories');
  await check('api::article-category.article-category', new Set(ARTICLES_DATA.map((a) => a.category)).size, 'article-categories');
  await check('api::author.author',
    new Set([...BOOKS_DATA.map((b) => b.author), ...ARTICLES_DATA.map((a) => a.author)]).size, 'authors');
  await check('api::publisher.publisher', new Set(BOOKS_DATA.map((b) => b.publisher)).size, 'publishers');
  await check('api::book.book', BOOKS_DATA.length, 'books', true);
  await check('api::article.article', ARTICLES_DATA.length, 'articles', true);

  // Re-flatten diff — books.
  for (const src of BOOKS_DATA) {
    const entry = await strapi.documents('api::book.book').findFirst({
      status: 'published', filters: { sku: src.sku },
      populate: { authors: true, publisher: true, category: { populate: ['parent'] }, tableOfContents: true } as any,
    });
    if (!entry) { errors.push(`book ${src.sku}: not found`); continue; }
    const { id, ...expected } = src;
    // categoryName is re-derived from the category relation (spec §3), not stored on the
    // book — compare against the canonical tree name rather than the (possibly stale)
    // source value.
    const canonicalName = CANONICAL_NAME_BY_SLUG.get(src.categorySlug);
    if (canonicalName == null) { errors.push(`book ${src.sku}: categorySlug ${src.categorySlug} not found in CATEGORIES_TREE`); continue; }
    (expected as any).categoryName = canonicalName;
    const got = reflattenBook(entry);
    if (!deepEqual(got, expected)) errors.push(`book ${src.sku}: re-flatten mismatch\n  expected: ${JSON.stringify(expected)}\n  got:      ${JSON.stringify(got)}`);
  }

  // Re-flatten diff — articles.
  for (const src of ARTICLES_DATA) {
    const entry = await strapi.documents('api::article.article').findFirst({
      status: 'published', filters: { slug: src.slug }, populate: ['author', 'category'],
    });
    if (!entry) { errors.push(`article ${src.slug}: not found`); continue; }
    const { id, ...expected } = src;
    const got = reflattenArticle(entry);
    if (!deepEqual(got, expected)) errors.push(`article ${src.slug}: re-flatten mismatch\n  expected: ${JSON.stringify(expected)}\n  got:      ${JSON.stringify(got)}`);
  }

  return { ok: errors.length === 0, errors };
}

async function main(): Promise<void> {
  const { createStrapi, compileStrapi } = await import('@strapi/strapi');
  const strapi = await createStrapi(await compileStrapi()).load();
  try {
    const result = await verify(strapi);
    // eslint-disable-next-line no-console
    console.log(result.ok ? 'Verify: OK' : `Verify FAILED:\n${result.errors.join('\n')}`);
    if (!result.ok) process.exitCode = 1;
  } finally {
    await strapi.destroy();
  }
}

if (require.main === module) {
  main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
}
