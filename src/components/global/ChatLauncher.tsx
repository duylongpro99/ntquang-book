"use client";

import React, { useState } from "react";
import { MessageCircleQuestion, X, Send } from "lucide-react";

export function ChatLauncher() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSent(true);
    setTimeout(() => {
      setMessage("");
      setSent(false);
      setIsOpen(false);
    }, 2000);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-surface rounded-xl border border-border shadow-e3 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="bg-primary p-3.5 text-primary-contrast flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircleQuestion className="w-5 h-5" />
              <div>
                <h4 className="text-sm font-semibold">Hỗ trợ tìm kiếm tài liệu</h4>
                <p className="text-[11px] opacity-90">Ban thư viện y học trực tuyến</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Đóng hỗ trợ"
              className="p-1 hover:bg-primary-hover rounded text-primary-contrast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3.5">
            {sent ? (
              <div className="py-4 text-center text-sm text-success font-medium">
                Cảm ơn bạn! Yêu cầu tài liệu đã được gửi đến ban quản trị thư viện.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-2.5">
                <p className="text-xs text-content-muted leading-relaxed">
                  Bạn không tìm thấy ebook, giáo trình hay tài liệu bài giảng y khoa cần thiết? Hãy gửi tên sách để chúng tôi cập nhật bổ sung sớm nhất.
                </p>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Nhập tên sách, tác giả hoặc chuyên ngành y khoa..."
                  rows={3}
                  className="w-full rounded-md border border-border bg-surface p-2 text-xs text-content placeholder:text-content-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus resize-none"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-primary hover:bg-primary-hover text-primary-contrast text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi yêu cầu tài liệu</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Hỗ trợ tìm kiếm sách y học"
        aria-expanded={isOpen}
        className="flex items-center gap-2 px-3.5 py-2.5 bg-primary hover:bg-primary-hover text-primary-contrast rounded-full shadow-e2 font-medium text-xs md:text-sm transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <MessageCircleQuestion className="w-4 h-4" />
        <span className="hidden sm:inline">Yêu cầu sách & Hỗ trợ</span>
      </button>
    </div>
  );
}
