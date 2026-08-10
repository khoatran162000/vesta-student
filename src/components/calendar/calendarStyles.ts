// FILE: src/components/calendar/calendarStyles.ts — CSS cho CalendarView (bê từ file lịch gốc, scoped .vcal)
export const CALENDAR_CSS = `
.vcal{--royal:#1a2a6c;--rd:#0f1847;--gold:#c9a84c;--gl:#e8cc73;--gd:#a88a32;--bg:#faf8f4;--cw:#f5f0e8;--cb:#fff;--tx:#1a1a2e;--td:#6b7084;--tl:#9a9eb2;--br:#e8e4dc;--sh:0 2px 12px rgba(26,42,108,.06);--shh:0 8px 24px rgba(26,42,108,.1);--mon:#c0392b;--tue:#d4760a;--wed:#1a8a5c;--thu:#2563a8;--fri:#7c3aad;--sat:#0e8a7a;--sun:#c2185b;background:var(--bg);color:var(--tx);font-family:'Montserrat',system-ui,sans-serif;min-height:100vh}
.vcal *{margin:0;padding:0;box-sizing:border-box}
.vcal .hero{background:linear-gradient(160deg,var(--rd),var(--royal));padding:20px 24px;position:relative;overflow:hidden}
.vcal .hc{position:relative;z-index:1;display:flex;align-items:center;gap:16px;max-width:800px;margin:0 auto}
.vcal .hl{width:68px;height:68px;border-radius:50%;object-fit:cover;border:2px solid var(--gold);flex-shrink:0}
.vcal .hb{font-family:'Cormorant Garamond',serif;font-size:13px;font-weight:600;color:var(--gold);letter-spacing:4px;text-transform:uppercase}
.vcal .h-slogan{font-size:9px;color:var(--gl);letter-spacing:1.5px;margin:2px 0 6px}
.vcal .hero h1{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:700;color:#fff;line-height:1.1}
.vcal .hero h1 em{font-style:italic;color:var(--gl)}
.vcal .tabs{display:flex;justify-content:center;gap:6px;padding:14px;background:var(--cb);border-bottom:1px solid var(--br);flex-wrap:wrap}
.vcal .tab{padding:8px 20px;border-radius:20px;border:2px solid var(--br);background:0;color:var(--td);font-size:13px;font-weight:700;cursor:pointer;transition:all .3s}
.vcal .tab:hover{border-color:var(--gold)}.vcal .tab.a{background:var(--royal);color:#fff;border-color:var(--royal)}
.vcal .sub-tabs{display:flex;gap:4px;padding:10px 14px;overflow-x:auto;background:var(--cw);border-bottom:1px solid var(--br);justify-content:center;flex-wrap:wrap}
.vcal .stab{padding:6px 12px;border-radius:14px;border:1.5px solid var(--br);background:var(--cb);color:var(--td);font-size:10px;font-weight:600;cursor:pointer;text-align:center;line-height:1.3}
.vcal .stab:hover{border-color:var(--gold)}.vcal .stab.a{background:var(--royal);color:#fff;border-color:var(--royal)}
.vcal .nt{max-width:800px;margin:0 auto;padding:12px 14px 0}
.vcal .nc{background:var(--cb);border:1px solid var(--br);border-left:4px solid var(--gold);border-radius:10px;padding:14px 16px;font-size:12px;line-height:1.8}
.vcal .nc strong{color:var(--royal)}.vcal .nc .w{color:#c0392b;font-weight:600}.vcal .nc .g{color:var(--gd);font-weight:600}
.vcal .cl{max-width:1100px;margin:0 auto;padding:4px 10px 30px}
.vcal .wh{display:flex;align-items:center;gap:8px;padding:12px 2px 4px}
.vcal .wbdg{font-size:8px;font-weight:800;color:var(--gd);background:rgba(201,168,76,.12);border:1px solid rgba(201,168,76,.25);padding:2px 6px;border-radius:4px}
.vcal .wtl{font-family:'Cormorant Garamond',serif;font-size:14px;font-weight:600}.vcal .wdt{font-size:9px;color:var(--tl);margin-left:auto}
.vcal .wg{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}
@media(max-width:850px){.vcal .wg{grid-template-columns:repeat(3,1fr)}}
@media(max-width:500px){.vcal .wg{grid-template-columns:repeat(2,1fr)}}
.vcal .dc{background:var(--cb);border-radius:7px;border:1.5px solid var(--br);overflow:hidden;cursor:pointer;transition:all .2s}
.vcal .dc:hover{border-color:var(--gold);transform:translateY(-1px);box-shadow:var(--shh)}
.vcal .dc.td{border-color:var(--gold);box-shadow:0 0 0 3px rgba(201,168,76,.15)}
.vcal .dc.empty{cursor:default;opacity:.55}.vcal .dc.empty:hover{transform:none;border-color:var(--br);box-shadow:none}
.vcal .dtp{padding:5px 7px 2px;display:flex;align-items:center;justify-content:space-between}
.vcal .dnum{font-size:15px;font-weight:800}.vcal .dc.td .dnum{color:var(--gd)}
.vcal .ddow{font-size:7px;font-weight:700;padding:2px 4px;border-radius:3px;color:#fff}
.vcal .ddow.mon{background:var(--mon)}.vcal .ddow.tue{background:var(--tue)}.vcal .ddow.wed{background:var(--wed)}.vcal .ddow.thu{background:var(--thu)}.vcal .ddow.fri{background:var(--fri)}.vcal .ddow.sat{background:var(--sat)}.vcal .ddow.sun{background:var(--sun)}
.vcal .dbd{padding:2px 7px 7px}.vcal .dhl{font-size:6.5px;font-weight:700;color:var(--gd);text-transform:uppercase;letter-spacing:.4px}.vcal .dhc{font-size:9px;font-weight:600;margin-top:1px}
.vcal .ov{position:fixed;inset:0;background:rgba(15,24,71,.55);z-index:200;display:flex;justify-content:center;align-items:center;padding:16px;backdrop-filter:blur(6px)}
.vcal .mo{background:#fff;border-radius:14px;max-width:360px;width:100%;max-height:85vh;overflow-y:auto;box-shadow:0 24px 64px rgba(15,24,71,.25)}
.vcal .mhd{padding:14px 16px 10px;border-bottom:1px solid var(--br);display:flex;justify-content:space-between}
.vcal .mdt{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:700;color:var(--royal)}
.vcal .mdw{font-size:8px;color:var(--td);text-transform:uppercase;letter-spacing:1px;margin-top:2px;font-weight:600}
.vcal .mx{background:var(--cw);border:1px solid var(--br);color:var(--td);font-size:14px;cursor:pointer;width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center}
.vcal .mbd{padding:12px 16px 18px}.vcal .mhl{font-size:7px;font-weight:700;color:var(--gd);text-transform:uppercase;letter-spacing:1px;margin-bottom:2px}
.vcal .mhc{font-size:13px;font-weight:700;margin-bottom:10px}
.vcal .mlk{display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,var(--rd),var(--royal));color:var(--gl);text-decoration:none;padding:10px 14px;border-radius:10px;font-size:12px;font-weight:700}
.vcal .mnt{margin-top:8px;font-size:9px;color:var(--td);text-align:center;font-style:italic}
.vcal .ft{background:linear-gradient(160deg,var(--rd),var(--royal));padding:24px 20px;text-align:center;margin-top:12px}
.vcal .ft-t{font-family:'Cormorant Garamond',serif;font-size:14px;font-weight:600;color:var(--gold);letter-spacing:3px;text-transform:uppercase;margin-bottom:8px}
.vcal .ft-addr{font-size:11px;color:#fff;font-weight:600;margin-bottom:8px}.vcal .ft-l{color:var(--gl);text-underline-offset:3px;font-weight:600;font-size:12px}
.vcal .ft-ct{font-size:10.5px;color:var(--gl);margin-top:8px}.vcal .ft-ct a{color:#fff;text-decoration:none;font-weight:600}
`;