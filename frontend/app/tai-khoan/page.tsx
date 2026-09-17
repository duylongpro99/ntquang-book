"use client";

import { ArrowRight, Download, ShieldCheck, UserCheck } from "lucide-react";
import Link from "next/link";
import { AccountNav } from "@/src/components/account/AccountNav";
import { DataTable } from "@/src/components/account/DataTable";
import { Breadcrumb } from "@/src/components/global/Breadcrumb";
import { Button } from "@/src/components/ui/Button";
import { useAuth } from "@/src/context/AuthContext";

export default function AccountDashboardPage() {
  const { user, isAuthenticated, downloads, openAuthModal } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <UserCheck className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-heading font-bold text-content">
          Đăng nhập để xem trang tài khoản
        </h1>
        <p className="text-xs text-content-muted leading-relaxed">
          Vui lòng đăng nhập bằng tài khoản email hoặc tên đăng nhập của bạn để xem lịch sử tải sách
          và quản lý thông tin thành viên.
        </p>
        <div className="pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => openAuthModal("login")}
            className="w-full justify-center"
          >
            Đăng nhập ngay
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-6 space-y-6">
      <Breadcrumb
        items={[{ label: "Tài khoản", href: "/tai-khoan" }, { label: "Tổng quan thành viên" }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1">
          <AccountNav />
        </div>

        {/* Dashboard Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Welcome Banner */}
          <div className="p-6 bg-surface rounded-xl border border-border shadow-e1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider block">
                  Bảng điều khiển thành viên
                </span>
                <h1 className="text-xl sm:text-2xl font-heading font-bold text-content mt-1">
                  Xin chào, {user.name}!
                </h1>
                <p className="text-xs text-content-muted mt-1">
                  Thành viên y tế chính thức · {user.email}
                </p>
              </div>

              <Link
                href="/thu-vien-sach"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-contrast text-xs font-semibold rounded-md transition-colors shadow-e1 shrink-0"
              >
                <span>Tìm kiếm sách mới</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Stat Counters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
              <div className="p-3 bg-surface-muted/60 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-content-muted">Sách đã tải về</span>
                  <Download className="w-4 h-4 text-primary" />
                </div>
                <div className="text-2xl font-bold font-heading text-content mt-1">
                  {downloads.length}
                </div>
                <span className="text-[11px] text-content-muted">Tài liệu trong máy</span>
              </div>

              <div className="p-3 bg-surface-muted/60 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-content-muted">Quyền truy cập</span>
                  <ShieldCheck className="w-4 h-4 text-success" />
                </div>
                <div className="text-2xl font-bold font-heading text-success mt-1">100% Mở</div>
                <span className="text-[11px] text-content-muted">Không giới hạn chuyên khoa</span>
              </div>

              <div className="p-3 bg-surface-muted/60 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-content-muted">Tình trạng tài khoản</span>
                  <UserCheck className="w-4 h-4 text-primary" />
                </div>
                <div className="text-2xl font-bold font-heading text-content mt-1">Kích hoạt</div>
                <span className="text-[11px] text-content-muted">Đã xác thực</span>
              </div>
            </div>
          </div>

          {/* Downloaded Books Table (Default tab in dashboard) */}
          <DataTable downloads={downloads} />
        </div>
      </div>
    </div>
  );
}
