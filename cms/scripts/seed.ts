import { createStrapi, compileStrapi } from '@strapi/strapi';
import type { Core } from '@strapi/strapi';
import { assertSafeDatabase } from './seed/guard';
import { seedCategories } from './seed/steps/categories';
import { seedArticleCategories } from './seed/steps/article-categories';
import { seedAuthors } from './seed/steps/authors';
import { seedPublishers } from './seed/steps/publishers';
import { seedBooks } from './seed/steps/books';
import { seedArticles } from './seed/steps/articles';
import { seedBranding } from './seed/steps/branding';

/** Run all seed steps in dependency order and return per-collection counts. */
export async function runSeed(strapi: Core.Strapi): Promise<Record<string, number>> {
  const categories = await seedCategories(strapi);
  const articleCategories = await seedArticleCategories(strapi);
  const authors = await seedAuthors(strapi);
  const publishers = await seedPublishers(strapi);
  const books = await seedBooks(strapi);
  const articles = await seedArticles(strapi);
  await seedBranding(strapi);
  return { categories, articleCategories, authors, publishers, books, articles };
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const client = process.env.DATABASE_CLIENT ?? 'sqlite';
  assertSafeDatabase(client, {
    force: argv.includes('--force'),
    allowProd: process.env.SEED_ALLOW_PROD === '1',
  });

  const strapi = await createStrapi(await compileStrapi()).load();
  try {
    const counts = await runSeed(strapi);
    // eslint-disable-next-line no-console
    console.log('Seed complete:', JSON.stringify(counts));
    if (argv.includes('--verify')) {
      const { verify } = await import('./seed-verify');
      const result = await verify(strapi);
      // eslint-disable-next-line no-console
      console.log(result.ok ? 'Verify: OK' : `Verify FAILED:\n${result.errors.join('\n')}`);
      if (!result.ok) process.exitCode = 1;
    }
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
