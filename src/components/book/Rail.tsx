"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { Book } from "@/src/data/books";
import { BookCard } from "@/src/components/book/BookCard";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

export interface RailProps {
  title: string;
  subtitle?: string;
  books?: Book[];
  viewAllHref?: string;
  loading?: boolean;
  className?: string;
}

export function Rail({
  title,
  subtitle,
  books = [],
  viewAllHref,
  loading = false,
  className = "",
}: RailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = direction === "left" ? -320 : 320;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  return (
    <section className={`py-4 ${className}`}>
      {/* Header */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-lg md:text-xl font-heading font-bold text-content tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs md:text-sm text-content-muted mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 mr-2"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scroll("left")}
              aria-label="Cuộn sang trái"
              className="p-1.5 rounded-md border border-border bg-surface text-content hover:bg-surface-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Cuộn sang phải"
              className="p-1.5 rounded-md border border-border bg-surface text-content hover:bg-surface-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Rail content */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x focus:outline-none"
        tabIndex={0}
        aria-label={title}
      >
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`rail-skel-${i}`}
              className="w-[180px] sm:w-[220px] shrink-0 snap-start"
            >
              <BookCard loading={true} />
            </div>
          ))
        ) : books.length > 0 ? (
          books.map((book) => (
            <div
              key={book.id}
              className="w-[180px] sm:w-[220px] shrink-0 snap-start"
            >
              <BookCard book={book} />
            </div>
          ))
        ) : (
          <div className="py-6 text-sm text-content-muted">
            Hiện chưa có sách trong mục này.
          </div>
        )}
      </div>
    </section>
  );
}
