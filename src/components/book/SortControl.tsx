"use client";

import React from "react";
import { ArrowUpDown } from "lucide-react";

export type SortOption = "newest" | "downloads" | "rating" | "title";

export interface SortControlProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalResults?: number;
  className?: string;
}

export function SortControl({
  currentSort,
  onSortChange,
  totalResults,
  className = "",
}: SortControlProps) {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 text-xs sm:text-sm ${className}`}>
      {totalResults !== undefined && (
        <span className="text-content-muted text-xs">
          Tìm thấy <strong className="text-content font-semibold">{totalResults}</strong> tài liệu
        </span>
      )}

      <div className="flex items-center gap-2 ml-auto sm:ml-auto">
        <label htmlFor="sort-select" className="text-content-muted flex items-center gap-1.5 whitespace-nowrap text-xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-content-muted shrink-0" />
          <span className="hidden xs:inline">Sắp xếp:</span>
        </label>
        <select
          id="sort-select"
          value={currentSort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus font-medium max-w-[190px] truncate"
        >
          <option value="newest">Mới cập nhật nhất</option>
          <option value="downloads">Lượt tải nhiều nhất</option>
          <option value="rating">Đánh giá cao nhất</option>
          <option value="title">Tên tài liệu (A-Z)</option>
        </select>
      </div>
    </div>
  );
}
