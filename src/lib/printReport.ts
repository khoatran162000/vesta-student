// FILE: src/lib/printReport.ts — In báo cáo HTML dán: mở cửa sổ sạch, ép in nền màu,
// khóa bề rộng thiết kế rồi scale cho vừa A4 (giữ bố cục y bản web).
// Report KHÔNG phải HTML dán (biểu mẫu bảng) → rơi về window.print() như cũ.
export function printHtmlReport(html?: string | null) {
  const src = String(html || "").trim();
  if (!src) { window.print(); return; }

  const w = window.open("", "_blank", "width=1200,height=1400");
  if (!w) { alert("Trình duyệt đang chặn cửa sổ in. Hãy cho phép popup cho trang này rồi thử lại."); return; }

  const DESIGN_W = 1100;              // bề rộng thiết kế report (khớp .html-report max-width web)
  const PRINT_W = 733;               // vùng in A4 dọc trừ lề 8mm ≈ 733px @96dpi
  const scale = PRINT_W / DESIGN_W;  // ~0.666

  w.document.open();
  w.document.write(src);
  w.document.close();

  const s = w.document.createElement("style");
  s.textContent =
    "@page{size:A4 portrait;margin:8mm;}" +
    "html,body,*{-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;}" +
    "@media print{" +
    "  html,body{margin:0 !important;padding:0 !important;background:#fff !important;}" +
    `  body{width:${DESIGN_W}px !important;transform:scale(${scale});transform-origin:top left;}` +
    "}";
  (w.document.head || w.document.documentElement).appendChild(s);

  w.focus();
  let printed = false;
  const doPrint = () => { if (printed) return; printed = true; try { w.print(); } catch {} };
  w.onload = doPrint;
  setTimeout(doPrint, 600);
}