// FILE: src/app/(protected)/lich-su/[attemptId]/page.tsx — Xem lai bai lam
"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, Minus, Loader2, FileText } from "lucide-react";
import { api, getImageUrl } from "@/lib/api";

const TYPE_LABELS: Record<string, string> = { MULTIPLE_CHOICE: "Trắc nghiệm", FILL_IN_BLANK: "Điền từ", MATCHING: "Nối câu", ESSAY: "Tự luận" };

export default function ReviewPage() {
  const params = useParams();
  const attemptId = params.attemptId as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/student/history/${attemptId}`).then((res) => { if (res.success) setData(res.data); }).finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-gold" /></div>;
  if (!data) return <p className="py-20 text-center text-muted">Không tìm thấy bài làm.</p>;

  const correct = data.questions.filter((q: any) => q.isCorrect === true).length;
  const wrong = data.questions.filter((q: any) => q.isCorrect === false).length;

  return (
    <div className="mx-auto max-w-[800px]">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/lich-su" className="rounded-lg p-2 text-muted hover:bg-cream-dark hover:text-royal"><ArrowLeft size={20} /></Link>
        <div>
          <h2 className="text-2xl font-bold text-royal">{data.exam.title}</h2>
          <p className="text-sm text-muted">Nộp lúc {new Date(data.endTime).toLocaleString("vi-VN")}</p>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-4 gap-3">
        <div className="card !py-3 text-center">
          <p className="text-2xl font-bold text-royal">{data.score ?? "—"}<span className="text-sm text-muted">/{data.exam.totalScore}</span></p>
          <p className="text-xs text-muted">Điểm</p>
        </div>
        <div className="card !py-3 text-center"><p className="text-2xl font-bold text-green-600">{correct}</p><p className="text-xs text-muted">Đúng</p></div>
        <div className="card !py-3 text-center"><p className="text-2xl font-bold text-red-500">{wrong}</p><p className="text-xs text-muted">Sai</p></div>
        <div className="card !py-3 text-center"><p className="text-2xl font-bold text-muted">{data.questions.length}</p><p className="text-xs text-muted">Tổng câu</p></div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {data.questions.map((q: any) => (
          <div key={q.id} className={`card !py-4 border-l-4 ${q.isCorrect === true ? "border-l-green-500" : q.isCorrect === false ? "border-l-red-500" : "border-l-silver"}`}>
            <div className="mb-2 flex items-center gap-2">
              {q.isCorrect === true && <CheckCircle size={16} className="text-green-500" />}
              {q.isCorrect === false && <XCircle size={16} className="text-red-500" />}
              {q.isCorrect === null && <Minus size={16} className="text-silver" />}
              <span className="rounded bg-royal/8 px-2 py-0.5 text-[0.65rem] font-semibold text-royal">Câu {q.questionNumber}</span>
              <span className="text-[0.65rem] text-muted">{TYPE_LABELS[q.type]} · {q.score} điểm</span>
            </div>

            {q.mediaUrl && (
              <div className="mb-3">
                {q.mediaUrl.match(/\.(mp3|wav|ogg|m4a)$/i) ? <audio controls src={getImageUrl(q.mediaUrl)} className="w-full" />
                  : <img src={getImageUrl(q.mediaUrl)} alt="" className="max-h-[200px] rounded-lg" />}
              </div>
            )}

            <p className="mb-3 text-sm text-[#1a1a2e]" dangerouslySetInnerHTML={{ __html: q.content }} />

            {/* MC options */}
            {q.type === "MULTIPLE_CHOICE" && Array.isArray(q.options) && (
              <div className="mb-3 space-y-1.5">
                {q.options.map((opt: string, i: number) => {
                  const isCorrectOpt = JSON.stringify(q.correctAnswer) === JSON.stringify(opt);
                  const isStudentPick = JSON.stringify(q.studentAnswer) === JSON.stringify(opt);
                  return (
                    <div key={i} className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${
                      isCorrectOpt ? "bg-green-50 font-medium text-green-700" : isStudentPick ? "bg-red-50 text-red-600 line-through" : "bg-cream text-muted"
                    }`}>
                      <span className="font-mono text-xs">{String.fromCharCode(65 + i)}.</span>{opt}
                      {isCorrectOpt && <CheckCircle size={14} className="ml-auto text-green-500" />}
                      {isStudentPick && !isCorrectOpt && <XCircle size={14} className="ml-auto text-red-400" />}
                    </div>
                  );
                })}
              </div>
            )}

            {q.type !== "MULTIPLE_CHOICE" && q.type !== "ESSAY" && (
              <div className="mb-3 space-y-1 text-sm">
                <p><span className="text-muted">Đáp án đúng:</span> <strong className="text-green-700">{typeof q.correctAnswer === "string" ? q.correctAnswer : JSON.stringify(q.correctAnswer)}</strong></p>
                <p><span className="text-muted">Bạn trả lời:</span> <strong className={q.isCorrect ? "text-green-700" : "text-red-600"}>{q.studentAnswer || "(bỏ trống)"}</strong></p>
              </div>
            )}

            {q.type === "ESSAY" && q.studentAnswer && (
              <div className="mb-3 rounded-lg bg-cream p-3 text-sm"><p className="text-xs text-muted mb-1">Bài viết của bạn:</p><p>{q.studentAnswer}</p></div>
            )}

            {q.explanation && (
              <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700"><strong>Giải thích:</strong> {q.explanation}</div>
            )}

            {q.studentNote && (
              <div className="mt-2 rounded-lg bg-yellow-50 px-3 py-2 text-sm text-amber-700">
                <FileText size={13} className="mb-0.5 mr-1 inline" /><strong>Ghi chú:</strong> {q.studentNote}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}