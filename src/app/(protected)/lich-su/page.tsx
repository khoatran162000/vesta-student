// FILE: src/app/(protected)/lich-su/page.tsx — Điểm Tích Lũy (báo cáo GV + điểm hệ thống)
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, Loader2, FileText, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";

type SysRow = {
  id: string;
  title: string;
  kind: "exam" | "exercise";
  score: number | null;
  totalScore: number | null;
  isGraded: boolean;
  createdAt: string;
  reviewHref?: string;   // chỉ đề thi mới xem lại được
};

export default function DiemTichLuyPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [rows, setRows] = useState<SysRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [repRes, examRes, exRes] = await Promise.all([
          api.get("/reports/my"),
          api.get("/student/history"),
          api.get("/interactive/my/attempts"),
        ]);
        if (repRes.success) setReports(repRes.data || []);

        const examRows: SysRow[] = (examRes.success ? (examRes.data || []) : []).map((a: any) => ({
          id: a.id,
          title: a.exam?.title || "Đề thi",
          kind: "exam" as const,
          score: a.score ?? null,
          totalScore: a.exam?.totalScore ?? null,
          isGraded: a.isGraded !== false,
          createdAt: a.createdAt,
          reviewHref: a.status === "SUBMITTED" ? `/lich-su/${a.id}` : undefined,
        }));

        const exRows: SysRow[] = (exRes.success ? (exRes.data || []) : []).map((a: any) => ({
          id: a.id,
          title: a.exercise?.title || "Bài tập",
          kind: "exercise" as const,
          score: a.score ?? null,
          totalScore: a.totalScore ?? null,
          isGraded: a.isGraded !== false,
          createdAt: a.createdAt,
        }));

        const merged = [...examRows, ...exRows].sort(
          (x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime()
        );
        setRows(merged);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function fmtDate(d: string | null) {
    if (!d) return "—";
    try { return new Date(d).toLocaleDateString("vi-VN"); } catch { return "—"; }
  }
  function scoreColor(score: number | null, total: number | null) {
    if (score === null || total === null || total === 0) return "text-muted";
    const p = score / total;
    return p >= 0.7 ? "text-green-600" : p >= 0.5 ? "text-amber-600" : "text-red-500";
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-gold" /></div>;

  return (
    <div className="mx-auto max-w-[860px] space-y-8">
      <h1 className="text-2xl font-bold text-royal">Điểm Tích Lũy</h1>

      {/* ─── Phần 1: Báo cáo định kỳ từ giáo viên ─── */}
      <section>
        <h2 className="mb-3 text-lg font-bold text-royal">Báo cáo định kỳ từ giáo viên</h2>
        {reports.length === 0 ? (
          <div className="rounded-xl border border-silver/30 bg-white py-10 text-center text-sm text-muted">
            Chưa có báo cáo nào được công bố.
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <Link key={r.id} href={`/bao-cao/${r.id}`}
                className="flex items-center justify-between rounded-xl border border-silver/30 bg-white p-4 transition-colors hover:border-gold/50 hover:bg-cream/40">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-maroon/10">
                    <FileText size={18} className="text-maroon" />
                  </div>
                  <div>
                    <div className="font-bold text-[#1a1a2e]">Báo cáo {r.course || ""} — đến {fmtDate(r.periodTo)}</div>
                    <div className="text-xs text-muted">Dữ liệu: {fmtDate(r.dataFrom)} – {fmtDate(r.dataTo)}</div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-muted" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ─── Phần 2: Điểm các bài đã làm trên hệ thống ─── */}
      <section>
        <h2 className="mb-3 text-lg font-bold text-royal">Điểm các bài đã làm</h2>
        <div className="card !p-0 overflow-hidden">
          {rows.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-muted">Chưa có bài nào được làm.</p>
              <Link href="/de-thi" className="mt-3 inline-block text-sm font-semibold text-gold hover:underline">Bắt đầu luyện →</Link>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b border-silver/20 bg-cream">
                <th className="px-5 py-3 font-semibold text-royal">Tên bài</th>
                <th className="px-5 py-3 font-semibold text-royal">Loại</th>
                <th className="px-5 py-3 font-semibold text-royal">Điểm</th>
                <th className="px-5 py-3 font-semibold text-royal">Ngày</th>
                <th className="px-5 py-3 text-right font-semibold text-royal"></th>
              </tr></thead>
              <tbody>{rows.map((r) => (
                <tr key={`${r.kind}-${r.id}`} className="border-b border-silver/10 hover:bg-cream/50">
                  <td className="px-5 py-3 font-medium text-[#1a1a2e]">
                    {r.title}
                    {!r.isGraded && <span className="ml-2 rounded bg-amber-50 px-1.5 py-0.5 text-[0.6rem] font-semibold text-amber-700">ôn tập</span>}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${r.kind === "exam" ? "bg-royal/10 text-royal" : "bg-purple-50 text-purple-700"}`}>
                      {r.kind === "exam" ? "Đề thi" : "Bài tập"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {r.score !== null ? (
                      <span className={`font-semibold ${scoreColor(r.score, r.totalScore)}`}>
                        {r.score}{r.totalScore !== null ? `/${r.totalScore}` : ""}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-5 py-3 text-muted">{fmtDate(r.createdAt)}</td>
                  <td className="px-5 py-3 text-right">
                    {r.reviewHref && (
                      <Link href={r.reviewHref} className="btn-secondary text-xs"><Eye size={13} />Xem lại</Link>
                    )}
                  </td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}