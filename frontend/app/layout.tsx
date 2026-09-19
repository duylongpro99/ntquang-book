import type { Metadata } from "next";
import { Be_Vietnam_Pro, Inter } from "next/font/google";
import "./globals.css";
import { QuickViewModal } from "@/src/components/book/QuickViewModal";
import { AppFooter } from "@/src/components/global/AppFooter";
import { AppHeader } from "@/src/components/global/AppHeader";
import { AuthModal } from "@/src/components/global/AuthModal";
import { ChatLauncher } from "@/src/components/global/ChatLauncher";
import { SocialProofToast } from "@/src/components/global/SocialProofToast";
import { generateThemeCss } from "@/src/config/theme";
import { AuthProvider } from "@/src/context/AuthContext";
import { QuickViewProvider } from "@/src/context/QuickViewContext";
import { getBranding } from "@/src/lib/cms/branding";
import { getCategoryTree } from "@/src/lib/cms/categories";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  display: "swap",
});

const beVietnamPro = Be_Vietnam_Pro({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Download Sách Y Học - Thư viện sách y khoa trực tuyến số 1",
  description:
    "Kho tài liệu giáo trình, ebook y học, bài giảng lâm sàng chuyên sâu mọi chuyên khoa dành cho bác sĩ, dược sĩ và sinh viên y dược.",
  openGraph: {
    title: "Download Sách Y Học - Thư viện sách y khoa trực tuyến số 1",
    description:
      "Kho tài liệu giáo trình, ebook y học, bài giảng lâm sàng chuyên sâu mọi chuyên khoa.",
    type: "website",
    locale: "vi_VN",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // getBranding already falls back to DEFAULT_THEME on error; guard the category
  // tree the same way so a CMS outage degrades the shell (empty nav) instead of
  // 500-ing every route. MegaMenu/AppHeader tolerate an empty tree.
  const [categories, theme] = await Promise.all([getCategoryTree().catch(() => []), getBranding()]);
  return (
    <html lang="vi" className={`${inter.variable} ${beVietnamPro.variable}`}>
      <head>
        {/* Brand palette from the CMS branding single type: :root (light) + .dark tokens.
            The .dark class is toggled per-visitor by ThemeToggle. */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: server-generated CSS from trusted CMS tokens */}
        <style dangerouslySetInnerHTML={{ __html: generateThemeCss(theme) }} />
      </head>
      <body className="min-h-screen flex flex-col bg-bg text-content antialiased">
        <AuthProvider>
          <QuickViewProvider>
            <AppHeader categories={categories} />
            <main className="flex-1">{children}</main>
            <AppFooter />
            <AuthModal />
            <QuickViewModal />
            <SocialProofToast />
            <ChatLauncher />
          </QuickViewProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
