import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';
import { seedCategories } from '../../scripts/seed/steps/categories';
import { seedAuthors } from '../../scripts/seed/steps/authors';
import { seedPublishers } from '../../scripts/seed/steps/publishers';
import { seedBooks } from '../../scripts/seed/steps/books';

let strapi: Core.Strapi;
beforeAll(async () => {
  strapi = await setupStrapi();
  await seedCategories(strapi);
  await seedAuthors(strapi);
  await seedPublishers(strapi);
});
afterAll(async () => { await teardownStrapi(); });

describe('seedBooks', () => {
  it('creates 12 published books with resolved relations, byline, and TOC', async () => {
    const n = await seedBooks(strapi);
    expect(n).toBe(12);
    const published = await strapi.documents('api::book.book').findMany({ status: 'published', pagination: { limit: -1 } });
    expect(published).toHaveLength(12);

    const b1 = await strapi.documents('api::book.book').findFirst({
      status: 'published', filters: { sku: 'MED-NOI-001' },
      populate: ['authors', 'publisher', 'category', 'tableOfContents'],
    });
    expect(b1?.byline).toBe('PGS.TS. Châu Ngọc Hoa (Chủ biên)');
    expect((b1 as any).authors[0].name).toBe('PGS.TS. Châu Ngọc Hoa (Chủ biên)');
    expect((b1 as any).publisher.name).toBe('NXB Y Học');
    expect((b1 as any).category.slug).toBe('noi-khoa/noi-tong-quat');
    expect((b1 as any).tableOfContents).toHaveLength(7);
    expect((b1 as any).tableOfContents[0].text).toBe('Chương 1: Nguyên tắc tiếp cận bệnh nhân nội khoa');
    expect(b1?.coverUrl).toContain('images.unsplash.com');
    expect((b1 as any).cover ?? null).toBeNull(); // media field left empty
    expect(b1?.language).toBe('Tiếng Việt');
    expect(b1?.downloadUrl).toBe('/files/dieu-tri-hoc-noi-khoa-tap-1.pdf');
  });

  it('is idempotent (second run: still 12)', async () => {
    expect(await seedBooks(strapi)).toBe(12);
    const published = await strapi.documents('api::book.book').findMany({ status: 'published', pagination: { limit: -1 } });
    expect(published).toHaveLength(12);
  });

  it('throws loudly if a categorySlug is missing', async () => {
    await expect(
      seedBooks(strapi, [{ ...({} as any), sku: 'X', title: 'X', slug: 'x', categorySlug: 'no-such/cat',
        author: 'A', publisher: 'NXB Y Học' } as any]),
    ).rejects.toThrow(/categor/i);
  });
});
