// FILE: src/app/(protected)/dashboard/page.tsx — GHI ĐÈ
// Thêm phân biệt paid/unpaid + quick links đến các tab mới
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen, Target, Trophy, Bell,
  TrendingUp, NotebookPen, FileText, MessageSquareText,
  PlayCircle, CalendarDays, ArrowRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/student/dashboard").then((res) => { if (res.success) setData(res.data); }).finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
      </div>
    );

  const stats = data?.stats || {};
  const chart = data?.chartData || [];
  const maxScore = Math.max(...chart.map((c: any) => c.totalScore || 10), 10);
  const isPaid = user?.isPaid;

  // Quick links theo paid/unpaid
  const paidLinks = [
    { href: "/lo-trinh", label: "Lộ trình", icon: TrendingUp, color: "bg-blue-50 text-blue-600", desc: "15 tuần học theo lớp" },
    { href: "/ki-nang", label: "Tích lũy kĩ năng", icon: Target, color: "bg-purple-50 text-purple-600", desc: "Reading, Listening, Writing, Speaking" },
    { href: "/nhat-ky", label: "Nhật ký buổi học", icon: NotebookPen, color: "bg-amber-50 text-amber-600", desc: "Nội dung từng buổi + BTVN" },
    { href: "/tai-lieu", label: "Tài liệu", icon: FileText, color: "bg-green-50 text-green-600", desc: "Slide, Padlet, video" },
    { href: "/vo-ghi", label: "Vở ghi & Phản hồi", icon: MessageSquareText, color: "bg-pink-50 text-pink-600", desc: "Nộp bài, nhận chấm của GV" },
  ];
  const unpaidLinks = [
    { href: "/hoc-thu", label: "Học thử", icon: PlayCircle, color: "bg-blue-50 text-blue-600", desc: "Trải nghiệm bài giảng demo" },
    { href: "/lich-khai-giang", label: "Lịch khai giảng", icon: CalendarDays, color: "bg-amber-50 text-amber-600", desc: "Xem các lớp sắp mở" },
  ];
  const links = isPaid ? paidLinks : unpaidLinks;

  return (
    <div className="mx-auto max-w-[900px]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-royal">Xin chào, {user?.fullName?.split(" ").slice(-1)[0] || "bạn"}!</h1>
          {isPaid ? (
            <p className="mt-1 text-sm text-muted">Bạn đang trong khoá <strong className="text-royal">{user?.course || "—"}</strong> — chúc bạn học tốt</p>
          ) : (
            <p className="mt-1 text-sm text-amber-700">⏳ Đang chờ xác nhận thanh toán. Bạn có thể trải nghiệm bài học thử bên dưới.</p>
          )}
        </div>
        <Link href="/thong-bao" className="relative rounded-lg p-2 text-muted hover:bg-cream-dark hover:text-royal">
          <Bell size={20} />
          {data?.unreadNotifications > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[0.55rem] font-bold text-white">
              {data.unreadNotifications}
            </span>
          )}
        </Link>
      </div>

      {/* Stats — chỉ hiện cho học viên đã có dữ liệu thi */}
      {(stats.submittedAttempts > 0 || stats.totalAttempts > 0) && (
        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="card flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><BookOpen size={20} /></div>
            <div><p className="text-2xl font-bold text-[#1a1a2e]">{stats.submittedAttempts || 0}</p><p className="text-xs text-muted">Bài đã nộp</p></div>
          </div>
          <div className="card flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><Trophy size={20} /></div>
            <div><p className="text-2xl font-bold text-[#1a1a2e]">{stats.averageScore ?? "—"}</p><p className="text-xs text-muted">Điểm TB</p></div>
          </div>
          <div className="card flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600"><Target size={20} /></div>
            <div><p className="text-2xl font-bold text-[#1a1a2e]">{stats.totalAttempts || 0}</p><p className="text-xs text-muted">Tổng lượt thi</p></div>
          </div>
        </div>
      )}

      {/* Quick links — paid/unpaid */}
      <h2 className="mb-3 text-base font-bold text-royal">
        {isPaid ? "📚 Khoá học của bạn" : "🎁 Bắt đầu với VESTA"}
      </h2>
      <div className={`mb-8 grid gap-3 ${isPaid ? "sm:grid-cols-2" : "sm:grid-cols-2"}`}>
        {links.map((l) => (
          <Link key={l.href} href={l.href}
            className="group flex items-center gap-4 rounded-xl border border-silver/30 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${l.color}`}>
              <l.icon size={22} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[#1a1a2e]">{l.label}</p>
              <p className="text-xs text-muted">{l.desc}</p>
            </div>
            <ArrowRight size={16} className="text-muted opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        ))}
      </div>

      {/* Chart — chỉ paid + có dữ liệu */}
      {isPaid && chart.length > 0 && (
        <div className="card mb-8">
          <h2 className="mb-4 text-lg font-bold text-royal">Biểu đồ tiến độ</h2>
          <div className="relative h-[200px]">
            <svg viewBox={`0 0 ${chart.length * 80 + 40} 200`} className="w-full h-full" preserveAspectRatio="none">
              {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
                <line key={pct} x1="30" y1={20 + (1 - pct) * 160} x2={chart.length * 80 + 20} y2={20 + (1 - pct) * 160}
                  stroke="#e5e7eb" strokeWidth="1" />
              ))}
              <polyline fill="none" stroke="#C9A84C" strokeWidth="2.5" strokeLinejoin="round"
                points={chart.map((c: any, i: number) => {
                  const x = 40 + i * 80;
                  const y = 20 + (1 - (c.score || 0) / maxScore) * 160;
                  return `${x},${y}`;
                }).join(" ")} />
              {chart.map((c: any, i: number) => {
                const x = 40 + i * 80;
                const y = 20 + (1 - (c.score || 0) / maxScore) * 160;
                return <circle key={i} cx={x} cy={y} r="4" fill="#C9A84C" stroke="white" strokeWidth="2" />;
              })}
              {chart.map((c: any, i: number) => {
                const x = 40 + i * 80;
                return (
                  <text key={`label-${i}`} x={x} y="195" textAnchor="middle" fill="#5A6178" fontSize="9">
                    {c.score}/{c.totalScore}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="flex gap-4">
        <Link href="/de-thi" className="btn-primary flex-1 justify-center py-4 text-base">Làm bài thi →</Link>
        <Link href="/lich-su" className="btn-secondary flex-1 justify-center py-4 text-base">Xem lịch sử</Link>
      </div>
    </div>
  );
}