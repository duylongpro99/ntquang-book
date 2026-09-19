"use client";

import { CheckCircle2, Save, UserCheck } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { AccountNav } from "@/src/components/account/AccountNav";
import { Breadcrumb } from "@/src/components/global/Breadcrumb";
import { Button } from "@/src/components/ui/Button";
import { FormField } from "@/src/components/ui/FormField";
import { useAuth } from "@/src/context/AuthContext";

export default function AccountInfoPage() {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [name, setName] = useState(user?.name || "Bác sĩ Duy Long");
  const [email, setEmail] = useState(user?.email || "duylong@hospital.vn");
  const [hospital, setHospital] = useState("Bệnh viện Đại học Y Dược TP.HCM");
  const [specialty, setSpecialty] = useState("Nội tiêu hóa");
  const [saved, setSaved] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <UserCheck className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-heading font-bold text-content">
          Đăng nhập để xem thông tin tài khoản
        </h1>
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-6 space-y-6">
      <Breadcrumb
        items={[{ label: "Tài khoản", href: "/tai-khoan" }, { label: "Thông tin cá nhân" }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-1">
          <AccountNav />
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="p-6 bg-surface rounded-xl border border-border shadow-e1">
            <h2 className="text-lg font-heading font-bold text-content pb-3 border-b border-border">
              Cập nhật thông tin thành viên
            </h2>

            {saved && (
              <div className="mt-4 p-3 bg-success/10 border border-success/30 rounded-md text-xs text-success font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Thông tin cá nhân đã được lưu cập nhật thành công.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4 max-w-xl">
              <FormField
                id="name"
                label="Họ và tên bác sĩ / độc giả"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <FormField
                id="email"
                type="email"
                label="Địa chỉ Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                helperText="Email dùng để nhận thông báo và khôi phục mật khẩu tài khoản"
                required
              />

              <FormField
                id="hospital"
                label="Cơ sở y tế / Bệnh viện / Trường ĐH"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
              />

              <FormField
                id="specialty"
                label="Chuyên khoa công tác / Học tập"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              />

              <div className="pt-2">
                <Button variant="primary" size="md" type="submit">
                  <Save className="w-4 h-4" />
                  <span>Lưu thay đổi</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
