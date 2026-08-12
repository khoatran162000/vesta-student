// FILE: src/app/(protected)/nhat-ky-diem-danh/page.tsx — Hub: Nhật ký buổi học + Điểm danh
"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { NotebookPen } from "lucide-react";
const Spin = () => <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" /></div>;
const NhatKy = dynamic(() => import("../nhat-ky/page"), { ssr: false, loading: Spin });
const DiemDanh = dynamic(() => import("../diem-danh/page"), { ssr: false, loading: Spin });
const TABS = [
  { id: "nhat-ky", label: "Nhật ký buổi học" },
  { id: "diem-danh", label: "Điểm danh" },
] as const;
export default function NhatKyDiemDanhHub() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("nhat-ky");
  return (
    <div className="mx-auto max-w-[960px]">
      <div className="mb-4 flex items-center gap-2 text-royal"><NotebookPen size={20} /><h1 className="text-xl font-bold">Nhật ký & Điểm danh</h1></div>
      <div className="mb-4 flex gap-1 rounded-xl border border-silver/30 bg-white p-1">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${tab === t.id ? "bg-royal text-white" : "text-muted hover:bg-cream-dark"}`}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "nhat-ky" ? <NhatKy /> : <DiemDanh />}
    </div>
  );
}
