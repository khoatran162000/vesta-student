// FILE: src/components/exercise/GapPlayer.tsx
// Render bài tập gap (LearnClick) cho học viên/khách làm + chấm + tô màu
"use client";
import { useMemo, useState } from "react";
import {
  DndContext, useDraggable, useDroppable, DragEndEvent,
  PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core";

export interface PlayerGap {
  type: "TEXT" | "DROPDOWN" | "DRAG";
  options?: string[];   // dropdown
  answers?: string[];   // chỉ có với DRAG (để dựng ngân hàng từ)
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
function DropZone({ gapId, value, locked, state }: { gapId: string; value: string; locked: boolean; state: "" | "correct" | "wrong" }) {
  const { setNodeRef, isOver } = useDroppable({ id: `drop-${gapId}` });
  const border = state === "correct" ? "border-green-400 bg-green-50"
    : state === "wrong" ? "border-red-400 bg-red-50"
    : isOver ? "border-amber-500 bg-amber-100" : "border-amber-300 bg-white";
  return (
    <span ref={setNodeRef}
      className={`mx-1 inline-flex min-w-[80px] items-center justify-center rounded-lg border-2 border-dashed px-3 py-1 text-sm ${border}`}>
      {value || <span className="text-gray-300">kéo vào</span>}
    </span>
  );
}

export default function GapPlayer({ content, gaps, distractors = [], result, answers, onChange }: Props) {
  const submitted = !!result;
  const detailMap = useMemo(() => {
    const m: Record<string, GapDetail> = {};
    result?.detail?.forEach((d) => { m[d.id] = d; });
    return m;
  }, [result]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // Ngân hàng từ cho DRAG: gộp đáp án các gap DRAG (lấy phương án đầu) + distractors, xáo 1 lần
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

  // Parse content thành các mảnh: text hoặc gap
  const parts = useMemo(() => content.split(/(\[\[gap:[^\]]+\]\])/g), [content]);

  function setAns(id: string, val: string) {
    onChange({ ...answers, [id]: val });
  }

  function handleDragEnd(e: DragEndEvent) {
    const wordId = String(e.active.id);          // "word-xxx"
    const overId = e.over ? String(e.over.id) : null;  // "drop-<gapId>"
    if (!overId || !overId.startsWith("drop-")) return;
    const gapId = overId.replace("drop-", "");
    const label = wordId.replace(/^word-\d+-/, ""); // nhãn từ
    setAns(gapId, label);
  }

  const usedWords = new Set(Object.values(answers));

  const body = (
    <p className="text-[1.05rem] leading-[2.4]">
      {parts.map((part, i) => {
        const m = part.match(/^\[\[gap:([^\]]+)\]\]$/);
        if (!m) return <span key={i}>{part}</span>;
        const id = m[1];
        const g = gaps[id] || { type: "TEXT" };
        const d = detailMap[id];
        const state: "" | "correct" | "wrong" = !submitted ? "" : d?.isCorrect ? "correct" : "wrong";

        // màu khi đã nộp
        const fieldColor = state === "correct" ? "border-green-400 bg-green-50 text-green-800"
          : state === "wrong" ? "border-red-400 bg-red-50 text-red-800"
          : "border-gray-300";

        let field;
        if (g.type === "DROPDOWN") {
          field = (
            <select key={i} disabled={submitted} value={answers[id] || ""}
              onChange={(e) => setAns(id, e.target.value)}
              className={`mx-1 rounded-lg border px-2 py-1 text-sm ${fieldColor}`}>
              <option value="">— chọn —</option>
              {(g.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          );
        } else if (g.type === "DRAG") {
          field = <DropZone key={i} gapId={id} value={answers[id] || ""} locked={submitted} state={state} />;
        } else {
          field = (
            <input key={i} type="text" disabled={submitted} value={answers[id] || ""}
              onChange={(e) => setAns(id, e.target.value)}
              placeholder="..." size={Math.max(6, (answers[id]?.length || 6))}
              className={`mx-1 rounded-lg border px-2 py-0.5 text-sm ${fieldColor}`} />
          );
        }

        return (
          <span key={i} className="inline-flex items-center">
            {field}
            {submitted && !d?.isCorrect && d?.correctAnswers?.length > 0 && (
              <span className="ml-1 text-xs font-medium text-green-600">({d.correctAnswers[0]})</span>
            )}
          </span>
        );
      })}
    </p>
  );

  const hasDrag = Object.values(gaps).some((g) => g.type === "DRAG");

  if (!hasDrag) return body;

  // Có DRAG → bọc DndContext + ngân hàng từ
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