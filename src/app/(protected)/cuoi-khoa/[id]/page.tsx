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

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-gold" /></div>;
  if (!data) return null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link href="/cuoi-khoa" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-royal">
          <ArrowLeft size={15} />Quay lại
        </Link>
        <button onClick={() => window.print()} className="btn-primary">
          <Printer size={15} />In báo cáo
        </button>
      </div>
      <FinalReportView data={data} />
    </div>
  );
}