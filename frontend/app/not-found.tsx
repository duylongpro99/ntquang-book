import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-5">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
        <BookOpen className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-heading font-extrabold text-content">
        404 - Không tìm thấy trang
      </h1>
      <p className="text-sm text-content-muted leading-relaxed">
        Trang hoặc tài liệu y khoa bạn đang tìm kiếm không tồn tại hoặc đã được chuyển sang địa chỉ
        mới.
      </p>
      <div className="pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-contrast font-semibold text-sm hover:bg-primary-hover transition-colors shadow-e1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ</span>
        </Link>
      </div>
    </div>
  );
}
