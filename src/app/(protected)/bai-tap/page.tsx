// FILE: src/app/(protected)/bai-tap/page.tsx — HV xem danh sách bài tập tương tác
"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Target, Play, CheckCircle2, Loader2, FileQuestion, ArrowDownAZ, Clock } from "lucide-react";
import { api } from "@/lib/api";

const TYPE_LABELS: Record<string, string> = {
  QUIZ: "Trắc nghiệm",
  FILL_BLANK: "Điền chỗ trống",
  MATCHING: "Nối câu",
  VOCAB_CHECK: "Từ vựng",
};

// Khối của một bài = gộp nhãn LV: (mô tả) + các lớp được tick (visibleTo khi CLASS)
function exKhoi(ex: any): string[] {
  const tags = new Set<string>();
  if (ex.level) tags.add(String(ex.level).trim());
  if (ex.visibility === "CLASS" && ex.visibleTo) {
    String(ex.visibleTo).split(",").map((s: string) => s.trim()).filter(Boolean).forEach((t: string) => tags.add(t));
  }
  return [...tags];
}

export default function StudentExercisesPage() {
  const [exercises, setExercises] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState("");
  const [q, setQ] = useState("");
  const [sortMode, setSortMode] = useState<"recent" | "az">("recent");

  useEffect(() => {
    async function load() {
      const [exRes, atRes] = await Promise.all([
        api.get("/interactive"),
        api.get("/interactive/my/attempts"),
      ]);
      if (exRes.success) setExercises(exRes.data.filter((e: any) => e.isPublished));
      if (atRes.success) setAttempts(atRes.data || []);
      setLoading(false);
    }
    load();
  }, []);

  const bestScores: Record<string, number> = {};
  attempts.forEach((a) => {
    if (a.score != null && (bestScores[a.exerciseId] == null || a.score > bestScores[a.exerciseId])) {
      bestScores[a.exerciseId] = a.score;
    }
  });

  const khoiList = useMemo(() => {
    const s = new Set<string>();
    exercises.forEach((e) => exKhoi(e).forEach((k) => s.add(k)));
    return [...s].sort((a, b) => a.localeCompare(b, "vi"));
  }, [exercises]);
  const hasUncat = exercises.some((e) => exKhoi(e).length === 0);

  const shown = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return exercises
      .filter((ex) => {
        const matchQ = !kw || String(ex.title).toLowerCase().includes(kw);
        if (kw) return matchQ;
        const khoi = exKhoi(ex);
        return !levelFilter || (levelFilter === "__uncat__" ? khoi.length === 0 : khoi.includes(levelFilter));
      })
      .sort((a, b) => sortMode === "az"
        ? String(a.title || "").localeCompare(String(b.title || ""), "vi")
        : new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime());
  }, [exercises, q, levelFilter, sortMode]);

  if (loading)
    return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-gold" /></div>;

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-royal">Bài tập tương tác</h1>
        <p className="mt-1 text-sm text-muted">Luyện tập Quiz, điền chỗ trống, từ vựng — có chấm điểm tự động</p>
      </div>

      {exercises.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm bài…" className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
          <button onClick={() => setLevelFilter("")} className={`rounded-full px-3 py-1 text-xs font-semibold ${!levelFilter ? "bg-[#1B2A5C] text-white" : "bg-gray-100 text-gray-600"}`}>Tất cả</button>
          {khoiList.map((lv) => (
            <button key={lv} onClick={() => setLevelFilter(lv)} className={`rounded-full px-3 py-1 text-xs font-semibold ${levelFilter === lv ? "bg-[#1B2A5C] text-white" : "bg-gray-100 text-gray-600"}`}>{lv}</button>
          ))}
          {hasUncat && (
            <button onClick={() => setLevelFilter("__uncat__")} className={`rounded-full px-3 py-1 text-xs font-semibold ${levelFilter === "__uncat__" ? "bg-[#1B2A5C] text-white" : "bg-gray-100 text-gray-600"}`}>Chưa phân loại</button>
          )}
          <span className="mx-1 h-4 w-px bg-gray-300" />
          <button onClick={() => setSortMode("recent")} className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${sortMode === "recent" ? "bg-[#1B2A5C] text-white" : "bg-gray-100 text-gray-600"}`}><Clock size={12} />Mới nhất</button>
          <button onClick={() => setSortMode("az")} className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${sortMode === "az" ? "bg-[#1B2A5C] text-white" : "bg-gray-100 text-gray-600"}`}><ArrowDownAZ size={12} />A-Z</button>
        </div>
      )}
      {exercises.length === 0 ? (
        <div className="card py-16 text-center">
          <FileQuestion size={40} className="mx-auto mb-3 text-silver" />
          <p className="text-sm text-muted">Chưa có bài tập nào dành cho bạn.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {shown.map((ex) => {
            const done = bestScores[ex.id] != null;
            return (
              <div key={ex.id} className="card flex flex-col justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                      <Target size={18} />
                    </div>
                    <span className="rounded-full bg-cream px-2 py-0.5 text-[0.65rem] font-semibold text-muted">
                      {TYPE_LABELS[ex.type] || ex.type}
                    </span>
                    {done && (
                      <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-green-600">
                        <CheckCircle2 size={13} />{bestScores[ex.id]}%
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-[#1a1a2e]">{ex.title}</h3>
                  {ex.description && <p className="mt-1 text-xs text-muted line-clamp-2">{ex.description}</p>}
                  <p className="mt-2 text-xs text-muted">{ex.questionCount || 0} câu hỏi</p>
                </div>
                <Link href={`/bai-tap/${ex.id}`} className="btn-primary mt-4 w-full justify-center">
                  <Play size={14} />{done ? "Làm lại" : "Bắt đầu"}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
