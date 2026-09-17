"use client";

import React from "react";
import { useAuth } from "@/src/context/AuthContext";
import { AccountNav } from "@/src/components/account/AccountNav";
import { DataTable } from "@/src/components/account/DataTable";
import { Breadcrumb } from "@/src/components/global/Breadcrumb";
import { Button } from "@/src/components/ui/Button";
import { UserCheck } from "lucide-react";

export default function MyLibraryPage() {
  const { user, isAuthenticated, downloads, openAuthModal } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <UserCheck className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-heading font-bold text-content">
          Đăng nhập để xem thư viện cá nhân
        </h1>
        <p className="text-xs text-content-muted leading-relaxed">
          Vui lòng đăng nhập để xem danh sách tài liệu y khoa bạn đã tải về máy và tải lại nhanh chóng.
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
        items={[
          { label: "Tài khoản", href: "/tai-khoan" },
          { label: "Thư viện đã tải" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-1">
          <AccountNav />
        </div>

        <div className="lg:col-span-3 space-y-6">
          <DataTable downloads={downloads} />
        </div>
      </div>
    </div>
  );
}
