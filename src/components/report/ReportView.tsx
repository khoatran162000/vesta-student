// FILE: src/components/report/ReportView.tsx
// Render báo cáo định kỳ giống mẫu VESTA (dùng cho student xem + in A4)
"use client";

const COLS = [
  { key: "bai1", label: "Bài .1" }, { key: "bai2", label: "Bài .2" },
  { key: "bai3", label: "Bài .3" }, { key: "bai4", label: "Bài .4" },
  { key: "bai5", label: "Bài .5" }, { key: "bai6", label: "Bài .6" },
  { key: "examPractice", label: "Exam Practice", maroon: true },
  { key: "lectures", label: "Lectures", maroon: true },
];

function scoreClass(score: number | null): string {
  if (score === null || isNaN(score)) return "";
  if (score >= 85) return "hi";
  if (score >= 60) return "mi";
  return "lo";
}
function fmtDate(d: string | null) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("vi-VN"); } catch { return d as string; }
}

export interface ReportViewData {
  student?: { fullName?: string; studentCode?: string | null; course?: string | null };
  course?: string | null;
  learnclickUser?: string | null;
  padletAccount?: string | null;
  periodTo?: string | null;
  dataFrom?: string | null;
  dataTo?: string | null;
  grid?: { units: any[] };
  teacherNote?: { strengths?: string; reminders?: string; homework?: string; attitude?: string } | null;
}

