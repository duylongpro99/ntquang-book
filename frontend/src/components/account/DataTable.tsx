"use client";

import { CheckCircle2, Download, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/src/components/book/EmptyState";
import { type DownloadRecord, useAuth } from "@/src/context/AuthContext";
import { BOOKS_DATA } from "@/src/data/books";

export interface DataTableProps {
  downloads: DownloadRecord[];
  className?: string;
}

export function DataTable({ downloads, className = "" }: DataTableProps) {
  const { triggerDownload } = useAuth();
  const [reDownloadingId, setReDownloadingId] = useState<string | null>(null);

  const handleReDownload = async (record: DownloadRecord) => {
    setReDownloadingId(record.id);
    const book = BOOKS_DATA.find((b) => b.id === record.bookId);
    if (book) {
      await triggerDownload(book);
    }
    setTimeout(() => {
      setReDownloadingId(null);
    }, 1000);
  };

  if (downloads.length === 0) {
    return (
      <EmptyState
        variant="downloads"
        title="Bạn chưa tải cuốn sách nào"
        description="Toàn bộ ebook giáo trình và bài giảng bạn đã tải sẽ xuất hiện tại đây để bạn có thể tải lại bất kỳ lúc nào."
        actionLabel="Khám phá kho sách ngay"
        actionHref="/thu-vien-sach"
      />
    );
  }

  return (
    <div
      className={`bg-surface rounded-xl border border-border shadow-e1 overflow-hidden ${className}`}
    >
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-base font-heading font-semibold text-content">
            Lịch sử sách & tài liệu đã tải
          </h3>
          <p className="text-xs text-content-muted mt-0.5">
            Tổng cộng: {downloads.length} cuốn sách
          </p>
        </div>
      </div>

      {/* Mobile Card List (< sm) */}
      <div className="block sm:hidden divide-y divide-border">
        {downloads.map((record) => (
          <div key={record.id} className="p-4 space-y-3">
            <div className="flex gap-3 items-start">
              <div className="w-14 h-20 bg-surface-muted rounded-md overflow-hidden shrink-0 border border-border shadow-xs">
                <img
                  src={record.bookCover}
                  alt={record.bookTitle}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/sach/${record.bookSlug}`}
                  className="font-semibold text-content text-sm hover:text-primary line-clamp-2 leading-snug"
                >
                  {record.bookTitle}
                </Link>
                <p className="text-xs text-content-muted mt-1 truncate">{record.author}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] border border-primary/20">
                    {record.format}
                  </span>
                  <span className="text-[11px] text-content-muted">{record.fileSize}</span>
                  <span className="text-[11px] text-content-muted/80">· {record.downloadedAt}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => handleReDownload(record)}
                disabled={reDownloadingId === record.id}
                className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary-hover text-primary-contrast font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
              >
                {reDownloadingId === record.id ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Đang tải...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Tải lại về máy</span>
                  </>
                )}
              </button>
              <Link
                href={`/sach/${record.bookSlug}`}
                className="px-3 py-2 rounded-lg border border-border bg-surface text-content hover:bg-surface-muted text-xs font-medium flex items-center gap-1"
                aria-label={`Xem chi tiết ${record.bookTitle}`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop/Tablet Table (>= sm) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-xs text-content">
          <thead className="bg-surface-muted/60 text-content-muted border-b border-border uppercase text-[10px] tracking-wider font-semibold">
            <tr>
              <th scope="col" className="px-4 py-3">
                Tài liệu / Ebook
              </th>
              <th scope="col" className="px-4 py-3">
                Tác giả
              </th>
              <th scope="col" className="px-4 py-3">
                Định dạng
              </th>
              <th scope="col" className="px-4 py-3">
                Dung lượng
              </th>
              <th scope="col" className="px-4 py-3">
                Thời gian tải
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {downloads.map((record) => (
              <tr key={record.id} className="hover:bg-surface-muted/40 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-14 bg-surface-muted rounded overflow-hidden shrink-0 border border-border">
                      <img
                        src={record.bookCover}
                        alt={record.bookTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <Link
                        href={`/sach/${record.bookSlug}`}
                        className="font-semibold text-content hover:text-primary line-clamp-1 max-w-[280px]"
                      >
                        {record.bookTitle}
                      </Link>
                      <Link
                        href={`/sach/${record.bookSlug}`}
                        className="text-[11px] text-primary hover:underline inline-flex items-center gap-0.5 mt-0.5"
                      >
                        <span>Trang chi tiết</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-content-muted max-w-[160px] truncate">
                  {record.author}
                </td>
                <td className="px-4 py-3">
                  <span className="font-semibold px-2 py-0.5 bg-surface-muted rounded text-[10px] border border-border">
                    {record.format}
                  </span>
                </td>
                <td className="px-4 py-3 text-content-muted font-medium">{record.fileSize}</td>
                <td className="px-4 py-3 text-content-muted">{record.downloadedAt}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleReDownload(record)}
                    disabled={reDownloadingId === record.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {reDownloadingId === record.id ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                        <span>Đang tải...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Tải lại</span>
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
