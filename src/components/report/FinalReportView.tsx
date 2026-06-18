// FILE: src/components/report/FinalReportView.tsx
// Render báo cáo cuối khóa giống mẫu VESTA (student xem + in)
"use client";

const SKILL_COLS = [
  { key: "readingA", label: "Reading A" }, { key: "readingB", label: "Reading B" },
  { key: "listeningA", label: "Listening A / Reading C" }, { key: "listeningB", label: "Listening B / Transcript" },
  { key: "writing", label: "Writing" }, { key: "speaking", label: "Speaking" },
  { key: "lectures", label: "Lectures", maroon: true }, { key: "examPractice", label: "Exam Practice", maroon: true },
];

const REVIEW_CARDS = [
  { key: "reading", label: "📖 Reading", cls: "b" },
  { key: "listening", label: "🎧 Listening", cls: "g" },
  { key: "writingT1", label: "✍️ Writing Task 1", cls: "w" },
  { key: "writingT2", label: "✍️ Writing Task 2", cls: "o" },
  { key: "speaking", label: "🗣️ Speaking", cls: "a" },
  { key: "notebook", label: "📓 Vở ghi", cls: "" },
];

const PRED_BOXES = [
  { key: "listening", label: "🎧 Nghe" }, { key: "reading", label: "📖 Đọc" },
  { key: "writing", label: "✍️ Viết" }, { key: "speaking", label: "🗣️ Nói" },
];

function scoreClass(score: number | null): string {
  if (score === null || isNaN(score)) return "";
  if (score >= 85) return "hi";
  if (score >= 60) return "mi";
  return "lo";
}

export interface FinalReportViewData {
  student?: { fullName?: string; studentCode?: string | null; course?: string | null };
  course?: string | null;
  learnclickUser?: string | null;
  skillGrid?: { units: any[] };
  review?: Record<string, string> | null;
  prediction?: any;
  orientation?: { advice?: string; classInfo?: string } | null;
}

