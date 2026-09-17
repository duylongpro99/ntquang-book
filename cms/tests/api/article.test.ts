import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';

let strapi: Core.Strapi;
beforeAll(async () => { strapi = await setupStrapi(); });
afterAll(async () => { await teardownStrapi(); });

describe('article content type', () => {
  it('has draft/publish, richtext content and the right relations', () => {
    const ct = strapi.contentType('api::article.article');
    expect(ct.options?.draftAndPublish).toBe(true);
    expect(ct.attributes.content.type).toBe('richtext');
    expect((ct.attributes.author as any).relation).toBe('manyToOne');
    expect((ct.attributes.author as any).target).toBe('api::author.author');
    expect((ct.attributes.category as any).target).toBe('api::article-category.article-category');
  });

  it('stores HTML content and links author + category', async () => {
    const author = await strapi.documents('api::author.author').create({ data: { name: 'Art Auth', slug: 'art-auth' } });
    const cat = await strapi.documents('api::article-category.article-category').create({ data: { name: 'Cận lâm sàng', slug: 'can-lam-sang' } });
    const article = await strapi.documents('api::article.article').create({
      data: {
        title: 'Bài viết A', slug: 'bai-viet-a', excerpt: 'tóm tắt',
        content: '<p>Nội dung <strong>HTML</strong></p>', readTime: '7 phút đọc',
        byline: 'BS. Nguyễn Văn Hùng', author: author.documentId, category: cat.documentId,
      },
      status: 'published',
      populate: ['author', 'category'],
    });
    expect(article.content).toContain('<strong>HTML</strong>');
    expect((article as any).author.name).toBe('Art Auth');
    expect((article as any).category.slug).toBe('can-lam-sang');
  });
});
