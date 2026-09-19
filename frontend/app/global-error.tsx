"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary for errors thrown in the root layout itself (where the
 * normal error.tsx can't render). Must provide its own <html>/<body>. Styles
 * are inline so it works even if the app shell/CSS failed to load.
 */
export default function GlobalError({
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
    <html lang="vi">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#f8fafc",
          color: "#0f172a",
        }}
      >
        <div style={{ maxWidth: 480, padding: "2rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 0.75rem" }}>
            Đã có lỗi xảy ra
          </h1>
          <p
            style={{ fontSize: "0.9rem", color: "#475569", lineHeight: 1.6, margin: "0 0 1.5rem" }}
          >
            Không thể tải trang lúc này. Vui lòng thử lại sau ít phút.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "0.65rem 1.25rem",
              borderRadius: 8,
              border: "none",
              background: "#0f766e",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Thử lại
          </button>
        </div>
      </body>
    </html>
  );
}
