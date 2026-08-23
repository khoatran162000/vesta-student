// FILE: src/app/(protected)/bai-cham/page.tsx — HS xem đơn chấm bài của mình + bài chữa (không cần mã đơn)
"use client";
import { useEffect, useState } from "react";
import { Loader2, FileText, Download, ChevronDown, ChevronUp, ClipboardCheck } from "lucide-react";
import { apiFetch, getImageUrl } from "@/lib/api";

type Order = {
  id: string; code: string; status: string; gradingType: string | null;
  amount: number; createdAt: string; deliveredAt: string | null;
  deliverUrl: string | null; resultHtml: string | null;
};

const STATUS: Record<string, { label: string; cls: string }> = {
  PENDING:   { label: "Chờ xử lý",     cls: "bg-amber-50 text-amber-700 border-amber-200" },
  PAID:      { label: "Đã thanh toán", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  DELIVERED: { label: "Đã chấm xong",  cls: "bg-green-50 text-green-700 border-green-200" },
  CANCELLED: { label: "Đã huỷ",        cls: "bg-gray-100 text-gray-500 border-gray-200" },
};

const isFullDoc = (s: string) => /<html[\s>]/i.test(s) || /<!doctype/i.test(s) || /<style[\s>]/i.test(s);
const fmtDate = (s?: string | null) => (s ? new Date(s).toLocaleDateString("vi-VN") : "");

function ResultView({ html }: { html: string }) {
  if (isFullDoc(html)) {
    return (
      <iframe title="bai-chua" srcDoc={html} sandbox="allow-same-origin allow-popups"
        className="w-full rounded-lg border border-cream-dark bg-white" style={{ height: "70vh" }} />
    );
  }
  return (
    <div className="max-w-none rounded-lg border border-cream-dark bg-white p-4 text-sm leading-relaxed [&_img]:max-w-full [&_table]:w-full"
      dangerouslySetInnerHTML={{ __html: html }} />
  );
}

export default function BaiChamPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const json = await apiFetch("/student/grading-orders");
        setOrders(json?.data || []);
      } catch { setOrders([]); }
    })();
  }, []);

  if (orders === null)
    return <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-gold" /></div>;

  return (
    <div className="mx-auto max-w-[820px]">
      <div className="mb-2 flex items-center gap-2">
        <ClipboardCheck className="text-gold" size={22} />
        <h1 className="font-display text-2xl font-bold text-royal">Bài chấm</h1>
      </div>
      <p className="mb-6 text-sm text-muted">Bài viết/nói bạn gửi chấm chữa và kết quả từ giáo viên sẽ hiển thị ở đây — không cần nhập mã đơn.</p>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-cream-dark bg-white py-16 text-center text-muted">
          Bạn chưa có đơn chấm bài nào. Khi gửi bài chấm chữa, đơn sẽ hiện ở đây.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const st = STATUS[o.status] || STATUS.PENDING;
            const delivered = o.status === "DELIVERED";
            const isOpen = open === o.id;
            return (
              <div key={o.id} className="overflow-hidden rounded-xl border border-cream-dark bg-white">
                <button
                  onClick={() => delivered && setOpen(isOpen ? null : o.id)}
                  className={`flex w-full items-center gap-3 p-4 text-left ${delivered ? "hover:bg-cream/40" : "cursor-default"}`}>
                  <FileText size={18} className="shrink-0 text-royal/70" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-royal">Chấm bài {o.gradingType || "Writing"}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[0.7rem] font-medium ${st.cls}`}>{st.label}</span>
                    </div>
                    <div className="mt-0.5 text-xs text-muted">
                      Mã đơn {o.code} · Gửi {fmtDate(o.createdAt)}{o.deliveredAt ? ` · Trả ${fmtDate(o.deliveredAt)}` : ""}
                    </div>
                  </div>
                  {delivered && (isOpen ? <ChevronUp size={18} className="text-muted" /> : <ChevronDown size={18} className="text-muted" />)}
                </button>

                {delivered && isOpen && (
                  <div className="border-t border-cream-dark p-4">
                    {o.deliverUrl && (
                      <a href={getImageUrl(o.deliverUrl)} target="_blank" rel="noopener noreferrer"
                        className="mb-3 inline-flex items-center gap-2 rounded-lg bg-royal px-3 py-2 text-sm font-medium text-white hover:opacity-90">
                        <Download size={15} /> Tải file bài chữa
                      </a>
                    )}
                    {o.resultHtml ? (
                      <ResultView html={o.resultHtml} />
                    ) : (
                      !o.deliverUrl && <p className="text-sm text-muted">Giáo viên đã đánh dấu hoàn tất. Nếu chưa thấy nội dung, vui lòng liên hệ trung tâm.</p>
                    )}
                  </div>
                )}

                {!delivered && (
                  <div className="border-t border-cream-dark px-4 py-3 text-xs text-muted">
                    {o.status === "PENDING"
                      ? "Đơn đang chờ xử lý / xác nhận thanh toán."
                      : o.status === "CANCELLED"
                      ? "Đơn đã huỷ."
                      : "Đã thanh toán — giáo viên đang chấm, bạn sẽ nhận thông báo khi có kết quả."}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
