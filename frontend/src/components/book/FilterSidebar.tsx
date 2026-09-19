"use client";

import { ChevronDown, ChevronRight, Filter, RotateCcw, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useParamNav } from "@/src/components/book/CatalogControls";
import { Button } from "@/src/components/ui/Button";
import type { CategoryItem } from "@/src/lib/cms/types";

export interface FilterSidebarProps {
  categories: CategoryItem[];
  className?: string;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

const LANGUAGES = ["Tiếng Việt", "English", "Song ngữ"];
const FORMATS = ["PDF", "EPUB"];

export function FilterSidebar({
  categories,
  className = "",
  isMobileDrawer = false,
  onCloseMobileDrawer,
}: FilterSidebarProps) {
  const { params, setParam } = useParamNav();
  const category = params.get("chuyen-khoa") ?? undefined;
  const language = params.get("ngon-ngu") ?? undefined;
  const format = params.get("dinh-dang") ?? undefined;

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "noi-khoa": true,
    "ngoai-khoa": false,
  });

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileDrawer) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileDrawer]);

  const toggleCategory = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleLanguageToggle = (lang: string) => {
    setParam({ "ngon-ngu": language === lang ? null : lang, trang: null });
  };

  const handleFormatToggle = (fmt: string) => {
    setParam({ "dinh-dang": format === fmt ? null : fmt, trang: null });
  };

  const handleCategorySelect = (catSlug: string) => {
    setParam({ "chuyen-khoa": category === catSlug ? null : catSlug, trang: null });
  };

  const clearAllFilters = () => {
    setParam({ "chuyen-khoa": null, "ngon-ngu": null, "dinh-dang": null, trang: null });
  };

  const activeFiltersCount = [category, language, format].filter(Boolean).length;

  const hasActiveFilters = activeFiltersCount > 0;

  const filterControls = (
    <div className="space-y-6">
      {/* Header & Reset (Desktop only; Mobile has its own header) */}
      {!isMobileDrawer && (
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2 font-heading font-semibold text-content text-sm">
            <Filter className="w-4 h-4 text-primary" />
            <span>Bộ lọc tài liệu</span>
            {hasActiveFilters && (
              <span className="w-5 h-5 rounded-full bg-primary text-primary-contrast text-[11px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-primary hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Đặt lại</span>
            </button>
          )}
        </div>
      )}

      {/* Applied Filters Tags */}
      {hasActiveFilters && (
        <div className="space-y-2 pb-3 border-b border-border">
          <div className="flex items-center justify-between text-xs text-content-muted">
            <span className="font-medium">Đang áp dụng:</span>
            {isMobileDrawer && (
              <button
                onClick={clearAllFilters}
                className="text-primary hover:underline font-semibold text-xs flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Xóa tất cả</span>
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {category && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium border border-primary/20">
                <span className="max-w-[150px] truncate">{category}</span>
                <button
                  onClick={() => setParam({ "chuyen-khoa": null, trang: null })}
                  aria-label="Xóa chuyên khoa"
                  className="hover:text-primary-hover p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {language && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium border border-primary/20">
                <span>{language}</span>
                <button
                  onClick={() => setParam({ "ngon-ngu": null, trang: null })}
                  aria-label="Xóa ngôn ngữ"
                  className="hover:text-primary-hover p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {format && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium border border-primary/20">
                <span>{format}</span>
                <button
                  onClick={() => setParam({ "dinh-dang": null, trang: null })}
                  aria-label="Xóa định dạng"
                  className="hover:text-primary-hover p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Specialty Category Facet */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-xs font-semibold text-content uppercase tracking-wider">
            Chuyên khoa y tế
          </h4>
          {category && (
            <button
              onClick={() => setParam({ "chuyen-khoa": null, trang: null })}
              className="text-[11px] text-content-muted hover:text-primary"
            >
              Bỏ chọn
            </button>
          )}
        </div>

        <div
          className={`${isMobileDrawer ? "space-y-1" : "space-y-1 max-h-80 overflow-y-auto pr-1"} text-xs`}
        >
          {categories.map((cat) => {
            const isSelected = category === cat.slug;
            const isExpanded = expandedCategories[cat.id];
            const hasSub = cat.children && cat.children.length > 0;

            return (
              <div key={cat.id} className="space-y-0.5">
                <div
                  className={`flex items-center justify-between rounded-lg transition-colors min-h-[38px] px-2 ${
                    isSelected
                      ? "bg-primary/10 text-primary font-semibold"
                      : "hover:bg-surface-muted text-content"
                  }`}
                >
                  <button
                    onClick={() => handleCategorySelect(cat.slug)}
                    className="flex-1 text-left line-clamp-1 py-1.5 transition-colors cursor-pointer"
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] text-content-muted ml-1.5 font-normal">
                      ({cat.count})
                    </span>
                  </button>

                  {hasSub && (
                    <button
                      onClick={(e) => toggleCategory(cat.id, e)}
                      className="p-1.5 text-content-muted hover:text-primary rounded-md transition-colors cursor-pointer"
                      aria-label={isExpanded ? "Thu gọn chuyên khoa" : "Mở rộng chuyên khoa"}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>

                {/* Subcategories */}
                {isExpanded && hasSub && (
                  <div className="pl-3.5 space-y-1 border-l-2 border-border ml-3 my-1">
                    {cat.children?.map((sub) => {
                      const isSubSelected = category === sub.slug;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => handleCategorySelect(sub.slug)}
                          className={`w-full text-left py-2 px-2 rounded-md line-clamp-1 text-xs transition-colors cursor-pointer flex items-center justify-between min-h-[36px] ${
                            isSubSelected
                              ? "font-semibold text-primary bg-primary/10"
                              : "text-content-muted hover:text-primary hover:bg-surface-muted"
                          }`}
                        >
                          <span className="truncate">{sub.name}</span>
                          {sub.count && (
                            <span className="text-[10px] opacity-75 shrink-0 ml-1">
                              {sub.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Language Facet */}
      <div className="pt-4 border-t border-border">
        <h4 className="text-xs font-semibold text-content uppercase tracking-wider mb-2.5">
          Ngôn ngữ tài liệu
        </h4>
        <div className="space-y-2 text-xs">
          {LANGUAGES.map((lang) => {
            const checked = language === lang;
            return (
              <label
                key={lang}
                className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                  checked
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-content hover:bg-surface-muted"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleLanguageToggle(lang)}
                  className="rounded border-border text-primary focus:ring-focus w-4 h-4 cursor-pointer"
                />
                <span className="flex-1 text-xs">{lang}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Format Facet */}
      <div className="pt-4 border-t border-border">
        <h4 className="text-xs font-semibold text-content uppercase tracking-wider mb-2.5">
          Định dạng ebook
        </h4>
        <div className="space-y-2 text-xs">
          {FORMATS.map((fmt) => {
            const checked = format === fmt;
            return (
              <label
                key={fmt}
                className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                  checked
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-content hover:bg-surface-muted"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleFormatToggle(fmt)}
                  className="rounded border-border text-primary focus:ring-focus w-4 h-4 cursor-pointer"
                />
                <span className="flex-1 text-xs">{fmt} Ebook</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (isMobileDrawer) {
    return (
      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={onCloseMobileDrawer}
          aria-hidden="true"
        />

        {/* Slide-in Sheet */}
        <div className="relative w-[88vw] max-w-sm sm:max-w-md bg-surface h-full z-10 shadow-e3 flex flex-col animate-in slide-in-from-left duration-250">
          {/* Fixed Drawer Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface shrink-0">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-heading font-semibold text-content text-base">
                  Bộ Lọc Sách Y Học
                </h3>
                <p className="text-[11px] text-content-muted">
                  {hasActiveFilters
                    ? `Đang chọn ${activeFiltersCount} tiêu chí`
                    : "Lọc theo chuyên khoa, định dạng, ngôn ngữ"}
                </p>
              </div>
            </div>
            <button
              onClick={onCloseMobileDrawer}
              aria-label="Đóng bộ lọc"
              className="p-2 rounded-lg text-content-muted hover:text-content hover:bg-surface-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 overscroll-contain">
            {filterControls}
          </div>

          {/* Fixed Drawer Footer */}
          <div className="p-4 border-t border-border bg-surface shrink-0 flex items-center gap-3">
            {hasActiveFilters && (
              <Button variant="secondary" size="md" className="shrink-0" onClick={clearAllFilters}>
                Đặt lại
              </Button>
            )}
            <Button
              variant="primary"
              size="md"
              className="flex-1 justify-center shadow-md font-semibold text-sm py-2.5"
              onClick={onCloseMobileDrawer}
            >
              Áp dụng bộ lọc {hasActiveFilters ? `(${activeFiltersCount})` : ""}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <aside
      aria-label="Bộ lọc sách"
      className={`bg-surface p-4 rounded-xl border border-border shadow-e1 ${className}`}
    >
      {filterControls}
    </aside>
  );
}

export interface MobileFilterTriggerProps {
  categories: CategoryItem[];
  label?: string;
}

/** Mobile-only "open filters" button + drawer, self-contained so list pages can stay server components. */
export function MobileFilterTrigger({
  categories,
  label = "Bộ lọc chuyên khoa",
}: MobileFilterTriggerProps) {
  const [open, setOpen] = useState(false);
  const { params } = useParamNav();
  const hasActiveFilters = Boolean(
    params.get("chuyen-khoa") || params.get("ngon-ngu") || params.get("dinh-dang"),
  );

  return (
    <div className="lg:hidden flex items-center gap-2">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-surface text-content text-xs font-semibold hover:bg-surface-muted transition-colors shadow-2xs"
      >
        <Filter className="w-4 h-4 text-primary" />
        <span>{label}</span>
        {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary" />}
      </button>

      {open && (
        <FilterSidebar
          categories={categories}
          isMobileDrawer={true}
          onCloseMobileDrawer={() => setOpen(false)}
        />
      )}
    </div>
  );
}
