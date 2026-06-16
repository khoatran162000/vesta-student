// FILE: src/app/(protected)/bao-cao/page.tsx — Student: danh sách báo cáo định kỳ
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, FileText, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";

export default function MyReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await api.get("/reports/my");
      if (data.success) setReports(data.data || []);
      setLoading(false);
    })();
  }, []);

  function fmtDate(d: string | null) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("vi-VN");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 text-2xl font-bold text-royal">Báo cáo định kỳ</h1>
      <p className="mb-6 text-sm text-muted">Báo cáo tiến độ học tập hàng tuần của bạn</p>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-gold" /></div>
      ) : reports.length === 0 ? (
        <div className="rounded-xl border border-silver/30 bg-white py-16 text-center text-sm text-muted">
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
    </div>
  );
}
