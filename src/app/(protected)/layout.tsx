// FILE: src/app/(protected)/layout.tsx — Sidebar + Auth guard Student
"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, BookOpen, ClipboardList, Bell, UserCircle, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
  { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/de-thi", label: "Làm bài thi", icon: BookOpen },
  { href: "/lich-su", label: "Lịch sử thi", icon: ClipboardList },
  { href: "/thong-bao", label: "Thông báo", icon: Bell },
  { href: "/ho-so", label: "Hồ sơ", icon: UserCircle },
];

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname() || "";
  const router = useRouter();

  useEffect(() => { if (!loading && !user) router.replace("/dang-nhap"); }, [loading, user, router]);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-cream"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" /></div>;
  if (!user) return null;

  // Nếu đang ở trang làm bài → full screen, không hiện sidebar
  if (pathname.startsWith("/lam-bai/")) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="sticky top-0 flex h-screen w-[220px] shrink-0 flex-col border-r border-silver/30 bg-white">
        <div className="border-b border-silver/20 px-5 py-5">
          <p className="text-xl font-bold text-royal">VESTA</p>
          <p className="text-[0.6rem] font-semibold uppercase tracking-widest text-muted">Student Portal</p>
        </div>
        <div className="border-b border-silver/20 px-5 py-3">
          <p className="truncate text-sm font-semibold text-[#1a1a2e]">{user.fullName}</p>
          <p className="truncate text-[0.65rem] font-mono text-gold">{user.studentCode}</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[0.82rem] font-medium transition-colors ${active ? "bg-royal/8 text-royal" : "text-muted hover:bg-cream hover:text-royal"}`}>
                <item.icon size={17} />{item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-silver/20 px-3 py-3">
          <button onClick={logout} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[0.82rem] font-medium text-muted hover:bg-red-50 hover:text-red-600">
            <LogOut size={17} />Đăng xuất
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}