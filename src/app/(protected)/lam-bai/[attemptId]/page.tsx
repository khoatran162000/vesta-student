// FILE: src/app/(protected)/lam-bai/[attemptId]/page.tsx — Exam Engine
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock, Save, Send, AlertTriangle, ChevronLeft, ChevronRight, Loader2, StickyNote, Ban } from "lucide-react";
import { api, getImageUrl } from "@/lib/api";

// Nội dung câu hỏi có thẻ HTML? → hiện trên "tờ giấy" trắng cho dễ đọc
function isHtmlContent(s: string) {
  return /<[a-z][\s\S]*>/i.test(s || "");
}

export default function ExamEnginePage() {
  const params = useParams();
  const attemptId = params.attemptId as string;
  const router = useRouter();

  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState(0); // phút
  const [timeLeft, setTimeLeft] = useState(0); // giây
  const [currentQ, setCurrentQ] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState("");
  const [blockMsg, setBlockMsg] = useState("");
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const blockMsgRef = useRef<NodeJS.Timeout | null>(null);

  // Chặn sao chép / dán / chuột phải / kéo-thả trong phòng thi.
  // LƯU Ý: đây là RÀO CẢN, không phải khoá tuyệt đối — HS quyết tâm vẫn có thể
  // mở DevTools, tắt JS, hoặc chụp màn hình. Chặn tốt HS lười, không thay coi thi.
  function blockAction(e: React.SyntheticEvent) {
    e.preventDefault();
    setBlockMsg("Bài thi không cho phép sao chép / dán — vui lòng tự nhập đáp án.");
    if (blockMsgRef.current) clearTimeout(blockMsgRef.current);
    blockMsgRef.current = setTimeout(() => setBlockMsg(""), 2500);
  }

  // Load exam data
  useEffect(() => {
    async function load() {
      // Thử lấy từ sessionStorage trước (nếu vừa start)
      const cached = sessionStorage.getItem("examSession");
      if (cached) {
        const data = JSON.parse(cached);
        if (data.attemptId === attemptId) {
          setExam(data.exam);
          setQuestions(data.exam.questions || []);
          setAnswers(data.answers || {});
          setNotes(data.studentNotes || {});
          setStartTime(new Date(data.startTime));
          setDuration(data.exam.duration);
          setLoading(false);
          sessionStorage.removeItem("examSession");
          return;
        }
      }
      // Nếu F5 → gọi API lấy lại (resume)
      try {
        // Cần lấy examId từ attempt — tạm dùng cách khác
        setLoading(false);
      } catch { setLoading(false); }
    }
    load();
  }, [attemptId]);

  // Timer — đếm ngược dựa trên startTime thực tế (chống F5)
  useEffect(() => {
    if (!startTime || !duration) return;

    function updateTimer() {
      const elapsed = Math.floor((Date.now() - startTime!.getTime()) / 1000);
      const remaining = duration * 60 - elapsed;
      setTimeLeft(Math.max(0, remaining));
      if (remaining <= 0) { handleAutoSubmit(); }
    }

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTime, duration]);

  // Auto-save mỗi 30 giây
  useEffect(() => {
    if (!exam) return;
    autoSaveRef.current = setInterval(() => { doAutoSave(); }, 30000);
    return () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current); };
  }, [exam, answers, notes]);

  async function doAutoSave() {
    try {
      setAutoSaveStatus("Đang lưu...");
      await api.put(`/student/attempts/${attemptId}/save`, { answers, studentNotes: notes });
      setAutoSaveStatus("Đã lưu " + new Date().toLocaleTimeString("vi-VN"));
    } catch {
      setAutoSaveStatus("Lỗi lưu!");
    }
  }

  function setAnswer(questionId: string, value: any) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function setNote(questionId: string, value: string) {
    setNotes((prev) => ({ ...prev, [questionId]: value }));
  }

  async function handleAutoSubmit() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const data = await api.post(`/student/attempts/${attemptId}/submit`, { answers, studentNotes: notes });
      if (data.success) {
        alert(`Hết giờ! Bài đã được nộp tự động.\nĐiểm: ${data.data.score}/${data.data.totalScore}`);
        router.push(`/lich-su/${attemptId}`);
      }
    } catch {} finally { setSubmitting(false); }
  }

  async function handleSubmit() {
    setShowConfirm(false); setSubmitting(true);
    try {
      await doAutoSave(); // Save trước khi nộp
      const data = await api.post(`/student/attempts/${attemptId}/submit`, { answers, studentNotes: notes });
      if (data.success) {
        router.push(`/lich-su/${attemptId}`);
      }
    } catch {} finally { setSubmitting(false); }
  }

  // Format time
  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  if (loading || !exam) return <div className="flex min-h-screen items-center justify-center bg-navy"><Loader2 size={32} className="animate-spin text-gold" /></div>;

  const q = questions[currentQ];
  const answeredCount = Object.values(answers).filter((v) => v !== null && v !== undefined && v !== "").length;
  const isUrgent = timeLeft < 300; // Dưới 5 phút → đỏ
  const qIsHtml = q ? isHtmlContent(q.content) : false;

  return (
    <div className="flex h-screen select-none flex-col bg-[#0f1520]"
      onCopy={blockAction} onCut={blockAction} onPaste={blockAction}
      onContextMenu={blockAction} onDragStart={blockAction} onDrop={blockAction}>
      <style>{`
        /* Ô nhập vẫn phải chọn được chữ để sửa bài — chỉ chặn copy/paste (bắt ở event). */
        .exam-input { user-select: text !important; -webkit-user-select: text !important; }
        /* HTML dán vào đề thường fix cứng width="1300" → ép co vừa khung, hết lướt ngang */
        .exam-html table { width: 100% !important; max-width: 100% !important; }
        .exam-html td, .exam-html th { overflow-wrap: anywhere; }
        .exam-html img, .exam-html iframe, .exam-html video { max-width: 100%; }
      `}</style>

      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-navy px-5 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold text-white truncate max-w-[300px]">{exam.title}</h1>
          <span className="rounded bg-white/10 px-2 py-0.5 text-[0.65rem] text-silver">{answeredCount}/{questions.length} câu</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[0.65rem] text-silver/60">{autoSaveStatus}</span>
          <button onClick={doAutoSave} className="rounded p-1.5 text-silver hover:bg-white/10 hover:text-white"><Save size={15} /></button>
          <div className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-lg font-bold ${isUrgent ? "bg-red-500/20 text-red-400 animate-pulse" : "bg-white/10 text-gold"}`}>
            <Clock size={16} />{formatTime(timeLeft)}
          </div>
          <button onClick={() => setShowConfirm(true)} className="rounded-lg bg-green-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-700">
            <Send size={14} className="mr-1.5 inline" />Nộp bài
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Question navigation sidebar */}
        <div className="w-[70px] shrink-0 overflow-y-auto border-r border-white/10 bg-navy/80 p-2">
          <div className="grid grid-cols-2 gap-1.5">
            {questions.map((_: any, i: number) => {
              const isAnswered = answers[questions[i].id] !== undefined && answers[questions[i].id] !== "" && answers[questions[i].id] !== null;
              const isCurrent = i === currentQ;
              return (
                <button key={i} onClick={() => setCurrentQ(i)}
                  className={`flex h-8 w-8 items-center justify-center rounded text-xs font-semibold transition-colors ${
                    isCurrent ? "bg-gold text-navy" : isAnswered ? "bg-green-600 text-white" : "bg-white/10 text-silver hover:bg-white/20"
                  }`}>{i + 1}</button>
              );
            })}
          </div>
        </div>

        {/* Question content */}
        <div className="flex-1 overflow-y-auto p-6">
          {q && (
            <div className={`mx-auto ${qIsHtml ? "max-w-[1100px]" : "max-w-[700px]"}`}>
              {/* Question header */}
              <div className="mb-4 flex items-center gap-2">
                <span className="rounded bg-gold/20 px-3 py-1 text-sm font-bold text-gold">Câu {currentQ + 1}/{questions.length}</span>
                <span className="rounded bg-white/10 px-2 py-0.5 text-[0.65rem] text-silver">{q.score} điểm</span>
                <button onClick={() => setShowNote(!showNote)} className={`ml-auto rounded p-1.5 ${notes[q.id] ? "text-yellow-400" : "text-silver"} hover:bg-white/10`}>
                  <StickyNote size={15} />
                </button>
              </div>

              {/* Media (audio/image) */}
              {q.mediaUrl && (
                <div className="mb-4">
                  {q.mediaUrl.match(/\.(mp3|wav|ogg|m4a|aac)$/i) ? (
                    <audio controls src={getImageUrl(q.mediaUrl)} className="w-full" />
                  ) : (
                    <img src={getImageUrl(q.mediaUrl)} alt="" className="max-h-[300px] rounded-lg object-contain" />
                  )}
                </div>
              )}

              {/* Question content — đề HTML hiện trên nền trắng (HTML của GV giả định nền sáng, chữ #222) */}
              {qIsHtml ? (
                <div className="mb-6 overflow-x-auto rounded-xl bg-white p-5">
                  <div className="exam-html text-sm text-[#1a1a2e]" dangerouslySetInnerHTML={{ __html: q.content }} />
                </div>
              ) : (
                <div className="mb-6 whitespace-pre-wrap text-sm leading-relaxed text-gray-200">{q.content}</div>
              )}

              {/* Note input */}
              {showNote && (
                <div className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3">
                  <p className="mb-1.5 text-xs font-semibold text-yellow-400">Ghi chú của bạn</p>
                  <textarea value={notes[q.id] || ""} onChange={(e) => setNote(q.id, e.target.value)} rows={2}
                    placeholder="Ghi chú từ khóa, ý chính..." className="exam-input w-full rounded bg-navy/50 px-3 py-2 text-sm text-gray-200 placeholder-silver/40 outline-none" />
                </div>
              )}

              {/* Answer area by type */}
              {q.type === "MULTIPLE_CHOICE" && Array.isArray(q.options) && (
                <div className="space-y-2.5">
                  {q.options.map((opt: string, i: number) => {
                    const selected = JSON.stringify(answers[q.id]) === JSON.stringify(opt);
                    return (
                      <button key={i} onClick={() => setAnswer(q.id, opt)}
                        className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                          selected ? "border-gold bg-gold/10 text-white" : "border-white/10 bg-white/5 text-gray-300 hover:border-gold/40 hover:bg-white/10"
                        }`}>
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                          selected ? "border-gold bg-gold text-navy" : "border-white/20 text-silver"
                        }`}>{String.fromCharCode(65 + i)}</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {q.type === "FILL_IN_BLANK" && (
                <input value={answers[q.id] || ""} onChange={(e) => setAnswer(q.id, e.target.value)}
                  placeholder="Nhập đáp án..." className="exam-input w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-gold" />
              )}

              {q.type === "ESSAY" && (
                <textarea value={answers[q.id] || ""} onChange={(e) => setAnswer(q.id, e.target.value)} rows={8}
                  placeholder="Viết bài của bạn ở đây..." className="exam-input w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-gold" />
              )}

              {/* Navigation */}
              <div className="mt-8 flex items-center justify-between">
                <button onClick={() => setCurrentQ((p) => Math.max(0, p - 1))} disabled={currentQ === 0}
                  className="flex items-center gap-1 rounded-lg bg-white/10 px-4 py-2 text-sm text-silver hover:bg-white/20 disabled:opacity-30">
                  <ChevronLeft size={16} />Câu trước
                </button>
                <button onClick={() => setCurrentQ((p) => Math.min(questions.length - 1, p + 1))} disabled={currentQ === questions.length - 1}
                  className="flex items-center gap-1 rounded-lg bg-white/10 px-4 py-2 text-sm text-silver hover:bg-white/20 disabled:opacity-30">
                  Câu sau<ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cảnh báo khi HS thử copy/paste */}
      {blockMsg && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-red-600/95 px-4 py-2.5 text-sm font-medium text-white shadow-xl">
          <Ban size={15} />{blockMsg}
        </div>
      )}

      {/* Submit confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle size={24} className="text-amber-500" />
              <h3 className="text-lg font-bold text-[#1a1a2e]">Nộp bài?</h3>
            </div>
            <p className="text-sm text-muted">
              Bạn đã trả lời <strong>{answeredCount}/{questions.length}</strong> câu.
              {answeredCount < questions.length && <span className="text-amber-600"> Còn {questions.length - answeredCount} câu chưa trả lời.</span>}
            </p>
            <p className="text-sm text-muted">Thời gian còn lại: <strong className="text-royal">{formatTime(timeLeft)}</strong></p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConfirm(false)} className="btn-secondary">Tiếp tục làm</button>
              <button onClick={handleSubmit} disabled={submitting}
                className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700">
                {submitting ? "Đang nộp..." : "Xác nhận nộp"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}