// FILE: src/app/(protected)/de-thi/page.tsx — Chon de thi
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Clock, Trophy, Play, Loader2, FolderOpen } from "lucide-react";
import { api } from "@/lib/api";

export default function ExamBrowserPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState<string | null>(null);

  useEffect(() => {
    api.get("/student/categories").then((res) => { if (res.success) setCategories(res.data); }).finally(() => setLoading(false));
    api.get("/student/exams").then((res) => { if (res.success) setExams(res.data); });
  }, []);

  function loadExams(catId: string) {
    setSelectedCat(catId);
    api.get(`/student/exams?categoryId=${catId}`).then((res) => { if (res.success) setExams(res.data); });
  }

  async function handleStart(examId: string) {
    setStarting(examId);
    try {
      const data = await api.post(`/student/exams/${examId}/start`);
      if (data.success) {
        // Lưu exam data vào sessionStorage để trang làm bài dùng
        sessionStorage.setItem("examSession", JSON.stringify(data.data));
        router.push(`/lam-bai/${data.data.attemptId}`);
      }
    } catch {} finally { setStarting(null); }
  }

  const filteredExams = selectedCat ? exams.filter((e) => e.categoryId === selectedCat) : exams;

  // Flatten categories for display
  function flatCats(cats: any[], depth = 0): { id: string; name: string; depth: number }[] {
    let result: any[] = [];
    for (const c of cats) {
      result.push({ id: c.id, name: c.name, depth });
      if (c.children?.length) result = result.concat(flatCats(c.children, depth + 1));
    }
    return result;
  }
  const flatCategories = flatCats(categories);

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-gold" /></div>;

  return (
    <div className="mx-auto max-w-[900px]">
      <h1 className="mb-6 text-2xl font-bold text-royal">Chọn bài thi</h1>

      {/* Category filter */}
      <div className="mb-5 flex flex-wrap gap-2">
        <button onClick={() => { setSelectedCat(""); api.get("/student/exams").then((r) => { if (r.success) setExams(r.data); }); }}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${!selectedCat ? "bg-royal text-white" : "bg-cream-dark text-muted hover:bg-royal/10"}`}>
          Tất cả
        </button>
        {flatCategories.map((c) => (
          <button key={c.id} onClick={() => loadExams(c.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${selectedCat === c.id ? "bg-royal text-white" : "bg-cream-dark text-muted hover:bg-royal/10"}`}>
            {"  ".repeat(c.depth)}{c.name}
          </button>
        ))}
      </div>

      {/* Exam list */}
      {filteredExams.length === 0 ? (
        <div className="card py-16 text-center">
          <FolderOpen size={40} className="mx-auto mb-3 text-silver" />
          <p className="text-muted">Chưa có đề thi nào trong danh mục này.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredExams.map((exam) => (
            <div key={exam.id} className="card flex flex-col justify-between">
              <div>
                <p className="text-xs text-gold font-semibold mb-1">{exam.category?.name}</p>
                <h3 className="text-base font-bold text-[#1a1a2e] mb-2">{exam.title}</h3>
                <div className="flex flex-wrap gap-3 text-xs text-muted mb-3">
                  <span className="flex items-center gap-1"><Clock size={12} />{exam.duration} phút</span>
                  <span className="flex items-center gap-1"><BookOpen size={12} />{exam._count?.questions || 0} câu</span>
                  <span className="flex items-center gap-1"><Trophy size={12} />{exam.totalScore} điểm</span>
                </div>
                {exam.attemptCount > 0 && (
                  <p className="text-xs text-muted">
                    Đã làm {exam.attemptCount} lần
                    {exam.bestScore !== null && <> · Điểm cao nhất: <strong className="text-green-600">{exam.bestScore}</strong></>}
                  </p>
                )}
              </div>
              <button onClick={() => handleStart(exam.id)} disabled={starting === exam.id}
                className="btn-primary mt-4 w-full justify-center">
                {starting === exam.id ? "Đang tải..." : <><Play size={14} />{exam.attemptCount > 0 ? "Làm lại" : "Bắt đầu"}</>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}