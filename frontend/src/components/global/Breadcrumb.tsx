import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs text-content-muted ${className}`}>
      <ol className="flex items-center gap-1.5 flex-wrap">
        <li className="flex items-center">
          <Link
            href="/"
            className="hover:text-primary transition-colors flex items-center gap-1"
            title="Trang chủ"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="sr-only">Trang chủ</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-content-muted/60" aria-hidden="true" />
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-primary transition-colors line-clamp-1 max-w-[200px]"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className="font-medium text-content line-clamp-1 max-w-[250px]"
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
