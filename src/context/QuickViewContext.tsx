"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Book } from "@/src/data/books";

interface QuickViewContextType {
  selectedBook: Book | null;
  openQuickView: (book: Book) => void;
  closeQuickView: () => void;
}

const QuickViewContext = createContext<QuickViewContextType | undefined>(undefined);

export function QuickViewProvider({ children }: { children: ReactNode }) {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const openQuickView = (book: Book) => {
    setSelectedBook(book);
  };

  const closeQuickView = () => {
    setSelectedBook(null);
  };

  return (
    <QuickViewContext.Provider
      value={{
        selectedBook,
        openQuickView,
        closeQuickView,
      }}
    >
      {children}
    </QuickViewContext.Provider>
  );
}

export function useQuickView() {
  const context = useContext(QuickViewContext);
  if (!context) {
    throw new Error("useQuickView must be used within a QuickViewProvider");
  }
  return context;
}
