"use client";

import { BookOpen, X } from "lucide-react";
import { useEffect, useState } from "react";

interface ToastActivity {
  doctor: string;
  book: string;
  timeAgo: string;
}

const ACTIVITIES: ToastActivity[] = [
  { doctor: "BS. Trần Quốc Tuấn", book: "Điều Trị Học Nội Khoa (Tập 1)", timeAgo: "2 phút trước" },
  {
    doctor: "BSNT. Lê Đình Thắng",
    book: "Atlas Giải Phẫu Người Netter 7th",
    timeAgo: "5 phút trước",
  },
  {
    doctor: "BS. Nguyễn Thanh Tùng",
    book: "Phác Đồ Hồi Sức Cấp Cứu 2024",
    timeAgo: "12 phút trước",
  },
  {
    doctor: "BS. Lương Thiên Bình",
    book: "Chẩn Đoán Hình Ảnh Toàn Diện CT-MRI",
    timeAgo: "18 phút trước",
  },
  { doctor: "DS. Nguyễn Ngọc Hạnh", book: "Dược Lý Học Lâm Sàng", timeAgo: "25 phút trước" },
];

export function SocialProofToast() {
  const [current, setCurrent] = useState<ToastActivity | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    let index = 0;
    const triggerNext = () => {
      setCurrent(ACTIVITIES[index % ACTIVITIES.length]);
      setVisible(true);
      index++;

      // auto dismiss after 5s
      setTimeout(() => {
        setVisible(false);
      }, 5000);
    };

    // First trigger after 4s
    const firstTimer = setTimeout(triggerNext, 4000);
    // Interval every 16s
    const interval = setInterval(triggerNext, 16000);

    return () => {
      clearTimeout(firstTimer);
      clearInterval(interval);
    };
  }, [dismissed]);

  if (!visible || !current || dismissed) return null;

  return (
    <aside
      aria-label="Thông báo tải sách gần đây"
      className="fixed bottom-20 left-4 z-40 max-w-[calc(100vw-2rem)] sm:max-w-xs bg-surface border border-border rounded-lg p-3 shadow-e2 flex items-center gap-3 animate-in slide-in-from-left duration-300"
    >
      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <BookOpen className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0 text-xs">
        <p className="font-semibold text-content line-clamp-1">{current.doctor}</p>
        <p className="text-content-muted line-clamp-1">vừa tải {current.book}</p>
        <span className="text-[10px] text-content-muted/70">{current.timeAgo}</span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-content-muted hover:text-content p-1 rounded"
        aria-label="Đóng thông báo"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </aside>
  );
}
