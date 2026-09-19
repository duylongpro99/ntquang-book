/**
 * CMS-ready Theme and Color Tokens System for Sách Y Học Online
 *
 * Centralized, decoupled color management system.
 * Designed to be easily controlled by a Headless CMS, Admin Settings, or Environment config.
 */

export interface ColorTokens {
  bg: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryHover: string;
  primaryContrast: string;
  accent: string;
  accentContrast: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  focusRing: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  accentLabel: string;
  light: ColorTokens;
  dark: ColorTokens;
}

/**
 * Our proprietary bespoke color identity: "Oxford Medical Sapphire & Precision Slate"
 * Distinctive, authoritative, scholarly, and clean clinical atmosphere.
 */
export const DEFAULT_THEME: ThemeConfig = {
  id: "medical-sapphire",
  name: "Oxford Medical Sapphire",
  description:
    "Bản sắc y khoa kinh điển: Xanh Sapphire đậm học thuật, Slate lâm sàng và điểm nhấn Amber Caduceus",
  accentLabel: "Xanh Sapphire Y Khoa",
  light: {
    bg: "#f8fafc", // Slate 50: clean clinical paper reading canvas
    surface: "#ffffff", // Pure crisp surface
    surfaceMuted: "#f1f5f9", // Slate 100: subtle contrast for nested sections
    border: "#e2e8f0", // Slate 200: clean hairline demarcation
    text: "#0f172a", // Slate 900: razor-sharp clinical typography
    textMuted: "#475569", // Slate 600: passing 4.5:1 WCAG AA contrast ratio
    primary: "#1d4ed8", // Blue 700: Authoritative Medical Sapphire
    primaryHover: "#1e40af", // Blue 800: Deep sapphire hover
    primaryContrast: "#ffffff",
    accent: "#d97706", // Amber 600: Caduceus Warm Gold for alert, new badges & rating
    accentContrast: "#ffffff",
    success: "#16a34a", // Green 600
    warning: "#d97706", // Amber 600
    danger: "#dc2626", // Red 600: Clinical emergency / contraindication
    info: "#0284c7", // Sky 600
    focusRing: "#3b82f6", // Blue 500
  },
  dark: {
    bg: "#0b1120", // Midnight Navy Slate for hospital call rooms
    surface: "#111c33", // Elevated deep clinical slate
    surfaceMuted: "#1e293b", // Slate 800
    border: "#25334d", // Low-contrast eye-safe border
    text: "#f8fafc", // Slate 50
    textMuted: "#94a3b8", // Slate 400
    primary: "#3b82f6", // Blue 500: Vibrant high-contrast medical blue
    primaryHover: "#60a5fa", // Blue 400
    primaryContrast: "#ffffff",
    accent: "#f59e0b", // Amber 500
    accentContrast: "#0b1120",
    success: "#22c55e",
    warning: "#fbbf24",
    danger: "#ef4444",
    info: "#38bdf8",
    focusRing: "#60a5fa",
  },
};

/**
 * Generate CSS variable block for root and dark mode.
 * Can be embedded directly or returned by a CMS API endpoint.
 */
export function generateThemeCss(theme: ThemeConfig = DEFAULT_THEME): string {
  const l = theme.light;
  const d = theme.dark;

  return `
    :root {
      --bg: ${l.bg};
      --surface: ${l.surface};
      --surface-muted: ${l.surfaceMuted};
      --border: ${l.border};
      --text: ${l.text};
      --text-muted: ${l.textMuted};
      --primary: ${l.primary};
      --primary-hover: ${l.primaryHover};
      --primary-contrast: ${l.primaryContrast};
      --accent: ${l.accent};
      --accent-contrast: ${l.accentContrast};
      --success: ${l.success};
      --warning: ${l.warning};
      --danger: ${l.danger};
      --info: ${l.info};
      --focus-ring: ${l.focusRing};
    }
    .dark {
      --bg: ${d.bg};
      --surface: ${d.surface};
      --surface-muted: ${d.surfaceMuted};
      --border: ${d.border};
      --text: ${d.text};
      --text-muted: ${d.textMuted};
      --primary: ${d.primary};
      --primary-hover: ${d.primaryHover};
      --primary-contrast: ${d.primaryContrast};
      --accent: ${d.accent};
      --accent-contrast: ${d.accentContrast};
      --success: ${d.success};
      --warning: ${d.warning};
      --danger: ${d.danger};
      --info: ${d.info};
      --focus-ring: ${d.focusRing};
    }
  `;
}
