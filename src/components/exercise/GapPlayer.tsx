// FILE: src/components/exercise/GapPlayer.tsx
// Render bài tập gap (LearnClick) cho học viên/khách làm + chấm + tô màu
// content HỖ TRỢ CẢ HAI: HTML (bài dán từ LearnClick) hoặc text thuần (bài cũ) — tự nhận diện
// Đợt 3: ô trống highlight vàng dễ nhìn; gợi ý CHỈ hiện khi GV tự nhập (g.hint).
"use client";
import { useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  DndContext, useDraggable, useDroppable, DragEndEvent,
  PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core";
export interface PlayerGap {
  type: "TEXT" | "DROPDOWN" | "DRAG";
  options?: string[];
  answers?: string[];
  hint?: string;
}
export interface GapDetail {
  id: string;
  studentAnswer: string | null;
  correctAnswers: string[];
  isCorrect: boolean;
}
interface Props {
  content: string;
  gaps: Record<string, PlayerGap>;
  distractors?: string[];
  result?: { detail: GapDetail[] } | null;  // sau khi nộp
  answers: Record<string, string>;
  onChange: (answers: Record<string, string>) => void;
}
// ─── Một từ kéo được ───
function DraggableWord({ id, label, used }: { id: string; label: string; used: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined;
  if (used) return null;
  return (
    <span ref={setNodeRef} style={style} {...listeners} {...attributes}
      className={`inline-block cursor-grab rounded-lg border-2 border-amber-300 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-800 select-none ${isDragging ? "opacity-50" : ""}`}>
      {label}
    </span>
  );
}
// ─── Ô thả (drop zone) cho gap DRAG ───
function DropZone({ gapId, value, state }: { gapId: string; value: string; state: "" | "correct" | "wrong" }) {
  const { setNodeRef, isOver } = useDroppable({ id: `drop-${gapId}` });
  const border = state === "correct" ? "border-green-400 bg-green-50"
    : state === "wrong" ? "border-red-400 bg-red-50"
    : isOver ? "border-amber-500 bg-amber-100" : "border-amber-400 bg-amber-50";
  return (
    <span ref={setNodeRef}
      className={`mx-1 inline-flex min-w-[90px] items-center justify-center rounded-lg border-2 border-dashed px-3 py-1 text-sm font-medium ${border}`}>
      {value || <span className="text-amber-500">kéo vào</span>}
    </span>
  );
}
// ─── Dựng HTML nền: đổi [[gap:N]] thành thẻ neo rỗng để cắm React portal ───
const TOKEN_RE = /\[\[gap:([^\]]+)\]\]/g;
function looksLikeHtml(s: string): boolean {
  return /<[a-z][\s\S]*>/i.test(s);
}
function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function buildHostHtml(content: string): { html: string; isHtml: boolean } {
  const isHtml = looksLikeHtml(content);
  const base = isHtml ? content : escapeHtml(content);
  const html = base.replace(TOKEN_RE, (_m, id) =>
    `<span data-gap-id="${String(id).replace(/"/g, "&quot;")}"></span>`
  );
  return { html, isHtml };
}
export default function GapPlayer({ content, gaps, distractors = [], result, answers, onChange }: Props) {
  const submitted = !!result;
  const detailMap = useMemo(() => {
    const m: Record<string, GapDetail> = {};
    result?.detail?.forEach((d) => { m[d.id] = d; });
    return m;
  }, [result]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const wordBank = useMemo(() => {
    const words: string[] = [];
    Object.values(gaps).forEach((g: any) => {
      if (g.type === "DRAG" && Array.isArray(g.answers) && g.answers[0]) {
        words.push(g.answers[0]);
      }
    });
    const all = [...words, ...distractors];
    return Array.from(new Set(all)).sort(() => Math.random() - 0.5);
  }, [gaps, distractors]);
  const { html, isHtml } = useMemo(() => buildHostHtml(content || ""), [content]);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [slots, setSlots] = useState<{ id: string; el: HTMLElement }[]>([]);
  // QUAN TRỌNG: bơm innerHTML THỦ CÔNG — KHÔNG dùng dangerouslySetInnerHTML.
  // Nếu để React quản vùng này, mỗi lần nó dựng lại innerHTML là các span bị lìa khỏi DOM,
  // portal cắm input vào span mồ côi → không hiện gì.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    host.innerHTML = html;
    const els = Array.from(host.querySelectorAll<HTMLElement>("[data-gap-id]"));
    setSlots(els.map((el) => ({ id: el.getAttribute("data-gap-id") || "", el })));
  }, [html]);
  function setAns(id: string, val: string) {
    onChange({ ...answers, [id]: val });
  }
  function handleDragEnd(e: DragEndEvent) {
    const wordId = String(e.active.id);
    const overId = e.over ? String(e.over.id) : null;
    if (!overId || !overId.startsWith("drop-")) return;
    const gapId = overId.replace("drop-", "");
    const label = wordId.replace(/^word-\d+-/, "");
    setAns(gapId, label);
  }
  const usedWords = new Set(Object.values(answers));
  function renderField(id: string) {
    const g = gaps[id] || { type: "TEXT" as const };
    const d = detailMap[id];
    const state: "" | "correct" | "wrong" = !submitted ? "" : d?.isCorrect ? "correct" : "wrong";
    const fieldColor = state === "correct" ? "border-green-400 bg-green-50 text-green-800"
      : state === "wrong" ? "border-red-400 bg-red-50 text-red-800"
      : "";
    // Chưa nộp: ô trống nổi bật (nền vàng nhạt + viền vàng đậm + gạch chân) — không hoà nền
    const idleText = "border-amber-400 bg-amber-50 underline decoration-amber-400 decoration-2 underline-offset-4 text-[#1a1a2e] placeholder-amber-400";
    const idleSelect = "border-amber-400 bg-amber-50 text-[#1a1a2e]";
    let field;
    if (g.type === "DROPDOWN") {
      field = (
        <select disabled={submitted} value={answers[id] || ""}
          onChange={(e) => setAns(id, e.target.value)}
          className={`mx-1 rounded-md border-2 px-2 py-1 text-sm font-medium outline-none focus:border-amber-500 ${state ? fieldColor : idleSelect}`}>
          <option value="">— chọn —</option>
          {(g.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    } else if (g.type === "DRAG") {
      field = <DropZone gapId={id} value={answers[id] || ""} state={state} />;
    } else {
      field = (
        <input type="text" disabled={submitted} value={answers[id] || ""}
          onChange={(e) => setAns(id, e.target.value)}
          placeholder="✎ …" size={Math.max(8, (answers[id]?.length || 8))}
          className={`mx-1 rounded-md border-2 px-2 py-0.5 text-sm font-medium outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 ${state ? fieldColor : idleText}`} />
      );
    }
    return (
      <span className="inline-flex items-center align-baseline">
        {field}
        {/* Gợi ý CHỈ hiện khi GV tự nhập (g.hint có nội dung) — máy không tự sinh */}
        {!submitted && g.hint && g.hint.trim() && <HintButton hint={g.hint} />}
        {submitted && !d?.isCorrect && (d?.correctAnswers?.length ?? 0) > 0 && (
          <span className="ml-1 text-xs font-medium text-green-600">({d!.correctAnswers[0]})</span>
        )}
      </span>
    );
  }
  const body = (
    <div className={isHtml ? "overflow-x-auto" : ""}>
      {isHtml && (
        <style>{`
          /* HTML dán từ LearnClick fix cứng width="1300" → ép co vừa khung, hết lướt ngang. */
          .gap-html-body table { width: 100% !important; max-width: 100% !important; }
          .gap-html-body td, .gap-html-body th { overflow-wrap: anywhere; }
          .gap-html-body img, .gap-html-body iframe, .gap-html-body video { max-width: 100%; }
        `}</style>
      )}
      <div
        ref={hostRef}
        className={isHtml ? "gap-html-body" : "whitespace-pre-wrap text-[1.05rem] leading-[2.4]"}
      />
      {slots.map((s) => createPortal(renderField(s.id), s.el, s.id))}
    </div>
  );
  const hasDrag = Object.values(gaps).some((g) => g.type === "DRAG");
  if (!hasDrag) return body;
  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {!submitted && wordBank.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2 rounded-xl border border-amber-200 bg-amber-50/40 p-3">
          {wordBank.map((w, idx) => (
            <DraggableWord key={idx} id={`word-${idx}-${w}`} label={w} used={usedWords.has(w)} />
          ))}
        </div>
      )}
      {body}
    </DndContext>
  );
}
// ─── Nút gợi ý 💡 cạnh gap (chỉ khi GV nhập hint) ───
function HintButton({ hint }: { hint: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative mx-0.5 inline-flex">
      <button type="button" onClick={() => setShow((s) => !s)}
        title="Xem gợi ý"
        className="text-sm leading-none opacity-70 hover:opacity-100">💡</button>
      {show && (
        <span className="absolute bottom-full left-1/2 z-50 mb-1 block w-max max-w-[240px] -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg">
          {hint}
        </span>
      )}
    </span>
  );
}