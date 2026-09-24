// FILE: thong-bao/xem/[token]/page.tsx — Xem nội dung thông báo nặng (HTML) qua iframe cô lập
"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const MOBILE_FIX = `<style>@media (max-width:640px){html,body{overflow-x:hidden!important}*{max-width:100%!important;overflow-wrap:anywhere}img,table,video,figure{max-width:100%!important;height:auto}}</style>`;
function withFix(h: string): string {
  if (!h) return h;
  return /<\/head>/i.test(h) ? h.replace(/<\/head>/i, MOBILE_FIX + "</head>") : MOBILE_FIX + h;
}

export default function NotifViewPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [html, setHtml] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "empty">("loading");

  useEffect(() => {
    const t = String(token || "").replace(/[^a-z0-9]/gi, "");
    if (!t) { setStatus("empty"); return; }
    (async () => {
      try {
        const res = await fetch(`${API_URL}/site-content/notif_${t}`, { cache: "no-store" });
        const j = await res.json();
        const c = j?.data?.data?.html || "";
        if (c) { setHtml(withFix(c)); setStatus("ok"); }
        else setStatus("empty");
      } catch { setStatus("empty"); }
    })();
  }, [token]);

  return (
    <div className="mx-auto max-w-[1100px]">
      <button onClick={() => router.push("/thong-bao")}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-royal">
        <ArrowLeft size={16} />Quay lại thông báo
      </button>
      {status === "loading" && (
        <div className="flex justify-center py-20"><Loader2 size={26} className="animate-spin text-gold" /></div>
      )}
      {status === "empty" && (
        <div className="py-20 text-center text-muted">Không tìm thấy nội dung thông báo.</div>
      )}
      {status === "ok" && html !== null && (
        <iframe
          srcDoc={html}
          title="Nội dung thông báo"
          sandbox="allow-scripts allow-same-origin allow-popups"
          className="w-full rounded-lg border border-silver/30 bg-white"
          style={{ height: "calc(100vh - 8rem)" }}
        />
      )}
    </div>
  );
}
