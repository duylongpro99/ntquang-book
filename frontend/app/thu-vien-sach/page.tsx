import { CardGrid } from "@/src/components/book/CardGrid";
import { Pagination, SortSelect } from "@/src/components/book/CatalogControls";
import { EmptyState } from "@/src/components/book/EmptyState";
import { FilterSidebar, MobileFilterTrigger } from "@/src/components/book/FilterSidebar";
import { Breadcrumb } from "@/src/components/global/Breadcrumb";
import { listBooks } from "@/src/lib/cms/books";
import { getCategoryTree } from "@/src/lib/cms/categories";

export const revalidate = 60;

const SORT_MAP = {
  "moi-nhat": "newest",
  "luot-tai": "downloads",
  "danh-gia": "rating",
  ten: "title",
} as const;

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const sort = SORT_MAP[(sp["sap-xep"] ?? "moi-nhat") as keyof typeof SORT_MAP];
  const category = sp["chuyen-khoa"];
  const language = sp["ngon-ngu"];
  const format = sp["dinh-dang"];

  const [tree, { books, pageCount }] = await Promise.all([
    getCategoryTree(),
    listBooks({
      category,
      language,
      format,
      sort,
      page: Number(sp.trang ?? "1"),
      pageSize: 8,
    }),
  ]);

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-6 space-y-6">
      <Breadcrumb items={[{ label: "Thư viện sách y học" }]} />

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

        <MobileFilterTrigger categories={tree} />
      </div>

      {/* List-Grid Layout: Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-1 sticky top-20">
          <FilterSidebar categories={tree} />
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-5">
          <div className="flex items-center justify-end">
            <SortSelect />
          </div>

          {books.length > 0 ? (
            <>
              <CardGrid books={books} cols={3} />
              <Pagination pageCount={pageCount} />
            </>
          ) : (
            <EmptyState
              variant="category"
              title="Không tìm thấy tài liệu phù hợp với bộ lọc"
              description="Hãy thử bỏ bớt các điều kiện lọc ngôn ngữ hoặc định dạng để hiển thị thêm tài liệu."
              actionLabel="Xóa toàn bộ bộ lọc"
              actionHref="/thu-vien-sach"
            />
          )}
        </div>
      </div>
    </div>
  );
}
