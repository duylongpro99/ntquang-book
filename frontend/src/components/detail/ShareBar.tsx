"use client";

import { Check, Copy, Send, Share2 } from "lucide-react";
import { useState } from "react";

export interface ShareBarProps {
  title: string;
  url?: string;
  className?: string;
}

export function ShareBar({ title, className = "" }: ShareBarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className={`flex items-center gap-2 text-xs text-content-muted ${className}`}>
      <span className="flex items-center gap-1.5 font-medium text-content">
        <Share2 className="w-3.5 h-3.5 text-primary" />
        <span>Chia sẻ tài liệu:</span>
      </span>

      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-border bg-surface hover:bg-surface-muted transition-colors text-content cursor-pointer"
        aria-label="Sao chép liên kết"
      >
        {copied ? (
          <>
            <Check className="w-3 h-3 text-success" />
            <span className="text-success font-medium">Đã chép link</span>
          </>
        ) : (
          <>
            <Copy className="w-3 h-3" />
            <span>Sao chép link</span>
          </>
        )}
      </button>

      {/* Facebook Share Button */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          typeof window !== "undefined" ? window.location.href : "",
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 rounded border border-border bg-surface hover:bg-surface-muted text-content transition-colors"
        aria-label="Chia sẻ qua Facebook"
      >
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </a>

      {/* Telegram Share Button */}
      <a
        href={`https://t.me/share/url?url=${encodeURIComponent(
          typeof window !== "undefined" ? window.location.href : "",
        )}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 rounded border border-border bg-surface hover:bg-surface-muted text-content transition-colors"
        aria-label="Chia sẻ qua Telegram"
      >
        <Send className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}
