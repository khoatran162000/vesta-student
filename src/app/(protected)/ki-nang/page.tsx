// FILE: src/app/(protected)/ki-nang/page.tsx — Tích lũy kĩ năng
"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { BookOpen, Headphones, PenTool, Mic, Lock, TrendingUp } from "lucide-react";
import Link from "next/link";

const SKILLS = [
  { key: "reading", label: "Reading", icon: BookOpen, color: "bg-blue-50 text-blue-600", borderColor: "border-blue-200" },
  { key: "listening", label: "Listening", icon: Headphones, color: "bg-purple-50 text-purple-600", borderColor: "border-purple-200" },
  { key: "writing", label: "Writing", icon: PenTool, color: "bg-amber-50 text-amber-600", borderColor: "border-amber-200" },
  { key: "speaking", label: "Speaking", icon: Mic, color: "bg-pink-50 text-pink-600", borderColor: "border-pink-200" },
];

export default function SkillsPage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/student/dashboard").then((res) => { if (res.success) setStats(res.data?.stats || {}); })
      .finally(() => setLoading(false));
  }, []);

  if (authLoading || loading)
    return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" /></div>;

  if (!user?.isPaid)
    return (
      <div className="mx-auto max-w-[700px] py-20 text-center">
        <Lock size={48} className="mx-auto mb-4 text-amber-600" />
        <h2 className="text-xl font-bold text-royal">Tính năng dành cho học viên đã ghi danh</h2>
        <p className="mt-2 text-sm text-muted">Vui lòng hoàn tất thanh toán để theo dõi tiến độ 4 kĩ năng.</p>
        <Link href="/dashboard" className="btn-primary mt-6 inline-flex">← Quay về Tổng quan</Link>
      </div>
    );

  const overallAvg = stats.averageScore ?? null;
  const totalAttempts = stats.totalAttempts || 0;

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-royal">Tích lũy kĩ năng</h1>
        <p className="mt-1 text-sm text-muted">Theo dõi tiến độ 4 kĩ năng IELTS qua các bài luyện đã làm</p>
      </div>

      {/* Overall */}
      <div className="card mb-6 flex items-center gap-4 bg-gradient-to-br from-gold/10 to-amber-50">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/20 text-gold">
          <TrendingUp size={28} />
        </div>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wider text-muted">Điểm trung bình chung</p>
          <p className="text-3xl font-bold text-royal">{overallAvg ?? "—"}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wider text-muted">Tổng lượt luyện</p>
          <p className="text-2xl font-bold text-[#1a1a2e]">{totalAttempts}</p>
        </div>
      </div>

      {/* 4 skills */}
      <div className="grid gap-4 sm:grid-cols-2">
        {SKILLS.map((s) => {
          const skillStats = stats[s.key] || {};
          const count = skillStats.count || 0;
          const avg = skillStats.average ?? null;
          const best = skillStats.best ?? null;
          return (
            <div key={s.key} className={`card border-2 ${s.borderColor}`}>
              <div className="mb-3 flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}><s.icon size={20} /></div>
                <div>
                  <h3 className="text-base font-bold text-royal">{s.label}</h3>
                  <p className="text-xs text-muted">{count} bài đã làm</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg bg-cream/60 p-2">
                  <p className="text-[0.65rem] uppercase text-muted">Điểm TB</p>
                  <p className="text-lg font-bold text-[#1a1a2e]">{avg ?? "—"}</p>
                </div>
                <div className="rounded-lg bg-cream/60 p-2">
                  <p className="text-[0.65rem] uppercase text-muted">Cao nhất</p>
                  <p className="text-lg font-bold text-gold">{best ?? "—"}</p>
                </div>
              </div>
              <Link href={`/de-thi?skill=${s.key}`} className="mt-3 block rounded-lg bg-royal/8 py-2 text-center text-xs font-semibold text-royal hover:bg-royal/15">
                Luyện thêm →
              </Link>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-muted">
        💡 Dữ liệu chi tiết theo kĩ năng phụ thuộc vào việc đề thi được gắn category. Nếu chưa thấy đủ, hãy nhờ giáo viên gán category cho bài thi.
      </p>
    </div>
  );
}