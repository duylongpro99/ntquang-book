"use client";

import React, { useState } from "react";
import { Book } from "@/src/data/books";
import { useAuth } from "@/src/context/AuthContext";
import { Button } from "@/src/components/ui/Button";
import { Download, CheckCircle2, ShieldCheck, Lock } from "lucide-react";

export interface PrimaryCTAProps {
  book: Book;
  className?: string;
  isStickyMobile?: boolean;
}

export function PrimaryCTA({
  book,
  className = "",
  isStickyMobile = false,
}: PrimaryCTAProps) {
  const { isAuthenticated, triggerDownload } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownloadClick = async () => {
    setDownloading(true);
    try {
      const success = await triggerDownload(book);
      if (success) {
        setDownloaded(true);
        setTimeout(() => setDownloaded(false), 5000);
      }
    } finally {
      setDownloading(false);
    }
  };

  if (isStickyMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-surface/95 backdrop-blur-md border-t border-border shadow-e3 z-30 md:hidden flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-content truncate">{book.title}</p>
          <span className="text-[11px] text-content-muted">
            {book.format} · {book.fileSize}
          </span>
        </div>
        <Button
          variant="primary"
          size="md"
          loading={downloading}
          onClick={handleDownloadClick}
          className="shrink-0"
        >
          {downloaded ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Đã tải xong</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Tải sách</span>
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="p-5 bg-surface rounded-xl border border-primary/30 shadow-e2 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider block">
              Tài liệu mở cho thành viên
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-heading font-bold text-content">
                Miễn phí tải về
              </span>
              <span className="text-xs text-content-muted">
                (Định dạng gốc {book.format})
              </span>
            </div>
          </div>
          <div className="text-right text-xs text-content-muted">
            <span className="block font-semibold text-content">{book.fileSize}</span>
            <span>PDF quét độ phân giải cao</span>
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          loading={downloading}
          onClick={handleDownloadClick}
          className="w-full justify-center shadow-md py-3 text-base"
        >
          {downloaded ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>Đã khởi động tải xuống thành công</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>{isAuthenticated ? "Tải sách về máy ngay" : "Đăng nhập để tải sách"}</span>
            </>
          )}
        </Button>

        <div className="flex items-center justify-between text-[11px] text-content-muted pt-2 border-t border-border/80">
          <div className="flex items-center gap-1.5 text-success">
            <ShieldCheck className="w-4 h-4" />
            <span>Tệp sạch, không chứa quảng cáo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 text-content-muted" />
            <span>{book.downloadCount.toLocaleString()} lượt tải</span>
          </div>
        </div>
      </div>
    </div>
  );
}
