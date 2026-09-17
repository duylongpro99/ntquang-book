"use client";

import { ChevronRight, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { BOOKS_DATA, type Book } from "@/src/data/books";

export interface GlobalSearchProps {
  variant?: "inline" | "full";
  defaultValue?: string;
  className?: string;
  placeholder?: string;
}

export function GlobalSearch({
  variant = "inline",
  defaultValue = "",
  className = "",
  placeholder = "Tìm kiếm sách, tài liệu y khoa... (vd: nội khoa, CT-MRI, netter)",
}: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<Book[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      const q = query.toLowerCase().trim();
      const filtered = BOOKS_DATA.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.categoryName.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q),
      ).slice(0, 5);
      setResults(filtered);
      setIsOpen(true);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    router.push(`/tim-kiem?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div ref={searchRef} className={`relative w-full ${className}`}>
      <form
        role="search"
        onSubmit={handleSearchSubmit}
        className="relative flex items-center w-full"
      >
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query.trim()) setIsOpen(true);
            }}
            placeholder={placeholder}
            aria-label="Tìm kiếm sách y học"
            className={`w-full rounded-md border border-border bg-surface pl-10 pr-10 text-content placeholder:text-content-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 ${
              variant === "full" ? "py-3 text-base" : "py-2 text-sm"
            }`}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
                setIsOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-content-muted hover:text-content rounded"
              aria-label="Xóa từ khóa"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button type="submit" className="sr-only" aria-label="Tìm kiếm">
          Tìm
        </button>
      </form>

      {/* Live search dropdown results */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface border border-border rounded-lg shadow-e3 z-50 overflow-hidden">
          <div className="p-2 border-b border-border bg-surface-muted/50 text-xs text-content-muted font-medium flex items-center justify-between">
            <span>Gợi ý sách ({results.length})</span>
            <button
              onClick={handleSearchSubmit}
              className="text-primary hover:underline font-semibold"
            >
              Xem tất cả kết quả cho &quot;{query}&quot;
            </button>
          </div>

          {results.length > 0 ? (
            <div className="divide-y divide-border">
              {results.map((book) => (
                <Link
                  key={book.id}
                  href={`/sach/${book.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-3 hover:bg-surface-muted transition-colors text-left"
                >
                  <div className="w-10 h-14 bg-surface-muted rounded overflow-hidden shrink-0 border border-border">
                    <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-content line-clamp-1">{book.title}</h4>
                    <p className="text-xs text-content-muted line-clamp-1 mt-0.5">
                      {book.author} · {book.categoryName}
                    </p>
                    <span className="inline-block mt-1 text-[11px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                      {book.format} · {book.fileSize}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-content-muted shrink-0" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-content-muted">
              Không tìm thấy sách phù hợp với &quot;{query}&quot;. Nhấn Enter để tìm kiếm chi tiết.
            </div>
          )}

          <div className="p-2.5 bg-surface-muted text-center border-t border-border">
            <button
              onClick={handleSearchSubmit}
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              <Search className="w-3 h-3" /> Tìm tất cả &quot;{query}&quot; trong thư viện
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
