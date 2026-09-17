"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  ThemeConfig,
  DEFAULT_THEME,
  CMS_PRESET_THEMES,
} from "@/src/config/theme";

interface CmsThemeContextType {
  currentTheme: ThemeConfig;
  setThemeById: (themeId: string) => void;
  availableThemes: ThemeConfig[];
}

const CmsThemeContext = createContext<CmsThemeContextType | undefined>(undefined);

export function CmsThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(DEFAULT_THEME);

  useEffect(() => {
    // Check if custom CMS theme preset was configured or selected
    const savedThemeId = localStorage.getItem("cms_brand_theme_id");
    if (savedThemeId && CMS_PRESET_THEMES[savedThemeId]) {
      applyTheme(CMS_PRESET_THEMES[savedThemeId]);
    } else {
      applyTheme(DEFAULT_THEME);
    }
  }, []);

  const applyTheme = (theme: ThemeConfig) => {
    setCurrentTheme(theme);
    const root = document.documentElement;

    // Apply light tokens
    const l = theme.light;
    root.style.setProperty("--bg", l.bg);
    root.style.setProperty("--surface", l.surface);
    root.style.setProperty("--surface-muted", l.surfaceMuted);
    root.style.setProperty("--border", l.border);
    root.style.setProperty("--text", l.text);
    root.style.setProperty("--text-muted", l.textMuted);
    root.style.setProperty("--primary", l.primary);
    root.style.setProperty("--primary-hover", l.primaryHover);
    root.style.setProperty("--primary-contrast", l.primaryContrast);
    root.style.setProperty("--accent", l.accent);
    root.style.setProperty("--accent-contrast", l.accentContrast);
    root.style.setProperty("--success", l.success);
    root.style.setProperty("--warning", l.warning);
    root.style.setProperty("--danger", l.danger);
    root.style.setProperty("--info", l.info);
    root.style.setProperty("--focus-ring", l.focusRing);
  };

  const setThemeById = (themeId: string) => {
    const selected = CMS_PRESET_THEMES[themeId];
    if (selected) {
      applyTheme(selected);
      localStorage.setItem("cms_brand_theme_id", themeId);
    }
  };

  return (
    <CmsThemeContext.Provider
      value={{
        currentTheme,
        setThemeById,
        availableThemes: Object.values(CMS_PRESET_THEMES),
      }}
    >
      {children}
    </CmsThemeContext.Provider>
  );
}

export function useCmsTheme() {
  const context = useContext(CmsThemeContext);
  if (!context) {
    throw new Error("useCmsTheme must be used within a CmsThemeProvider");
  }
  return context;
}
