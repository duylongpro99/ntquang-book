"use client";

import {
  BookOpen,
  Calendar,
  ExternalLink,
  HardDrive,
  Languages,
  ListOrdered,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { RatingStars } from "@/src/components/book/RatingStars";
import { PrimaryCTA } from "@/src/components/detail/PrimaryCTA";
import { useAuth } from "@/src/context/AuthContext";
import { useQuickView } from "@/src/context/QuickViewContext";

export function QuickViewModal() {
  const { selectedBook, closeQuickView } = useQuickView();
  const { triggerDownload } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeQuickView();
      }
    };

    if (selectedBook) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedBook, closeQuickView]);

  if (!selectedBook) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-view-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={closeQuickView}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface rounded-2xl border border-border shadow-e3 z-10 animate-in zoom-in-95 duration-200 p-6 sm:p-8">
        {/* Close Button */}
        <button
          onClick={closeQuickView}
          className="absolute top-4 right-4 p-2 rounded-full text-content-muted hover:text-content hover:bg-surface-muted transition-colors"
          aria-label="Đóng xem nhanh"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
          {/* Left: Book Cover */}
          <div className="sm:col-span-5 space-y-3">
            <div className="aspect-3/4 w-full bg-surface-muted rounded-xl overflow-hidden border border-border shadow-md relative">
              <img
                src={selectedBook.cover}
                alt={selectedBook.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary text-primary-contrast shadow-xs">
                  {selectedBook.format} EBOOK
                </span>
                {selectedBook.isNew && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent text-accent-contrast shadow-xs">
                    Mới cập nhật
                  </span>
                )}
              </div>
            </div>

            {/* Quick Meta Grid */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-content-muted bg-surface-muted/50 p-2.5 rounded-lg border border-border">
              <div className="flex items-center gap-1.5 truncate">
                <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">Năm {selectedBook.year}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">{selectedBook.pages} trang</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <Languages className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">{selectedBook.language}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <HardDrive className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">{selectedBook.fileSize}</span>
              </div>
            </div>
          </div>

          {/* Right: Info & Download Action */}
          <div className="sm:col-span-7 flex flex-col justify-between space-y-4">
            <div>
              <Link
                href={`/danh-muc/${selectedBook.categorySlug}`}
                onClick={closeQuickView}
                className="text-xs font-semibold text-primary hover:underline"
              >
                {selectedBook.categoryName}
              </Link>

              <h2
                id="quick-view-title"
                className="text-lg sm:text-xl font-heading font-bold text-content leading-snug mt-1"
              >
                {selectedBook.title}
              </h2>

              <p className="text-xs text-content-muted mt-1 font-medium">{selectedBook.author}</p>

              <div className="mt-2.5 flex items-center gap-3">
                <RatingStars
                  rating={selectedBook.rating}
                  count={selectedBook.ratingCount}
                  size="sm"
                />
                <span className="text-[11px] text-content-muted">
                  • {selectedBook.downloadCount.toLocaleString()} lượt tải
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-content-muted leading-relaxed mt-3.5 line-clamp-3">
                {selectedBook.description}
              </p>

              {/* Table of contents preview */}
              {selectedBook.tableOfContents && selectedBook.tableOfContents.length > 0 && (
                <div className="mt-3.5 p-3 rounded-lg bg-surface-muted/60 border border-border">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-content mb-1.5">
                    <ListOrdered className="w-3.5 h-3.5 text-primary" />
                    <span>Mục lục tiêu biểu:</span>
                  </div>
                  <ul className="text-[11px] text-content-muted space-y-1">
                    {selectedBook.tableOfContents.slice(0, 3).map((ch, i) => (
                      <li key={i} className="line-clamp-1">
                        • {ch}
                      </li>
                    ))}
                    {selectedBook.tableOfContents.length > 3 && (
                      <li className="text-primary font-medium text-[10px]">
                        + {selectedBook.tableOfContents.length - 3} chương lâm sàng khác...
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Action CTA with download gate */}
            <div className="pt-4 border-t border-border space-y-2.5">
              <PrimaryCTA book={selectedBook} />

              <div className="flex justify-between items-center text-xs">
                <span className="text-[11px] text-content-muted">Mã SKU: {selectedBook.sku}</span>
                <Link
                  href={`/sach/${selectedBook.slug}`}
                  onClick={closeQuickView}
                  className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
                >
                  <span>Xem chi tiết đầy đủ</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
