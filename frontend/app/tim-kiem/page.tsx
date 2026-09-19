import { Search } from "lucide-react";
import Link from "next/link";
import { CardGrid } from "@/src/components/book/CardGrid";
import { Pagination, SortSelect } from "@/src/components/book/CatalogControls";
import { EmptyState } from "@/src/components/book/EmptyState";
import { Breadcrumb } from "@/src/components/global/Breadcrumb";
import { GlobalSearch } from "@/src/components/global/GlobalSearch";
import { searchBooks } from "@/src/lib/cms/books";
import { getCategoryTree } from "@/src/lib/cms/categories";

export const revalidate = 60;

const SORT_MAP = {
  "moi-nhat": "newest",
  "luot-tai": "downloads",
  "danh-gia": "rating",
  ten: "title",
} as const;

const SUGGESTED_TAGS = [
  "Nội khoa",
  "Chẩn đoán hình ảnh",
  "Giải phẫu Netter",
  "Phác đồ điều trị",
  "Nhi khoa",
];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const query = sp.q ?? "";
  const sort = SORT_MAP[(sp["sap-xep"] ?? "moi-nhat") as keyof typeof SORT_MAP];

  const [{ books, pageCount }, categories] = await Promise.all([
    query.trim()
      ? searchBooks({ query, sort, page: Number(sp.trang ?? "1") })
      : Promise.resolve({ books: [], total: 0, pageCount: 0 }),
    getCategoryTree(),
  ]);

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
            {SUGGESTED_TAGS.map((tag) => (
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
      ) : books.length > 0 ? (
        <div className="space-y-5">
          <div className="flex items-center justify-end">
            <SortSelect />
          </div>

          <CardGrid books={books} cols={4} />

          <Pagination pageCount={pageCount} />
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
              {categories.map((cat) => (
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
