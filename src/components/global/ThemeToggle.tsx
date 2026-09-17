"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("medical_lib_theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (stored === "dark" || (!stored && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);

    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("medical_lib_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("medical_lib_theme", "light");
    }
  };

  if (!mounted) {
    return (
      <div
        className={`w-8 h-8 rounded-full border border-border bg-surface flex items-center justify-center opacity-0 ${className}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full text-content-muted hover:text-content hover:bg-surface-muted border border-border/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus cursor-pointer ${className}`}
      aria-label={isDark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
      title={isDark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-warning" />
      ) : (
        <Moon className="w-4 h-4 text-content-muted" />
      )}
    </button>
  );
}
