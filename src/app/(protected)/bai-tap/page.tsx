// FILE: src/app/(protected)/bai-tap/page.tsx — HV xem danh sách bài tập tương tác
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Target, Play, CheckCircle2, Loader2, FileQuestion } from "lucide-react";
import { api } from "@/lib/api";

const TYPE_LABELS: Record<string, string> = {
  QUIZ: "Trắc nghiệm",
  FILL_BLANK: "Điền chỗ trống",
  MATCHING: "Nối câu",
  VOCAB_CHECK: "Từ vựng",
};

export default function StudentExercisesPage() {
  const [exercises, setExercises] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Map exerciseId → điểm cao nhất đã đạt
  const bestScores: Record<string, number> = {};
  attempts.forEach((a) => {
    if (a.score != null && (bestScores[a.exerciseId] == null || a.score > bestScores[a.exerciseId])) {
      bestScores[a.exerciseId] = a.score;
    }
  });

  if (loading)
    return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-gold" /></div>;

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-royal">Bài tập tương tác</h1>
        <p className="mt-1 text-sm text-muted">Luyện tập Quiz, điền chỗ trống, từ vựng — có chấm điểm tự động</p>
      </div>

      {exercises.length === 0 ? (
        <div className="card py-16 text-center">
          <FileQuestion size={40} className="mx-auto mb-3 text-silver" />
          <p className="text-sm text-muted">Chưa có bài tập nào dành cho bạn.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {exercises.map((ex) => {
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
