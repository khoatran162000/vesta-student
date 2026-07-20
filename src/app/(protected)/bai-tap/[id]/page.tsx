// FILE: src/app/(protected)/bai-tap/[id]/page.tsx — HV làm bài (gap LearnClick + tương thích bài cũ + timer/giới hạn lượt)
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Loader2, CheckCircle2, XCircle, Send, RotateCcw, Trophy, Clock, Play,
} from "lucide-react";
import { api } from "@/lib/api";
import GapPlayer, { PlayerGap } from "@/components/exercise/GapPlayer";
import MatchingPlayer, { MatchingData } from "@/components/exercise/MatchingPlayer";
export default function DoExercisePage() {
  const { id } = useParams();
  const router = useRouter();
  const [exercise, setExercise] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  // ── Phiên có giới hạn (start→submit) ──
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [attemptGraded, setAttemptGraded] = useState(true);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [started, setStarted] = useState(false);
  const [starting, setStarting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    api.get(`/interactive/${id}`)
      .then((res) => { if (res.success) setExercise(res.data); })
      .finally(() => setLoading(false));
  }, [id]);
  // Bài có bật timer hoặc giới hạn lượt?
  const hasLimits = !!exercise && (exercise.timeLimit != null || exercise.maxAttempts != null);
  const timeLimit: number | null = exercise?.timeLimit ?? null;
  // ── Đồng hồ: đếm ngược theo startTime server (F5 không reset) ──
  useEffect(() => {
    if (!started || !startTime || timeLimit == null) return;
    function tick() {
      const elapsed = Math.floor((Date.now() - startTime!.getTime()) / 1000);
      const remaining = timeLimit! * 60 - elapsed;
      setTimeLeft(Math.max(0, remaining));
      if (remaining <= 0) handleAutoSubmit();
    }
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, startTime, timeLimit]);
  function setAnswer(qId: string, value: any) {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  }
  // Bắt đầu phiên (bài có giới hạn)
  async function handleStart() {
    setStarting(true);
    const res = await api.post(`/interactive/${id}/start`, {});
    setStarting(false);
    if (res.success) {
      setAttemptId(res.data.attemptId);
      setAttemptGraded(res.data.isGraded !== false);
      setStartTime(new Date(res.data.startTime));
      setStarted(true);
    } else {
      alert(res.message || "Không bắt đầu được bài");
    }
  }
  async function doSubmit(auto = false) {
    if (submitting) return;
    setSubmitting(true);
    const body: any = { answers };
    if (attemptId) body.attemptId = attemptId;   // phiên có giới hạn
    const res = await api.post(`/interactive/${id}/submit`, body);
    setSubmitting(false);
    if (res.success) {
      setResult(res.data);
      if (timerRef.current) clearInterval(timerRef.current);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (!auto) {
      alert(res.message || "Lỗi nộp bài");
    }
  }
  const handleAutoSubmit = useCallback(() => { doSubmit(true); /* eslint-disable-next-line */ }, [answers, attemptId, submitting]);
  async function handleSubmit() {
    const missing = totalCount - answeredCount;
    if (missing > 0 && !confirm(`Còn ${missing} chỗ chưa điền — bỏ trống sẽ tính là sai. Nộp bài luôn?`)) return;
    await doSubmit(false);
  }
  function handleRetry() {
    setAnswers({});
    setResult(null);
  }
  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
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
  const gaps = exercise.gaps || null;
  const isGapEx = !!exercise.content && gaps && typeof gaps === "object" && Object.keys(gaps).length > 0;
  const isHtmlGap = isGapEx && /<[a-z][\s\S]*>/i.test(exercise.content || "");
  const isMatching = exercise.type === "MATCHING";
  const matchingData: MatchingData = isMatching && exercise.questions && !Array.isArray(exercise.questions)
    ? exercise.questions : { pairs: [], choices: [] };
  const questions = Array.isArray(exercise.questions) ? exercise.questions : [];
  const gapIds = isGapEx ? Object.keys(gaps) : [];
  let totalCount = 0, answeredCount = 0;
  if (isGapEx) {
    totalCount = gapIds.length;
    answeredCount = gapIds.filter((gid) => answers[gid] !== undefined && String(answers[gid]).trim() !== "").length;
  } else if (isMatching) {
    totalCount = matchingData.pairs.length;
    answeredCount = matchingData.pairs.filter((p) => answers[p.id] !== undefined && String(answers[p.id]).trim() !== "").length;
  } else {
    totalCount = questions.length;
    answeredCount = Object.keys(answers).filter((k) => answers[k] !== undefined && answers[k] !== "").length;
  }
  const attemptsLeft: number | null = exercise.attemptsLeft ?? null;
  const isUrgent = timeLeft < 60; // <1 phút → đỏ
  // ── Màn chờ "Bắt đầu làm bài" cho bài CÓ giới hạn (chưa start, chưa có kết quả) ──
  if (hasLimits && !started && !result) {
    const outOfGraded = attemptsLeft != null && attemptsLeft <= 0;
    return (
      <div className="mx-auto max-w-[600px]">
        <Link href="/bai-tap" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-royal">
          <ArrowLeft size={15} />Quay lại danh sách
        </Link>
        <div className="card text-center">
          <h1 className="text-2xl font-bold text-royal">{exercise.title}</h1>
          {exercise.description && <p className="mt-1 text-sm text-muted">{exercise.description}</p>}
          <div className="my-5 flex flex-wrap justify-center gap-3 text-sm">
            {timeLimit != null && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-royal/8 px-3 py-1.5 font-medium text-royal">
                <Clock size={15} />{timeLimit} phút
              </span>
            )}
            {exercise.maxAttempts != null && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-gold/10 px-3 py-1.5 font-medium text-gold-dim">
                <Trophy size={15} />
                {outOfGraded ? "Đã hết lượt chấm" : `Còn ${attemptsLeft} lượt được chấm`}
              </span>
            )}
          </div>
          {outOfGraded && (
            <p className="mb-4 rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
              Bạn đã dùng hết lượt được chấm. Làm tiếp là <strong>lượt ôn tập</strong> — không tính vào điểm.
            </p>
          )}
          {timeLimit != null && (
            <p className="mb-4 text-xs text-muted">
              Khi bấm bắt đầu, đồng hồ sẽ chạy và <strong>hết giờ bài tự động nộp</strong>. Hãy chắc bạn sẵn sàng.
            </p>
          )}
          <button onClick={handleStart} disabled={starting} className="btn-primary mx-auto">
            {starting ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            {starting ? "Đang mở bài..." : "Bắt đầu làm bài"}
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className={`mx-auto ${isHtmlGap ? "max-w-[1200px]" : "max-w-[760px]"}`}>
      {/* Đồng hồ góc trên (chỉ khi đang làm bài có giờ) */}
      {started && timeLimit != null && !result && (
        <div className={`fixed right-5 top-20 z-40 flex items-center gap-1.5 rounded-lg px-3 py-2 font-mono text-lg font-bold shadow-lg ${
          isUrgent ? "bg-red-500/20 text-red-500 animate-pulse ring-1 ring-red-400" : "bg-royal/10 text-royal"
        }`}>
          <Clock size={16} />{formatTime(timeLeft)}
        </div>
      )}
      <Link href="/bai-tap" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-royal">
        <ArrowLeft size={15} />Quay lại danh sách
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-royal">{exercise.title}</h1>
        {exercise.description && <p className="mt-1 text-sm text-muted">{exercise.description}</p>}
        <p className="mt-1 text-xs text-muted">
          {totalCount} {isMatching ? "cặp nối" : (exercise.type === "MULTIPLE_CHOICE" || exercise.type === "QUIZ" || exercise.type === "VOCAB_CHECK") ? "câu hỏi" : "chỗ trống"}
        </p>
      </div>
      {/* Banner lượt ôn tập (phiên không chấm) */}
      {started && !attemptGraded && !result && (
        <div className="mb-4 rounded-lg bg-amber-50 px-4 py-2.5 text-center text-sm font-medium text-amber-700">
          Lượt ôn tập — bài này sẽ không tính vào điểm chính thức.
        </div>
      )}
      {/* Kết quả sau khi nộp */}
      {result && (
        <div className="card mb-6 bg-gradient-to-br from-gold/10 to-amber-50 text-center">
          <Trophy size={36} className="mx-auto mb-2 text-gold" />
          <p className="text-3xl font-bold text-royal">{result.score}%</p>
          <p className="text-sm text-muted">
            Đúng {result.correct}/{result.total}
            {result.isGraded === false ? " — lượt ôn tập, không tính điểm" : " — điểm đã được lưu"}
            {result.autoSubmitted ? " · hết giờ tự nộp" : ""}
          </p>
          {/* Ẩn "Làm lại" khi bài có giới hạn lượt */}
          {!hasLimits && (
            <button onClick={handleRetry} className="btn-secondary mt-4">
              <RotateCcw size={14} />Làm lại
            </button>
          )}
          {hasLimits && (
            <Link href="/bai-tap" className="btn-secondary mt-4 inline-flex">← Về danh sách bài tập</Link>
          )}
        </div>
      )}
      {/* ─── BÀI GAP ─── */}
      {isGapEx ? (
        <div className="card">
          <GapPlayer
            content={exercise.content}
            gaps={gaps as Record<string, PlayerGap>}
            distractors={Array.isArray(exercise.distractors) ? exercise.distractors : []}
            answers={answers}
            onChange={setAnswers}
            result={result}
          />
        </div>
      ) : isMatching ? (
        <div className="card">
          <MatchingPlayer data={matchingData} answers={answers} onChange={setAnswers} result={result} />
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q: any, i: number) => {
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
                {(exercise.type === "QUIZ" || exercise.type === "VOCAB_CHECK" || exercise.type === "MULTIPLE_CHOICE") && Array.isArray(q.options) && (
                  <div className="space-y-2 pl-8">
                    {q.options.map((opt: string, j: number) => {
                      const letter = String.fromCharCode(65 + j);
                      const selected = answers[q.id] === letter;
                      const isCorrectAns = detail && detail.correctAnswer === letter;
                      const isWrongPick = detail && selected && !detail.isCorrect;
                      return (
                        <button key={j} disabled={!!result} onClick={() => setAnswer(q.id, letter)}
                          className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                            isCorrectAns ? "border-green-400 bg-green-50" : isWrongPick ? "border-red-400 bg-red-50"
                            : selected ? "border-gold bg-gold/10" : "border-silver/30 hover:border-gold/50"
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
                {exercise.type === "FILL_BLANK" && (
                  <div className="pl-8">
                    <input type="text" disabled={!!result} value={answers[q.id] || ""} onChange={(e) => setAnswer(q.id, e.target.value)}
                      placeholder="Nhập đáp án..." className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${
                        detail ? (detail.isCorrect ? "border-green-400 bg-green-50" : "border-red-400 bg-red-50") : "border-silver/40 focus:border-gold"
                      }`} />
                    {detail && !detail.isCorrect && (
                      <p className="mt-1 text-xs text-green-600">Đáp án đúng: <strong>{String(detail.correctAnswer)}</strong></p>
                    )}
                  </div>
                )}
                {detail?.explanation && (
                  <div className="mt-3 ml-8 rounded-lg bg-cream/60 px-3 py-2 text-xs text-muted">💡 {detail.explanation}</div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {/* Nút nộp */}
      {!result && (
        <button onClick={handleSubmit} disabled={submitting || answeredCount === 0}
          className="btn-primary mt-6 w-full justify-center py-3.5 disabled:opacity-60">
          {submitting ? <><Loader2 size={16} className="animate-spin" />Đang nộp...</>
            : <><Send size={16} />Nộp bài ({answeredCount}/{totalCount})</>}
        </button>
      )}
    </div>
  );
}