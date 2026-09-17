import type { Core } from '@strapi/strapi';
import { setupStrapi, teardownStrapi } from '../helpers/strapi';

let strapi: Core.Strapi;
beforeAll(async () => { strapi = await setupStrapi(); });
afterAll(async () => { await teardownStrapi(); });

describe('book content type', () => {
  it('has draft/publish and the key field shapes', () => {
    const ct = strapi.contentType('api::book.book');
    expect(ct.options?.draftAndPublish).toBe(true);
    expect(ct.attributes.slug.type).toBe('uid');
    expect(ct.attributes.format.type).toBe('enumeration');
    expect((ct.attributes.format as any).enum).toEqual(['PDF', 'EPUB', 'Chm']);
    expect(ct.attributes.language.type).toBe('string'); // NOT enum (GraphQL-safe)
    expect(ct.attributes.tableOfContents.type).toBe('component');
    expect(ct.attributes.cover.type).toBe('media');
    expect(ct.attributes.coverUrl.type).toBe('string');
    expect((ct.attributes.authors as any).relation).toBe('manyToMany');
    expect((ct.attributes.publisher as any).relation).toBe('manyToOne');
  });

  it('links authors/publisher/category, stores TOC + Vietnamese language', async () => {
    const author = await strapi.documents('api::author.author').create({ data: { name: 'Rel Auth', slug: 'rel-auth' } });
    const pub = await strapi.documents('api::publisher.publisher').create({ data: { name: 'Rel Pub', slug: 'rel-pub' } });
    const cat = await strapi.documents('api::category.category').create({ data: { name: 'Rel Cat', slug: 'rel-cat-path' } });
    const book = await strapi.documents('api::book.book').create({
      data: {
        title: 'Rel Book', slug: 'rel-book', sku: 'SKU-REL-1',
        byline: 'PGS.TS. Châu Ngọc Hoa (Chủ biên)',
        authors: [author.documentId], publisher: pub.documentId, category: cat.documentId,
        tableOfContents: [{ text: 'Chương 1' }, { text: 'Chương 2' }],
        format: 'PDF', language: 'Tiếng Việt', coverUrl: 'https://example.com/c.jpg', downloadCount: 0,
      },
      status: 'published',
      populate: ['authors', 'publisher', 'category', 'tableOfContents'],
    });
    expect((book as any).authors[0].name).toBe('Rel Auth');
    expect((book as any).publisher.name).toBe('Rel Pub');
    expect((book as any).category.slug).toBe('rel-cat-path');
    expect((book as any).tableOfContents).toHaveLength(2);
    expect((book as any).tableOfContents[0].text).toBe('Chương 1');
    expect(book.language).toBe('Tiếng Việt');
    expect(book.byline).toBe('PGS.TS. Châu Ngọc Hoa (Chủ biên)');
  });

  it('hides drafts from the published document status', async () => {
    await strapi.documents('api::book.book').create({ data: { title: 'Pub One', slug: 'pub-one', sku: 'SKU-PUB-1' }, status: 'published' });
    await strapi.documents('api::book.book').create({ data: { title: 'Draft One', slug: 'draft-one', sku: 'SKU-DRAFT-1' }, status: 'draft' });
    const published = await strapi.documents('api::book.book').findMany({
      status: 'published', filters: { sku: { $in: ['SKU-PUB-1', 'SKU-DRAFT-1'] } },
    });
    const skus = published.map((b: any) => b.sku);
    expect(skus).toContain('SKU-PUB-1');
    expect(skus).not.toContain('SKU-DRAFT-1');
  });
});
