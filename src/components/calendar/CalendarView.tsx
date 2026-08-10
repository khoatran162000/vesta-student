// FILE: src/components/calendar/CalendarView.tsx — Render lịch làm bài từ data D (dùng chung landing + student)
"use client";
import { useEffect, useMemo, useState } from "react";
import { CALENDAR_CSS } from "./calendarStyles";

const DV = ["Thứ Hai","Thứ Ba","Thứ Tư","Thứ Năm","Thứ Sáu","Thứ Bảy","Chủ nhật"];
const DS = ["T2","T3","T4","T5","T6","T7","CN"];
const DC = ["mon","tue","wed","thu","fri","sat","sun"];
const dowClass = (w: string) => DC[DS.indexOf(w)] || "mon";
const dowFull = (w: string) => DV[DS.indexOf(w)] || w;
const fdShort = (s: string) => { const p = s.split("-"); return p[2] + "/" + p[1]; };
const todayISO = () => { const d = new Date(); d.setHours(0,0,0,0); return d.toISOString().slice(0,10); };

export type Day = { d: string; w: string; h?: string; l?: string };
export type Week = { i: number; u: number; d: Day[] };
export type Cls = { id: string; kg: string; r: string; w: Week[] };
export type CalData = Record<string, Cls[]>;
const LOGO = "/images/logo.jpg"; // logo landing/student (thay vì base64 nặng)

const API_URL = process.env.NEXT_PUBLIC_API_URL;
export default function CalendarView({ data }: { data: CalData }) {
  const levels = useMemo(() => Object.keys(data || {}), [data]);
  const [lv, setLv] = useState<string>("");
  const [clsId, setClsId] = useState<string>("");
  const [modal, setModal] = useState<Day | null>(null);
  const [logo, setLogo] = useState<string>(LOGO);
  const TODAY = todayISO();

  // Lấy logo chính thức từ site-content (giống Header) cho nét; lỗi thì giữ ảnh mặc định
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/site-content/logo`, { cache: "no-store" });
        const json = await res.json();
        const url = json?.data?.data?.logoUrl;
        if (url) setLogo(url.startsWith("http") ? url : `${(API_URL || "").replace(/\/api\/?$/, "")}${url}`);
      } catch {}
    })();
  }, []);

  // Mở sẵn 6+ (hoặc level đầu) và lớp đầu tiên — như file gốc
  useEffect(() => {
    if (levels.length === 0) return;
    const startLv = levels.includes("6+") ? "6+" : levels[0];
    setLv(startLv);
    setClsId(data[startLv]?.[0]?.id || "");
  }, [levels, data]);

  function pickLv(l: string) { setLv(l); setClsId(data[l]?.[0]?.id || ""); }

  const cls = useMemo(() => (data[lv] || []).find((c) => c.id === clsId) || null, [data, lv, clsId]);

  return (
    <div className="vcal">
      <style>{CALENDAR_CSS}</style>

      <div className="hero"><div className="hc">
        <img src={logo} alt="VESTA" className="hl" />
        <div className="hero-right">
          <span className="hb">Vesta Uni</span>
          <div className="h-slogan">HỌC NHANH · THI CHẮC · PHÁ TẮC BAND</div>
          <h1>Lịch Làm Bài <em>Tích Lũy</em></h1>
        </div>
      </div></div>

      {/* Tab level */}
      <div className="tabs">
        {levels.map((l) => (
          <button key={l} className={`tab${l === lv ? " a" : ""}`} onClick={() => pickLv(l)}>IELTS {l}</button>
        ))}
      </div>

      {/* Tab lớp */}
      <div className="sub-tabs">
        {(data[lv] || []).map((c) => (
          <button key={c.id} className={`stab${c.id === clsId ? " a" : ""}`} onClick={() => setClsId(c.id)}>
            <strong>{c.id}</strong><br /><span style={{ fontSize: 8 }}>{c.r}</span>
          </button>
        ))}
      </div>

      <div className="nt"><div className="nc">
        <strong>7 ngày/tuần đều có bài.</strong> Không bỏ cách ngày. Học Quizlet trước, suy nghĩ kỹ, tra từ, take note.<br />
        Mỗi ngày <span className="g">90–120 phút</span>. Bấm vào ô để xem link bài tập.<br />
        <span className="w">Không làm bài đều và đủ, cam kết không lên trình.</span>
      </div></div>

      {/* Lịch */}
      <div className="cl">
        {cls?.w.map((wk) => (
          <div key={wk.i}>
            <div className="wh">
              <span className="wbdg">{wk.i < 0 ? "PRE" : "TUẦN " + (wk.i + 1)}</span>
              <span className="wtl">{wk.i < 0 ? "Trước KG" : "Unit " + wk.u}</span>
              {wk.d[0] && <span className="wdt">{fdShort(wk.d[0].d)} – {fdShort(wk.d[wk.d.length - 1].d)}</span>}
            </div>
            <div className="wg">
              {wk.d.map((day) => {
                const isToday = day.d === TODAY;
                const hasContent = !!(day.h || day.l);
                return (
                  <div key={day.d}
                    className={`dc${isToday ? " td" : ""}${hasContent ? "" : " empty"}`}
                    onClick={() => { if (hasContent) setModal(day); }}>
                    <div className="dtp">
                      <span className="dnum">{Number(day.d.split("-")[2])}</span>
                      <span className={`ddow ${dowClass(day.w)}`}>{day.w}</span>
                    </div>
                    <div className="dbd">
                      {day.h ? (<><div className="dhl">Bài luyện tại nhà</div><div className="dhc">{day.h}</div></>) : (<div className="dhc">—</div>)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="ft">
        <div className="ft-t">Vesta Uni — Fast Track to High Scores</div>
        <div className="ft-addr">Số 9 Khu thương mại, khu B (Khu 361), đường Hoàng Quốc Việt, P. Nghĩa Đô, Hà Nội</div>
        <a href="https://www.vestaedu.online" target="_blank" rel="noopener noreferrer" className="ft-l">www.vestaedu.online</a>
        <div className="ft-ct">vestaunivn@gmail.com · Zalo: <a href="tel:0838779988">0838 779 988</a> | <a href="tel:0336781368">033 678 1368</a></div>
      </div>

      {/* Popup ngày */}
      {modal && (
        <div className="ov" onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="mo">
            <div className="mhd">
              <div>
                <div className="mdt">{fdShort(modal.d)}</div>
                <div className="mdw">{dowFull(modal.w)}</div>
              </div>
              <button className="mx" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="mbd">
              <div className="mhl">Bài luyện tại nhà</div>
              <div className="mhc">{modal.h || "—"}</div>
              {modal.l ? (
                <a className="mlk" href={modal.l} target="_blank" rel="noopener noreferrer">Mở link bài tập →</a>
              ) : (
                <div className="mnt">Ngày này chưa có link bài tập.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}