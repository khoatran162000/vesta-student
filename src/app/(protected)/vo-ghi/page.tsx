// FILE: src/app/(protected)/vo-ghi/page.tsx — Vở ghi & Phản hồi GV
"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Send, Loader2, CheckCircle2, Clock, MessageSquareText, Lock } from "lucide-react";
import Link from "next/link";

export default function FeedbackPage() {
  const { user, loading: authLoading } = useAuth();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form nộp bài
  const [title, setTitle] = useState("");
  const [work, setWork] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const res = await api.get("/class/feedback/my");
    if (res.success) setFeedbacks(res.data || []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !work.trim()) return;
    setSubmitting(true);
    setMsg("");
    const res = await api.post("/class/feedback/submit", { title, studentWork: work });
    if (res.success) {
      setMsg("✅ Đã nộp bài thành công! Giáo viên sẽ chấm trong vài ngày.");
      setTitle("");
      setWork("");
      loadData();
    } else {
      setMsg("❌ " + (res.message || "Lỗi nộp bài"));
    }
    setSubmitting(false);
  }

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

  const pending = feedbacks.filter((f) => f.status === "PENDING");
  const reviewed = feedbacks.filter((f) => f.status === "REVIEWED");

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-royal">Vở ghi & Phản hồi GV</h1>
        <p className="mt-1 text-sm text-muted">Nộp bài viết / nói để được giáo viên chấm và phản hồi</p>
      </div>

      {/* Form nộp bài */}
      <form onSubmit={handleSubmit} className="card mb-8">
        <h2 className="mb-4 text-base font-bold text-royal">📝 Nộp bài mới</h2>
        {msg && <p className={`mb-3 rounded-lg px-4 py-2 text-sm ${msg.startsWith("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>{msg}</p>}
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">Tiêu đề bài</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
              placeholder="VD: Writing Task 2 — Should universities be free?"
              className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">Nội dung bài</label>
            <textarea value={work} onChange={(e) => setWork(e.target.value)} rows={8} required
              placeholder="Dán bài viết của bạn vào đây..."
              className="input-field resize-y" />
            <p className="mt-1 text-[0.65rem] text-muted">{work.length} ký tự · ~{work.trim().split(/\s+/).filter(Boolean).length} từ</p>
          </div>
          <button type="submit" disabled={submitting || !title.trim() || !work.trim()}
            className="btn-primary w-full justify-center py-3 disabled:opacity-60">
            {submitting ? <><Loader2 size={16} className="animate-spin" />Đang gửi...</> : <><Send size={16} />Nộp bài</>}
          </button>
        </div>
      </form>

      {/* Pending */}
      {pending.length > 0 && (
        <>
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-royal">
            <Clock size={16} className="text-amber-600" />Đang chờ GV chấm ({pending.length})
          </h2>
          <div className="mb-6 space-y-3">
            {pending.map((fb) => (
              <div key={fb.id} className="card border-l-4 border-amber-500">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold text-[#1a1a2e]">{fb.title}</h3>
                  <span className="text-xs text-muted">{new Date(fb.createdAt).toLocaleDateString("vi-VN")}</span>
                </div>
                <p className="line-clamp-3 text-xs text-muted">{fb.studentWork}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Reviewed */}
      <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-royal">
        <CheckCircle2 size={16} className="text-green-600" />Đã được chấm ({reviewed.length})
      </h2>
      {reviewed.length === 0 ? (
        <div className="card py-12 text-center text-sm text-muted">Chưa có bài nào được chấm.</div>
      ) : (
        <div className="space-y-3">
          {reviewed.map((fb) => (
            <div key={fb.id} className="card border-l-4 border-green-500">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-[#1a1a2e]">{fb.title}</h3>
                  <p className="text-[0.65rem] text-muted">
                    Nộp: {new Date(fb.createdAt).toLocaleDateString("vi-VN")} ·
                    {fb.reviewedAt && ` Chấm: ${new Date(fb.reviewedAt).toLocaleDateString("vi-VN")}`}
                  </p>
                </div>
                {fb.score != null && (
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gold">{fb.score}</p>
                    <p className="text-[0.65rem] text-muted">/ {fb.maxScore || 10}</p>
                  </div>
                )}
              </div>

              <details className="mb-3">
                <summary className="cursor-pointer text-xs font-semibold text-muted hover:text-royal">Xem bài đã nộp</summary>
                <div className="mt-2 whitespace-pre-wrap rounded-lg bg-cream/60 p-3 text-xs text-[#1a1a2e]">
                  {fb.studentWork}
                </div>
              </details>

              {fb.teacherComment && (
                <div className="rounded-lg border border-gold/30 bg-gold/5 p-3">
                  <p className="mb-1 flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-wider text-gold">
                    <MessageSquareText size={12} />Phản hồi từ GV
                    {fb.reviewer && <span className="font-normal text-muted">· {fb.reviewer.fullName}</span>}
                  </p>
                  <p className="whitespace-pre-wrap text-sm text-[#1a1a2e]">{fb.teacherComment}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}