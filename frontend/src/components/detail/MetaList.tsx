import React from "react";
import { Book } from "@/src/data/books";
import { User, Building, Calendar, BookOpen, HardDrive, Languages, Hash } from "lucide-react";

export interface MetaListProps {
  book: Book;
  className?: string;
}

export function MetaList({ book, className = "" }: MetaListProps) {
  const items = [
    {
      icon: <User className="w-4 h-4 text-primary" />,
      label: "Tác giả / Chủ biên",
      value: book.author,
    },
    {
      icon: <Building className="w-4 h-4 text-primary" />,
      label: "Nhà xuất bản",
      value: book.publisher,
    },
    {
      icon: <Calendar className="w-4 h-4 text-primary" />,
      label: "Năm xuất bản",
      value: book.year.toString(),
    },
    {
      icon: <Languages className="w-4 h-4 text-primary" />,
      label: "Ngôn ngữ",
      value: book.language,
    },
    {
      icon: <BookOpen className="w-4 h-4 text-primary" />,
      label: "Số trang",
      value: `${book.pages} trang`,
    },
    {
      icon: <HardDrive className="w-4 h-4 text-primary" />,
      label: "Định dạng & Dung lượng",
      value: `${book.format} (${book.fileSize})`,
    },
    {
      icon: <Hash className="w-4 h-4 text-primary" />,
      label: "Mã tài liệu (SKU)",
      value: book.sku,
    },
  ];

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-surface-muted/60 rounded-xl border border-border text-xs ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-2.5">
          <div className="p-1 rounded bg-surface border border-border/80 shrink-0 mt-0.5">
            {item.icon}
          </div>
          <div className="min-w-0">
            <span className="text-content-muted block">{item.label}</span>
            <span className="font-semibold text-content block truncate">{item.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
