"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";
import { MegaMenu } from "@/src/components/global/MegaMenu";
import { GlobalSearch } from "@/src/components/global/GlobalSearch";
import { ThemeToggle } from "@/src/components/global/ThemeToggle";
import {
  Menu,
  X,
  User as UserIcon,
  LogOut,
  BookOpen,
  HelpCircle,
  FileText,
  Phone,
  Library,
} from "lucide-react";

export function AppHeader() {
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Top Banner Notice */}
      <div className="bg-primary/10 border-b border-primary/20 text-xs py-1.5 px-4 text-center text-primary font-medium">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          <span className="hidden sm:inline">
            Thư viện sách y học trực tuyến dành cho bác sĩ, dược sĩ & sinh viên y khoa
          </span>
          <span className="sm:hidden mx-auto font-medium">
            Thư viện sách y khoa trực tuyến
          </span>
          <div className="hidden sm:flex items-center gap-4 text-[11px] text-content-muted">
            <Link href="/gioi-thieu" className="hover:text-primary transition-colors">
              Giới thiệu
            </Link>
            <span>•</span>
            <Link href="/lien-he" className="hover:text-primary transition-colors">
              Liên hệ
            </Link>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border transition-shadow ${
          scrolled ? "shadow-e2" : "shadow-e1"
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Left: Mobile hamburger & Brand */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-1.5 rounded-md text-content hover:bg-surface-muted md:hidden"
                aria-label="Mở menu điều hướng"
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-contrast shadow-e1 group-hover:bg-primary-hover transition-colors">
                  <Library className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-heading font-bold text-lg text-content leading-tight block tracking-tight">
                    SÁCH Y HỌC
                  </span>
                  <span className="text-[10px] text-primary font-medium tracking-wider uppercase block">
                    Medical Library
                  </span>
                </div>
              </Link>
            </div>

            {/* Middle: Desktop MegaMenu and GlobalSearch */}
            <div className="hidden md:flex items-center gap-3 flex-1 max-w-2xl mx-2">
              <MegaMenu />
              <div className="flex-1">
                <GlobalSearch />
              </div>
            </div>

            {/* Right: Navigation & User Auth */}
            <div className="flex items-center gap-2 sm:gap-3">
              <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-content-muted mr-1">
                <Link
                  href="/thu-vien-sach"
                  className="hover:text-primary transition-colors"
                >
                  Kho sách
                </Link>
                <Link
                  href="/tin-tuc"
                  className="hover:text-primary transition-colors"
                >
                  Tin tức
                </Link>
              </nav>

              <ThemeToggle />

              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-surface-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    aria-label="Tài khoản cá nhân"
                    aria-expanded={userDropdownOpen}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center overflow-hidden font-semibold text-xs">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user.name.slice(0, 1).toUpperCase()
                      )}
                    </div>
                    <span className="hidden sm:inline text-xs font-semibold text-content max-w-[110px] truncate">
                      {user.name}
                    </span>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-surface rounded-xl border border-border shadow-e3 z-50 py-1.5 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-4 py-2 border-b border-border">
                        <p className="text-xs font-semibold text-content truncate">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-content-muted truncate">
                          {user.email}
                        </p>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/tai-khoan"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-content hover:bg-surface-muted transition-colors"
                        >
                          <UserIcon className="w-4 h-4 text-content-muted" />
                          <span>Tài khoản của tôi</span>
                        </Link>
                        <Link
                          href="/tai-khoan/thu-vien"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-content hover:bg-surface-muted transition-colors"
                        >
                          <BookOpen className="w-4 h-4 text-content-muted" />
                          <span>Thư viện tải xuống</span>
                        </Link>
                      </div>

                      <div className="border-t border-border pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs text-danger hover:bg-danger/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4 text-danger" />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openAuthModal("login")}
                    className="px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 rounded-md transition-colors"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => openAuthModal("register")}
                    className="px-3 py-1.5 text-xs font-semibold bg-primary hover:bg-primary-hover text-primary-contrast rounded-md shadow-e1 transition-colors"
                  >
                    Đăng ký
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Search Input Bar */}
          <div className="py-2.5 md:hidden border-t border-border/60">
            <GlobalSearch />
          </div>
        </div>
      </header>

      {/* Mobile Drawer Sheet */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-sm bg-surface h-full z-10 shadow-e3 flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-primary">
                <Library className="w-5 h-5" />
                <span>Sách Y Học Online</span>
              </div>
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded text-content-muted"
                  aria-label="Đóng menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-3 border-b border-border space-y-1">
              <Link
                href="/thu-vien-sach"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-content hover:bg-surface-muted rounded-md"
              >
                <BookOpen className="w-4 h-4 text-primary" />
                <span>Kho thư viện sách</span>
              </Link>
              <Link
                href="/tin-tuc"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-content hover:bg-surface-muted rounded-md"
              >
                <FileText className="w-4 h-4 text-primary" />
                <span>Tin tức y khoa</span>
              </Link>
              <Link
                href="/gioi-thieu"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-content hover:bg-surface-muted rounded-md"
              >
                <HelpCircle className="w-4 h-4 text-primary" />
                <span>Giới thiệu & Hướng dẫn</span>
              </Link>
              <Link
                href="/lien-he"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-content hover:bg-surface-muted rounded-md"
              >
                <Phone className="w-4 h-4 text-primary" />
                <span>Liên hệ hỗ trợ</span>
              </Link>
            </div>

            <div className="flex-1 overflow-hidden">
              <MegaMenu
                isMobileDrawer={true}
                onCloseMobileDrawer={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
