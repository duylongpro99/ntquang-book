import { Layers } from "lucide-react";
import Link from "next/link";
import { CardGrid } from "@/src/components/book/CardGrid";
import { Pagination, SortSelect } from "@/src/components/book/CatalogControls";
import { EmptyState } from "@/src/components/book/EmptyState";
import { FilterSidebar, MobileFilterTrigger } from "@/src/components/book/FilterSidebar";
import { Breadcrumb, type BreadcrumbItem } from "@/src/components/global/Breadcrumb";
import { listBooks } from "@/src/lib/cms/books";
import { getCategoryBySlug, getCategoryTree } from "@/src/lib/cms/categories";

export const revalidate = 60;

const SORT_MAP = {
  "moi-nhat": "newest",
  "luot-tai": "downloads",
  "danh-gia": "rating",
  ten: "title",
} as const;

function titleFromSlugPart(part: string): string {
  return part
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { slug: slugArray } = await params;
  const sp = await searchParams;
  const fullSlug = slugArray.join("/");
  const sort = SORT_MAP[(sp["sap-xep"] ?? "moi-nhat") as keyof typeof SORT_MAP];

  const [tree, category, { books, pageCount }] = await Promise.all([
    getCategoryTree(),
    getCategoryBySlug(fullSlug),
    listBooks({
      category: fullSlug,
      language: sp["ngon-ngu"],
      format: sp["dinh-dang"],
      sort,
      page: Number(sp["trang"] ?? "1"),
    }),
  ]);

  const categoryName = category?.name ?? titleFromSlugPart(slugArray[slugArray.length - 1] ?? "");

  // Breadcrumbs: resolve each slug segment against the category tree.
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Thư viện sách", href: "/thu-vien-sach" },
    ...(await Promise.all(
      slugArray.map(async (part, index) => {
        const partPath = slugArray.slice(0, index + 1).join("/");
        const matched = await getCategoryBySlug(partPath);
        return {
          label: matched ? matched.name : part.replace(/-/g, " "),
          href: index < slugArray.length - 1 ? `/danh-muc/${partPath}` : undefined,
        };
      }),
    )),
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
            {categoryName}
          </h1>
          <p className="text-xs sm:text-sm text-content-muted mt-1">
            Tổng hợp giáo trình, tài liệu chuyên sâu và bài giảng lâm sàng ngành {categoryName}
          </p>
        </div>

        <MobileFilterTrigger categories={tree} label="Lọc trong mục này" />
      </div>

      {/* Subcategory pills if available */}
      {category?.children && category.children.length > 0 && (
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
          <FilterSidebar categories={tree} />
        </div>

        {/* Main Grid */}
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
              title={`Chưa có sách nào phù hợp trong danh mục ${categoryName}`}
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
