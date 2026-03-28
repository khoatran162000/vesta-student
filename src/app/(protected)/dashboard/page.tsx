// FILE: src/app/(protected)/dashboard/page.tsx — Dashboard hoc vien
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Target, Trophy, Bell } from "lucide-react";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/student/dashboard").then((res) => { if (res.success) setData(res.data); }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" /></div>;

  const stats = data?.stats || {};
  const chart = data?.chartData || [];

  // Tính max score cho chart
  const maxScore = Math.max(...chart.map((c: any) => c.totalScore || 10), 10);

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-royal">Xin chào!</h1>
        <Link href="/thong-bao" className="relative rounded-lg p-2 text-muted hover:bg-cream-dark hover:text-royal">
          <Bell size={20} />
          {data?.unreadNotifications > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[0.55rem] font-bold text-white">{data.unreadNotifications}</span>
          )}
        </Link>
      </div>

      {/* Stats */}
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

      {/* Progress Chart */}
      <div className="card mb-8">
        <h2 className="mb-4 text-lg font-bold text-royal">Biểu đồ tiến độ</h2>
        {chart.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">Chưa có dữ liệu. Hãy làm bài thi đầu tiên!</p>
        ) : (
          <div className="relative h-[200px]">
            {/* Simple SVG line chart */}
            <svg viewBox={`0 0 ${chart.length * 80 + 40} 200`} className="w-full h-full" preserveAspectRatio="none">
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
                <line key={pct} x1="30" y1={20 + (1 - pct) * 160} x2={chart.length * 80 + 20} y2={20 + (1 - pct) * 160}
                  stroke="#e5e7eb" strokeWidth="1" />
              ))}
              {/* Line */}
              <polyline fill="none" stroke="#C9A84C" strokeWidth="2.5" strokeLinejoin="round"
                points={chart.map((c: any, i: number) => {
                  const x = 40 + i * 80;
                  const y = 20 + (1 - (c.score || 0) / maxScore) * 160;
                  return `${x},${y}`;
                }).join(" ")} />
              {/* Points */}
              {chart.map((c: any, i: number) => {
                const x = 40 + i * 80;
                const y = 20 + (1 - (c.score || 0) / maxScore) * 160;
                return <circle key={i} cx={x} cy={y} r="4" fill="#C9A84C" stroke="white" strokeWidth="2" />;
              })}
              {/* Labels */}
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
        )}
      </div>

      {/* Quick actions */}
      <div className="flex gap-4">
        <Link href="/de-thi" className="btn-primary flex-1 justify-center py-4 text-base">Làm bài thi →</Link>
        <Link href="/lich-su" className="btn-secondary flex-1 justify-center py-4 text-base">Xem lịch sử</Link>
      </div>
    </div>
  );
}