// FILE: src/app/(protected)/lich-su/page.tsx — Lich su thi
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function HistoryPage() {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/student/history").then((res) => { if (res.success) setAttempts(res.data); }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-gold" /></div>;

  return (
    <div className="mx-auto max-w-[800px]">
      <h1 className="mb-6 text-2xl font-bold text-royal">Lịch sử làm bài</h1>
      <div className="card !p-0 overflow-hidden">
        {attempts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-muted">Chưa có lượt thi nào.</p>
            <Link href="/de-thi" className="mt-3 inline-block text-sm font-semibold text-gold hover:underline">Bắt đầu làm bài →</Link>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b border-silver/20 bg-cream">
              <th className="px-5 py-3 font-semibold text-royal">Đề thi</th>
              <th className="px-5 py-3 font-semibold text-royal">Điểm</th>
              <th className="px-5 py-3 font-semibold text-royal">Trạng thái</th>
              <th className="px-5 py-3 font-semibold text-royal">Ngày</th>
              <th className="px-5 py-3 text-right font-semibold text-royal"></th>
            </tr></thead>
            <tbody>{attempts.map((a) => (
              <tr key={a.id} className="border-b border-silver/10 hover:bg-cream/50">
                <td className="px-5 py-3 font-medium text-[#1a1a2e]">{a.exam.title}</td>
                <td className="px-5 py-3">
                  {a.score !== null ? (
                    <span className={`font-semibold ${a.score >= a.exam.totalScore * 0.7 ? "text-green-600" : a.score >= a.exam.totalScore * 0.5 ? "text-amber-600" : "text-red-500"}`}>
                      {a.score}/{a.exam.totalScore}
                    </span>
                  ) : "—"}
                </td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${a.status === "SUBMITTED" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                    {a.status === "SUBMITTED" ? "Đã nộp" : "Đang làm"}
                  </span>
                </td>
                <td className="px-5 py-3 text-muted">{new Date(a.createdAt).toLocaleDateString("vi-VN")}</td>
                <td className="px-5 py-3 text-right">
                  {a.status === "SUBMITTED" && (
                    <Link href={`/lich-su/${a.id}`} className="btn-secondary text-xs"><Eye size={13} />Xem lại</Link>
                  )}
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}