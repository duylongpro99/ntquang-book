"use client";

import { X, ZoomIn } from "lucide-react";
import { useState } from "react";
import type { Book } from "@/src/data/books";

export interface MediaViewerProps {
  book: Book;
  className?: string;
}

export function MediaViewer({ book, className = "" }: MediaViewerProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Cover Image Container */}
      <div className="relative group bg-surface rounded-xl border border-border overflow-hidden shadow-e2 flex items-center justify-center p-4">
        <div className="relative aspect-3/4 max-w-[340px] w-full mx-auto rounded-lg overflow-hidden shadow-md">
          <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
          <button
            onClick={() => setIsZoomed(true)}
            aria-label="Phóng to ảnh bìa sách"
            className="absolute bottom-3 right-3 p-2 rounded-full bg-black/60 text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Format Badge */}
        <div className="absolute top-3 left-3 bg-primary text-primary-contrast text-xs font-bold px-2.5 py-1 rounded-md shadow-e1">
          {book.format} EBOOK
        </div>
      </div>

      <p className="text-center text-[11px] text-content-muted">
        Bản quyền thuộc tác giả & Nhà xuất bản y học
      </p>

      {/* Lightbox zoom modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-lg max-h-[90vh]">
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute -top-10 right-0 text-white p-1 hover:opacity-80"
              aria-label="Đóng xem ảnh"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={book.cover}
              alt={book.title}
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
