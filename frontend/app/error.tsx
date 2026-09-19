"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { useEffect } from "react";

/**
 * Route-segment error boundary. Catches errors thrown while rendering any page
 * (most importantly a failed CMS fetch) and shows a recoverable fallback
 * instead of an unhandled 500.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-5">
      <div className="w-16 h-16 rounded-2xl bg-danger/10 text-danger flex items-center justify-center mx-auto">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-heading font-extrabold text-content">Đã có lỗi xảy ra</h1>
      <p className="text-sm text-content-muted leading-relaxed">
        Không thể tải nội dung lúc này. Vui lòng thử lại sau ít phút.
      </p>
      <div className="pt-2">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-contrast font-semibold text-sm hover:bg-primary-hover transition-colors shadow-e1"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Thử lại</span>
        </button>
      </div>
    </div>
  );
}
