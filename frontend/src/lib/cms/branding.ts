import { DEFAULT_THEME, type ThemeConfig } from "@/src/config/theme";
import { cmsFetch } from "./client";
import { mapBranding, type StrapiEntry } from "./mappers";

/**
 * Fetch the CMS branding single type and map it to the frontend ThemeConfig.
 * Falls back to DEFAULT_THEME on any error or missing data so the site always
 * renders a complete palette.
 */
export async function getBranding(): Promise<ThemeConfig> {
  try {
    const res = await cmsFetch<{ data: StrapiEntry | null }>(
      "/branding",
      { populate: ["light", "dark"] },
      { tags: ["branding"] },
    );
    if (!res.data?.light || !res.data?.dark) return DEFAULT_THEME;
    return mapBranding(res.data);
  } catch {
    return DEFAULT_THEME;
  }
}
