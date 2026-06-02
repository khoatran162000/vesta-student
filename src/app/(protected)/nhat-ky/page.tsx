// FILE: src/app/(protected)/nhat-ky/page.tsx — Nhật ký buổi học
"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Calendar, Clock, BookmarkCheck, Lock } from "lucide-react";
import Link from "next/link";

export default function DiaryPage() {
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
        <Link href="/dashboard" className="btn-primary mt-6 inline-flex">← Quay về Tổng quan</Link>
      </div>
    );

  // Sắp xếp theo session tăng dần
  const sorted = [...diaries].sort((a, b) => a.session - b.session);

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-royal">Nhật ký buổi học</h1>
        <p className="mt-1 text-sm text-muted">Lớp {user.course} · {diaries.length} buổi</p>
      </div>

      {sorted.length === 0 ? (
        <div className="card py-12 text-center text-sm text-muted">Chưa có nhật ký buổi học nào.</div>
      ) : (
        <div className="space-y-3">
          {sorted.map((d) => (
            <div key={d.id} id={`session-${d.session}`} className="card">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-royal text-white px-2.5 py-0.5 text-xs font-bold">Buổi {d.session}</span>
                  <span className="flex items-center gap-1 text-xs text-muted">
                    <Calendar size={12} />
                    {new Date(d.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                  </span>
                  {d.duration && (
                    <span className="flex items-center gap-1 text-xs text-muted">
                      <Clock size={12} />{d.duration}
                    </span>
                  )}
                </div>
                {d.creator && <span className="text-[0.65rem] text-muted">GV: {d.creator.fullName}</span>}
              </div>
              <p className="text-sm leading-relaxed text-[#1a1a2e]">{d.topic}</p>
              {d.homework && (
                <div className="mt-3 flex gap-2 rounded-lg bg-amber-50 px-3 py-2">
                  <BookmarkCheck size={16} className="mt-0.5 shrink-0 text-amber-600" />
                  <div>
                    <p className="text-[0.65rem] font-bold uppercase tracking-wider text-amber-700">BTVN</p>
                    <p className="text-xs text-amber-900">{d.homework}</p>
                  </div>
                </div>
              )}
              {d.teacherNote && (
                <div className="mt-2 rounded-lg bg-cream/60 px-3 py-2 text-xs italic text-muted">
                  💬 {d.teacherNote}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}