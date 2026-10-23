// FILE: src/app/(protected)/de-thi/[examId]/page.tsx — Mo thang 1 de thi theo link (gui HS)
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Clock, Trophy, Play, Loader2, ArrowLeft, Pencil } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

const ADMIN_URL = "https://admin.vestaedu.online";

export default function ExamStartPage() {
  const params = useParams();
  const examId = String(params.examId || "");
  const router = useRouter();
  const { user } = useAuth();
  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let done = false;
    api.get("/student/exams")
      .then((res) => {
        if (done) return;
        if (res.success) {
          const found = (res.data || []).find((e: any) => e.id === examId);
          if (found) setExam(found);
          else setErr("Không tìm thấy đề thi này hoặc bạn chưa có quyền làm.");
        } else setErr(res.message || "Không tải được đề thi.");
      })
      .catch(() => setErr("Không tải được đề thi."))
      .finally(() => { if (!done) setLoading(false); });
    return () => { done = true; };
  }, [examId]);

  async function handleStart() {
    setStarting(true);
    try {
      const data = await api.post(`/student/exams/${examId}/start`);
      if (data.success) {
        sessionStorage.setItem("examSession", JSON.stringify(data.data));
        router.push(`/lam-bai/${data.data.attemptId}`);
      } else { setErr(data.message || "Không bắt đầu được."); setStarting(false); }
    } catch { setErr("Không bắt đầu được."); setStarting(false); }
  }

  const isStaff = user?.role === "ADMIN" || user?.role === "TEACHER";

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-gold" /></div>;

  return (
    <div className="mx-auto max-w-[600px]">
      <Link href="/de-thi" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-royal"><ArrowLeft size={15} />Tất cả đề thi</Link>
      {err ? (
        <div className="card py-16 text-center">
          <p className="text-muted">{err}</p>
          <Link href="/de-thi" className="btn-primary mt-4 inline-flex">Về danh sách đề</Link>
        </div>
      ) : (
        <div className="card text-center">
          <p className="mb-1 text-xs font-semibold text-gold">{exam?.category?.name}</p>
          <h1 className="text-2xl font-bold text-royal">{exam?.title}</h1>
          <div className="my-5 flex flex-wrap justify-center gap-3 text-sm text-muted">
            <span className="flex items-center gap-1"><Clock size={14} />{exam?.duration} phút</span>
            <span className="flex items-center gap-1"><BookOpen size={14} />{exam?._count?.questions || 0} câu</span>
            <span className="flex items-center gap-1"><Trophy size={14} />{exam?.totalScore} điểm</span>
          </div>
          {exam?.attemptCount > 0 && (
            <p className="mb-4 text-xs text-muted">Đã làm {exam.attemptCount} lần{exam.bestScore != null && <> · Điểm cao nhất: <strong className="text-green-600">{exam.bestScore}</strong></>}</p>
          )}
          <button onClick={handleStart} disabled={starting} className="btn-primary w-full justify-center">
            {starting ? "Đang tải..." : <><Play size={15} />{exam?.attemptCount > 0 ? "Làm lại" : "Bắt đầu làm đề"}</>}
          </button>
        </div>
      )}
      {isStaff && (
        <a href={`${ADMIN_URL}/ngan-hang-de/de-thi/${examId}`} target="_blank" rel="noopener noreferrer" className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-1.5 rounded-full bg-royal px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-royal/90"><Pencil size={15} />Sửa đề (admin)</a>
      )}
    </div>
  );
}
