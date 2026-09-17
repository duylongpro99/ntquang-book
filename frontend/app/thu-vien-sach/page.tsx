"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BOOKS_DATA, Book } from "@/src/data/books";
import { Breadcrumb } from "@/src/components/global/Breadcrumb";
import { FilterSidebar, FilterState } from "@/src/components/book/FilterSidebar";
import { SortControl, SortOption } from "@/src/components/book/SortControl";
import { CardGrid } from "@/src/components/book/CardGrid";
import { Pagination } from "@/src/components/book/Pagination";
import { EmptyState } from "@/src/components/book/EmptyState";
import { Filter } from "lucide-react";

function LibraryCatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("chuyen-khoa") || undefined;

  const [filters, setFilters] = useState<FilterState>({
    category: initialCategory,
  });
  const [sort, setSort] = useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const ITEMS_PER_PAGE = 8;

  // Filter books
  const filteredBooks = useMemo(() => {
    return BOOKS_DATA.filter((book) => {
      if (filters.category) {
        const matchesCategory =
          book.categorySlug === filters.category ||
          book.parentCategorySlug === filters.category ||
          book.categorySlug.startsWith(filters.category);
        if (!matchesCategory) return false;
      }
      if (filters.language) {
        if (book.language !== filters.language) return false;
      }
      if (filters.format) {
        if (book.format !== filters.format) return false;
      }
      return true;
    });
  }, [filters]);

  // Sort books
  const sortedBooks = useMemo(() => {
    const list = [...filteredBooks];
    switch (sort) {
      case "newest":
        return list.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
      case "downloads":
        return list.sort((a, b) => b.downloadCount - a.downloadCount);
      case "rating":
        return list.sort((a, b) => b.rating - a.rating);
      case "title":
        return list.sort((a, b) => a.title.localeCompare(b.title, "vi"));
      default:
        return list;
    }
  }, [filteredBooks, sort]);

  // Paginate
  const totalPages = Math.ceil(sortedBooks.length / ITEMS_PER_PAGE);
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedBooks.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedBooks, currentPage]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-6 space-y-6">
      <Breadcrumb
        items={[
          { label: "Thư viện sách y học" },
        ]}
      />

      {/* Page Title & Mobile Filter Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-content tracking-tight">
            Kho Thư Viện Sách Y Học
          </h1>
          <p className="text-xs sm:text-sm text-content-muted mt-1">
            Tra cứu toàn bộ tài liệu, bài giảng và ebook chuyên ngành y dược
          </p>
        </div>

        {/* Mobile Filter Button (<1024px) */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-surface text-content text-xs font-semibold hover:bg-surface-muted transition-colors shadow-2xs"
          >
            <Filter className="w-4 h-4 text-primary" />
            <span>Bộ lọc chuyên khoa</span>
            {Boolean(filters.category || filters.language || filters.format) && (
              <span className="w-2 h-2 rounded-full bg-primary" />
            )}
          </button>
        </div>
      </div>

      {/* List-Grid Layout: Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-1 sticky top-20">
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            isMobileDrawer={true}
            onCloseMobileDrawer={() => setMobileFilterOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-5">
          <SortControl
            currentSort={sort}
            onSortChange={setSort}
            totalResults={sortedBooks.length}
          />

          {sortedBooks.length > 0 ? (
            <>
              <CardGrid books={paginatedBooks} cols={3} />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </>
          ) : (
            <EmptyState
              variant="category"
              title="Không tìm thấy tài liệu phù hợp với bộ lọc"
              description="Hãy thử bỏ bớt các điều kiện lọc ngôn ngữ hoặc định dạng để hiển thị thêm tài liệu."
              actionLabel="Xóa toàn bộ bộ lọc"
              onActionClick={() => handleFilterChange({})}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={<div className="max-w-[1280px] mx-auto px-4 py-12 text-center text-sm text-content-muted">Đang tải kho sách...</div>}>
      <LibraryCatalogContent />
    </Suspense>
  );
}
