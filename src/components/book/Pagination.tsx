"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <nav
      role="navigation"
      aria-label="Phân trang"
      className={`flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 pt-6 ${className}`}
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Trang trước"
        className="p-1.5 sm:p-2 rounded-lg border border-border bg-surface text-content hover:bg-surface-muted disabled:opacity-40 disabled:pointer-events-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((p, idx) => {
        if (p === "...") {
          return (
            <span
              key={`ellipsis-${idx}`}
              className="px-1.5 sm:px-2 py-1 text-content-muted select-none text-xs sm:text-sm"
            >
              ...
            </span>
          );
        }

        const isCurrent = p === currentPage;
        return (
          <button
            key={`page-${p}`}
            onClick={() => onPageChange(p)}
            aria-current={isCurrent ? "page" : undefined}
            className={`min-w-[32px] sm:min-w-[36px] h-8 sm:h-9 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus cursor-pointer ${
              isCurrent
                ? "bg-primary text-primary-contrast shadow-e1"
                : "bg-surface border border-border text-content hover:bg-surface-muted"
            }`}
          >
            {p}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Trang kế tiếp"
        className="p-1.5 sm:p-2 rounded-lg border border-border bg-surface text-content hover:bg-surface-muted disabled:opacity-40 disabled:pointer-events-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}