export default function ReportView({ data }: { data: ReportViewData }) {
  const units = data.grid?.units || [];
  const note = data.teacherNote || {};
  const noteFields = [
    { key: "strengths", label: "Điểm mạnh" },
    { key: "reminders", label: "Nhắc nhở cần xử lý ngay" },
    { key: "homework", label: "Bài tập về nhà" },
    { key: "attitude", label: "Thái độ học tập & ghi bài" },
  ] as const;

  return (
    <div className="report-doc">
      {/* Header */}
      <div className="rp-header">
        <div className="rp-header-left">
          <div className="rp-logo">VESTA</div>
          <div>
            <div className="rp-t1">VESTA UNI</div>
            <div className="rp-t2">Học Nhanh · Thi Chắc · Phá Tắc Band</div>
          </div>
        </div>
        <div className="rp-header-right">
          <div className="rp-r1">BÁO CÁO ĐỊNH KÌ HÀNG TUẦN</div>
          <div className="rp-r2">{data.course || "7+"} Weekly Progress Report</div>
        </div>
      </div>

      {/* Thông tin HS */}
      <div className="rp-info">
        <div><span className="rp-info-lb">Học sinh:</span> <b>{data.student?.fullName || "—"}</b></div>
        <div><span className="rp-info-lb">Lớp:</span> {data.course || "—"}</div>
        <div><span className="rp-info-lb">LearnClick:</span> {data.learnclickUser || "—"}</div>
        <div><span className="rp-info-lb">Padlet:</span> {data.padletAccount || "—"}</div>
        <div><span className="rp-info-lb">Kỳ báo cáo đến:</span> {fmtDate(data.periodTo ?? null)}</div>
        <div><span className="rp-info-lb">Dữ liệu LearnClick:</span> {fmtDate(data.dataFrom ?? null)} – {fmtDate(data.dataTo ?? null)}</div>
      </div>

      {/* Bảng theo dõi */}
      <div className="rp-sec-title">Theo dõi LearnClick theo lộ trình {data.course || "7+"}</div>
      <div className="rp-table-wrap">
        <table className="rp-tbl">
          <thead>
            <tr>
              <th className="rp-th-unit">Unit</th>
              {COLS.map((c) => (
                <th key={c.key} className={c.maroon ? "rp-th-maroon" : "rp-th-navy"}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {units.map((u) => (
              <tr key={u.key} className={u.key === "TESTS" ? "rp-row-tests" : ""}>
                <td className="rp-td-unit">
                  <div className="rp-unit-label">{u.label}</div>
                  <div className="rp-unit-sub">{u.sublabel}</div>
                </td>
                {COLS.map((c) => {
                  const items = (u.cells?.[c.key] || []) as any[];
                  return (
                    <td key={c.key} className="rp-td-cell">
                      {items.length === 0 ? (
                        <span className="rp-empty">Chưa làm</span>
                      ) : (
                        items.map((it, i) => (
                          <div key={i} className="rp-ci">
                            <div className="rp-ci-title">{it.title}</div>
                            <div className={`rp-sc ${scoreClass(it.score)}`}>
                              {it.score === null || it.score === undefined ? "—" : `${it.score}%`}
                            </div>
                            <div className="rp-ci-meta">
                              {(it.attempts ?? 0)} lần{it.date ? ` · ${it.date}` : ""}
                            </div>
                            {it.note && <div className="rp-ci-note">{it.note}</div>}
                          </div>
                        ))
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Nhận xét GV */}
      <div className="rp-sec-title">Nhận xét của giáo viên</div>
      <div className="rp-notes">
        {noteFields.map((f) => (
          <div key={f.key} className="rp-note-box">
            <div className="rp-note-lb">{f.label}</div>
            <div className="rp-note-val">{(note as any)[f.key] || <span className="rp-empty">—</span>}</div>
          </div>
        ))}
      </div>

      {/* Ký */}
      <div className="rp-sign">
        <div className="rp-sign-col">
          <div className="rp-sign-title">Phòng Học Thuật VESTA UNI</div>
          <div className="rp-sign-sub">Xác nhận báo cáo học tập định kì</div>
          <div className="rp-sign-blank" />
        </div>
        <div className="rp-sign-col">
          <div className="rp-sign-title">Phụ huynh / Học sinh</div>
          <div className="rp-sign-sub">Xác nhận đã đọc báo cáo</div>
          <div className="rp-sign-blank" />
        </div>
      </div>

      {/* Footer */}
      <div className="rp-footer">
        <div className="rp-mf-company">CÔNG TY TNHH <span>VESTA UNI</span></div>
        <div className="rp-mf-line">
          <span>MST: 0111130332</span>
          <span>60 Hoàng Quốc Việt, Cầu Giấy, Hà Nội</span>
        </div>
      </div>

      <style jsx>{`
        .report-doc {
          --gold:#C9A84C; --gold-light:#E8D48B; --gold-dim:#9A7A32;
          --maroon:#7B1A26; --maroon-dark:#4A0A10; --maroon-mid:#A3243A;
          --navy:#0F1A3A; --navy-mid:#1B2A5B; --text-soft:#7A8899; --text-dark:#1A1A2E;
          background:#fff; color:var(--text-dark); font-size:12px;
          max-width:1100px; margin:0 auto; box-shadow:0 2px 16px rgba(0,0,0,.08);
        }
        .rp-header {
          background:linear-gradient(135deg,var(--maroon-dark) 0%,var(--maroon) 42%,#9B2232 72%,var(--maroon-dark) 100%);
          padding:14px 20px; display:flex; justify-content:space-between; align-items:center;
        }
        .rp-header-left { display:flex; align-items:center; gap:12px; }
        .rp-logo {
          width:48px; height:48px; border-radius:50%; background:#fff; color:var(--maroon);
          display:flex; align-items:center; justify-content:center; font-weight:800; font-size:13px; font-family:Georgia,serif;
        }
        .rp-t1 { font-family:Georgia,serif; font-size:18px; font-weight:800; color:#fff; }
        .rp-t2 { font-size:9px; color:var(--gold-light); letter-spacing:1px; text-transform:uppercase; margin-top:2px; }
        .rp-header-right { text-align:right; }
        .rp-r1 { font-family:Georgia,serif; font-size:16px; font-weight:800; color:var(--gold-light); }
        .rp-r2 { font-size:9px; color:rgba(255,255,255,.7); letter-spacing:1px; text-transform:uppercase; margin-top:2px; }
        .rp-info {
          display:grid; grid-template-columns:repeat(3,1fr); gap:6px 18px;
          padding:12px 20px; background:#F5EDD0; font-size:11px;
        }
        .rp-info-lb { color:var(--text-soft); }
        .rp-sec-title {
          font-family:Georgia,serif; font-size:14px; font-weight:700; color:var(--navy);
          padding:6px 11px; background:linear-gradient(90deg,rgba(15,26,58,.08),transparent);
          border-left:4px solid var(--gold); margin:14px 20px 8px;
        }
        .rp-table-wrap { padding:0 20px; overflow-x:auto; }
        .rp-tbl { width:100%; border-collapse:collapse; font-size:10px; }
        .rp-th-unit, .rp-th-navy { background:var(--navy-mid); color:#fff; }
        .rp-th-maroon { background:var(--maroon); color:#fff; }
        .rp-tbl th { padding:6px 4px; text-align:center; font-size:9px; text-transform:uppercase; font-weight:700; }
        .rp-td-unit { background:var(--navy-mid); color:var(--gold-light); text-align:center; padding:6px; font-weight:700; width:80px; }
        .rp-unit-label { font-size:10px; }
        .rp-unit-sub { font-size:8px; color:rgba(255,255,255,.65); font-weight:400; }
        .rp-td-cell { border:1px solid #E8EBF2; padding:3px; vertical-align:top; min-width:80px; }
        .rp-row-tests .rp-td-cell { background:rgba(123,26,38,.04); }
        .rp-empty { color:#C0CBD8; font-size:9px; display:block; text-align:center; padding:6px 0; }
        .rp-ci { background:#fff; border-radius:4px; padding:3px; margin-bottom:3px; box-shadow:0 1px 2px rgba(0,0,0,.06); }
        .rp-ci-title { font-size:8.5px; font-weight:600; color:#4A5568; }
        .rp-sc { font-size:14px; font-weight:800; }
        .rp-sc.hi { color:var(--navy-mid); }
        .rp-sc.mi { color:var(--gold-dim); }
        .rp-sc.lo { color:var(--maroon-mid); }
        .rp-ci-meta { font-size:7.5px; color:#7A8899; }
        .rp-ci-note { font-size:8px; color:var(--maroon-mid); margin-top:1px; font-style:italic; }
        .rp-notes { display:grid; grid-template-columns:1fr 1fr; gap:10px; padding:0 20px; }
        .rp-note-box { border:1px solid #E8EBF2; border-radius:6px; padding:8px 10px; }
        .rp-note-lb { font-size:9px; font-weight:800; text-transform:uppercase; color:var(--navy); letter-spacing:.5px; margin-bottom:3px; }
        .rp-note-val { font-size:11px; white-space:pre-wrap; min-height:32px; }
        .rp-sign { display:grid; grid-template-columns:1fr 1fr; gap:32px; padding:20px; }
        .rp-sign-col { text-align:center; }
        .rp-sign-title { font-size:11px; font-weight:800; color:var(--navy); }
        .rp-sign-sub { font-size:9px; color:var(--text-soft); margin-top:2px; }
        .rp-sign-blank { height:60px; border-bottom:1px dashed rgba(138,155,176,.6); margin:8px 16px 0; }
        .rp-footer {
          background:linear-gradient(180deg,var(--maroon-dark) 0%,#5A0F18 100%);
          padding:10px 16px; text-align:center; color:rgba(255,255,255,.78); border-top:3px solid var(--gold-light);
        }
        .rp-mf-company { font-family:Georgia,serif; font-size:12px; font-weight:700; color:#fff; }
        .rp-mf-company span { color:var(--gold-light); }
        .rp-mf-line { display:flex; gap:18px; justify-content:center; margin-top:3px; font-size:9px; flex-wrap:wrap; }
        @media print {
          @page { size:A4 landscape; margin:6mm; }
          .report-doc { box-shadow:none; max-width:none; font-size:10px; }
          .rp-header { padding:8px 14px; }
          .rp-info { padding:8px 14px; gap:3px 14px; }
          .rp-sec-title { margin:8px 14px 5px; padding:4px 9px; font-size:12px; }
          .rp-table-wrap { padding:0 14px; }
          .rp-tbl { font-size:8.5px; }
          .rp-tbl th { padding:3px; }
          .rp-td-unit { padding:3px; }
          .rp-sc { font-size:11px; }
          .rp-notes { padding:0 14px; gap:7px; }
          .rp-note-val { min-height:24px; font-size:9.5px; }
          .rp-sign { padding:12px 14px; }
          .rp-sign-blank { height:42px; }
          .rp-footer { padding:7px 12px; }
        }
      `}</style>
    </div>
  );
}