// FILE: src/app/(protected)/lo-trinh/page.tsx — Lộ trình học 15 tuần
"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { CheckCircle2, Circle, Lock } from "lucide-react";
import Link from "next/link";

export default function RoadmapPage() {
  const { user, loading: authLoading } = useAuth();
  const [diaries, setDiaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.course) { setLoading(false); return; }
    api.get(`/class/diaries?course=${encodeURIComponent(user.course)}&limit=200`)
      .then((res) => { if (res.success) setDiaries(res.data || []); })
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || loading)
    return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" /></div>;

  if (!user?.isPaid)
    return (
      <div className="mx-auto max-w-[700px] py-20 text-center">
        <Lock size={48} className="mx-auto mb-4 text-amber-600" />
        <h2 className="text-xl font-bold text-royal">Tính năng dành cho học viên đã ghi danh</h2>
        <p className="mt-2 text-sm text-muted">Vui lòng hoàn tất thanh toán để xem lộ trình học 15 tuần.</p>
        <Link href="/dashboard" className="btn-primary mt-6 inline-flex">← Quay về Tổng quan</Link>
      </div>
    );

  // Nhóm 20 buổi thành các tuần (mỗi tuần ~ 2 buổi)
  const totalSessions = diaries.length;
  const sessionsByWeek: Record<number, any[]> = {};
  diaries.sort((a, b) => a.session - b.session).forEach((d) => {
    const week = Math.ceil(d.session / 2);
    if (!sessionsByWeek[week]) sessionsByWeek[week] = [];
    sessionsByWeek[week].push(d);
  });

  // Tuần hiện tại = tuần có buổi gần ngày hôm nay nhất
  const today = new Date();
  let currentWeek = 1;
  for (const d of diaries) {
    if (new Date(d.date) <= today) currentWeek = Math.ceil(d.session / 2);
  }
  const totalWeeks = Math.max(15, Object.keys(sessionsByWeek).length);

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-royal">Lộ trình học — Lớp {user.course}</h1>
        <p className="mt-1 text-sm text-muted">{totalSessions} buổi đã được lên kế hoạch · Tuần {currentWeek}/{totalWeeks}</p>
      </div>

      {/* Progress bar */}
      <div className="card mb-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted">Tiến độ tổng thể</span>
          <span className="font-semibold text-royal">{Math.round((currentWeek / totalWeeks) * 100)}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-cream">
          <div className="h-full rounded-full bg-gradient-to-r from-gold to-amber-500 transition-all"
            style={{ width: `${(currentWeek / totalWeeks) * 100}%` }} />
        </div>
      </div>

      {/* Weeks grid */}
      <div className="space-y-3">
        {Array.from({ length: totalWeeks }).map((_, i) => {
          const week = i + 1;
          const sessions = sessionsByWeek[week] || [];
          const isPast = week < currentWeek;
          const isCurrent = week === currentWeek;
          const isFuture = week > currentWeek;
          return (
            <div key={week} className={`card border-l-4 ${
              isPast ? "border-green-500" : isCurrent ? "border-gold" : "border-silver/30"
            }`}>
              <div className="flex items-center gap-3">
                {isPast ? <CheckCircle2 size={20} className="text-green-500" /> :
                 isCurrent ? <Circle size={20} className="text-gold animate-pulse" /> :
                 <Circle size={20} className="text-silver" />}
                <h3 className="text-base font-bold text-royal">Tuần {week}</h3>
                {isCurrent && <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[0.65rem] font-semibold text-gold">Hiện tại</span>}
                {sessions.length === 0 && !isFuture && (
                  <span className="rounded-full bg-cream px-2 py-0.5 text-[0.65rem] text-muted">Chưa có buổi</span>
                )}
              </div>
              {sessions.length > 0 && (
                <div className="mt-3 space-y-2 pl-7">
                  {sessions.map((s) => (
                    <Link key={s.id} href={`/nhat-ky#session-${s.session}`}
                      className="block rounded-lg border border-silver/20 bg-cream/40 p-2.5 hover:bg-cream-dark">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-royal/8 px-1.5 py-0.5 text-[0.65rem] font-mono text-royal">B{s.session}</span>
                        <span className="text-xs text-muted">{new Date(s.date).toLocaleDateString("vi-VN")}</span>
                      </div>
                      <p className="mt-1 text-sm text-[#1a1a2e] line-clamp-1">{s.topic}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}