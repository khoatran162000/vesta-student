// FILE: src/app/(protected)/lich-lam-bai/page.tsx — Lịch làm bài cho học viên (student portal)
"use client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import CalendarView, { CalData } from "@/components/calendar/CalendarView";

export default function LichLamBaiPage() {
  const [data, setData] = useState<CalData | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "empty">("loading");
  useEffect(() => {
    (async () => {
      try {
        const json = await apiFetch("/site-content/calendar_all", { needsAuth: false });
        const d = json?.data?.data;
        if (d && Object.keys(d).length) { setData(d); setStatus("ok"); }
        else setStatus("empty");
      } catch { setStatus("empty"); }
    })();
  }, []);
  if (status === "loading") return <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-gold" /></div>;
  if (status === "empty" || !data) return <div className="mx-auto max-w-[700px] py-20 text-center text-muted">Lịch làm bài đang được cập nhật.</div>;
  return (
    <div className="-mx-4 -my-6 sm:-mx-6 lg:-mx-8">
      <CalendarView data={data} />
    </div>
  );
}
