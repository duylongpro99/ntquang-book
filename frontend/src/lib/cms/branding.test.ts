import { afterEach, expect, it, vi } from "vitest";
import { DEFAULT_THEME } from "@/src/config/theme";

const client = { cmsFetch: vi.fn() };
vi.mock("./client", () => ({
  cmsFetch: (...a: unknown[]) => client.cmsFetch(...a),
  absolute: (u: string) => u,
}));

import { getBranding } from "./branding";

afterEach(() => vi.clearAllMocks());

const TOKENS = {
  bg: "#111111",
  surface: "#222222",
  surfaceMuted: "#333333",
  border: "#444444",
  text: "#555555",
  textMuted: "#666666",
  primary: "#777777",
  primaryHover: "#888888",
  primaryContrast: "#999999",
  accent: "#aaaaaa",
  accentContrast: "#bbbbbb",
  success: "#cccccc",
  warning: "#dddddd",
  danger: "#eeeeee",
  info: "#0f0f0f",
  focusRing: "#1a1a1a",
};

it("maps the branding single type into a ThemeConfig", async () => {
  client.cmsFetch.mockResolvedValueOnce({
    data: {
      name: "Hospital Brand",
      description: "desc",
      accentLabel: "Xanh",
      light: { id: 1, ...TOKENS },
      dark: { id: 2, ...TOKENS },
    },
  });
  const theme = await getBranding();
  expect(theme.name).toBe("Hospital Brand");
  expect(theme.description).toBe("desc");
  expect(theme.accentLabel).toBe("Xanh");
  expect(theme.light).toEqual(TOKENS);
  expect(theme.dark).toEqual(TOKENS);
});

it("falls back to DEFAULT_THEME when the CMS fetch fails", async () => {
  client.cmsFetch.mockRejectedValueOnce(new Error("network"));
  expect(await getBranding()).toEqual(DEFAULT_THEME);
});

it("falls back to DEFAULT_THEME when branding data is empty", async () => {
  client.cmsFetch.mockResolvedValueOnce({ data: null });
  expect(await getBranding()).toEqual(DEFAULT_THEME);
});
