import type { Core } from '@strapi/strapi';
import { BOOKS_DATA, ARTICLES_DATA, CATEGORIES_TREE } from './seed/source';
import { reflattenBook, reflattenArticle } from './seed/reflatten';

const EXPECTED_CATEGORIES =
  CATEGORIES_TREE.reduce((n, top) => n + 1 + (top.children?.length ?? 0), 0); // 56

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
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
