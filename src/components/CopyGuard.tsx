// FILE: src/components/CopyGuard.tsx — Cản sao chép nội dung ở mức thao tác thường.
// Chặn: bôi đen (user-select), chuột phải, copy/cut, và ⌘/Ctrl + C/X/S/P.
// CHỪA: input / textarea / [contenteditable] (HS vẫn gõ & thao tác trong ô đáp án).
// LƯU Ý: KHÔNG chặn được tuyệt đối (F12 / xem nguồn / chụp màn hình vẫn lấy được).
"use client";
import { useEffect, useRef } from "react";

function inEditable(el: EventTarget | null): boolean {
  const node = el as HTMLElement | null;
  if (!node || !node.closest) return false;
  return !!node.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]');
}

export default function CopyGuard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const block = (e: Event) => { if (!inEditable(e.target)) e.preventDefault(); };
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      if (inEditable(e.target)) return;              // trong ô nhập thì cho thao tác bình thường
      const k = e.key.toLowerCase();
      if (["c", "x", "s", "p"].includes(k)) e.preventDefault();  // copy/cut/save/print
    };

    root.addEventListener("copy", block);
    root.addEventListener("cut", block);
    root.addEventListener("contextmenu", block);
    root.addEventListener("dragstart", block);
    root.addEventListener("keydown", onKey);
    return () => {
      root.removeEventListener("copy", block);
      root.removeEventListener("cut", block);
      root.removeEventListener("contextmenu", block);
      root.removeEventListener("dragstart", block);
      root.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`copy-guard ${className}`}
      style={{
        // chặn bôi đen; ô nhập được mở lại bằng CSS bên dưới
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        userSelect: "none",
        WebkitTouchCallout: "none",
      }}
    >
      {/* Mở lại chọn/tương tác cho ô nhập bên trong vùng bị khóa */}
      <style>{`
        .copy-guard input,
        .copy-guard textarea,
        .copy-guard select,
        .copy-guard [contenteditable] {
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          user-select: text !important;
        }
      `}</style>
      {children}
    </div>
  );
}