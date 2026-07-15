// FILE: src/app/(protected)/tai-lieu/page.tsx — Tài liệu học
"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { FileText, Video, Link2, FileCode, ExternalLink, Lock, X } from "lucide-react";
import Link from "next/link";

function getIcon(fileType?: string) {
  const t = (fileType || "").toUpperCase();
  if (t.includes("VIDEO")) return Video;
  if (t.includes("LINK") || t.includes("PADLET")) return Link2;
  if (t.includes("PDF") || t.includes("DOC")) return FileText;
  return FileCode;
}

export default function MaterialsPage() {
  const { user, loading: authLoading } = useAuth();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reading, setReading] = useState<any>(null);

  useEffect(() => {
    if (!user?.course) { setLoading(false); return; }
    api.get(`/class/materials?course=${encodeURIComponent(user.course)}&limit=200`)
      .then((res) => { if (res.success) setMaterials(res.data || []); })
      .finally(() => setLoading(false));
  }, [user]);

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

  const sorted = [...materials].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  const cardInner = (m: any, Icon: any) => (
    <>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="truncate font-semibold text-[#1a1a2e]">{m.title}</p>
        {m.description && <p className="truncate text-xs text-muted">{m.description}</p>}
        <p className="mt-0.5 text-[0.6rem] uppercase tracking-wider text-muted">{m.fileType || "LINK"}</p>
      </div>
      <ExternalLink size={14} className="text-muted opacity-0 transition-opacity group-hover:opacity-100" />
    </>
  );

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-royal">Tài liệu học</h1>
        <p className="mt-1 text-sm text-muted">Lớp {user.course} · {materials.length} tài liệu</p>
      </div>

      {sorted.length === 0 ? (
        <div className="card py-12 text-center text-sm text-muted">Chưa có tài liệu nào.</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {sorted.map((m) => {
            const Icon = getIcon(m.contentHtml ? "HTML" : m.fileType);
            // Tài liệu HTML: đọc tại chỗ. Tài liệu link: mở tab mới như cũ.
            return m.contentHtml ? (
              <button key={m.id} onClick={() => setReading(m)}
                className="group card flex w-full items-center gap-3 hover:-translate-y-0.5 hover:shadow-md">
                {cardInner(m, Icon)}
              </button>
            ) : (
              <a key={m.id} href={m.fileUrl} target="_blank" rel="noopener noreferrer"
                className="group card flex items-center gap-3 hover:-translate-y-0.5 hover:shadow-md">
                {cardInner(m, Icon)}
              </a>
            );
          })}
        </div>
      )}

      {reading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 px-4 py-8">
          <div className="flex max-h-full w-full max-w-[900px] flex-col rounded-2xl bg-white shadow-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-silver/20 px-5 py-3">
              <h3 className="truncate text-base font-bold text-royal">{reading.title}</h3>
              <button onClick={() => setReading(null)} className="text-muted hover:text-royal"><X size={20} /></button>
            </div>
            <div className="overflow-auto p-5">
              <div dangerouslySetInnerHTML={{ __html: reading.contentHtml }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}