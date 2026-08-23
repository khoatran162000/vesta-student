// FILE: src/app/(protected)/lich-lam-bai/page.tsx — Lịch làm bài cho học viên (student portal)
"use client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import CalendarView, { CalData } from "@/components/calendar/CalendarView";
export default function LichLamBaiPage() {
  const [html, setHtml] = useState<string | null>(null);
  const [data, setData] = useState<CalData | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "empty">("loading");
  useEffect(() => {
    (async () => {
      // Ưu tiên bản HTML cả năm chị dán (calendar_html) → hiện nguyên trang qua iframe cách ly
      try {
        const h = await apiFetch("/site-content/calendar_html", { needsAuth: false });
        const htmlVal = h?.data?.data?.html;
        if (htmlVal && String(htmlVal).trim()) { setHtml(String(htmlVal)); setStatus("ok"); return; }
      } catch {}
      // Fallback: lịch có cấu trúc cũ (calendar_all) → CalendarView
      try {
        const json = await apiFetch("/site-content/calendar_all", { needsAuth: false });
        const d = json?.data?.data;
        if (d && Object.keys(d).length) { setData(d); setStatus("ok"); }
        else setStatus("empty");
      } catch { setStatus("empty"); }
    })();
  }, []);
  if (status === "loading") return <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-gold" /></div>;
  if (html) {
    return (
      <div className="-mx-4 -my-6 sm:-mx-6 lg:-mx-8">
        <iframe srcDoc={html} title="Lịch làm bài" sandbox="allow-scripts allow-popups" className="w-full border-0" style={{ height: "calc(100vh - 4rem)" }} />
      </div>
    );
  }
  if (status === "empty" || !data) return <div className="mx-auto max-w-[700px] py-20 text-center text-muted">Lịch làm bài đang được cập nhật.</div>;
  return (
    <div className="-mx-4 -my-6 sm:-mx-6 lg:-mx-8">
      <CalendarView data={data} />
    </div>
  );
}
