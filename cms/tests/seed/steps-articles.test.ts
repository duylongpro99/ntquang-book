import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';
import { seedAuthors } from '../../scripts/seed/steps/authors';
import { seedArticleCategories } from '../../scripts/seed/steps/article-categories';
import { seedArticles } from '../../scripts/seed/steps/articles';
import { ARTICLES_DATA } from '../../scripts/seed/source';

let strapi: Core.Strapi;
beforeAll(async () => {
  strapi = await setupStrapi();
  await seedAuthors(strapi);
  await seedArticleCategories(strapi);
});
afterAll(async () => { await teardownStrapi(); });

describe('seedArticles', () => {
  it('creates 3 published articles with relations, publishedDate, verbatim content', async () => {
    const n = await seedArticles(strapi);
    expect(n).toBe(3);
    const a1 = await strapi.documents('api::article.article').findFirst({
      status: 'published',
      filters: { slug: 'cap-nhat-huong-dan-chan-doan-dieu-tri-tang-huyet-ap-2024' },
      populate: ['author', 'category'],
    });
    expect(a1?.byline).toBe('BS. Nguyễn Văn Hùng');
    expect((a1 as any).author.name).toBe('BS. Nguyễn Văn Hùng');
    expect((a1 as any).category.name).toBe('Kiến thức y học');
    expect(a1?.publishedDate).toBe('2024-02-25');
    expect(a1?.readTime).toBe('7 phút đọc');
    expect(a1?.coverUrl).toContain('images.unsplash.com');
    // content stored byte-faithfully (no trimming/normalization)
    const src = ARTICLES_DATA.find((a) => a.slug === a1?.slug)!;
    expect(a1?.content).toBe(src.content);
  });

  it('is idempotent (second run: still 3)', async () => {
    expect(await seedArticles(strapi)).toBe(3);
    const all = await strapi.documents('api::article.article').findMany({ status: 'published', pagination: { limit: -1 } });
    expect(all).toHaveLength(3);
  });
});
