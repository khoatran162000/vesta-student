// FILE: src/components/exercise/MatchingPlayer.tsx — HV nối cột (Matching)
"use client";
import { CheckCircle2, XCircle } from "lucide-react";

export interface MatchingData {
  pairs: { id: string; left: string }[];
  choices: string[];
}

interface Props {
  data: MatchingData;
  answers: Record<string, any>;
  onChange: (a: Record<string, any>) => void;
  result: any; // sau khi nộp
}

export default function MatchingPlayer({ data, answers, onChange, result }: Props) {
  const pairs = data?.pairs || [];
  const choices = data?.choices || [];

  function setMatch(pairId: string, value: string) {
    onChange({ ...answers, [pairId]: value });
  }

  return (
    <div className="space-y-3">
      {pairs.map((p, i) => {
        const detail = result?.detail?.find((d: any) => d.id === p.id);
        const selected = answers[p.id] || "";
        return (
          <div key={p.id} className="flex items-center gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-royal/8 text-xs font-bold text-royal">{i + 1}</div>
            <div className="flex-1 rounded-lg border border-silver/30 bg-cream/40 px-3 py-2 text-sm font-medium text-[#1a1a2e]">
              {p.left}
            </div>
            <span className="text-muted">→</span>
            <div className="flex-1">
              <select value={selected} disabled={!!result}
                onChange={(e) => setMatch(p.id, e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${
                  detail ? (detail.isCorrect ? "border-green-400 bg-green-50" : "border-red-400 bg-red-50") : "border-silver/40 focus:border-gold"
                }`}>
                <option value="">— chọn —</option>
                {choices.map((c, j) => <option key={j} value={c}>{c}</option>)}
              </select>
              {detail && !detail.isCorrect && (
                <p className="mt-1 text-xs text-green-600">Đáp án đúng: <strong>{String(detail.correctAnswer)}</strong></p>
              )}
            </div>
            {detail && (detail.isCorrect
              ? <CheckCircle2 size={20} className="shrink-0 text-green-500" />
              : <XCircle size={20} className="shrink-0 text-red-500" />)}
          </div>
        );
      })}
    </div>
  );
}