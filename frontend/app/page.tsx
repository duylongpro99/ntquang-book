import {
  ArrowRight,
  Award,
  BookOpen,
  Download,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";
import { Rail } from "@/src/components/book/Rail";
import { GlobalSearch } from "@/src/components/global/GlobalSearch";
import { listBooks } from "@/src/lib/cms/books";
import { getCategoryTree } from "@/src/lib/cms/categories";

export const revalidate = 60;

export default async function HomePage() {
  const [newRes, featuredRes, noiRes, ngoaiRes, canRes, categories] = await Promise.all([
    listBooks({ featuredOrNew: true, limit: 12 }),
    listBooks({ isFeatured: true, limit: 12 }),
    listBooks({ category: "noi-khoa", limit: 2 }),
    listBooks({ category: "ngoai-khoa", limit: 2 }),
    listBooks({ category: "can-lam-sang", limit: 2 }),
    getCategoryTree(),
  ]);
  const newBooks = newRes.books;
  const featuredBooks = featuredRes.books;
  const internalMedBooks = noiRes.books;
  const surgeryBooks = ngoaiRes.books;
  const paraclinicalBooks = canRes.books;
  const quickCategories = categories.slice(0, 7);

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section */}
      <section className="bg-linear-to-b from-primary/10 via-surface-muted to-bg py-10 md:py-14 border-b border-border">
        <div className="max-w-[1280px] mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kho thư viện số hóa hơn 2,000+ tài liệu y khoa chất lượng cao</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-extrabold text-content tracking-tight max-w-3xl mx-auto leading-tight">
            Thư Viện Sách Y Học Trực Tuyến Hàng Đầu Việt Nam
          </h1>

          <p className="text-sm md:text-base text-content-muted max-w-2xl mx-auto mt-3 mb-8 leading-relaxed">
            Tra cứu, tải trọn bộ giáo trình đại học y dược, ebook lâm sàng, phác đồ điều trị bệnh
            viện và tài liệu chuyên khoa định dạng PDF sắc nét.
          </p>

          {/* Centered Search in Hero */}
          <div className="max-w-xl mx-auto shadow-e2 rounded-lg bg-surface p-1.5 border border-border">
            <GlobalSearch
              variant="full"
              placeholder="Nhập tên giáo trình, tác giả hoặc chuyên ngành (vd: Netter, Harrison, ECG)..."
            />
          </div>

          {/* Quick Specialties Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6 max-w-3xl mx-auto">
            <span className="text-xs text-content-muted font-medium mr-1">Chuyên khoa nhanh:</span>
            {quickCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/danh-muc/${cat.slug}`}
                className="px-3 py-1 bg-surface rounded-full text-xs font-medium text-content border border-border hover:border-primary hover:text-primary transition-colors shadow-2xs"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Main Container with Curated Rails */}
      <div className="max-w-[1280px] mx-auto px-4 space-y-10">
        {/* Curated Rail 1: Sách mới cập nhật */}
        <Rail
          title="Sách Y Học Mới Cập Nhật"
          subtitle="Các ấn bản giáo trình, phác đồ điều trị mới phát hành năm 2023 - 2024"
          books={newBooks}
          viewAllHref="/thu-vien-sach"
        />

        {/* Feature Highlights Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-surface rounded-xl border border-border shadow-e1">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-content">Đầy Đủ Chuyên Ngành</h3>
              <p className="text-xs text-content-muted mt-0.5 leading-relaxed">
                79 danh mục chuyên khoa từ Nội, Ngoại, Sản, Nhi đến Cận lâm sàng & Y học cơ sở.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-content">Tải Về Không Giới Hạn</h3>
              <p className="text-xs text-content-muted mt-0.5 leading-relaxed">
                Mọi thành viên đăng ký đều tải được toàn bộ tài liệu, không phân chia hạng thành
                viên.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-content">Định Dạng Chuẩn Sắc Nét</h3>
              <p className="text-xs text-content-muted mt-0.5 leading-relaxed">
                File PDF / EPUB scan chất lượng cao, có mục lục số bookmark dễ dàng tra cứu nhanh.
              </p>
            </div>
          </div>
        </div>

        {/* Curated Rail 2: Sách xem nhiều nhất / Kinh điển */}
        <Rail
          title="Tài Liệu Y Khoa Kinh Điển Xem Nhiều Nhất"
          subtitle="Những cuốn sách gối đầu giường không thể thiếu của các thế hệ bác sĩ"
          books={featuredBooks}
          viewAllHref="/thu-vien-sach"
        />

        {/* Category Rails: Nội Khoa & Cận Lâm Sàng */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
          <section className="bg-surface p-5 rounded-xl border border-border shadow-e1">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
              <div className="flex items-center gap-2 font-heading font-bold text-base text-content">
                <Stethoscope className="w-5 h-5 text-primary" />
                <span>Chuyên Khoa Nội</span>
              </div>
              <Link
                href="/danh-muc/noi-khoa"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Xem tất cả →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {internalMedBooks.slice(0, 2).map((book) => (
                <div key={book.id}>
                  <Link
                    href={`/sach/${book.slug}`}
                    className="group block bg-surface-muted/60 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="aspect-3/4 rounded overflow-hidden mb-2 bg-surface">
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <span className="text-[11px] text-primary font-medium block">
                      {book.categoryName}
                    </span>
                    <h4 className="text-xs font-semibold text-content line-clamp-2 mt-0.5 group-hover:text-primary">
                      {book.title}
                    </h4>
                    <p className="text-[11px] text-content-muted mt-1 truncate">{book.author}</p>
                  </Link>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-surface p-5 rounded-xl border border-border shadow-e1">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
              <div className="flex items-center gap-2 font-heading font-bold text-base text-content">
                <Award className="w-5 h-5 text-primary" />
                <span>Cận Lâm Sàng & Chẩn Đoán Hình Ảnh</span>
              </div>
              <Link
                href="/danh-muc/can-lam-sang"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Xem tất cả →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {paraclinicalBooks.slice(0, 2).map((book) => (
                <div key={book.id}>
                  <Link
                    href={`/sach/${book.slug}`}
                    className="group block bg-surface-muted/60 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="aspect-3/4 rounded overflow-hidden mb-2 bg-surface">
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <span className="text-[11px] text-primary font-medium block">
                      {book.categoryName}
                    </span>
                    <h4 className="text-xs font-semibold text-content line-clamp-2 mt-0.5 group-hover:text-primary">
                      {book.title}
                    </h4>
                    <p className="text-[11px] text-content-muted mt-1 truncate">{book.author}</p>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Curated Rail 3: Ngoại khoa & Chấn thương chỉnh hình */}
        <Rail
          title="Giáo Trình Ngoại Khoa & Phẫu Thuật Thực Hành"
          subtitle="Tài liệu chuyên khoa phẫu thuật tổng quát, lồng ngực, chấn thương chỉnh hình"
          books={surgeryBooks}
          viewAllHref="/danh-muc/ngoai-khoa"
        />

        {/* CTA Banner to Explore Full Catalog */}
        <section className="p-8 rounded-xl bg-linear-to-r from-primary to-primary-hover text-primary-contrast flex flex-col md:flex-row items-center justify-between gap-6 shadow-e2">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-xl md:text-2xl font-heading font-bold">
              Bạn Cần Tìm Giáo Trình Hoặc Ebook Chuyên Khoa Cụ Thể?
            </h2>
            <p className="text-xs md:text-sm text-primary-contrast/90 max-w-xl">
              Hơn 79 chuyên khoa y học đã được phân loại chi tiết theo hệ thống mã môn học chuẩn y
              tế. Hãy khám phá ngay kho sách đầy đủ.
            </p>
          </div>
          <Link
            href="/thu-vien-sach"
            className="px-5 py-3 rounded-lg bg-surface text-primary font-bold text-sm hover:bg-surface-muted transition-colors shadow-md shrink-0 inline-flex items-center gap-2"
          >
            <span>Duyệt toàn bộ thư viện</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
