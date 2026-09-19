import { beforeEach, describe, expect, it } from "vitest";
import { formatCmsDate, mapArticle, mapBook, mapCategoryNode } from "./mappers";

beforeEach(() => { process.env.CMS_URL = "http://localhost:1337"; });

const bookEntry = {
  documentId: "doc1", slug: "s1", title: "T", byline: "PGS Author", editor: "Ed",
  publisher: { name: "NXB Y Học" }, year: 2023, pages: 680, fileSize: "45.2 MB",
  format: "PDF", language: "Tiếng Việt", sku: "MED-001", rating: 4.9, ratingCount: 142,
  category: { slug: "noi-khoa/noi-tong-quat", name: "Nội tổng quát", parent: { slug: "noi-khoa" } },
  coverUrl: "https://img/x.jpg", description: "D",
  tableOfContents: [{ text: "Ch 1" }, { text: "Ch 2" }],
  downloadCount: 100, downloadUrl: "/files/x.pdf", dateAdded: "2024-01-15",
  isFeatured: true, isNew: false,
};

describe("mapBook", () => {
  it("re-flattens a populated book entry to the Book shape", () => {
    expect(mapBook(bookEntry)).toEqual({
      id: "doc1", slug: "s1", title: "T", author: "PGS Author", editor: "Ed",
      publisher: "NXB Y Học", year: 2023, pages: 680, fileSize: "45.2 MB",
      format: "PDF", language: "Tiếng Việt", sku: "MED-001", rating: 4.9, ratingCount: 142,
      categorySlug: "noi-khoa/noi-tong-quat", categoryName: "Nội tổng quát",
      parentCategorySlug: "noi-khoa", cover: "https://img/x.jpg", description: "D",
      tableOfContents: ["Ch 1", "Ch 2"], downloadCount: 100, downloadUrl: "/files/x.pdf",
      dateAdded: "2024-01-15", isFeatured: true,
    });
  });
  it("falls back to media url and omits absent optionals", () => {
    const e = { ...bookEntry, editor: undefined, coverUrl: undefined, cover: { url: "/uploads/c.jpg" },
      downloadUrl: undefined, file: { url: "/uploads/f.pdf" }, tableOfContents: [],
      isFeatured: false, category: { slug: "x", name: "X" } };
    const b = mapBook(e);
    expect(b.cover).toBe("http://localhost:1337/uploads/c.jpg");
    expect(b.downloadUrl).toBe("http://localhost:1337/uploads/f.pdf");
    expect(b.editor).toBeUndefined();
    expect(b.parentCategorySlug).toBeUndefined();
    expect(b.tableOfContents).toBeUndefined();
    expect(b.isFeatured).toBeUndefined();
  });
});

describe("mapArticle", () => {
  it("re-flattens and formats publishedDate back to dd/mm/yyyy", () => {
    expect(mapArticle({
      documentId: "a1", slug: "s", title: "Ti", category: { name: "Kiến thức y học" },
      excerpt: "Ex", byline: "BS X", publishedDate: "2024-02-25", readTime: "7 phút đọc",
      coverUrl: "https://img/a.jpg", content: "<p>c</p>",
    })).toEqual({
      id: "a1", slug: "s", title: "Ti", category: "Kiến thức y học", excerpt: "Ex",
      content: "<p>c</p>", author: "BS X", publishedAt: "25/02/2024",
      cover: "https://img/a.jpg", readTime: "7 phút đọc",
    });
  });
});

describe("formatCmsDate", () => {
  it("converts yyyy-mm-dd to dd/mm/yyyy", () => {
    expect(formatCmsDate("2024-02-25")).toBe("25/02/2024");
  });
});

describe("mapCategoryNode", () => {
  it("builds a CategoryItem with children and count", () => {
    expect(mapCategoryNode({ documentId: "c1", name: "N", slug: "noi-khoa" },
      [{ id: "c2", name: "C", slug: "noi-khoa/x", count: 2 }], 5)).toEqual({
      id: "noi-khoa", name: "N", slug: "noi-khoa", count: 5,
      children: [{ id: "c2", name: "C", slug: "noi-khoa/x", count: 2 }],
    });
  });
});
