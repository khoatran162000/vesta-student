// FILE: src/app/(protected)/bai-tap/[id]/page.tsx — HV làm bài tập (lưu điểm)
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle2, XCircle, Send, RotateCcw, Trophy } from "lucide-react";
import { api } from "@/lib/api";

export default function DoExercisePage() {
  const { id } = useParams();
  const router = useRouter();
  const [exercise, setExercise] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    api.get(`/interactive/${id}`).then((res) => {
      if (res.success) setExercise(res.data);
    }).finally(() => setLoading(false));
  }, [id]);

  function setAnswer(qId: string, value: any) {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    const res = await api.post(`/interactive/${id}/submit`, { answers });
    setSubmitting(false);
    if (res.success) {
      setResult(res.data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      alert(res.message || "Lỗi nộp bài");
    }
  }

  function handleRetry() {
    setAnswers({});
    setResult(null);
  }

  if (loading)
    return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-gold" /></div>;

  if (!exercise)
    return (
      <div className="mx-auto max-w-[700px] py-20 text-center">
        <p className="text-muted">Không tìm thấy bài tập.</p>
        <Link href="/bai-tap" className="btn-primary mt-4 inline-flex">← Quay lại</Link>
      </div>
    );

  const questions = Array.isArray(exercise.questions) ? exercise.questions : [];
  const allAnswered = questions.every((q: any) => answers[q.id] !== undefined && answers[q.id] !== "");

  return (
    <div className="mx-auto max-w-[760px]">
      <Link href="/bai-tap" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-royal">
        <ArrowLeft size={15} />Quay lại danh sách
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-royal">{exercise.title}</h1>
        {exercise.description && <p className="mt-1 text-sm text-muted">{exercise.description}</p>}
        <p className="mt-1 text-xs text-muted">{questions.length} câu hỏi</p>
      </div>

      {/* Kết quả sau khi nộp */}
      {result && (
        <div className="card mb-6 bg-gradient-to-br from-gold/10 to-amber-50 text-center">
          <Trophy size={36} className="mx-auto mb-2 text-gold" />
          <p className="text-3xl font-bold text-royal">{result.score}%</p>
          <p className="text-sm text-muted">Đúng {result.correct}/{result.total} câu — điểm đã được lưu</p>
          <button onClick={handleRetry} className="btn-secondary mt-4">
            <RotateCcw size={14} />Làm lại
          </button>
        </div>
      )}

      {/* Câu hỏi */}
      <div className="space-y-4">
        {questions.map((q: any, i: number) => {
          // Sau khi nộp: lấy chi tiết đúng/sai từ result
          const detail = result?.detail?.find((d: any) => d.id === q.id);
          return (
            <div key={q.id} className="card">
              <div className="mb-3 flex items-start gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-royal/8 text-xs font-bold text-royal">{i + 1}</span>
                <p className="flex-1 font-medium text-[#1a1a2e]">{q.content}</p>
                {detail && (detail.isCorrect
                  ? <CheckCircle2 size={20} className="shrink-0 text-green-500" />
                  : <XCircle size={20} className="shrink-0 text-red-500" />)}
              </div>

              {/* QUIZ / VOCAB — chọn đáp án A/B/C/D */}
              {(exercise.type === "QUIZ" || exercise.type === "VOCAB_CHECK") && Array.isArray(q.options) && (
                <div className="space-y-2 pl-8">
                  {q.options.map((opt: string, j: number) => {
                    const letter = String.fromCharCode(65 + j);
                    const selected = answers[q.id] === letter;
                    const isCorrectAns = detail && detail.correctAnswer === letter;
                    const isWrongPick = detail && selected && !detail.isCorrect;
                    return (
                      <button key={j} disabled={!!result}
                        onClick={() => setAnswer(q.id, letter)}
                        className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                          isCorrectAns ? "border-green-400 bg-green-50" :
                          isWrongPick ? "border-red-400 bg-red-50" :
                          selected ? "border-gold bg-gold/10" :
                          "border-silver/30 hover:border-gold/50"
                        } ${result ? "cursor-default" : ""}`}>
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          selected || isCorrectAns ? "bg-royal text-white" : "bg-cream text-muted"
                        }`}>{letter}</span>
                        <span className="text-[#1a1a2e]">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* FILL_BLANK — nhập text */}
              {exercise.type === "FILL_BLANK" && (
                <div className="pl-8">
                  <input type="text" disabled={!!result} value={answers[q.id] || ""}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                    placeholder="Nhập đáp án..."
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${
                      detail ? (detail.isCorrect ? "border-green-400 bg-green-50" : "border-red-400 bg-red-50") : "border-silver/40 focus:border-gold"
                    }`} />
                  {detail && !detail.isCorrect && (
                    <p className="mt-1 text-xs text-green-600">Đáp án đúng: <strong>{String(detail.correctAnswer)}</strong></p>
                  )}
                </div>
              )}

              {/* Giải thích sau khi nộp */}
              {detail?.explanation && (
                <div className="mt-3 ml-8 rounded-lg bg-cream/60 px-3 py-2 text-xs text-muted">
                  💡 {detail.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Nút nộp */}
      {!result && (
        <button onClick={handleSubmit} disabled={submitting || !allAnswered}
          className="btn-primary mt-6 w-full justify-center py-3.5 disabled:opacity-60">
          {submitting ? <><Loader2 size={16} className="animate-spin" />Đang nộp...</> : <><Send size={16} />Nộp bài ({Object.keys(answers).length}/{questions.length})</>}
        </button>
      )}
    </div>
  );
}
