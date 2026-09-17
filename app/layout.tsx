import type { Metadata } from "next";
import { Inter, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/src/context/AuthContext";
import { QuickViewProvider } from "@/src/context/QuickViewContext";
import { CmsThemeProvider } from "@/src/components/global/CmsThemeManager";
import { AppHeader } from "@/src/components/global/AppHeader";
import { AppFooter } from "@/src/components/global/AppFooter";
import { AuthModal } from "@/src/components/global/AuthModal";
import { QuickViewModal } from "@/src/components/book/QuickViewModal";
import { SocialProofToast } from "@/src/components/global/SocialProofToast";
import { ChatLauncher } from "@/src/components/global/ChatLauncher";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${inter.variable} ${beVietnamPro.variable}`}>
      <body className="min-h-screen flex flex-col bg-bg text-content antialiased">
        <CmsThemeProvider>
          <AuthProvider>
            <QuickViewProvider>
              <AppHeader />
              <main className="flex-1">{children}</main>
              <AppFooter />
              <AuthModal />
              <QuickViewModal />
              <SocialProofToast />
              <ChatLauncher />
            </QuickViewProvider>
          </AuthProvider>
        </CmsThemeProvider>
      </body>
    </html>
  );
}
