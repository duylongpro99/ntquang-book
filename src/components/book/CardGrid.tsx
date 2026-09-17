import React from "react";
import { BookCard } from "@/src/components/book/BookCard";
import { Book } from "@/src/data/books";

export interface CardGridProps {
  books?: Book[];
  cols?: 2 | 3 | 4;
  loading?: boolean;
  skeletonCount?: number;
  className?: string;
  emptyNode?: React.ReactNode;
  variant?: "book" | "course" | "compact" | "article";
}

export function CardGrid({
  books = [],
  cols = 4,
  loading = false,
  skeletonCount = 8,
  className = "",
  emptyNode,
  variant = "book",
}: CardGridProps) {
  const colClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  };

  if (loading) {
    return (
      <div className={`grid ${colClasses[cols]} gap-3 sm:gap-4 ${className}`}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <BookCard key={`skel-${i}`} loading={true} variant={variant} />
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return emptyNode ? <>{emptyNode}</> : null;
  }

  return (
    <div className={`grid ${colClasses[cols]} gap-3 sm:gap-4 ${className}`}>
      {books.map((book) => (
        <BookCard key={book.id} book={book} variant={variant} />
      ))}
    </div>
  );
}
