"use client";

import { Filter, Layers } from "lucide-react";
import Link from "next/link";
import { use, useMemo, useState } from "react";
import { CardGrid } from "@/src/components/book/CardGrid";
import { EmptyState } from "@/src/components/book/EmptyState";
import { FilterSidebar, type FilterState } from "@/src/components/book/FilterSidebar";
import { Pagination } from "@/src/components/book/Pagination";
import { SortControl, type SortOption } from "@/src/components/book/SortControl";
import { Breadcrumb } from "@/src/components/global/Breadcrumb";
import { BOOKS_DATA } from "@/src/data/books";
import { findCategoryBySlug } from "@/src/data/categories";

export default function CategoryPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const resolvedParams = use(params);
  const slugArray = resolvedParams?.slug || [];
  const fullSlug = slugArray.join("/");

  const category = findCategoryBySlug(fullSlug) || {
    id: slugArray[slugArray.length - 1] || "chuyen-khoa",
    name:
      slugArray[slugArray.length - 1]
        ?.split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ") || "Chuyên khoa",
    slug: fullSlug,
  };

  const [filters, setFilters] = useState<FilterState>({});
  const [sort, setSort] = useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const ITEMS_PER_PAGE = 8;

  // Filter books matching current category slug or parent
  const categoryBooks = useMemo(() => {
    return BOOKS_DATA.filter((book) => {
      const matchesCategory =
        book.categorySlug === fullSlug ||
        book.parentCategorySlug === fullSlug ||
        book.categorySlug.includes(slugArray[0]);

      if (!matchesCategory) return false;

      if (filters.language && book.language !== filters.language) return false;
      if (filters.format && book.format !== filters.format) return false;

      return true;
    });
  }, [fullSlug, slugArray, filters]);

  // Sort
  const sortedBooks = useMemo(() => {
    const list = [...categoryBooks];
    switch (sort) {
      case "newest":
        return list.sort(
          (a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
        );
      case "downloads":
        return list.sort((a, b) => b.downloadCount - a.downloadCount);
      case "rating":
        return list.sort((a, b) => b.rating - a.rating);
      case "title":
        return list.sort((a, b) => a.title.localeCompare(b.title, "vi"));
      default:
        return list;
    }
  }, [categoryBooks, sort]);

  // Paginate
  const totalPages = Math.ceil(sortedBooks.length / ITEMS_PER_PAGE);
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedBooks.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedBooks, currentPage]);

  // Build breadcrumb items based on slug hierarchy
  const breadcrumbItems = [
    { label: "Thư viện sách", href: "/thu-vien-sach" },
    ...slugArray.map((part, index) => {
      const partPath = slugArray.slice(0, index + 1).join("/");
      const matched = findCategoryBySlug(partPath);
      return {
        label: matched ? matched.name : part.replace(/-/g, " "),
        href: index < slugArray.length - 1 ? `/danh-muc/${partPath}` : undefined,
      };
    }),
  ];

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-6 space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      {/* Category Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Chuyên ngành y khoa</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-content tracking-tight">
            {category.name}
          </h1>
          <p className="text-xs sm:text-sm text-content-muted mt-1">
            Tổng hợp giáo trình, tài liệu chuyên sâu và bài giảng lâm sàng ngành {category.name}
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-surface text-content text-xs font-semibold hover:bg-surface-muted transition-colors shadow-2xs"
          >
            <Filter className="w-4 h-4 text-primary" />
            <span>Lọc trong mục này</span>
            {Boolean(filters.language || filters.format) && (
              <span className="w-2 h-2 rounded-full bg-primary" />
            )}
          </button>
        </div>
      </div>

      {/* Subcategory pills if available */}
      {category.children && category.children.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1 pb-2">
          <span className="text-xs text-content-muted font-medium py-1">Phân ngành con:</span>
          {category.children.map((child) => (
            <Link
              key={child.id}
              href={`/danh-muc/${child.slug}`}
              className="px-3 py-1 bg-surface hover:bg-primary/10 hover:text-primary rounded-full text-xs font-medium text-content border border-border transition-colors shadow-2xs"
            >
              {child.name} {child.count ? `(${child.count})` : ""}
            </Link>
          ))}
        </div>
      )}

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:col-span-1 sticky top-20">
          <FilterSidebar
            filters={filters}
            onFilterChange={(f) => {
              setFilters(f);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <FilterSidebar
            filters={filters}
            onFilterChange={(f) => {
              setFilters(f);
              setCurrentPage(1);
            }}
            isMobileDrawer={true}
            onCloseMobileDrawer={() => setMobileFilterOpen(false)}
          />
        )}

        {/* Main Grid */}
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
              title={`Chưa có sách nào phù hợp trong danh mục ${category.name}`}
              description="Bạn có thể kiểm tra các chuyên ngành liên quan hoặc xem danh sách tất cả tài liệu trong thư viện."
              actionLabel="Xem tất cả sách y học"
              actionHref="/thu-vien-sach"
            />
          )}
        </div>
      </div>
    </div>
  );
}
