// FILE: src/app/(protected)/lich-khai-giang/page.tsx — Lịch khai giảng cho HV chưa thanh toán
"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Calendar, Clock, Users, MapPin, User as UserIcon, MessageCircle } from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  UPCOMING: { label: "Sắp khai giảng", color: "bg-blue-50 text-blue-700" },
  ONGOING: { label: "Đang học", color: "bg-green-50 text-green-700" },
  COMPLETED: { label: "Đã kết thúc", color: "bg-gray-100 text-gray-500" },
  CANCELLED: { label: "Đã huỷ", color: "bg-red-50 text-red-600" },
};

export default function ScheduleListPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "UPCOMING" | "ONGOING">("UPCOMING");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const res = await api.get("/schedule");
    if (res.success) setSchedules(res.data || []);
    setLoading(false);
  }

  const filtered = schedules.filter((s) => filter === "ALL" ? true : s.status === filter);

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-royal">Lịch khai giảng các lớp</h1>
        <p className="mt-1 text-sm text-muted">Chọn lớp phù hợp để liên hệ ghi danh</p>
      </div>

      {/* Filter */}
      <div className="mb-4 flex gap-2">
        {([
          { v: "UPCOMING", l: "Sắp khai giảng" },
          { v: "ONGOING", l: "Đang học" },
          { v: "ALL", l: "Tất cả" },
        ] as const).map((f) => (
          <button key={f.v} onClick={() => setFilter(f.v)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              filter === f.v ? "bg-royal text-white" : "bg-cream text-muted hover:bg-cream-dark"
            }`}>
            {f.l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" /></div>
      ) : filtered.length === 0 ? (
        <div className="card py-12 text-center text-sm text-muted">Chưa có lớp nào.</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((s) => {
            const status = STATUS_LABELS[s.status] || STATUS_LABELS.UPCOMING;
            const seatLeft = (s.maxStudents || 15) - (s.currentStudents || 0);
            return (
              <div key={s.id} className="card">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted">Khoá {s.course}</p>
                    <h3 className="text-base font-bold text-royal">{s.className}</h3>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${status.color}`}>{status.label}</span>
                </div>

                <div className="space-y-1.5 text-xs text-[#1a1a2e]">
                  <p className="flex items-center gap-2">
                    <Calendar size={13} className="text-muted" />
                    Khai giảng <strong>{new Date(s.startDate).toLocaleDateString("vi-VN")}</strong>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock size={13} className="text-muted" />
                    {s.schedule}
                  </p>
                  {s.teacher && (
                    <p className="flex items-center gap-2">
                      <UserIcon size={13} className="text-muted" />GV: {s.teacher}
                    </p>
                  )}
                  {s.room && (
                    <p className="flex items-center gap-2">
                      <MapPin size={13} className="text-muted" />{s.room}
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <Users size={13} className="text-muted" />
                    Còn <strong className={seatLeft <= 3 ? "text-red-600" : "text-green-600"}>{seatLeft}</strong> chỗ
                  </p>
                </div>

                <a href="https://www.facebook.com/vestauni" target="_blank" rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-1 rounded-lg bg-gold/15 py-2 text-xs font-semibold text-gold hover:bg-gold/25">
                  <MessageCircle size={12} />Liên hệ ghi danh
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}