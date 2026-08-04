// FILE: src/lib/printReport.ts — In báo cáo HTML dán: mở cửa sổ sạch, ép in nền màu,
// dùng `zoom` co CẢ layout vừa khổ A4, và CĂN GIỮA report theo chiều dọc (dư chia đều trên/dưới).
// Report KHÔNG phải HTML dán (biểu mẫu bảng) → rơi về window.print() như cũ.
export function printHtmlReport(html?: string | null) {
  const src = String(html || "").trim();
  if (!src) { window.print(); return; }

  const w = window.open("", "_blank", "width=1200,height=1400");
  if (!w) { alert("Trình duyệt đang chặn cửa sổ in. Hãy cho phép popup cho trang này rồi thử lại."); return; }

  const DESIGN_W = 960;                          // bề rộng thiết kế report (px)
  const PRINT_W = 720;                           // vùng in A4 dọc (~190mm) @96dpi
  const zoom = Math.min(1, PRINT_W / DESIGN_W);  // ~0.75

  w.document.open();
  w.document.write(src);
  w.document.close();

  // Bọc toàn bộ nội dung report vào 1 wrapper để căn giữa dọc mà không phá layout gốc.
  const b = w.document.body;
  if (b) {
    const wrap = w.document.createElement("div");
    wrap.className = "vesta-print-wrap";
    while (b.firstChild) wrap.appendChild(b.firstChild);
    b.appendChild(wrap);
  }

  const s = w.document.createElement("style");
  s.textContent =
    "@page{size:A4 portrait;margin:8mm;}" +
    "html,body,*{-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;}" +
    "@media print{" +
    "  html{height:100%;}" +
    "  body{margin:0 !important;padding:0 !important;background:#fff !important;" +
    "       min-height:100vh; display:flex; align-items:center; justify-content:center;}" +
    // zoom co layout vừa A4; wrapper giữ bề rộng thiết kế
    `  .vesta-print-wrap{zoom:${zoom}; width:${DESIGN_W}px;}` +
    "}";
  (w.document.head || w.document.documentElement).appendChild(s);

  w.focus();
  let printed = false;
  const doPrint = () => { if (printed) return; printed = true; try { w.print(); } catch {} };
  w.onload = doPrint;
  setTimeout(doPrint, 600);
}