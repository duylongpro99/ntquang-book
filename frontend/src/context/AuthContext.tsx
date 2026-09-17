"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { Book } from "@/src/data/books";

export interface User {
  id: string;
  name: string;
  email: string;
  hospital?: string;
  specialty?: string;
  avatar?: string;
  joinedDate: string;
}

export interface DownloadRecord {
  id: string;
  bookId: string;
  bookSlug: string;
  bookTitle: string;
  bookCover: string;
  author: string;
  fileSize: string;
  format: string;
  downloadedAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalMode: "login" | "register";
  pendingDownloadBook: Book | null;
  downloads: DownloadRecord[];
  openAuthModal: (mode?: "login" | "register", pendingBook?: Book) => void;
  closeAuthModal: () => void;
  login: (usernameOrEmail: string, password?: string) => Promise<boolean>;
  register: (name: string, email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  triggerDownload: (book: Book) => Promise<boolean>;
  updateProfile: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INITIAL_DOWNLOADS: DownloadRecord[] = [
  {
    id: "dl-1",
    bookId: "b1",
    bookSlug: "dieu-tri-hoc-noi-khoa-tap-1",
    bookTitle: "Điều Trị Học Nội Khoa (Tập 1) – ĐH Y Dược TP.HCM",
    bookCover:
      "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=600&q=80",
    author: "PGS.TS. Châu Ngọc Hoa (Chủ biên)",
    fileSize: "45.2 MB",
    format: "PDF",
    downloadedAt: "2024-02-26 14:20",
  },
  {
    id: "dl-2",
    bookId: "b3",
    bookSlug: "chan-doan-hinh-anh-toan-dien-ct-mri",
    bookTitle: "Chẩn Đoán Hình Ảnh Toàn Diện: CT và MRI Lâm Sàng",
    bookCover:
      "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80",
    author: "PGS.TS. Bùi Văn Lệnh",
    fileSize: "92.4 MB",
    format: "PDF",
    downloadedAt: "2024-02-20 09:15",
  },
  {
    id: "dl-3",
    bookId: "b9",
    bookSlug: "doc-dien-tam-do-ecg-de-hieu-tu-a-z",
    bookTitle: "Đọc Điện Tâm Đồ (ECG) Dễ Hiểu Từ A Đến Z",
    bookCover:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80",
    author: "BS. Nguyễn Tôn Thơ",
    fileSize: "28.3 MB",
    format: "PDF",
    downloadedAt: "2024-02-15 16:45",
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");
  const [pendingDownloadBook, setPendingDownloadBook] = useState<Book | null>(null);
  const [downloads, setDownloads] = useState<DownloadRecord[]>(INITIAL_DOWNLOADS);

  // Load auth state from localStorage on client mount if available
  useEffect(() => {
    try {
      const stored = localStorage.getItem("med_auth_user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
      const storedDl = localStorage.getItem("med_downloads");
      if (storedDl) {
        setDownloads(JSON.parse(storedDl));
      }
    } catch {
      // Ignore local storage parse errors
    }
  }, []);

  const openAuthModal = (mode: "login" | "register" = "login", pendingBook?: Book) => {
    setAuthModalMode(mode);
    if (pendingBook) {
      setPendingDownloadBook(pendingBook);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const executeDownload = (book: Book) => {
    const newRecord: DownloadRecord = {
      id: `dl-${Date.now()}`,
      bookId: book.id,
      bookSlug: book.slug,
      bookTitle: book.title,
      bookCover: book.cover,
      author: book.author,
      fileSize: book.fileSize,
      format: book.format,
      downloadedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
    };

    setDownloads((prev) => {
      const updated = [newRecord, ...prev.filter((d) => d.bookId !== book.id)];
      try {
        localStorage.setItem("med_downloads", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Create a client-side simulated blob download or trigger file
    const element = document.createElement("a");
    const dummyContent = `Thư viện Sách Y Học - Ebook: ${book.title}\nTác giả: ${book.author}\nĐịnh dạng: ${book.format}\nDung lượng: ${book.fileSize}\nLiên kết tải chính thức an toàn từ Download Sách Y Học.`;
    const file = new Blob([dummyContent], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `${book.slug}.${book.format.toLowerCase() === "pdf" ? "pdf" : "txt"}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const login = async (usernameOrEmail: string): Promise<boolean> => {
    const defaultName = usernameOrEmail.includes("@")
      ? usernameOrEmail.split("@")[0]
      : usernameOrEmail;

    const loggedUser: User = {
      id: `user-${Date.now()}`,
      name: defaultName,
      email: usernameOrEmail.includes("@") ? usernameOrEmail : `${usernameOrEmail}@hospital.edu.vn`,
      hospital: "Bệnh viện Đại học Y Dược",
      specialty: "Nội khoa",
      avatar:
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80",
      joinedDate: "16/09/2024",
    };

    setUser(loggedUser);
    try {
      localStorage.setItem("med_auth_user", JSON.stringify(loggedUser));
    } catch {}

    setIsAuthModalOpen(false);

    // If there was a pending download action waiting for login, resume it now automatically!
    if (pendingDownloadBook) {
      setTimeout(() => {
        executeDownload(pendingDownloadBook);
        setPendingDownloadBook(null);
      }, 300);
    }

    return true;
  };

  const register = async (name: string, email: string): Promise<boolean> => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name,
      email: email,
      hospital: "Bác sĩ / Cán bộ y tế",
      specialty: "Đa khoa",
      avatar:
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80",
      joinedDate: new Date().toLocaleDateString("vi-VN"),
    };

    setUser(newUser);
    try {
      localStorage.setItem("med_auth_user", JSON.stringify(newUser));
    } catch {}

    setIsAuthModalOpen(false);

    if (pendingDownloadBook) {
      setTimeout(() => {
        executeDownload(pendingDownloadBook);
        setPendingDownloadBook(null);
      }, 300);
    }

    return true;
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("med_auth_user");
    } catch {}
  };

  const triggerDownload = async (book: Book): Promise<boolean> => {
    if (!user) {
      openAuthModal("login", book);
      return false;
    }
    executeDownload(book);
    return true;
  };

  const updateProfile = (updated: Partial<User>) => {
    if (!user) return;
    const nextUser = { ...user, ...updated };
    setUser(nextUser);
    try {
      localStorage.setItem("med_auth_user", JSON.stringify(nextUser));
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthModalOpen,
        authModalMode,
        pendingDownloadBook,
        downloads,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        triggerDownload,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
