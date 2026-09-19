"use client";

import { BookOpen, ChevronDown, ChevronRight, Layers, Menu } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CategoryItem } from "@/src/lib/cms/types";

export interface MegaMenuProps {
  categories: CategoryItem[];
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

export function MegaMenu({
  categories,
  isMobileDrawer = false,
  onCloseMobileDrawer,
}: MegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryItem>(categories[0]);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isMobileDrawer) {
    return (
      <div className="flex flex-col h-full bg-surface">
        <div className="px-4 py-3 border-b border-border bg-surface-muted/40 flex items-center justify-between">
          <div className="flex items-center gap-2 font-heading font-semibold text-content text-xs uppercase tracking-wider">
            <Layers className="w-4 h-4 text-primary" />
            <span>Chuyên khoa y học ({categories.length})</span>
          </div>
          <Link
            href="/thu-vien-sach"
            onClick={onCloseMobileDrawer}
            className="text-[11px] font-semibold text-primary hover:underline"
          >
            Tất cả →
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border/70 p-2">
          {categories.map((cat) => (
            <div key={cat.id} className="py-2 px-1">
              <Link
                href={`/danh-muc/${cat.slug}`}
                onClick={onCloseMobileDrawer}
                className="font-semibold text-content hover:text-primary transition-colors flex items-center justify-between text-xs py-1.5 px-2 rounded-lg hover:bg-surface-muted"
              >
                <span className="font-medium text-content">{cat.name}</span>
                <span className="text-[11px] text-content-muted font-normal bg-surface-muted px-2 py-0.5 rounded-full shrink-0">
                  {cat.count}
                </span>
              </Link>
              {cat.children && cat.children.length > 0 && (
                <div className="space-y-1 mt-1 pl-3 border-l-2 border-border/80 ml-2">
                  {cat.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/danh-muc/${child.slug}`}
                      onClick={onCloseMobileDrawer}
                      className="block text-xs text-content-muted hover:text-primary py-1.5 px-2 rounded-md hover:bg-surface-muted transition-colors truncate"
                    >
                      • {child.name}
                      {child.count && (
                        <span className="text-[10px] opacity-75 ml-1">({child.count})</span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-primary text-primary-contrast font-medium text-sm hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <Menu className="w-4 h-4" />
        <span>Danh mục sách</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Desktop Mega Dropdown */}
      {isOpen && (
        <div
          role="menu"
          className="absolute top-full left-0 mt-2 w-[780px] bg-surface rounded-xl border border-border shadow-e3 z-50 overflow-hidden flex divide-x divide-border animate-in fade-in duration-150"
        >
          {/* Main categories column */}
          <div className="w-[280px] py-2 bg-surface-muted/40 shrink-0">
            <div className="px-4 py-2 text-xs font-semibold text-content-muted uppercase tracking-wider">
              Chuyên ngành y khoa
            </div>
            <div className="divide-y divide-border/40">
              {categories.map((cat) => {
                const isActive = activeCategory.id === cat.id;
                return (
                  <button
                    key={cat.id}
                    onMouseEnter={() => setActiveCategory(cat)}
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full text-left px-4 py-2.5 flex items-center justify-between text-sm transition-colors ${
                      isActive
                        ? "bg-surface font-semibold text-primary border-l-3 border-primary"
                        : "text-content hover:bg-surface-muted"
                    }`}
                  >
                    <span className="line-clamp-1">{cat.name}</span>
                    <div className="flex items-center gap-1.5 text-xs text-content-muted">
                      <span>{cat.count}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subcategory specialties panel */}
          <div className="flex-1 p-5 bg-surface flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <Link
                  href={`/danh-muc/${activeCategory.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="text-base font-heading font-bold text-primary hover:underline flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span>{activeCategory.name}</span>
                </Link>
                <Link
                  href={`/danh-muc/${activeCategory.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-content-muted hover:text-primary font-medium"
                >
                  Xem toàn bộ ({activeCategory.count} ebook) →
                </Link>
              </div>

              {activeCategory.children && activeCategory.children.length > 0 ? (
                <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 mt-4">
                  {activeCategory.children.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/danh-muc/${sub.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-surface-muted transition-colors"
                    >
                      <span className="text-sm text-content group-hover:text-primary transition-colors line-clamp-1">
                        {sub.name}
                      </span>
                      {sub.count && (
                        <span className="text-xs text-content-muted/70 group-hover:text-primary">
                          ({sub.count})
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-content-muted">
                  Tất cả các tài liệu, bài giảng và ebook thuộc chuyên ngành {activeCategory.name}.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border mt-4 flex items-center justify-between text-xs text-content-muted">
              <span>Được phân loại theo tiêu chuẩn mã hóa chuyên khoa Bộ Y Tế</span>
              <Link
                href="/thu-vien-sach"
                onClick={() => setIsOpen(false)}
                className="font-semibold text-primary hover:underline"
              >
                Khám phá kho sách tổng quát →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