export default function FinalReportView({ data }: { data: FinalReportViewData }) {
  const units = data.skillGrid?.units || [];
  const review = data.review || {};
  const pred = data.prediction || {};
  const orient = data.orientation || {};
  const studentName = data.student?.fullName || "Học viên";

  return (
    <div className="final-doc">
      {/* Header */}
      <div className="fr-header">
        <div className="fr-h-left">
          <div className="fr-logo">VESTA</div>
          <div>
            <div className="fr-t1">VESTA UNI</div>
            <div className="fr-t2">Học Nhanh · Thi Chắc · Phá Tắc Band</div>
          </div>
        </div>
        <div className="fr-h-right">
          <div className="fr-r1">BÁO CÁO CUỐI KHÓA</div>
          <div className="fr-r2">{data.course || ""} Final Course Report</div>
        </div>
      </div>

      {/* Info */}
      <div className="fr-info">
        <div><span className="fr-lb">Học sinh:</span> <b>{studentName}</b></div>
        <div><span className="fr-lb">Lớp:</span> {data.course || "—"}</div>
        <div><span className="fr-lb">LearnClick:</span> {data.learnclickUser || "—"}</div>
      </div>

      {/* 1. Quá trình tích lũy kĩ năng */}
      <div className="fr-sec">1. QUÁ TRÌNH TÍCH LŨY KĨ NĂNG</div>
      <div className="fr-table-wrap">
        <table className="fr-tbl">
          <thead>
            <tr>
              <th className="fr-th-unit">Unit</th>
              {SKILL_COLS.map((c) => <th key={c.key} className={c.maroon ? "fr-th-m" : "fr-th-n"}>{c.label}</th>)}
              <th className="fr-th-rate">Đánh giá</th>
            </tr>
          </thead>
          <tbody>
            {units.map((u) => (
              <tr key={u.key}>
                <td className="fr-td-unit">{u.label}<div className="fr-unit-sub">{u.sublabel}</div></td>
                {SKILL_COLS.map((c) => {
                  const items = (u.cells?.[c.key] || []) as any[];
                  return (
                    <td key={c.key} className="fr-td">
                      {items.length === 0 ? <span className="fr-empty">—</span> : items.map((it, i) => (
                        <div key={i} className="fr-ci">
                          <div className="fr-ci-t">{it.title}</div>
                          <div className={`fr-sc ${scoreClass(it.score)}`}>{it.score === null ? "—" : `${it.score}%`}</div>
                          {it.note && <div className="fr-ci-n">{it.note}</div>}
                        </div>
                      ))}
                    </td>
                  );
                })}
                <td className="fr-td-rate">
                  <span className={`fr-rate ${scoreClass(u.rating)}`}>{u.rating === null || u.rating === undefined ? "—" : `${u.rating}%`}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2. Nhận xét cuối khóa */}
      <div className="fr-sec">2. NHẬN XÉT CUỐI KHÓA</div>
      {review.quickSummary && (
        <div className="fr-acard summary">
          <div className="fr-albl">Tổng kết nhanh cho {studentName}</div>
          <div className="fr-atxt">{review.quickSummary}</div>
        </div>
      )}
      <div className="fr-cards">
        {REVIEW_CARDS.filter((c) => review[c.key]).map((c) => (
          <div key={c.key} className={`fr-acard ${c.cls}`}>
            <div className="fr-albl">{c.label}</div>
            <div className="fr-atxt">{review[c.key]}</div>
          </div>
        ))}
      </div>

      {/* 3. Điểm dự đoán cuối khóa */}
      <div className="fr-sec">3. ĐIỂM DỰ ĐOÁN CUỐI KHÓA</div>
      <div className="fr-preds">
        {PRED_BOXES.map((b) => (
          <div key={b.key} className="fr-sbox">
            <div className="fr-sbox-lbl">{b.label}</div>
            <div className="fr-sbox-val">{pred[b.key]?.band || "—"}</div>
            <div className="fr-sbox-sub">{pred[b.key]?.sub || ""}</div>
          </div>
        ))}
        <div className="fr-sbox ov">
          <div className="fr-sbox-lbl">Overall</div>
          <div className="fr-sbox-val">{pred.overall?.band || "—"}</div>
          <div className="fr-sbox-sub">{pred.overall?.sub || "Ước tính cuối khóa"}</div>
        </div>
      </div>
      {pred.note && (
        <div className="fr-acard">
          <div className="fr-albl">Ghi chú dự đoán</div>
          <div className="fr-atxt">{pred.note}</div>
        </div>
      )}

      {/* 4. Định hướng */}
      <div className="fr-sec">4. ĐỊNH HƯỚNG SAU KHÓA HỌC</div>
      {orient.advice && <p className="fr-orient">{orient.advice}</p>}
      {orient.classInfo && <div className="fr-classinfo">{orient.classInfo}</div>}

      {/* Footer */}
      <div className="fr-footer">VESTA UNI — Học Nhanh · Thi Chắc · Phá Tắc Band</div>

      <style jsx>{`
        .final-doc {
          --gold:#A9966F; --gold-light:#D9D2C2; --maroon:#7A1020; --maroon-dark:#4A0A14;
          --royal:#162A5A; --royal-light:#263E78; --text-dark:#161728; --text-med:#4C4A54;
          background:#fff; color:var(--text-dark); max-width:1100px; margin:0 auto;
          box-shadow:0 2px 16px rgba(0,0,0,.08); font-size:12px;
        }
        .fr-header { background:linear-gradient(135deg,var(--maroon-dark),var(--maroon) 55%,#8B1A29); padding:16px 22px; display:flex; justify-content:space-between; align-items:center; }
        .fr-h-left { display:flex; align-items:center; gap:12px; }
        .fr-logo { width:50px; height:50px; border-radius:50%; background:#fff; color:var(--maroon); display:flex; align-items:center; justify-content:center; font-weight:800; font-family:Georgia,serif; font-size:13px; }
        .fr-t1 { font-family:Georgia,serif; font-size:19px; font-weight:800; color:#fff; }
        .fr-t2 { font-size:9px; color:var(--gold-light); letter-spacing:1.5px; text-transform:uppercase; margin-top:2px; }
        .fr-h-right { text-align:right; }
        .fr-r1 { font-family:Georgia,serif; font-size:17px; font-weight:800; color:var(--gold-light); }
        .fr-r2 { font-size:9px; color:rgba(255,255,255,.7); letter-spacing:1px; text-transform:uppercase; margin-top:2px; }
        .fr-info { display:flex; gap:28px; flex-wrap:wrap; padding:12px 22px; background:#F8F8F6; font-size:11px; border-bottom:2px solid var(--gold-light); }
        .fr-lb { color:var(--text-med); }
        .fr-sec { font-family:Georgia,serif; font-size:14px; font-weight:700; color:var(--royal); padding:7px 12px; background:linear-gradient(90deg,rgba(22,42,90,.08),transparent); border-left:4px solid var(--gold); margin:16px 22px 10px; }
        .fr-table-wrap { padding:0 22px; overflow-x:auto; }
        .fr-tbl { width:100%; border-collapse:collapse; font-size:9.5px; }
        .fr-tbl th { padding:5px 3px; text-align:center; font-size:8px; text-transform:uppercase; font-weight:700; color:#fff; }
        .fr-th-unit, .fr-th-n { background:var(--royal); }
        .fr-th-m { background:var(--maroon); }
        .fr-th-rate { background:var(--gold); color:#fff !important; }
        .fr-td-unit { background:var(--royal); color:var(--gold-light); text-align:center; padding:5px; font-weight:700; width:64px; }
        .fr-unit-sub { font-size:7px; color:rgba(255,255,255,.6); font-weight:400; }
        .fr-td { border:1px solid #E5E7EB; padding:2px; vertical-align:top; min-width:72px; }
        .fr-td-rate { border:1px solid #E5E7EB; background:#F8F8F6; text-align:center; vertical-align:middle; }
        .fr-empty { color:#CBD5E1; display:block; text-align:center; padding:5px 0; }
        .fr-ci { background:#fff; border-radius:3px; padding:2px 3px; margin-bottom:2px; }
        .fr-ci-t { font-size:7.5px; font-weight:600; color:#475569; }
        .fr-sc { font-size:13px; font-weight:800; }
        .fr-sc.hi { color:var(--royal); } .fr-sc.mi { color:var(--gold); } .fr-sc.lo { color:var(--maroon); }
        .fr-ci-n { font-size:7px; color:var(--maroon); font-style:italic; }
        .fr-rate { font-size:13px; font-weight:800; }
        .fr-rate.hi { color:var(--royal); } .fr-rate.mi { color:var(--gold); } .fr-rate.lo { color:var(--maroon); }
        .fr-acard { margin:0 22px 10px; padding:10px 14px; border:1px solid #E5E7EB; border-radius:8px; border-left:4px solid var(--gold); }
        .fr-acard.summary { background:#F8F8F6; border-left-color:var(--royal); }
        .fr-albl { font-size:11px; font-weight:800; color:var(--royal); margin-bottom:4px; }
        .fr-atxt { font-size:11px; line-height:1.6; color:var(--text-dark); white-space:pre-wrap; }
        .fr-cards { display:grid; grid-template-columns:1fr 1fr; gap:10px; padding:0 22px; }
        .fr-cards .fr-acard { margin:0; }
        .fr-acard.b { border-left-color:#263E78; } .fr-acard.g { border-left-color:#0F766E; }
        .fr-acard.w { border-left-color:#A9966F; } .fr-acard.o { border-left-color:#B45309; }
        .fr-acard.a { border-left-color:#7A1020; }
        .fr-preds { display:grid; grid-template-columns:repeat(5,1fr); gap:10px; padding:0 22px; }
        .fr-sbox { border:1px solid var(--gold-light); border-radius:10px; padding:12px 8px; text-align:center; background:#FAFAF8; }
        .fr-sbox.ov { background:linear-gradient(135deg,var(--royal),var(--royal-light)); border-color:var(--royal); }
        .fr-sbox-lbl { font-size:10px; font-weight:700; color:var(--text-med); }
        .fr-sbox.ov .fr-sbox-lbl { color:var(--gold-light); }
        .fr-sbox-val { font-family:Georgia,serif; font-size:22px; font-weight:800; color:var(--maroon); margin:4px 0; }
        .fr-sbox.ov .fr-sbox-val { color:#fff; }
        .fr-sbox-sub { font-size:8.5px; color:var(--text-med); }
        .fr-sbox.ov .fr-sbox-sub { color:rgba(255,255,255,.8); }
        .fr-orient { margin:0 22px 10px; padding:12px 16px; background:#F8F8F6; border-radius:8px; font-size:11px; line-height:1.7; white-space:pre-wrap; }
        .fr-classinfo { margin:0 22px 14px; padding:14px 16px; background:linear-gradient(135deg,rgba(169,150,111,.12),rgba(22,42,90,.06)); border:1px dashed var(--gold); border-radius:10px; font-size:11px; line-height:1.7; white-space:pre-wrap; }
        .fr-footer { background:linear-gradient(180deg,var(--maroon-dark),#5A0F18); padding:12px; text-align:center; color:var(--gold-light); font-family:Georgia,serif; font-size:12px; font-weight:700; border-top:3px solid var(--gold-light); margin-top:14px; }
        @media print {
          @page { size:A4 portrait; margin:8mm; }
          .final-doc { box-shadow:none; max-width:none; font-size:10px; }
          .fr-sbox-val { font-size:18px; }
        }
      `}</style>
    </div>
  );
}