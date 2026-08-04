// FILE: src/app/(protected)/cuoi-khoa/[id]/page.tsx — Student: xem báo cáo cuối khóa
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import FinalReportView from "@/components/report/FinalReportView";

export default function ViewFinalReportPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await api.get(`/final-reports/${id}`);
      if (res.success) setData(res.data);
      else { alert(res.message || "Không xem được báo cáo"); router.push("/cuoi-khoa"); }
      setLoading(false);
    })();
  }, [id, router]);

  // In báo cáo:
  // - Report HTML dán (data.html): mở cửa sổ in sạch chỉ chứa report + ÉP in nền màu
  //   (không cần tự tích "Print backgrounds"), tránh in iframe từ trang cha bị trắng.
  // - Report cấu trúc (không có html): in trang như cũ (sidebar đã print:hidden).
  function printReport() {
    const html = String(data?.html || "").trim();
    if (!html) { window.print(); return; }
    const w = window.open("", "_blank", "width=900,height=1200");
    if (!w) { alert("Trình duyệt đang chặn cửa sổ in. Hãy cho phép popup cho trang này rồi thử lại."); return; }
    w.document.open();
    w.document.write(html);
    w.document.close();
    // Ép in nền/màu dù checkbox "Print backgrounds" đang tắt
    const s = w.document.createElement("style");
    s.textContent =
      "@page{margin:8mm;}" +
      "html,body,*{-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;}";
    (w.document.head || w.document.documentElement).appendChild(s);
    w.focus();
    // In sau khi tải xong (ảnh/logo kịp hiện); có fallback nếu onload không bắn
    let printed = false;
    const doPrint = () => { if (printed) return; printed = true; try { w.print(); } catch {} };
    w.onload = doPrint;
    setTimeout(doPrint, 600);
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-gold" /></div>;
  if (!data) return null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link href="/cuoi-khoa" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-royal">
          <ArrowLeft size={15} />Quay lại
        </Link>
        <button onClick={printReport} className="btn-primary">
          <Printer size={15} />In báo cáo
        </button>
      </div>
      <FinalReportView data={data} />
    </div>
  );
}