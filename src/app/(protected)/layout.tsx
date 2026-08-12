// FILE: src/app/(protected)/layout.tsx — GHI ĐÈ
// Sidebar động: paid → 5 mục học + 4 mục gốc; unpaid → 2 mục học + 4 mục gốc
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, BookOpen, ClipboardList, Bell, UserCircle, LogOut,
  TrendingUp, Target, NotebookPen, MessageSquareText,
  PlayCircle, CalendarDays, GraduationCap, BookOpenCheck,
  CalendarCheck
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

// Mục chung cho mọi học viên
const BASE_NAV = [
  { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
];
const TAIL_NAV = [
  { href: "/de-thi", label: "Luyện Kĩ Năng", icon: BookOpen },
  { href: "/lich-su", label: "Điểm Tích Lũy", icon: ClipboardList },
  { href: "/diem-danh", label: "Điểm Danh", icon: CalendarCheck },
  { href: "/thong-bao", label: "Thông báo", icon: Bell },
  { href: "/ho-so", label: "Hồ sơ", icon: UserCircle },
];

// Mục dành cho học viên ĐÃ thanh toán (5 tab)
const PAID_NAV = [
  { href: "/thong-bao", label: "Thông báo", icon: Bell },
  { href: "/huong-dan-buoi-dau", label: "Hướng dẫn buổi đầu", icon: BookOpenCheck },
  { href: "/lich-lam-bai", label: "Lịch làm bài", icon: CalendarDays },
  { href: "/lo-trinh", label: "Lộ trình", icon: TrendingUp },
  { href: "/bai-tap-tich-luy", label: "Bài tập tích lũy", icon: Target },
  { href: "/ket-qua", label: "Kết quả định kỳ & cuối khóa", icon: GraduationCap },
  { href: "/nhat-ky-diem-danh", label: "Nhật ký & Điểm danh", icon: NotebookPen },
  { href: "/tam-su", label: "Tâm sự với Vesta", icon: MessageSquareText },
  { href: "/ho-so", label: "Hồ sơ", icon: UserCircle },
];

// Mục dành cho học viên CHƯA thanh toán (2 tab)
const UNPAID_NAV = [
  { href: "/hoc-thu", label: "Học thử", icon: PlayCircle },
  { href: "/lich-khai-giang", label: "Lịch khai giảng", icon: CalendarDays },
];

// HS chi dung dich vu cham bai (GRADING_ONLY): chi Tong quan + Thong bao + Ho so
const GRADING_NAV: { href: string; label: string; icon: any }[] = [];

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname() || "";
  const router = useRouter();
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    if (!user) return;
    api.get("/student/notifications").then((r: any) => { if (r?.success) setUnread(r.unreadCount || 0); }).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!loading && !user) router.replace("/dang-nhap");
  }, [loading, user, router]);

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
      </div>
    );

  if (!user) return null;

  // Nếu đang ở trang làm bài → full screen, không hiện sidebar
  if (pathname.startsWith("/lam-bai/")) return <>{children}</>;

  // Gộp menu theo trạng thái thanh toán
  const isGradingOnly = user.regStatus === "GRADING_ONLY";
  // Menu paid: PAID_NAV đã gồm Thông báo + Hồ sơ; unpaid/grading giữ như cũ.
  const NAV = isGradingOnly
    ? [...BASE_NAV, ...GRADING_NAV, ...TAIL_NAV.filter((m) => m.href === "/thong-bao" || m.href === "/ho-so")]
    : user.isPaid
    ? [...BASE_NAV, ...PAID_NAV]
    : [...BASE_NAV, ...UNPAID_NAV, ...TAIL_NAV];

  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="print:hidden sticky top-0 flex h-screen w-[220px] shrink-0 flex-col border-r border-silver/30 bg-white">
        {/* Bấm logo → về Tổng quan (dashboard) */}
        <Link href="/dashboard" className="group block border-b border-silver/20 px-5 py-5 transition-colors hover:bg-cream" title="Về Tổng quan">
          <p className="text-xl font-bold text-royal">VESTA</p>
          <p className="text-[0.6rem] font-semibold uppercase tracking-widest text-muted group-hover:text-royal">Student Portal</p>
        </Link>

        <div className="border-b border-silver/20 px-5 py-3">
          <p className="truncate text-sm font-semibold text-[#1a1a2e]">{user.fullName}</p>
          <p className="truncate text-[0.65rem] font-mono text-gold">{user.studentCode}</p>
          {user.course && (
            <p className="mt-1 inline-block rounded bg-royal/8 px-2 py-0.5 text-[0.6rem] font-semibold text-royal">
              Lớp {user.course}
            </p>
          )}
          {!user.isPaid && (
            <p className="mt-1 inline-block rounded bg-amber-50 px-2 py-0.5 text-[0.6rem] font-semibold text-amber-700">
              Chưa thanh toán
            </p>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[0.82rem] font-medium transition-colors ${
                  active ? "bg-royal/8 text-royal" : "text-muted hover:bg-cream hover:text-royal"
                }`}>
                <item.icon size={17} />{item.label}{item.href === "/thong-bao" && unread > 0 && (<span className="ml-auto min-w-[18px] rounded-full bg-red-500 px-1.5 text-center text-[0.6rem] font-bold leading-[18px] text-white">{unread}</span>)}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-silver/20 px-3 py-3">
          <button onClick={logout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[0.82rem] font-medium text-muted hover:bg-red-50 hover:text-red-600">
            <LogOut size={17} />Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 print:p-0">{children}</main>
    </div>
  );
}