import React from "react";
import Link from "next/link";
import { SearchX, FolderX, FileQuestion, ArrowLeft } from "lucide-react";
import { Button } from "@/src/components/ui/Button";

export interface EmptyStateProps {
  variant?: "search" | "category" | "downloads" | "generic";
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onActionClick?: () => void;
  className?: string;
}

export function EmptyState({
  variant = "generic",
  title,
  description,
  actionLabel = "Khám phá toàn bộ thư viện",
  actionHref = "/thu-vien-sach",
  onActionClick,
  className = "",
}: EmptyStateProps) {
  const getIcon = () => {
    switch (variant) {
      case "search":
        return <SearchX className="w-10 h-10 text-content-muted" />;
      case "category":
        return <FolderX className="w-10 h-10 text-content-muted" />;
      case "downloads":
        return <FileQuestion className="w-10 h-10 text-content-muted" />;
      default:
        return <FileQuestion className="w-10 h-10 text-content-muted" />;
    }
  };

  const getDefaultTitle = () => {
    switch (variant) {
      case "search":
        return "Không tìm thấy tài liệu phù hợp";
      case "category":
        return "Chưa có tài liệu trong chuyên khoa này";
      case "downloads":
        return "Thư viện tải xuống của bạn đang trống";
      default:
        return "Chưa có dữ liệu";
    }
  };

  const getDefaultDescription = () => {
    switch (variant) {
      case "search":
        return "Hãy thử kiểm tra lại chính tả từ khóa, tìm kiếm theo tên tác giả hoặc chọn chuyên khoa y học từ danh mục.";
      case "category":
        return "Các tài liệu chuyên ngành đang được ban quản trị thư viện cập nhật thêm. Bạn có thể tham khảo các chuyên khoa liên quan.";
      case "downloads":
        return "Bạn chưa tải cuốn sách nào. Hãy duyệt qua kho tài liệu và nhấn 'Tải sách' để lưu vào thư viện cá nhân của bạn.";
      default:
        return "Vui lòng quay lại danh mục chính để tiếp tục tra cứu.";
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 md:p-12 text-center bg-surface rounded-xl border border-border ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center mb-4">
        {getIcon()}
      </div>

      <h3 className="text-lg font-heading font-semibold text-content mb-1.5">
        {title || getDefaultTitle()}
      </h3>

      <p className="text-sm text-content-muted max-w-md mb-6 leading-relaxed">
        {description || getDefaultDescription()}
      </p>

      {onActionClick ? (
        <Button variant="primary" size="md" onClick={onActionClick}>
          {actionLabel}
        </Button>
      ) : actionHref ? (
        <Button variant="primary" size="md" href={actionHref}>
          <ArrowLeft className="w-4 h-4" />
          <span>{actionLabel}</span>
        </Button>
      ) : null}
    </div>
  );
}
