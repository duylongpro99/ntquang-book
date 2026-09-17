"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { CardGrid } from "@/src/components/book/CardGrid";
import { EmptyState } from "@/src/components/book/EmptyState";
import { Pagination } from "@/src/components/book/Pagination";
import { SortControl, type SortOption } from "@/src/components/book/SortControl";
import { Breadcrumb } from "@/src/components/global/Breadcrumb";
import { GlobalSearch } from "@/src/components/global/GlobalSearch";
import { BOOKS_DATA } from "@/src/data/books";
import { CATEGORIES_TREE } from "@/src/data/categories";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [sort, setSort] = useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Search filter
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return BOOKS_DATA.filter((b) => {
      return (
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.categoryName.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.publisher.toLowerCase().includes(q)
      );
    });
  }, [query]);

  // Sort
  const sortedBooks = useMemo(() => {
    const list = [...results];
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
  }, [results, sort]);

  // Paginate
  const totalPages = Math.ceil(sortedBooks.length / ITEMS_PER_PAGE);
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedBooks.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedBooks, currentPage]);

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-6 space-y-6">
      <Breadcrumb
        items={[
          { label: "Tìm kiếm", href: "/tim-kiem" },
          { label: query ? `Kết quả cho "${query}"` : "Tra cứu" },
        ]}
      />

      {/* Search Header */}
      <div className="bg-surface p-6 rounded-xl border border-border shadow-e1 space-y-4">
        <div className="max-w-2xl">
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-content tracking-tight flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            <span>Kết quả tìm kiếm: &quot;{query}&quot;</span>
          </h1>
          <p className="text-xs text-content-muted mt-1">
            Tra cứu trong toàn bộ thư viện sách y học, bài giảng lâm sàng và tài liệu chuyên ngành
          </p>
        </div>

        <div className="max-w-2xl">
          <GlobalSearch
            variant="full"
            defaultValue={query}
            placeholder="Tìm kiếm theo tên sách, tác giả hoặc chuyên ngành..."
          />
        </div>
      </div>

      {/* Results Section */}
      {query.trim() === "" ? (
        <div className="p-8 text-center bg-surface rounded-xl border border-border">
          <p className="text-sm text-content-muted mb-4">
            Vui lòng nhập từ khóa tìm kiếm (tên sách, tác giả hoặc chuyên khoa) ở ô phía trên.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-content-muted">Gợi ý tìm kiếm phổ biến:</span>
            {[
              "Nội khoa",
              "Chẩn đoán hình ảnh",
              "Giải phẫu Netter",
              "Phác đồ điều trị",
              "Nhi khoa",
            ].map((tag) => (
              <Link
                key={tag}
                href={`/tim-kiem?q=${encodeURIComponent(tag)}`}
                className="px-2.5 py-1 rounded bg-surface-muted border border-border text-xs text-primary hover:underline font-medium"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      ) : sortedBooks.length > 0 ? (
        <div className="space-y-5">
          <SortControl
            currentSort={sort}
            onSortChange={setSort}
            totalResults={sortedBooks.length}
          />

          <CardGrid books={paginatedBooks} cols={4} />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <EmptyState
            variant="search"
            title={`Không tìm thấy tài liệu phù hợp với "${query}"`}
            description="Hãy thử kiểm tra lại chính tả từ khóa, sử dụng từ khóa ngắn gọn hơn hoặc chọn duyệt theo chuyên khoa y học."
            actionLabel="Xem toàn bộ kho sách"
            actionHref="/thu-vien-sach"
          />

          <div className="p-5 bg-surface rounded-xl border border-border">
            <h3 className="text-sm font-heading font-semibold text-content mb-3">
              Chuyên ngành gợi ý bạn có thể quan tâm:
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {CATEGORIES_TREE.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/danh-muc/${cat.slug}`}
                  className="p-2 rounded bg-surface-muted hover:bg-primary/10 hover:text-primary transition-colors text-xs font-medium text-content border border-border truncate"
                >
                  {cat.name} ({cat.count})
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1280px] mx-auto px-4 py-12 text-center text-sm text-content-muted">
          Đang tìm kiếm...
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
