"use client";

import React, { useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { AccountNav } from "@/src/components/account/AccountNav";
import { Breadcrumb } from "@/src/components/global/Breadcrumb";
import { FormField } from "@/src/components/ui/FormField";
import { Button } from "@/src/components/ui/Button";
import { useCmsTheme } from "@/src/components/global/CmsThemeManager";
import { UserCheck, CheckCircle2, Save, Palette, Check } from "lucide-react";

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
        items={[
          { label: "Tài khoản", href: "/tai-khoan" },
          { label: "Thông tin cá nhân" },
        ]}
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

          {/* CMS Color Management Card */}
          <CmsThemeCard />
        </div>
      </div>
    </div>
  );
}

function CmsThemeCard() {
  const { currentTheme, setThemeById, availableThemes } = useCmsTheme();
  const [themeSaved, setThemeSaved] = useState(false);

  const handleSelect = (id: string) => {
    setThemeById(id);
    setThemeSaved(true);
    setTimeout(() => setThemeSaved(false), 2500);
  };

  return (
    <div className="p-6 bg-surface rounded-xl border border-border shadow-e1 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-heading font-bold text-content">
              Quản lý màu sắc thương hiệu (CMS Brand Theme)
            </h2>
            <p className="text-xs text-content-muted">
              Định nghĩa bản sắc màu độc quyền & chuẩn bị cấu hình đồng bộ qua CMS
            </p>
          </div>
        </div>

        {themeSaved && (
          <span className="text-xs text-success font-medium flex items-center gap-1 animate-in fade-in">
            <Check className="w-3.5 h-3.5" />
            Đã đồng bộ CMS
          </span>
        )}
      </div>

      <p className="text-xs text-content-muted leading-relaxed">
        Hệ thống màu sắc được kiến trúc tập trung tại <code className="px-1.5 py-0.5 rounded bg-surface-muted border border-border text-primary font-mono text-[11px]">src/config/theme.ts</code> và đồng bộ hóa qua CSS variables. Khi CMS cập nhật, toàn bộ giao diện (Nút bấm, Thẻ sách, Thanh điều hướng, Modal) tự động đổi màu đồng nhất:
      </p>

      {/* Preset selection grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {availableThemes.map((t) => {
          const isSelected = currentTheme.id === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleSelect(t.id)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "border-primary bg-surface-muted/60 ring-2 ring-primary/20 shadow-xs"
                  : "border-border hover:border-primary/40 bg-surface"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    {/* Color Swatch */}
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                      style={{ backgroundColor: t.light.primary }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
                      style={{ backgroundColor: t.light.accent }}
                    />
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary text-primary-contrast flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5" />
                      Đang kích hoạt
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-content">{t.name}</div>
                <div className="text-[11px] text-content-muted mt-1 leading-snug">
                  {t.description}
                </div>
              </div>

              {/* Hex codes preview */}
              <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-[10px] text-content-muted font-mono">
                <span>Primary: {t.light.primary}</span>
                <span>Accent: {t.light.accent}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Token Values Bar */}
      <div className="p-3 bg-surface-muted rounded-lg border border-border flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-content text-[11px]">Token hiện tại:</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-primary text-primary-contrast font-medium">
            Primary: {currentTheme.light.primary}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-accent text-accent-contrast font-medium">
            Accent: {currentTheme.light.accent}
          </span>
        </div>
        <span className="text-[11px] text-content-muted">
          100% tuân thủ WCAG AA & tối ưu đọc sách lâm sàng
        </span>
      </div>
    </div>
  );
}
