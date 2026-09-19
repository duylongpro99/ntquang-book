"use client";

import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const SORT_OPTIONS = [
  { value: "moi-nhat", label: "Mới nhất" },
  { value: "luot-tai", label: "Lượt tải" },
  { value: "danh-gia", label: "Đánh giá" },
  { value: "ten", label: "Tên A–Z" },
];

export function useParamNav() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const setParam = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v == null || v === "") next.delete(k);
      else next.set(k, v);
    }
    startTransition(() => router.push(`${pathname}?${next.toString()}`, { scroll: false }));
  };
  return { params, setParam, pending };
}

export function SortSelect() {
  const { params, setParam } = useParamNav();
  const current = params.get("sap-xep") ?? "moi-nhat";
  return (
    <div className="flex items-center gap-2 ml-auto sm:ml-auto">
      <label
        htmlFor="sort-select"
        className="text-content-muted flex items-center gap-1.5 whitespace-nowrap text-xs"
      >
        <ArrowUpDown className="w-3.5 h-3.5 text-content-muted shrink-0" />
        <span className="hidden xs:inline">Sắp xếp:</span>
      </label>
      <select
        id="sort-select"
        value={current}
        onChange={(e) => setParam({ "sap-xep": e.target.value, trang: null })}
        className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus font-medium max-w-[190px] truncate"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Pagination({ pageCount }: { pageCount: number }) {
  const { params, setParam } = useParamNav();
  const page = Number(params.get("trang") ?? "1");
  if (pageCount <= 1) return null;
  return (
    <nav
      aria-label="Phân trang"
      className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 pt-6"
    >
      <button
        type="button"
        onClick={() => setParam({ trang: page - 1 <= 1 ? null : String(page - 1) })}
        disabled={page <= 1}
        aria-label="Trang trước"
        className="p-1.5 sm:p-2 rounded-lg border border-border bg-surface text-content hover:bg-surface-muted disabled:opacity-40 disabled:pointer-events-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => {
        const isCurrent = p === page;
        return (
          <button
            key={p}
            type="button"
            aria-current={isCurrent ? "page" : undefined}
            disabled={isCurrent}
            onClick={() => setParam({ trang: p === 1 ? null : String(p) })}
            className={`min-w-[32px] sm:min-w-[36px] h-8 sm:h-9 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus cursor-pointer disabled:pointer-events-none ${
              isCurrent
                ? "bg-primary text-primary-contrast shadow-e1"
                : "bg-surface border border-border text-content hover:bg-surface-muted"
            }`}
          >
            {p}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => setParam({ trang: String(page + 1) })}
        disabled={page >= pageCount}
        aria-label="Trang kế tiếp"
        className="p-1.5 sm:p-2 rounded-lg border border-border bg-surface text-content hover:bg-surface-muted disabled:opacity-40 disabled:pointer-events-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}
