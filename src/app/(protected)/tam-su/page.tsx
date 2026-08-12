// FILE: src/app/(protected)/tam-su/page.tsx — Tâm sự với Vesta
"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { MessageSquareText, Send, Loader2, HelpCircle, Heart, Lightbulb } from "lucide-react";

const CATS = [
  { id: "QUESTION", label: "Câu hỏi", icon: HelpCircle },
  { id: "SHARE", label: "Chia sẻ", icon: Heart },
  { id: "SUGGEST", label: "Đề xuất", icon: Lightbulb },
] as const;
const catLabel = (c: string) => CATS.find((x) => x.id === c)?.label || "Chia sẻ";

export default function TamSuPage() {
  const [category, setCategory] = useState<string>("SHARE");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try { const r = await api.get("/student/vesta-messages"); if (r.success) setItems(r.data || []); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function send() {
    if (!content.trim()) { setMsg("Vui lòng nhập nội dung"); return; }
    setSending(true); setMsg("");
    try {
      const r = await api.post("/student/vesta-messages", { category, content });
      if (r.success) { setContent(""); setMsg("Đã gửi. Cảm ơn bạn đã chia sẻ với VESTA! 💛"); load(); }
      else setMsg(r.message || "Lỗi gửi");
    } catch { setMsg("Lỗi server"); } finally { setSending(false); }
  }

  return (
    <div className="mx-auto max-w-[700px]">
      <div className="mb-2 flex items-center gap-2 text-royal">
        <MessageSquareText size={22} /><h1 className="text-2xl font-bold">Tâm sự với Vesta</h1>
      </div>
      <p className="mb-5 text-sm text-muted">Gửi câu hỏi, chia sẻ cảm nhận, hoặc đề xuất cải thiện tới đội ngũ VESTA. Trung tâm sẽ đọc và phản hồi.</p>

      <div className="card space-y-4">
        <div className="flex gap-2">
          {CATS.map((c) => (
            <button key={c.id} onClick={() => setCategory(c.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2.5 text-sm font-medium transition-colors ${category === c.id ? "border-gold bg-gold/10 text-royal" : "border-silver/40 text-muted hover:border-gold/40"}`}>
              <c.icon size={15} />{c.label}
            </button>
          ))}
        </div>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4}
          placeholder="Viết điều bạn muốn gửi tới VESTA..." className="input-field" />
        {msg && <p className="text-sm font-semibold text-green-600">{msg}</p>}
        <button onClick={send} disabled={sending} className="btn-primary w-full justify-center">
          <Send size={15} />{sending ? "Đang gửi..." : "Gửi"}
        </button>
      </div>

      <h2 className="mb-3 mt-8 text-lg font-bold text-royal">Đã gửi</h2>
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 size={22} className="animate-spin text-gold" /></div>
      ) : items.length === 0 ? (
        <div className="card py-10 text-center text-sm text-muted">Bạn chưa gửi tâm sự nào.</div>
      ) : (
        <div className="space-y-3">
          {items.map((m) => (
            <div key={m.id} className="card">
              <div className="mb-1 flex items-center justify-between">
                <span className="rounded-full bg-royal/8 px-2.5 py-0.5 text-xs font-semibold text-royal">{catLabel(m.category)}</span>
                <span className="text-xs text-muted">{new Date(m.createdAt).toLocaleDateString("vi-VN")}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-[#1a1a2e]">{m.content}</p>
              {m.adminReply ? (
                <div className="mt-3 rounded-lg bg-gold/5 px-3 py-2">
                  <p className="text-[0.65rem] font-bold uppercase tracking-wider text-gold-dark">VESTA phản hồi</p>
                  <p className="mt-0.5 whitespace-pre-wrap text-sm text-[#1a1a2e]">{m.adminReply}</p>
                </div>
              ) : (
                <p className="mt-2 text-[0.7rem] text-muted">{m.status === "READ" ? "Trung tâm đã đọc" : "Đang chờ trung tâm đọc"}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
