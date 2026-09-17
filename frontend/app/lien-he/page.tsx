"use client";

import { AlertCircle, CheckCircle2, Mail, MapPin, Phone, Send } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Breadcrumb } from "@/src/components/global/Breadcrumb";
import { Button } from "@/src/components/ui/Button";
import { FormField } from "@/src/components/ui/FormField";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("request");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
    }, 1000);
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-6 space-y-8">
      <Breadcrumb items={[{ label: "Liên hệ & Hỗ trợ" }]} />

      <div className="pb-4 border-b border-border">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-content tracking-tight">
          Liên Hệ & Hỗ Trợ Độc Giả
        </h1>
        <p className="text-xs sm:text-sm text-content-muted mt-1">
          Gửi yêu cầu tài liệu, báo cáo lỗi file tải hoặc đóng góp ý kiến xây dựng thư viện y khoa
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Form */}
        <div className="md:col-span-7 bg-surface p-6 sm:p-8 rounded-xl border border-border shadow-e1">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-heading font-bold text-content">
                Đã gửi yêu cầu thành công!
              </h2>
              <p className="text-xs text-content-muted max-w-sm mx-auto leading-relaxed">
                Ban quản trị thư viện đã tiếp nhận thông tin của bạn. Chúng tôi sẽ xử lý và phản hồi
                qua email trong vòng 24 giờ.
              </p>
              <div className="pt-2">
                <Button variant="secondary" size="sm" onClick={() => setSubmitted(false)}>
                  Gửi yêu cầu khác
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  id="contact-name"
                  label="Họ và tên"
                  placeholder="BS. Nguyễn Văn A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <FormField
                  id="contact-email"
                  type="email"
                  label="Email của bạn"
                  placeholder="bacsi@benhvien.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="contact-topic"
                  className="block text-xs font-semibold text-content mb-1.5"
                >
                  Mục đích liên hệ
                </label>
                <select
                  id="contact-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs sm:text-sm text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus font-medium"
                >
                  <option value="request">Yêu cầu bổ sung sách / bài giảng mới</option>
                  <option value="broken-link">Báo cáo link hỏng / file lỗi tải về</option>
                  <option value="copyright">Vấn đề bản quyền & Sở hữu trí tuệ</option>
                  <option value="other">Ý kiến đóng góp khác</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-semibold text-content mb-1.5"
                >
                  Nội dung chi tiết <span className="text-danger">*</span>
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Vui lòng cung cấp tên sách, tác giả, link bài viết bị lỗi hoặc nội dung cần hỗ trợ..."
                  className="w-full rounded-md border border-border bg-surface p-3 text-xs sm:text-sm text-content placeholder:text-content-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus resize-none"
                  required
                />
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  loading={loading}
                  className="w-full sm:w-auto"
                >
                  <Send className="w-4 h-4" />
                  <span>Gửi tin nhắn</span>
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Right Info Card */}
        <div className="md:col-span-5 space-y-6">
          <div className="p-6 bg-surface rounded-xl border border-border shadow-e1 space-y-5">
            <h3 className="font-heading font-bold text-base text-content">
              Kênh Tiếp Nhận Trực Tiếp
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-content block">Email hỗ trợ</span>
                  <a
                    href="mailto:hotro@downloadsachyhoc.com"
                    className="text-primary hover:underline font-medium"
                  >
                    hotro@downloadsachyhoc.com
                  </a>
                  <p className="text-[11px] text-content-muted mt-0.5">
                    Hỗ trợ xác minh tài khoản và gửi tệp khẩn cấp
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-content block">Hotline / Zalo hỗ trợ</span>
                  <span className="text-content font-medium">0988.xxx.xxx (8:00 - 20:00)</span>
                  <p className="text-[11px] text-content-muted mt-0.5">
                    Hỗ trợ kỹ thuật tải sách trên máy tính và điện thoại
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-content block">Địa chỉ mạng lưới</span>
                  <span className="text-content-muted">Hà Nội & TP. Hồ Chí Minh, Việt Nam</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 bg-surface-muted rounded-xl border border-border space-y-2 text-xs">
            <div className="flex items-center gap-2 font-semibold text-content text-xs">
              <AlertCircle className="w-4 h-4 text-primary" />
              <span>Chính sách kiểm duyệt tài liệu</span>
            </div>
            <p className="text-content-muted leading-relaxed text-[11px]">
              Tất cả các tài liệu được gửi lên hoặc yêu cầu đều được rà soát chất lượng quét, trang
              in và bản quyền học thuật nhằm đem lại nguồn tư liệu tin cậy nhất cho cộng đồng ngành
              y.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
