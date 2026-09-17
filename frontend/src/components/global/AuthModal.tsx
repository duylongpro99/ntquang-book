"use client";

import React, { useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { FormField } from "@/src/components/ui/FormField";
import { Button } from "@/src/components/ui/Button";
import { useAuth } from "@/src/context/AuthContext";
import { Lock, User as UserIcon, BookOpen } from "lucide-react";

export function AuthModal() {
  const { isAuthModalOpen, authModalMode, closeAuthModal, login, register, pendingDownloadBook } = useAuth();
  const [mode, setMode] = useState<"login" | "register">(authModalMode);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync mode if changed from context
  React.useEffect(() => {
    setMode(authModalMode);
    setError(null);
  }, [authModalMode, isAuthModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === "login") {
      if (!username.trim()) {
        setError("Vui lòng nhập tên đăng nhập hoặc email.");
        return;
      }
      if (!password) {
        setError("Vui lòng nhập mật khẩu.");
        return;
      }
      setLoading(true);
      try {
        await login(username.trim(), password);
      } catch {
        setError("Tên đăng nhập hoặc mật khẩu không chính xác.");
      } finally {
        setLoading(false);
      }
    } else {
      if (!username.trim()) {
        setError("Vui lòng nhập họ và tên.");
        return;
      }
      if (!email.trim() || !email.includes("@")) {
        setError("Vui lòng nhập email hợp lệ (ví dụ: bacsi@hospital.edu.vn).");
        return;
      }
      if (!password || password.length < 6) {
        setError("Mật khẩu cần tối thiểu 6 ký tự.");
        return;
      }
      setLoading(true);
      try {
        await register(username.trim(), email.trim(), password);
      } catch {
        setError("Đã xảy ra lỗi khi tạo tài khoản. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={closeAuthModal}
      title={mode === "login" ? "Đăng nhập tài khoản" : "Tạo tài khoản mới"}
      description={
        pendingDownloadBook
          ? `Đăng nhập để tải ngay "${pendingDownloadBook.title}". Toàn bộ tài liệu đều miễn phí cho thành viên.`
          : "Thư viện sách y học online — Đăng nhập để tải ebook và giáo trình đầy đủ."
      }
      maxWidth="md"
    >
      {pendingDownloadBook && (
        <div className="mb-4 p-3 bg-surface-muted rounded-md border border-border flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-primary shrink-0" />
          <div className="text-xs text-content">
            <span className="font-semibold block">Đang chờ tải xuống:</span>
            <span className="line-clamp-1">{pendingDownloadBook.title}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "login" ? (
          <FormField
            label="Tên đăng nhập hoặc Email"
            type="text"
            name="usernameOrEmail"
            placeholder="bacsi_nguyenvana hoặc email..."
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError(null);
            }}
            required
            autoComplete="username"
          />
        ) : (
          <>
            <FormField
              label="Họ và tên / Chức danh"
              type="text"
              name="fullName"
              placeholder="BS. Nguyễn Văn A"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(null);
              }}
              required
              autoComplete="name"
            />
            <FormField
              label="Địa chỉ Email"
              type="email"
              name="email"
              placeholder="bacsi@benhvien.vn"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              required
              autoComplete="email"
            />
          </>
        )}

        <FormField
          label="Mật khẩu"
          type="password"
          name="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(null);
          }}
          required
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />

        {error && (
          <div
            id="auth-error-banner"
            role="alert"
            className="p-3 bg-danger/10 border border-danger/20 rounded-md text-xs text-danger font-medium flex items-center gap-2"
          >
            <Lock className="w-4 h-4 shrink-0 text-danger" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          className="w-full justify-center text-center mt-2"
        >
          {mode === "login" ? "Đăng nhập ngay" : "Đăng ký tài khoản miễn phí"}
        </Button>

        <div className="pt-2 text-center text-xs text-content-muted">
          {mode === "login" ? (
            <p>
              Chưa có tài khoản?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError(null);
                }}
                className="text-primary hover:underline font-semibold cursor-pointer"
              >
                Đăng ký thành viên mới
              </button>
            </p>
          ) : (
            <p>
              Đã có tài khoản?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className="text-primary hover:underline font-semibold cursor-pointer"
              >
                Đăng nhập ngay
              </button>
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
}
