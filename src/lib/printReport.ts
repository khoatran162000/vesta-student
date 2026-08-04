// FILE: src/lib/printReport.ts — In báo cáo HTML dán: mở cửa sổ sạch, ép in nền màu,
// dùng `zoom` thu nhỏ CẢ layout cho vừa khổ A4 (giữ nguyên bố cục bản web).
// Report KHÔNG phải HTML dán (biểu mẫu bảng) → rơi về window.print() như cũ.
export function printHtmlReport(html?: string | null) {
  const src = String(html || "").trim();
  if (!src) { window.print(); return; }

  const w = window.open("", "_blank", "width=1200,height=1400");
  if (!w) { alert("Trình duyệt đang chặn cửa sổ in. Hãy cho phép popup cho trang này rồi thử lại."); return; }

  const DESIGN_W = 960;                         // bề rộng thiết kế report (px) — hạ để report phóng to vừa khổ
  const PRINT_W = 720;                          // vùng in A4 dọc (~190mm) @96dpi
  const zoom = Math.min(1, PRINT_W / DESIGN_W); // ~0.75; không phóng quá 1

  w.document.open();
  w.document.write(src);
  w.document.close();

  const s = w.document.createElement("style");
  s.textContent =
    "@page{size:A4 portrait;margin:8mm;}" +
    // ép in nền/màu dù checkbox Background graphics tắt
    "html,body,*{-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;}" +
    // zoom co CẢ layout cho vừa A4 — bố cục giữ nguyên, không dồn/không chừa trắng
    "@media print{" +
    "  html,body{margin:0 !important;padding:0 !important;background:#fff !important;}" +
    `  body{zoom:${zoom};}` +
    "}";
  (w.document.head || w.document.documentElement).appendChild(s);

  w.focus();
  let printed = false;
  const doPrint = () => { if (printed) return; printed = true; try { w.print(); } catch {} };
  w.onload = doPrint;
  setTimeout(doPrint, 600);
}