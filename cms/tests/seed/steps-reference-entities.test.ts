import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';
import { seedAuthors } from '../../scripts/seed/steps/authors';
import { seedPublishers } from '../../scripts/seed/steps/publishers';
import { seedArticleCategories } from '../../scripts/seed/steps/article-categories';

let strapi: Core.Strapi;
beforeAll(async () => { strapi = await setupStrapi(); });
afterAll(async () => { await teardownStrapi(); });

describe('reference entity steps', () => {
  it('seeds 15 distinct authors across books + articles, with slugs', async () => {
    const n = await seedAuthors(strapi);
    expect(n).toBe(15);
    const all = await strapi.documents('api::author.author').findMany({ pagination: { limit: -1 } });
    expect(all).toHaveLength(15);
    const netter = await strapi.documents('api::author.author').findFirst({ filters: { name: 'Frank H. Netter, MD' } });
    expect(netter?.slug).toBe('frank-h-netter-md');
    const articleAuthor = await strapi.documents('api::author.author').findFirst({ filters: { name: 'BS. Nguyễn Văn Hùng' } });
    expect(articleAuthor).not.toBeNull(); // article authors included
  });

  it('seeds 2 publishers', async () => {
    const n = await seedPublishers(strapi);
    expect(n).toBe(2);
    const nxb = await strapi.documents('api::publisher.publisher').findFirst({ filters: { name: 'NXB Y Học' } });
    expect(nxb?.slug).toBe('nxb-y-hoc');
  });

  it('seeds 3 article-categories with generated slugs', async () => {
    const n = await seedArticleCategories(strapi);
    expect(n).toBe(3);
    const c = await strapi.documents('api::article-category.article-category').findFirst({ filters: { name: 'Kiến thức y học' } });
    expect(c?.slug).toBe('kien-thuc-y-hoc');
  });

  it('all three are idempotent on a second run', async () => {
    expect(await seedAuthors(strapi)).toBe(15);
    expect(await seedPublishers(strapi)).toBe(2);
    expect(await seedArticleCategories(strapi)).toBe(3);
    const authors = await strapi.documents('api::author.author').findMany({ pagination: { limit: -1 } });
    expect(authors).toHaveLength(15);
  });
});
