"use client";

import { BookOpen, LogOut, ShieldCheck, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";

export function AccountNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const links = [
    {
      href: "/tai-khoan",
      label: "Tổng quan",
      fullLabel: "Tổng quan tài khoản",
      icon: <UserIcon className="w-4 h-4 shrink-0" />,
    },
    {
      href: "/tai-khoan/thu-vien",
      label: "Thư viện đã tải",
      fullLabel: "Thư viện đã tải",
      icon: <BookOpen className="w-4 h-4 shrink-0" />,
    },
    {
      href: "/tai-khoan/thong-tin",
      label: "Thông tin cá nhân",
      fullLabel: "Thông tin cá nhân",
      icon: <ShieldCheck className="w-4 h-4 shrink-0" />,
    },
  ];

  return (
    <div>
      {/* Mobile/Tablet View (< lg): Compact Profile Bar & Horizontal Segmented Tabs */}
      <div className="block lg:hidden space-y-3 bg-surface rounded-xl border border-border p-3.5 shadow-e1">
        {user && (
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.slice(0, 1).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-heading font-semibold text-xs text-content truncate">
                    {user.name}
                  </h3>
                  <span className="text-[10px] font-semibold text-success bg-success/10 px-1.5 py-0.2 rounded-full shrink-0">
                    Thành viên
                  </span>
                </div>
                <p className="text-[11px] text-content-muted truncate">{user.email}</p>
              </div>
            </div>

            <button
              onClick={logout}
              aria-label="Đăng xuất"
              className="p-1.5 text-danger hover:bg-danger/10 rounded-md transition-colors shrink-0 text-xs flex items-center gap-1 font-medium"
              title="Đăng xuất"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="text-[11px]">Thoát</span>
            </button>
          </div>
        )}

        {/* Scrollable Horizontal Navigation Tabs */}
        <nav
          aria-label="Điều hướng trang tài khoản"
          className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1"
        >
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                  isActive
                    ? "bg-primary text-primary-contrast shadow-e1"
                    : "bg-surface-muted/60 border border-border/80 text-content hover:bg-surface-muted"
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Desktop View (>= lg): Full Vertical Sidebar */}
      <aside
        aria-label="Điều hướng tài khoản"
        className="hidden lg:block bg-surface rounded-xl border border-border p-4 shadow-e1"
      >
        {user && (
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-border">
            <div className="w-12 h-12 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-base overflow-hidden shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.slice(0, 1).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-heading font-semibold text-sm text-content truncate">
                {user.name}
              </h3>
              <p className="text-xs text-content-muted truncate">{user.email}</p>
              <span className="inline-block mt-1 text-[10px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">
                Thành viên chính thức
              </span>
            </div>
          </div>
        )}

        <nav className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-primary text-primary-contrast shadow-e1"
                    : "text-content hover:bg-surface-muted"
                }`}
              >
                {link.icon}
                <span>{link.fullLabel}</span>
              </Link>
            );
          })}

          <div className="pt-3 mt-3 border-t border-border">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-danger hover:bg-danger/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất tài khoản</span>
            </button>
          </div>
        </nav>
      </aside>
    </div>
  );
}
