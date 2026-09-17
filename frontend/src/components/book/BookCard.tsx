"use client";

import { ArrowRight, Download, Eye } from "lucide-react";
import Link from "next/link";
import { RatingStars } from "@/src/components/book/RatingStars";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { useQuickView } from "@/src/context/QuickViewContext";
import type { Book } from "@/src/data/books";

export interface BookCardProps {
  book?: Book;
  variant?: "book" | "course" | "compact" | "article";
  loading?: boolean;
  className?: string;
  onQuickView?: (book: Book) => void;
}

export function BookCard({
  book,
  variant = "book",
  loading = false,
  className = "",
  onQuickView,
}: BookCardProps) {
  const { openQuickView } = useQuickView();

  if (loading || !book) {
    if (variant === "compact") {
      return (
        <div className={`flex gap-3 p-2 bg-surface rounded-md border border-border ${className}`}>
          <Skeleton className="w-14 h-20 shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      );
    }
    return (
      <div
        className={`bg-surface rounded-md border border-border p-3 flex flex-col gap-3 ${className}`}
      >
        <Skeleton className="w-full aspect-3/4" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-3 w-3/5" />
        <div className="flex justify-between items-center mt-auto pt-2">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={`/sach/${book.slug}`}
        className={`group flex gap-3 p-2.5 bg-surface hover:bg-surface-muted/60 rounded-md border border-border hover:border-primary/40 transition-all shadow-e1 hover:shadow-e2 ${className}`}
      >
        <div className="w-14 h-20 bg-surface-muted rounded overflow-hidden shrink-0 border border-border relative">
          <img
            src={book.cover}
            alt={book.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <span className="text-[11px] text-primary font-medium line-clamp-1">
            {book.categoryName}
          </span>
          <h4 className="text-xs font-medium text-content line-clamp-2 group-hover:text-primary transition-colors">
            {book.title}
          </h4>
          <p className="text-[11px] text-content-muted line-clamp-1 mt-0.5">{book.author}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-semibold text-content-muted bg-surface-muted px-1.5 py-0.5 rounded border border-border">
              {book.format}
            </span>
            <span className="text-[10px] text-content-muted">{book.fileSize}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "article") {
    return (
      <Link
        href={`/sach/${book.slug}`}
        className={`group flex flex-col bg-surface rounded-md border border-border overflow-hidden hover:border-primary/40 transition-all shadow-e1 hover:shadow-e2 ${className}`}
      >
        <div className="aspect-16/9 bg-surface-muted relative overflow-hidden border-b border-border">
          <img
            src={book.cover}
            alt={book.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-primary block mb-1">
              {book.categoryName}
            </span>
            <h3 className="text-sm font-semibold text-content line-clamp-2 group-hover:text-primary transition-colors">
              {book.title}
            </h3>
            <p className="text-xs text-content-muted line-clamp-2 mt-1.5">{book.description}</p>
          </div>
          <div className="pt-3 mt-3 border-t border-border flex items-center justify-between text-xs text-content-muted">
            <span>{book.author}</span>
            <span className="inline-flex items-center text-primary font-semibold group-hover:translate-x-0.5 transition-transform">
              Xem chi tiết <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // Standard "book" or "course" variant
  return (
    <div
      className={`group flex flex-col bg-surface rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-all duration-200 shadow-e1 hover:shadow-e2 ${className}`}
    >
      <Link
        href={`/sach/${book.slug}`}
        className="block relative aspect-3/4 bg-surface-muted overflow-hidden border-b border-border"
        aria-label={book.title}
      >
        <img
          src={book.cover}
          alt={book.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badges for Format and New (No Tiers!) */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          <span className="px-1.5 sm:px-2 py-0.5 rounded text-[10px] font-bold bg-surface/90 backdrop-blur-sm text-content border border-border shadow-xs">
            {book.format}
          </span>
          {book.isNew && (
            <span className="px-1.5 sm:px-2 py-0.5 rounded text-[10px] font-bold bg-accent text-accent-contrast shadow-xs">
              Mới
            </span>
          )}
        </div>

        <div className="absolute bottom-2 right-2 z-10">
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-black/60 text-white backdrop-blur-sm">
            {book.fileSize}
          </span>
        </div>

        {/* Quick View Button on Hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none group-hover:pointer-events-auto z-20">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onQuickView) {
                onQuickView(book);
              } else {
                openQuickView(book);
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface text-content text-xs font-semibold shadow-e2 hover:bg-primary hover:text-primary-contrast transition-colors cursor-pointer"
            aria-label={`Xem nhanh ${book.title}`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem nhanh</span>
          </button>
        </div>
      </Link>

      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between">
        <div>
          <Link
            href={`/danh-muc/${book.categorySlug}`}
            className="text-[10px] sm:text-[11px] font-medium text-primary hover:underline line-clamp-1 block mb-0.5 sm:mb-1"
          >
            {book.categoryName}
          </Link>

          <Link href={`/sach/${book.slug}`}>
            <h3 className="text-xs sm:text-sm font-semibold text-content line-clamp-2 group-hover:text-primary transition-colors leading-snug">
              {book.title}
            </h3>
          </Link>

          <p className="text-[11px] sm:text-xs text-content-muted line-clamp-1 mt-0.5 sm:mt-1">
            {book.author}
          </p>
        </div>

        <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-border flex items-center justify-between gap-1">
          <RatingStars rating={book.rating} count={book.ratingCount} size="sm" />
          <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] text-content-muted shrink-0">
            <Download className="w-3 h-3 text-content-muted/80" />
            <span>{book.downloadCount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
