import { ArrowRight, BookOpen, Download, HeartPulse, Library, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Breadcrumb } from "@/src/components/global/Breadcrumb";

export const metadata = {
  title: "Giới Thiệu & Điều Khoản Sử Dụng - Thư Viện Sách Y Học",
  description:
    "Tìm hiểu về dự án thư viện số hóa tài liệu y khoa, quy trình tải sách và tuyên bố miễn trừ trách nhiệm y khoa.",
};

export default function AboutPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 py-6 space-y-8">
      <Breadcrumb items={[{ label: "Giới thiệu & Hướng dẫn" }]} />

      <div className="max-w-3xl mx-auto space-y-8">
        <header className="space-y-3 pb-6 border-b border-border text-center">
          <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
            <Library className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-extrabold text-content tracking-tight">
            Về Thư Viện Sách Y Học Trực Tuyến
          </h1>
          <p className="text-xs sm:text-sm text-content-muted max-w-xl mx-auto leading-relaxed">
            Hệ sinh thái lưu trữ, bảo tồn và chia sẻ nguồn tài liệu y khoa chính thống phi thương
            mại dành cho nhân viên y tế tại Việt Nam.
          </p>
        </header>

        {/* Section 1: Sứ mệnh */}
        <section className="bg-surface p-6 sm:p-8 rounded-xl border border-border shadow-e1 space-y-4">
          <h2 className="text-lg font-heading font-bold text-content flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span>Sứ Mệnh Của Dự Án</span>
          </h2>
          <p className="text-xs sm:text-sm text-content-muted leading-relaxed">
            Sách và giáo trình y học thường có dung lượng lớn, giá thành cao và khó tìm kiếm tại các
            địa phương ngoài hai trung tâm đào tạo lớn là Hà Nội và TP. Hồ Chí Minh. Dự án{" "}
            <strong>Download Sách Y Học</strong> ra đời nhằm số hóa, chuẩn hóa mục lục và cung cấp
            quyền truy cập miễn phí cho tất cả bác sĩ, dược sĩ, điều dưỡng và sinh viên y khoa trên
            cả nước.
          </p>
          <div className="p-4 bg-surface-muted rounded-lg border border-border text-xs text-content-muted">
            <p className="font-semibold text-content mb-1">Quy tắc truy cập công bằng:</p>
            <p>
              Thư viện không phân chia cấp bậc thành viên (VIP/Kim Cương/Vàng). Chỉ cần một tài
              khoản đăng ký tiêu chuẩn bằng email cá nhân, bạn có thể tải về toàn bộ sách, giáo
              trình và slide bài giảng không giới hạn.
            </p>
          </div>
        </section>

        {/* Section 2: Hướng dẫn tải sách */}
        <section className="bg-surface p-6 sm:p-8 rounded-xl border border-border shadow-e1 space-y-5">
          <h2 className="text-lg font-heading font-bold text-content flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            <span>Quy Trình 3 Bước Tải Sách Ebook</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-surface-muted/60 rounded-lg border border-border space-y-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-contrast font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="font-semibold text-content">Tìm kiếm & Tra cứu</h3>
              <p className="text-content-muted leading-relaxed">
                Sử dụng thanh tìm kiếm hoặc menu chuyên khoa để chọn tài liệu bạn cần.
              </p>
            </div>

            <div className="p-4 bg-surface-muted/60 rounded-lg border border-border space-y-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-contrast font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="font-semibold text-content">Đăng nhập tài khoản</h3>
              <p className="text-content-muted leading-relaxed">
                Nhấn nút &quot;Tải sách&quot;. Nếu chưa đăng nhập, hệ thống sẽ mở bảng đăng ký nhanh
                trong 30 giây.
              </p>
            </div>

            <div className="p-4 bg-surface-muted/60 rounded-lg border border-border space-y-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-contrast font-bold text-xs flex items-center justify-center">
                3
              </span>
              <h3 className="font-semibold text-content">Lưu file về máy</h3>
              <p className="text-content-muted leading-relaxed">
                Tệp PDF / EPUB sẽ tự động tải về thiết bị và lưu vào lịch sử tài khoản của bạn để
                tải lại.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Tuyên bố miễn trừ y khoa */}
        <section className="bg-surface p-6 sm:p-8 rounded-xl border border-border shadow-e1 space-y-4">
          <h2 className="text-lg font-heading font-bold text-content flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-primary" />
            <span>Tuyên Bố Miễn Trừ Trách Nhiệm Y Khoa</span>
          </h2>
          <p className="text-xs sm:text-sm text-content-muted leading-relaxed">
            Kiến thức y học luôn thay đổi theo sự phát triển của nghiên cứu lâm sàng và các khuyến
            cáo cập nhật từ các hiệp hội y khoa chuyên ngành. Mặc dù các tài liệu trên thư viện được
            tuyển chọn kỹ lưỡng, người đọc là nhân viên y tế cần sử dụng óc phán đoán lâm sàng và
            đối chiếu với phác đồ hiện hành của Bộ Y Tế hoặc cơ sở điều trị nơi mình công tác trước
            khi áp dụng vào thực tế điều trị bệnh nhân.
          </p>
          <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg text-xs text-content space-y-1">
            <p className="font-bold text-accent-contrast">
              Khuyến cáo cho độc giả không phải nhân viên y tế:
            </p>
            <p className="text-content-muted text-[11px] leading-relaxed">
              Các tài liệu này không dành cho việc tự chẩn đoán hoặc tự ý dùng thuốc điều trị. Nếu
              gặp bất kỳ vấn đề sức khỏe nào, vui lòng đến khám trực tiếp tại bệnh viện hoặc cơ sở y
              tế gần nhất.
            </p>
          </div>
        </section>

        {/* Section 4: Bản quyền & Góp ý */}
        <section className="bg-surface p-6 sm:p-8 rounded-xl border border-border shadow-e1 space-y-4">
          <h2 className="text-lg font-heading font-bold text-content flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span>Chính Sách Bản Quyền & Trách Nhiệm Tác Quyền</span>
          </h2>
          <p className="text-xs sm:text-sm text-content-muted leading-relaxed">
            Chúng tôi luôn tôn trọng bản quyền sở hữu trí tuệ của các tác giả, dịch giả và nhà xuất
            bản y học. Nếu bạn là chủ sở hữu bản quyền của bất kỳ tài liệu nào và mong muốn gỡ bỏ
            hoặc điều chỉnh thông tin, xin vui lòng gửi thư cho ban quản trị qua trang liên hệ để
            được xử lý ngay lập tức.
          </p>
          <div className="pt-2">
            <Link
              href="/lien-he"
              className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
            >
              <span>Gửi phản ánh bản quyền hoặc liên hệ với chúng tôi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
