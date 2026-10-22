// FILE: src/components/CopyGuard.tsx — Cản sao chép nội dung ở mức thao tác thường.
// Chặn: bôi đen (user-select), chuột phải, copy/cut, và ⌘/Ctrl + C/X/S/P.
// CHỪA: input / textarea / [contenteditable] (HS vẫn gõ & thao tác trong ô đáp án).
// ADMIN/TEACHER: KHÔNG chặn (để dạy — bôi đen, copy thoải mái).
"use client";
import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";

function inEditable(el: EventTarget | null): boolean {
  const node = el as HTMLElement | null;
  if (!node || !node.closest) return false;
  return !!node.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]');
}

export default function CopyGuard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { user } = useAuth();
  const staff = user?.role === "ADMIN" || user?.role === "TEACHER";
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (staff) return;                         // nhân sự: không chặn
    const root = ref.current;
    if (!root) return;

    const block = (e: Event) => { if (!inEditable(e.target)) e.preventDefault(); };
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      if (inEditable(e.target)) return;
      const k = e.key.toLowerCase();
      if (["c", "x", "s", "p"].includes(k)) e.preventDefault();
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
  }, [staff]);

  // ADMIN/TEACHER: trả thẳng nội dung, không bọc khóa chọn
  if (staff) return <>{children}</>;

  return (
    <div
      ref={ref}
      className={`copy-guard ${className}`}
      style={{
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        userSelect: "none",
        WebkitTouchCallout: "none",
      }}
    >
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
