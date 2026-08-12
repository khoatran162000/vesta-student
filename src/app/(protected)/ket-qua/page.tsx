// FILE: src/app/(protected)/ket-qua/page.tsx — Hub: Báo cáo định kỳ + Điểm tích lũy + Kết quả cuối khóa
"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { GraduationCap } from "lucide-react";
const Spin = () => <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" /></div>;
const BaoCao = dynamic(() => import("../bao-cao/page"), { ssr: false, loading: Spin });
const LichSu = dynamic(() => import("../lich-su/page"), { ssr: false, loading: Spin });
const CuoiKhoa = dynamic(() => import("../cuoi-khoa/page"), { ssr: false, loading: Spin });
const TABS = [
  { id: "bao-cao", label: "Báo cáo định kỳ" },
  { id: "lich-su", label: "Điểm tích lũy" },
  { id: "cuoi-khoa", label: "Kết quả cuối khóa" },
] as const;
export default function KetQuaHub() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("bao-cao");
  return (
    <div className="mx-auto max-w-[960px]">
      <div className="mb-4 flex items-center gap-2 text-royal"><GraduationCap size={20} /><h1 className="text-xl font-bold">Kết quả định kỳ & cuối khóa</h1></div>
      <div className="mb-4 flex gap-1 rounded-xl border border-silver/30 bg-white p-1">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${tab === t.id ? "bg-royal text-white" : "text-muted hover:bg-cream-dark"}`}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "bao-cao" ? <BaoCao /> : tab === "lich-su" ? <LichSu /> : <CuoiKhoa />}
    </div>
  );
}
