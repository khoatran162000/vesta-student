// FILE: src/app/(protected)/layout.tsx — GHI ĐÈ
// Sidebar động: paid → 5 mục học + 4 mục gốc; unpaid → 2 mục học + 4 mục gốc
"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, BookOpen, ClipboardList, Bell, UserCircle, LogOut,
  TrendingUp, Target, NotebookPen, FileText, MessageSquareText,
  PlayCircle, CalendarDays, GraduationCap
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Mục chung cho mọi học viên
const BASE_NAV = [
  { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
];
const TAIL_NAV = [
  { href: "/de-thi", label: "Làm bài thi", icon: BookOpen },
  { href: "/lich-su", label: "Lịch sử thi", icon: ClipboardList },
  { href: "/thong-bao", label: "Thông báo", icon: Bell },
  { href: "/ho-so", label: "Hồ sơ", icon: UserCircle },
];

// Mục dành cho học viên ĐÃ thanh toán (5 tab)
const PAID_NAV = [
  { href: "/lo-trinh", label: "Lộ trình", icon: TrendingUp },
  { href: "/ki-nang", label: "Tích lũy kĩ năng", icon: Target },
  { href: "/nhat-ky", label: "Nhật ký buổi học", icon: NotebookPen },
  { href: "/tai-lieu", label: "Tài liệu", icon: FileText },
  { href: "/bai-tap", label: "Bài tập tương tác", icon: Target },
  { href: "/vo-ghi", label: "Vở ghi & Phản hồi", icon: MessageSquareText },
  { href: "/bao-cao", label: "Báo cáo định kỳ", icon: ClipboardList },
  { href: "/cuoi-khoa", label: "Kết quả cuối khóa", icon: GraduationCap },
];

// Mục dành cho học viên CHƯA thanh toán (2 tab)
const UNPAID_NAV = [
  { href: "/hoc-thu", label: "Học thử", icon: PlayCircle },
  { href: "/lich-khai-giang", label: "Lịch khai giảng", icon: CalendarDays },
];

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname() || "";
  const router = useRouter();

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
  const courseMenu = user.isPaid ? PAID_NAV : UNPAID_NAV;
  const NAV = [...BASE_NAV, ...courseMenu, ...TAIL_NAV];

  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="print:hidden sticky top-0 flex h-screen w-[220px] shrink-0 flex-col border-r border-silver/30 bg-white">
        <div className="border-b border-silver/20 px-5 py-5">
          <p className="text-xl font-bold text-royal">VESTA</p>
          <p className="text-[0.6rem] font-semibold uppercase tracking-widest text-muted">Student Portal</p>
        </div>

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
                <item.icon size={17} />{item.label}
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