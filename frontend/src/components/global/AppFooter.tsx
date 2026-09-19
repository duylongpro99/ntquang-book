import { HeartPulse, Library, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { getCategoryTree } from "@/src/lib/cms/categories";

export async function AppFooter() {
  const categories = await getCategoryTree();
  return (
    <footer className="bg-surface border-t border-border mt-16 text-content">
      <div className="max-w-[1280px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Purpose */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-contrast shadow-e1">
                <Library className="w-4 h-4" />
              </div>
              <div>
                <span className="font-heading font-bold text-base text-content">
                  DOWNLOAD SÁCH Y HỌC
                </span>
                <span className="block text-[10px] text-primary font-medium">
                  Thư viện y học online số 1 Việt Nam
                </span>
              </div>
            </Link>
            <p className="text-xs text-content-muted leading-relaxed">
              Kho tài liệu giáo trình, ebook y khoa và bài giảng chuyên ngành chất lượng cao dành
              cho bác sĩ nội trú, sinh viên y dược và nhân viên y tế học tập, nghiên cứu.
            </p>
            <div className="flex items-center gap-2 text-xs text-success font-medium">
              <ShieldCheck className="w-4 h-4 text-success" />
              <span>Toàn bộ tài liệu mở cho thành viên đăng ký</span>
            </div>
          </div>

          {/* Quick Specialties Links */}
          <div>
            <h4 className="text-xs font-semibold text-content uppercase tracking-wider mb-3">
              Chuyên khoa nổi bật
            </h4>
            <ul className="space-y-2 text-xs text-content-muted">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/danh-muc/${cat.slug}`}
                    className="hover:text-primary transition-colors flex items-center justify-between"
                  >
                    <span>{cat.name}</span>
                    <span className="text-[11px] text-content-muted/60">{cat.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help & Policies */}
          <div>
            <h4 className="text-xs font-semibold text-content uppercase tracking-wider mb-3">
              Hỗ trợ & Hướng dẫn
            </h4>
            <ul className="space-y-2 text-xs text-content-muted">
              <li>
                <Link href="/thu-vien-sach" className="hover:text-primary transition-colors">
                  Kho sách trực tuyến
                </Link>
              </li>
              <li>
                <Link href="/gioi-thieu" className="hover:text-primary transition-colors">
                  Hướng dẫn tải sách ebook
                </Link>
              </li>
              <li>
                <Link href="/tin-tuc" className="hover:text-primary transition-colors">
                  Tin tức & Kiến thức y khoa
                </Link>
              </li>
              <li>
                <Link href="/lien-he" className="hover:text-primary transition-colors">
                  Gửi yêu cầu tài liệu / Báo lỗi file
                </Link>
              </li>
              <li>
                <Link href="/gioi-thieu" className="hover:text-primary transition-colors">
                  Điều khoản sử dụng & Bản quyền
                </Link>
              </li>
            </ul>
          </div>

          {/* Medical disclaimer notice */}
          <div className="p-4 bg-surface-muted rounded-lg border border-border space-y-2 text-xs">
            <div className="flex items-center gap-2 font-semibold text-content text-xs">
              <HeartPulse className="w-4 h-4 text-primary" />
              <span>Tuyên bố miễn trừ y khoa</span>
            </div>
            <p className="text-content-muted text-[11px] leading-relaxed">
              Các tài liệu, ebook và bài giảng được lưu trữ trên thư viện chỉ nhằm mục đích nghiên
              cứu học thuật và nâng cao kiến thức y khoa chuyên môn. Không thay thế cho tư vấn, chẩn
              đoán hay điều trị y khoa trực tiếp từ cơ sở y tế có thẩm quyền.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-content-muted">
          <p>© {new Date().getFullYear()} Thư viện Sách Y Học Online. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Định dạng: PDF / EPUB chất lượng cao</span>
            <span>•</span>
            <span>Truy cập trực tuyến 24/7</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
