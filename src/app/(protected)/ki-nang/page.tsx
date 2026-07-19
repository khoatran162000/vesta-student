// FILE: src/app/(protected)/ki-nang/page.tsx — Bảng tiến độ học tập (hệ thống tự điền %)
"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Lock, TrendingUp, CheckCircle2, Circle, Trophy, FileText } from "lucide-react";
import Link from "next/link";

interface ExProgress {
  exerciseId: string; title: string; type: string;
  attempted: boolean; bestScore: number | null; attemptCount: number; lastAttemptAt: string | null;
}
interface ExamProg { examTitle: string; score: number | null; totalScore: number | null; date: string | null; }

const scoreColor = (s: number | null) =>
  s === null ? "text-muted"
  : s >= 85 ? "text-green-600"
  : s >= 50 ? "text-amber-600"
  : "text-red-500";
const barColor = (s: number) => s >= 85 ? "bg-green-500" : s >= 50 ? "bg-amber-500" : "bg-red-400";

export default function ProgressPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/student/progress")
      .then((res) => { if (res.success) setData(res.data); })
      .finally(() => setLoading(false));
  }, []);

  if (authLoading || loading)
    return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" /></div>;

  if (!user?.isPaid)
    return (
      <div className="mx-auto max-w-[700px] py-20 text-center">
        <Lock size={48} className="mx-auto mb-4 text-amber-600" />
        <h2 className="text-xl font-bold text-royal">Tính năng dành cho học viên đã ghi danh</h2>
        <Link href="/dashboard" className="btn-primary mt-6 inline-flex">← Quay về Tổng quan</Link>
      </div>
    );

  const s = data?.summary || {};
  const interactive: ExProgress[] = data?.interactive || [];
  const exams: ExamProg[] = data?.exams || [];

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-royal">Bảng tiến độ học tập</h1>
        <p className="mt-1 text-sm text-muted">Hệ thống tự động cập nhật theo bài tập và bài thi bạn đã làm</p>
      </div>

      {/* Tổng quan */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card bg-gradient-to-br from-gold/10 to-amber-50">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/20 text-gold"><TrendingUp size={22} /></div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted">Hoàn thành chung</p>
              <p className="text-2xl font-bold text-royal">{s.overallPercent ?? 0}%</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-50 text-green-600"><Trophy size={22} /></div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted">Bài đạt (≥85%)</p>
              <p className="text-2xl font-bold text-[#1a1a2e]">{s.passedExercises ?? 0}<span className="text-base text-muted">/{s.totalExercises ?? 0}</span></p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><FileText size={22} /></div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted">Bài thi đã làm</p>
              <p className="text-2xl font-bold text-[#1a1a2e]">{s.totalExams ?? 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bảng bài tập tương tác */}
      <div className="card mb-6 !p-0 overflow-hidden">
        <div className="border-b border-silver/20 bg-cream px-5 py-3">
          <h2 className="font-bold text-royal">Bài tập tương tác</h2>
          <p className="text-xs text-muted">Mỗi bài lấy điểm cao nhất trong các lần bạn làm</p>
        </div>
        {interactive.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">Chưa có bài tập nào được giao.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-silver/20 text-xs text-muted">
                <th className="px-5 py-2.5 font-semibold">Bài tập</th>
                <th className="px-3 py-2.5 font-semibold">Số lần làm</th>
                <th className="px-5 py-2.5 font-semibold w-[40%]">Kết quả cao nhất</th>
              </tr>
            </thead>
            <tbody>
              {interactive.map((ex) => (
                <tr key={ex.exerciseId} className="border-b border-silver/10">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {ex.bestScore !== null && ex.bestScore >= 85
                        ? <CheckCircle2 size={15} className="shrink-0 text-green-500" />
                        : <Circle size={15} className="shrink-0 text-silver" />}
                      <span className="font-medium text-[#1a1a2e]">{ex.title}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-muted">{ex.attempted ? `${ex.attemptCount} lần` : "—"}</td>
                  <td className="px-5 py-3">
                    {ex.attempted ? (
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-cream-dark">
                          <div className={`h-full rounded-full ${barColor(ex.bestScore ?? 0)}`} style={{ width: `${ex.bestScore ?? 0}%` }} />
                        </div>
                        <span className={`w-12 text-right text-sm font-bold ${scoreColor(ex.bestScore)}`}>{ex.bestScore}%</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted">Chưa làm</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Bảng điểm thi */}
      <div className="card !p-0 overflow-hidden">
        <div className="border-b border-silver/20 bg-cream px-5 py-3">
          <h2 className="font-bold text-royal">Điểm bài thi</h2>
          <p className="text-xs text-muted">Bài thi không tính vào phần trăm hoàn thành ở trên</p>
        </div>
        {exams.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">Chưa làm bài thi nào.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-silver/20 text-xs text-muted">
                <th className="px-5 py-2.5 font-semibold">Đề thi</th>
                <th className="px-3 py-2.5 font-semibold">Điểm</th>
                <th className="px-5 py-2.5 font-semibold">Ngày làm</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((e, i) => (
                <tr key={i} className="border-b border-silver/10">
                  <td className="px-5 py-3 font-medium text-[#1a1a2e]">{e.examTitle}</td>
                  <td className="px-3 py-3">
                    <span className="font-bold text-royal">{e.score ?? "—"}</span>
                    {e.totalScore ? <span className="text-xs text-muted">/{e.totalScore}</span> : null}
                  </td>
                  <td className="px-5 py-3 text-muted">
                    {e.date ? new Date(e.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}