"use client";

import { FileText, ListOrdered, Star } from "lucide-react";
import { useState } from "react";
import { RatingStars } from "@/src/components/book/RatingStars";
import type { Book } from "@/src/lib/cms/types";

export interface TabGroupProps {
  book: Book;
  className?: string;
}

export function TabGroup({ book, className = "" }: TabGroupProps) {
  const [activeTab, setActiveTab] = useState<"desc" | "toc" | "reviews">("desc");

  return (
    <div
      className={`bg-surface rounded-xl border border-border shadow-e1 overflow-hidden ${className}`}
    >
      {/* Tabs Header */}
      <div className="flex border-b border-border bg-surface-muted/40 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("desc")}
          className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
            activeTab === "desc"
              ? "border-primary text-primary bg-surface"
              : "border-transparent text-content-muted hover:text-content"
          }`}
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span>Giới thiệu sách</span>
        </button>

        {book.tableOfContents && book.tableOfContents.length > 0 && (
          <button
            onClick={() => setActiveTab("toc")}
            className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === "toc"
                ? "border-primary text-primary bg-surface"
                : "border-transparent text-content-muted hover:text-content"
            }`}
          >
            <ListOrdered className="w-4 h-4 shrink-0" />
            <span>Mục lục ({book.tableOfContents.length})</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab("reviews")}
          className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
            activeTab === "reviews"
              ? "border-primary text-primary bg-surface"
              : "border-transparent text-content-muted hover:text-content"
          }`}
        >
          <Star className="w-4 h-4 shrink-0" />
          <span>Đánh giá ({book.ratingCount})</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-4 sm:p-6">
        {activeTab === "desc" && (
          <div className="prose max-w-none text-content text-sm leading-relaxed space-y-4">
            <p className="text-base text-content font-medium leading-normal">{book.description}</p>

            <div className="p-4 bg-surface-muted rounded-lg border border-border mt-4">
              <h4 className="text-xs font-bold text-content uppercase tracking-wider mb-2">
                Thông tin bản quyền & Lưu ý sử dụng
              </h4>
              <p className="text-xs text-content-muted leading-relaxed">
                Tài liệu <strong>{book.title}</strong> được biên soạn bởi {book.author}, xuất bản
                bởi {book.publisher}. Bản ebook phục vụ mục đích tự học tập, tham khảo nâng cao
                nghiệp vụ cho đội ngũ y bác sĩ và sinh viên ngành y khoa.
              </p>
            </div>
          </div>
        )}

        {activeTab === "toc" && book.tableOfContents && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-content mb-3">
              Mục lục các chương & chuyên đề lâm sàng
            </h4>
            <div className="space-y-2">
              {book.tableOfContents.map((chapter, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-md bg-surface-muted/50 border border-border/70 flex items-start gap-3 text-xs text-content"
                >
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-[11px]">
                    {idx + 1}
                  </span>
                  <span className="font-medium pt-0.5">{chapter}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-surface-muted rounded-lg border border-border">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-heading font-bold text-content">
                    {book.rating.toFixed(1)}
                  </span>
                  <span className="text-sm text-content-muted">/ 5.0</span>
                </div>
                <RatingStars rating={book.rating} count={book.ratingCount} size="md" />
                <p className="text-xs text-content-muted mt-1">
                  Dựa trên {book.ratingCount} đánh giá từ các bác sĩ và sinh viên y khoa
                </p>
              </div>

              <div className="text-xs text-content-muted space-y-1 sm:text-right">
                <div className="text-success font-semibold">100% tài liệu được kiểm duyệt</div>
                <div>Độ nét cao · Đầy đủ số trang</div>
              </div>
            </div>

            {/* Sample verified member reviews */}
            <div className="divide-y divide-border">
              <div className="py-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-content">
                      BS. Trần Minh Đức (BV Chợ Rẫy)
                    </span>
                    <span className="text-[10px] text-success bg-success/10 px-1.5 py-0.5 rounded font-medium">
                      Bác sĩ đã xác minh
                    </span>
                  </div>
                  <span className="text-[11px] text-content-muted">2 ngày trước</span>
                </div>
                <RatingStars rating={5} showCount={false} />
                <p className="text-xs text-content-muted leading-relaxed">
                  Bản quét PDF cực kỳ rõ nét, mục lục bookmark chuyển trang rất mượt mà. Nội dung
                  bám sát thực tiễn lâm sàng.
                </p>
              </div>

              <div className="py-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-content">
                      BSNT. Lê Thu Hà (ĐH Y Hà Nội)
                    </span>
                    <span className="text-[10px] text-success bg-success/10 px-1.5 py-0.5 rounded font-medium">
                      Thành viên thư viện
                    </span>
                  </div>
                  <span className="text-[11px] text-content-muted">1 tuần trước</span>
                </div>
                <RatingStars rating={5} showCount={false} />
                <p className="text-xs text-content-muted leading-relaxed">
                  Cảm ơn ban quản trị thư viện đã chia sẻ cuốn sách này. Tài liệu rất hữu ích cho
                  các kỳ thi chuyên khoa và thực hành lâm sàng.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
