import { reflattenBook, reflattenArticle } from '../../scripts/seed/reflatten';
import { BOOKS_DATA, ARTICLES_DATA } from '../../scripts/seed/source';

describe('reflattenBook', () => {
  it('reconstructs a child-category book equal to source (minus id)', () => {
    const src = BOOKS_DATA.find((b) => b.sku === 'MED-NOI-001')!;
    const entry = {
      slug: src.slug, title: src.title, editor: src.editor, byline: src.author, categoryName: src.categoryName,
      publisher: { name: src.publisher }, category: { slug: src.categorySlug, name: src.categoryName, parent: { slug: src.parentCategorySlug } },
      year: src.year, pages: src.pages, fileSize: src.fileSize, format: src.format, language: src.language,
      sku: src.sku, rating: src.rating, ratingCount: src.ratingCount, downloadCount: src.downloadCount,
      dateAdded: src.dateAdded, isFeatured: true, isNew: true,
      coverUrl: src.cover, description: src.description,
      tableOfContents: src.tableOfContents!.map((text) => ({ text })), downloadUrl: src.downloadUrl,
    };
    const { id, ...expected } = src;
    expect(reflattenBook(entry)).toEqual(expected);
  });

  it('omits parentCategorySlug/isFeatured/isNew for a top-level, unflagged book', () => {
    const src = BOOKS_DATA.find((b) => b.sku === 'MED-ENG-008')!; // sach-tieng-anh, isFeatured only
    const entry = {
      slug: src.slug, title: src.title, editor: src.editor, byline: src.author, categoryName: src.categoryName,
      publisher: { name: src.publisher }, category: { slug: src.categorySlug, name: src.categoryName, parent: null },
      year: src.year, pages: src.pages, fileSize: src.fileSize, format: src.format, language: src.language,
      sku: src.sku, rating: src.rating, ratingCount: src.ratingCount, downloadCount: src.downloadCount,
      dateAdded: src.dateAdded, isFeatured: true, isNew: false,
      coverUrl: src.cover, description: src.description,
      tableOfContents: src.tableOfContents!.map((text) => ({ text })), downloadUrl: src.downloadUrl,
    };
    const out = reflattenBook(entry);
    expect(out).not.toHaveProperty('parentCategorySlug');
    expect(out).not.toHaveProperty('isNew');
    expect(out.isFeatured).toBe(true);
    const { id, ...expected } = src;
    expect(out).toEqual(expected);
  });
});

describe('reflattenArticle', () => {
  it('reconstructs an article equal to source (minus id)', () => {
    const src = ARTICLES_DATA[0];
    const entry = {
      slug: src.slug, title: src.title, excerpt: src.excerpt, content: src.content,
      byline: src.author, category: { name: src.category }, publishedDate: '2024-02-25',
      coverUrl: src.cover, readTime: src.readTime,
    };
    const { id, ...expected } = src;
    expect(reflattenArticle(entry)).toEqual(expected);
  });
});
