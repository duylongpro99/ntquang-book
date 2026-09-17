"use client";

import React, { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBookBySlug, getRelatedBooks, BOOKS_DATA } from "@/src/data/books";
import { Breadcrumb } from "@/src/components/global/Breadcrumb";
import { MediaViewer } from "@/src/components/detail/MediaViewer";
import { MetaList } from "@/src/components/detail/MetaList";
import { PrimaryCTA } from "@/src/components/detail/PrimaryCTA";
import { ShareBar } from "@/src/components/detail/ShareBar";
import { TabGroup } from "@/src/components/detail/TabGroup";
import { RatingStars } from "@/src/components/book/RatingStars";
import { Rail } from "@/src/components/book/Rail";
import { ShieldCheck, ArrowLeft, Download, CheckCircle2 } from "lucide-react";

export default function BookDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams?.slug;
  const book = getBookBySlug(slug);

  if (!book) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-content font-heading">
          Không tìm thấy tài liệu
        </h1>
        <p className="text-sm text-content-muted">
          Cuốn sách hoặc tài liệu y khoa bạn đang tìm kiếm không tồn tại hoặc đã được chuyển sang đường dẫn khác.
        </p>
        <Link
          href="/thu-vien-sach"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-contrast text-sm font-semibold hover:bg-primary-hover transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay về kho thư viện sách</span>
        </Link>
      </div>
    );
  }

  const relatedBooks = getRelatedBooks(book, 6);

  return (
    <div className="space-y-10 pb-20 md:pb-12">
      {/* Top Container */}
      <div className="max-w-[1280px] mx-auto px-4 pt-6 space-y-6">
        <Breadcrumb
          items={[
            { label: "Thư viện", href: "/thu-vien-sach" },
            {
              label: book.categoryName,
              href: `/danh-muc/${book.categorySlug}`,
            },
            { label: book.title },
          ]}
        />

        {/* 2-Column Product Detail Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10">
          {/* Left Column: Media & Share */}
          <div className="md:col-span-5 lg:col-span-4 space-y-5">
            <MediaViewer book={book} />
            <div className="p-4 bg-surface rounded-xl border border-border">
              <ShareBar title={book.title} />
            </div>
          </div>

          {/* Right Column: Title, Metadata, CTA */}
          <div className="md:col-span-7 lg:col-span-8 space-y-5">
            <div>
              <Link
                href={`/danh-muc/${book.categorySlug}`}
                className="inline-block text-xs font-semibold text-primary uppercase tracking-wider mb-2 hover:underline"
              >
                {book.categoryName}
              </Link>
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-content tracking-tight leading-snug">
                {book.title}
              </h1>
              <p className="text-sm text-content-muted mt-1.5 font-medium">
                Tác giả / Chủ biên: <span className="text-content font-semibold">{book.author}</span> · NXB: {book.publisher}
              </p>

              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                <RatingStars rating={book.rating} count={book.ratingCount} size="md" />
                <span className="text-content-muted">•</span>
                <span className="text-xs text-content-muted flex items-center gap-1">
                  <Download className="w-3.5 h-3.5 text-primary" />
                  <strong>{book.downloadCount.toLocaleString()}</strong> lượt tải
                </span>
                <span className="text-content-muted">•</span>
                <span className="text-xs text-success font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Đã kiểm duyệt y khoa
                </span>
              </div>
            </div>

            {/* Download CTA Box */}
            <PrimaryCTA book={book} />

            {/* Metadata spec sheet */}
            <MetaList book={book} />
          </div>
        </div>

        {/* Detailed Tabs: Description, TOC, Reviews */}
        <div className="pt-4">
          <TabGroup book={book} />
        </div>

        {/* Curated Related Books Rail */}
        {relatedBooks.length > 0 && (
          <div className="pt-6 border-t border-border">
            <Rail
              title="Tài Liệu Y Khoa Cùng Chuyên Ngành"
              subtitle={`Các đầu sách, giáo trình cùng nhóm chuyên môn với ${book.categoryName}`}
              books={relatedBooks}
              viewAllHref={`/danh-muc/${book.categorySlug}`}
            />
          </div>
        )}
      </div>

      {/* Sticky Bottom CTA for Mobile (<768px) */}
      <PrimaryCTA book={book} isStickyMobile={true} />
    </div>
  );
}
