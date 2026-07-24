// FILE: src/app/(protected)/diem-danh/page.tsx — HS xem lịch sử điểm danh của mình
"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Loader2, Check, Clock, XCircle, CalendarCheck } from "lucide-react";

interface AttRow {
  id: string;
  sessionDate: string;
  status: string;
  score: number | null;
  note: string | null;
  markedAt: string;
  class?: { name?: string; classCode?: string | null; course?: string | null };
}
const LABEL: Record<string, { text: string; cls: string; icon: any }> = {
  PRESENT: { text: "Có mặt", cls: "bg-green-50 text-green-700", icon: Check },
  LATE: { text: "Đi muộn", cls: "bg-amber-50 text-amber-700", icon: Clock },
  ABSENT: { text: "Vắng", cls: "bg-red-50 text-red-600", icon: XCircle },
};

export default function AttendancePage() {
  const [rows, setRows] = useState<AttRow[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/attendance/my")
      .then((res) => { if (res.success) { setRows(res.data || []); setStats(res.stats || null); } })
      .finally(() => setLoading(false));
  }, []);

  function fmtDate(d: string) {
    try { return new Date(d).toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" }); }
    catch { return d; }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-gold" /></div>;

  return (
    <div className="mx-auto max-w-[760px]">
      <h1 className="mb-1 text-2xl font-bold text-royal">Điểm danh</h1>
      <p className="mb-6 text-sm text-muted">Lịch sử đi học của bạn theo từng buổi</p>

      {/* Tổng kết */}
      {stats && stats.total > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="card text-center">
            <p className="text-2xl font-bold text-green-600">{stats.present}</p>
            <p className="text-xs text-muted">Có mặt</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-amber-600">{stats.late}</p>
            <p className="text-xs text-muted">Đi muộn</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-red-500">{stats.absent}</p>
            <p className="text-xs text-muted">Vắng</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-gold">{stats.rate != null ? `${stats.rate}%` : "—"}</p>
            <p className="text-xs text-muted">Tỉ lệ đi học</p>
          </div>
        </div>
      )}

      <div className="card !p-0 overflow-hidden">
        {rows.length === 0 ? (
          <div className="py-16 text-center">
            <CalendarCheck size={32} className="mx-auto mb-3 text-silver" />
            <p className="text-muted">Chưa có buổi học nào được điểm danh.</p>
          </div>
        ) : (
          <div className="divide-y divide-silver/10">
            {rows.map((r) => {
              const L = LABEL[r.status] || LABEL.ABSENT;
              const Icon = L.icon;
              return (
                <div key={r.id} className="flex items-start justify-between gap-3 px-5 py-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-royal">{fmtDate(r.sessionDate)}</p>
                    <p className="text-xs text-muted">
                      {r.class?.name || r.class?.classCode || r.class?.course || "Lớp học"}
                    </p>
                    {r.note && <p className="mt-1 text-xs text-muted">Ghi chú: {r.note}</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {r.score != null && (
                      <div className="text-right">
                        <p className="text-lg font-bold text-gold">{r.score}</p>
                        <p className="text-[0.6rem] text-muted">điểm buổi</p>
                      </div>
                    )}
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${L.cls}`}>
                      <Icon size={12} />{L.text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}