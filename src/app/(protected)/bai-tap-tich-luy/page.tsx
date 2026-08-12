// FILE: src/app/(protected)/bai-tap-tich-luy/page.tsx — Hub: Tích lũy kĩ năng + Bài tập tương tác
"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Target } from "lucide-react";
const Spin = () => <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" /></div>;
const KiNang = dynamic(() => import("../ki-nang/page"), { ssr: false, loading: Spin });
const BaiTap = dynamic(() => import("../bai-tap/page"), { ssr: false, loading: Spin });
const TABS = [
  { id: "ki-nang", label: "Tích lũy kĩ năng" },
  { id: "bai-tap", label: "Bài tập tương tác" },
] as const;
export default function BaiTapTichLuyHub() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("ki-nang");
  return (
    <div className="mx-auto max-w-[960px]">
      <div className="mb-4 flex items-center gap-2 text-royal"><Target size={20} /><h1 className="text-xl font-bold">Bài tập tích lũy</h1></div>
      <div className="mb-4 flex gap-1 rounded-xl border border-silver/30 bg-white p-1">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${tab === t.id ? "bg-royal text-white" : "text-muted hover:bg-cream-dark"}`}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "ki-nang" ? <KiNang /> : <BaiTap />}
    </div>
  );
}
