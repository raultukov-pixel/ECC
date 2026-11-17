import React, { useMemo } from "react";
import { P, rng } from "./art";
import { drape } from "./art5";
import { INK6, mixc } from "./art6";
import { FONT } from "./fonts";

export const UI = "Inter, Helvetica, Arial, sans-serif";
export const KF = 1508;
export const KT = 1330;
const SOFT = "#ffdca0";

/* =================================================================== phone */

export const Phone: React.FC<{ x: number; y: number; s?: number; rot?: number; on?: number; glow?: string; children?: React.ReactNode; id?: string }> = ({ x, y, s = 1, rot = 0, on = 1, glow = "#8fc4ff", children, id = "ph" }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    {on > 0.02 && <circle r={760 * s} fill={glow} opacity={0.22 * on} filter="url(#glowb)" style={{ mixBlendMode: "screen" }} />}
    <g transform={`scale(${s})`}>
      <rect x={-196} y={-386} width={392} height={772} rx={58} fill="#06080b" />
      <rect x={-196} y={-386} width={392} height={772} rx={58} fill="none" stroke="#5a6372" strokeWidth={2.5} opacity={0.55} />
      <clipPath id={`${id}clip`}>
        <rect x={-180} y={-370} width={360} height={740} rx={44} />
      </clipPath>
      <g clipPath={`url(#${id}clip)`}>
        <rect x={-180} y={-370} width={360} height={740} fill="#05070a" />
        <g transform="translate(-180 -370)" opacity={on}>
          {children}
        </g>
        <rect x={-180} y={-370} width={360} height={740} fill="#05070a" opacity={1 - on} />
        <rect x={-180} y={-370} width={360} height={300} fill="#ffffff" opacity={0.035 * on} />
      </g>
      <rect x={-52} y={-360} width={104} height={24} rx={12} fill="#05070a" />
    </g>
  </g>
);

const Handset: React.FC<{ x: number; y: number; r?: number; rot?: number; fill?: string }> = ({ x, y, r = 1, rot = 0, fill = "#fff" }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${r})`}>
    <path d="M-19,-9 Q0,15 19,-9" stroke={fill} strokeWidth={11} fill="none" strokeLinecap="round" />
    <circle cx={-19} cy={-9} r={8} fill={fill} />
    <circle cx={19} cy={-9} r={8} fill={fill} />
  </g>
);

const Avatar: React.FC<{ x: number; y: number; r: number; kind?: "mom" | "neighbor" | "plain"; tone?: string }> = ({ x, y, r, kind = "mom", tone = "#c98f58" }) => (
  <g transform={`translate(${x} ${y})`}>
    <clipPath id={`av${kind}${Math.round(r)}`}>
      <circle r={r} />
    </clipPath>
    <circle r={r} fill={tone} />
    <g clipPath={`url(#av${kind}${Math.round(r)})`} fill="#241810">
      <ellipse cx={0} cy={r * 0.98} rx={r * 0.78} ry={r * 0.62} />
      <ellipse cx={0} cy={-r * 0.12} rx={r * 0.3} ry={r * 0.36} />
      {kind === "mom" && <circle cx={r * 0.02} cy={-r * 0.62} r={r * 0.2} />}
      {kind === "mom" && <path d={`M${-r * 0.32},${-r * 0.2} Q0,${-r * 0.82} ${r * 0.32},${-r * 0.2} Q0,${-r * 0.46} ${-r * 0.32},${-r * 0.2}Z`} />}
      {kind === "neighbor" && <path d={`M${-r * 0.34},${-r * 0.1} Q${-r * 0.4},${-r * 0.7} 0,${-r * 0.62} Q${r * 0.4},${-r * 0.7} ${r * 0.34},${-r * 0.1} Q0,${-r * 0.4} ${-r * 0.34},${-r * 0.1}Z`} />}
    </g>
  </g>
);

export const CallScreen: React.FC<{ T: number; name: string; sub?: string; kind?: "mom" | "neighbor"; press?: number; ended?: number }> = ({ T, name, sub = "входящий вызов", kind = "mom", press = 0, ended = 0 }) => {
  const ring = (i: number) => {
    const u = (((T * 0.9 + i / 3) % 1) + 1) % 1;
    return <circle key={i} cx={180} cy={225} r={84 + u * 70} fill="none" stroke="#9cc8ff" strokeWidth={3} opacity={(1 - u) * 0.45 * (1 - ended)} />;
  };
  return (
    <g fontFamily={UI}>
      <defs>
        <linearGradient id="cbg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2c4157" />
          <stop offset="1" stopColor="#0a1018" />
        </linearGradient>
      </defs>
      <rect width={360} height={740} fill="url(#cbg)" />
      {[0, 1, 2].map(ring)}
      <Avatar x={180} y={225} r={82} kind={kind} tone={kind === "mom" ? "#d19a62" : "#a9b8c4"} />
      <text x={180} y={385} textAnchor="middle" fontSize={56} fontWeight={600} fill="#fff">
        {name}
      </text>
      <text x={180} y={426} textAnchor="middle" fontSize={22} fill="#a9bacb">
        {ended > 0.5 ? "вызов завершён" : sub}
      </text>
      <g opacity={1 - ended * 0.9}>
        <g transform={`translate(88 622) scale(${1 - 0.12 * press})`}>
          <circle r={46} fill={press > 0.1 ? "#ff5a4d" : "#e0382d"} />
          <circle r={46 + 14 * press} fill="#ff5a4d" opacity={0.3 * press} />
          <Handset x={0} y={4} rot={180} r={1.05} />
        </g>
        <g transform={`translate(272 622) scale(${1 + 0.05 * Math.sin(T * 7)})`}>
          <circle r={46} fill="#2fbf5d" />
          <Handset x={0} y={4} r={1.05} />
        </g>
        <text x={88} y={702} textAnchor="middle" fontSize={17} fill="#a9bacb">
          отклонить
        </text>
        <text x={272} y={702} textAnchor="middle" fontSize={17} fill="#a9bacb">
          ответить
        </text>
      </g>
    </g>
  );
};

export type Msg = { who: "her" | "me"; text: string; at: number; time?: string };

export const ChatScreen: React.FC<{ T: number; msgs: Msg[]; typing?: { text: string; from: number; to: number; sendAt: number } }> = ({ T, msgs, typing }) => {
  let y = 118;
  const items: React.ReactNode[] = [];
  msgs.forEach((m, i) => {
    const w = Math.min(290, 44 + m.text.length * 15.5);
    const h = 56;
    const p = Math.max(0, Math.min(1, (T - m.at) / 0.28));
    const e = 1 - (1 - p) ** 3;
    if (p > 0) {
      const x = m.who === "her" ? 18 : 342 - w;
      items.push(
        <g key={i} opacity={e} transform={`translate(${x} ${y + (1 - e) * 20}) scale(${0.92 + 0.08 * e})`} style={{ transformOrigin: `${m.who === "her" ? 0 : w}px ${h}px` }}>
          <rect width={w} height={h} rx={26} fill={m.who === "her" ? "#27384a" : "#2b6fb5"} />
          <text x={w / 2} y={36} textAnchor="middle" fontSize={26} fill="#fff" fontWeight={500}>
            {m.text}
          </text>
          {m.time && (
            <text x={m.who === "her" ? 6 : w - 6} y={h + 20} textAnchor={m.who === "her" ? "start" : "end"} fontSize={14} fill="#7d8fa1">
              {m.time}
            </text>
          )}
        </g>,
      );
    }
    y += p > 0 ? h + (m.time ? 40 : 18) : 0;
  });
  const showTyping = typing && T >= typing.from && T < typing.sendAt;
  const typed = typing ? typing.text.slice(0, Math.max(0, Math.round(((T - typing.from) / Math.max(0.01, typing.to - typing.from)) * typing.text.length))) : "";
  return (
    <g fontFamily={UI}>
      <rect width={360} height={740} fill="#0c141d" />
      <rect width={360} height={96} fill="#13202d" />
      <path d="M26,56 L14,56 M20,48 L12,56 L20,64" stroke="#7fb4ee" strokeWidth={3.5} fill="none" strokeLinecap="round" transform="translate(6 0)" />
      <Avatar x={78} y={56} r={26} kind="mom" />
      <text x={116} y={50} fontSize={26} fontWeight={600} fill="#fff">
        Мама
      </text>
      <text x={116} y={74} fontSize={16} fill="#6f8aa5">
        была недавно
      </text>
      {items}
      <rect y={668} width={360} height={72} fill="#13202d" />
      <rect x={18} y={680} width={324} height={48} rx={24} fill="#1c2c3d" />
      <text x={38} y={712} fontSize={24} fill={showTyping ? "#fff" : "#587089"}>
        {showTyping ? typed : "Сообщение"}
        {showTyping && Math.floor(T * 3) % 2 === 0 ? "|" : ""}
      </text>
    </g>
  );
};

const Arrow: React.FC<{ x: number; y: number; col: string; dir?: "in" | "out" | "miss"; r?: number }> = ({ x, y, col, dir = "miss", r = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${r})`}>
    {dir === "out" ? (
      <path d="M-7,7 L7,-7 M-2,-7 L7,-7 L7,2" stroke={col} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    ) : (
      <path d="M7,-7 L-7,7 M-7,-2 L-7,7 L2,7" stroke={col} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    )}
  </g>
);

export const HistoryScreen: React.FC<{ T: number; focus?: number; pulse?: number }> = ({ T, focus = 0, pulse = 0 }) => {
  const rows = [
    { n: "Мама", sub: "Пропущенный", t: "14:07", col: "#ff4d42", dir: "miss" as const, k: "mom" as const },
    { n: "Антон, работа", sub: "Исходящий", t: "13:52", col: "#8fa2b4", dir: "out" as const, k: "neighbor" as const },
    { n: "Доставка", sub: "Входящий", t: "вчера", col: "#8fa2b4", dir: "in" as const, k: "neighbor" as const },
    { n: "Мама", sub: "Входящий · 4 мин", t: "пн", col: "#8fa2b4", dir: "in" as const, k: "mom" as const },
    { n: "Антон, работа", sub: "Исходящий", t: "пн", col: "#8fa2b4", dir: "out" as const, k: "neighbor" as const },
    { n: "Соседка", sub: "Входящий", t: "вс", col: "#8fa2b4", dir: "in" as const, k: "neighbor" as const },
  ];
  return (
    <g fontFamily={UI}>
      <rect width={360} height={740} fill="#0b1219" />
      <text x={22} y={74} fontSize={36} fontWeight={700} fill="#fff">
        Недавние
      </text>
      {rows.map((r, i) => {
        const y = 118 + i * 104;
        const dim = i === 0 ? 1 : 1 - focus * 0.78;
        return (
          <g key={i} opacity={dim} transform={`translate(0 ${y})`}>
            {i === 0 && <rect x={0} y={-4} width={360} height={98} fill="#ff4d42" opacity={0.08 + 0.1 * focus + 0.05 * pulse * Math.sin(T * 6)} />}
            <Avatar x={52} y={44} r={30} kind={r.k} tone={r.k === "mom" ? "#c98f58" : "#566a7d"} />
            <text x={100} y={38} fontSize={28} fontWeight={i === 0 ? 700 : 500} fill={i === 0 ? "#ff5a4d" : "#fff"}>
              {r.n}
            </text>
            <Arrow x={110} y={64} col={r.col} dir={r.dir} r={1.1 * (i === 0 ? 1 + 0.18 * pulse * Math.sin(T * 5) : 1)} />
            <text x={128} y={72} fontSize={20} fill={i === 0 ? "#ff7b70" : "#8fa2b4"}>
              {r.sub}
            </text>
            <text x={340} y={44} fontSize={19} fill="#6f8aa5" textAnchor="end">
              {r.t}
            </text>
            <rect x={100} y={96} width={260} height={1.5} fill="#1d2b39" />
          </g>
        );
      })}
    </g>
  );
};

export const ContactScreen: React.FC<{ T: number; k?: number }> = ({ T, k = 0 }) => {
  const u = (((T * 0.8) % 1) + 1) % 1;
  return (
    <g fontFamily={UI}>
      <defs>
        <linearGradient id="ctbg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b2a1d" />
          <stop offset="1" stopColor="#0a0c10" />
        </linearGradient>
      </defs>
      <rect width={360} height={740} fill="url(#ctbg)" />
      <Avatar x={180} y={190} r={92} kind="mom" tone="#d9a46c" />
      <text x={180} y={348} textAnchor="middle" fontSize={64} fontWeight={700} fill="#fff">
        Мама
      </text>
      <text x={180} y={388} textAnchor="middle" fontSize={22} fill="#b9a58f">
        мобильный
      </text>
      <g transform="translate(180 540)">
        <circle r={74 + 40 * u} fill="#2fbf5d" opacity={(1 - u) * (0.35 + 0.45 * k)} />
        <circle r={62 + 8 * Math.sin(T * 5) * k} fill="#2fbf5d" />
        <Handset x={0} y={6} r={1.7} />
      </g>
      <g opacity={0.8}>
        <circle cx={62} cy={540} r={34} fill="#243242" />
        <circle cx={298} cy={540} r={34} fill="#243242" />
        <rect x={46} y={530} width={32} height={22} rx={5} fill="none" stroke="#9db4cc" strokeWidth={3} />
        <path d={`M284,538 L298,548 L312,538`} stroke="#9db4cc" strokeWidth={3} fill="none" />
      </g>
    </g>
  );
};

/** fingertip at (x,y); press 0..1 dips it */
export const Finger: React.FC<{ x: number; y: number; rot?: number; press?: number; rim?: string }> = ({ x, y, rot = -28, press = 0, rim = "#9fc0ea" }) => {
  const d = "M-15,0 Q-15,-15 0,-15 Q15,-15 15,0 Q22,110 34,200 Q44,300 90,420 L-70,420 Q-40,300 -32,200 Q-22,110 -15,0Z";
  return (
    <g transform={`translate(${x + 3 * press} ${y + 9 * press}) rotate(${rot})`}>
      <path d={d} fill={rim} opacity={0.5} transform="translate(-3 -1)" />
      <path d={d} fill={INK6} />
      <path d="M-30,190 Q-70,150 -68,100 Q-60,84 -44,100 L-26,160Z" fill={INK6} />
    </g>
  );
};

/* =================================================================== bokeh */

export const Bokeh: React.FC<{ t: number; a: string; b: string; seed?: number; n?: number; op?: number; hot?: string }> = ({ t, a, b, seed = 4, n = 26, op = 0.4, hot = "#ffd9a0" }) => {
  const pts = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: n }, () => ({ x: r() * 1300 - 110, y: r() * 2200 - 140, r: 22 + r() * 70, c: r() < 0.5 ? hot : "#9cc4ff", ph: r() * 6 }));
  }, [seed, n, hot]);
  return (
    <g>
      <defs>
        <linearGradient id={`bk${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      </defs>
      <rect x={-300} y={-300} width={1700} height={2700} fill={`url(#bk${seed})`} />
      <g filter="url(#bl8)">
        {pts.map((p, i) => (
          <circle key={i} cx={p.x + Math.sin(t * 0.3 + p.ph) * 10} cy={p.y + Math.cos(t * 0.25 + p.ph) * 8} r={p.r} fill={p.c} opacity={op * (0.45 + 0.55 * Math.abs(Math.sin(t * 0.4 + p.ph)))} />
        ))}
      </g>
    </g>
  );
};

/* =================================================================== sofa, tv, desk props */

export const Glass: React.FC<{ fill?: string; s?: number }> = ({ fill = INK6, s = 1 }) => (
  <g transform={`scale(${s})`} fill={fill}>
    <path d="M-15,-58 Q-15,-30 0,-28 Q15,-30 15,-58Z" />
    <rect x={-2} y={-30} width={4} height={26} />
    <ellipse cx={0} cy={-2} rx={13} ry={3} />
  </g>
);

export const Laptop: React.FC<{ x: number; y: number; s?: number; glow?: number; flip?: boolean; screenC?: string }> = ({ x, y, s = 1, glow = 1, flip, screenC = "#bcd8ff" }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <path d={P([[-4, 0], [150, 0], [150, -8], [-2, -8]])} fill={INK6} />
    <path d={P([[140, -8], [190, -150], [200, -148], [152, -6]])} fill={INK6} />
    <path d={P([[142, -14], [186, -142], [194, -140], [152, -10]])} fill={screenC} opacity={0.9 * glow} />
    <path d={P([[146, -12], [188, -140], [-170, -40], [-200, 0]])} fill={screenC} opacity={0.1 * glow} filter="url(#bl8)" />
  </g>
);

/* ------------------------------------------------------------ office */

export type OfficeP = { t: number; sky: [string, string]; light?: number; blinds?: number; lamp?: number; papers?: number; sun?: number };

const skyline = (seed: number, base: number, n: number, sky: string, lit: number, t: number) => {
  const r = rng(seed);
  const out: React.ReactNode[] = [];
  let x = 80;
  for (let i = 0; i < n; i++) {
    const w = 54 + r() * 80;
    const h = 150 + r() * 380;
    out.push(<rect key={`b${i}`} x={x} y={base - h} width={w} height={h} fill={mixc("#101a28", sky, 0.18)} />);
    for (let wy = base - h + 14; wy < base - 12; wy += 22)
      for (let wx = x + 8; wx < x + w - 10; wx += 17)
        if (r() < lit) out.push(<rect key={`w${i}_${wy}_${wx}`} x={wx} y={wy} width={7} height={11} fill="#ffd89a" opacity={0.5 + 0.4 * Math.abs(Math.sin(t * 0.1 + wx))} />);
    x += w + 4 + r() * 8;
  }
  return out;
};

export const OfficeBack: React.FC<OfficeP> = ({ t, sky, light = 1, blinds = 1, lamp = 0.8, papers = 0, sun = 0 }) => {
  const x0 = 110, x1 = 970, y0 = 330, y1 = 1230;
  return (
    <g>
      <defs>
        <linearGradient id="o8sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="1" stopColor={sky[1]} />
        </linearGradient>
        <radialGradient id="o8wall" gradientUnits="userSpaceOnUse" cx={540} cy={900} r={1200}>
          <stop offset="0" stopColor={mixc("#16202c", "#43566c", 0.7 * light)} />
          <stop offset="0.6" stopColor="#0d141c" />
          <stop offset="1" stopColor="#06090d" />
        </radialGradient>
        <clipPath id="o8win">
          <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} />
        </clipPath>
      </defs>
      <rect x={-900} y={-900} width={3400} height={3900} fill="url(#o8wall)" />
      <g clipPath="url(#o8win)">
        <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="url(#o8sky)" />
        <circle cx={760} cy={y1 - 360} r={110 * (0.6 + sun)} fill="#fff2d0" opacity={0.5 * sun} filter="url(#bl14)" />
        {skyline(5, y1, 11, sky[1], 0.34 * (1 - sun * 0.8), t)}
      </g>
      <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="none" stroke={sky[1]} strokeWidth={46} opacity={0.22 * light} filter="url(#bl24)" />
      {blinds > 0 && (
        <g opacity={blinds}>
          {Array.from({ length: 28 }, (_, i) => (
            <rect key={i} x={x0} y={y0 + i * 32} width={x1 - x0} height={13} fill="#080c11" opacity={0.92} />
          ))}
          <rect x={x0} y={y0 - 24} width={x1 - x0} height={24} fill="#05080c" />
        </g>
      )}
      <g stroke="#05080c" fill="none">
        <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} strokeWidth={22} />
        <path d={`M${(x0 + x1) / 2},${y0} V${y1}`} strokeWidth={12} />
      </g>
      <path d={P([[x0 + 20, y1 + 8], [x1 - 20, y1 + 8], [x1 + 230, KF + 400], [x0 - 260, KF + 400]])} fill={sky[1]} opacity={0.12 * light} filter="url(#bl24)" style={{ mixBlendMode: "screen" }} />
      <rect x={-900} y={KF} width={3400} height={1400} fill="#05080b" />
      <rect x={-900} y={KF} width={3400} height={5} fill={sky[1]} opacity={0.18 * light} />
      {/* desk */}
      <g fill="#05080b">
        <rect x={430} y={KT} width={700} height={22} rx={4} />
        <rect x={470} y={KT + 18} width={16} height={KF - KT - 18} />
        <rect x={1040} y={KT + 18} width={16} height={KF - KT - 18} />
        <rect x={470} y={KT + 80} width={586} height={10} />
      </g>
      <rect x={430} y={KT} width={700} height={3} fill="#bcd8ff" opacity={0.28 * light} />
      {/* chair */}
      <g fill="#05080b">
        <rect x={210} y={1230} width={16} height={KF - 1230} rx={5} />
        <rect x={210} y={1396} width={170} height={14} rx={5} />
        <rect x={356} y={1396} width={12} height={KF - 1396} />
      </g>
      {/* lamp */}
      <g transform={`translate(1020 ${KT})`}>
        <path d="M0,0 L0,-120 L-70,-190" stroke="#05080b" strokeWidth={8} fill="none" strokeLinecap="round" />
        <path d="M-96,-178 L-44,-206 L-30,-174 L-82,-150Z" fill="#05080b" />
        {lamp > 0 && <path d={P([[-90, -160], [-36, -190], [-340, 30], [-420, 10]])} fill="#ffd9a0" opacity={0.2 * lamp} filter="url(#bl14)" style={{ mixBlendMode: "screen" }} />}
        {lamp > 0 && <circle cx={-64} cy={-168} r={26} fill="#fff0cf" opacity={0.7 * lamp} filter="url(#bl8)" />}
      </g>
      {papers > 0 && (
        <g>
          {Array.from({ length: Math.round(papers * 5) }, (_, i) => (
            <rect key={i} x={760 + i * 6} y={KT - 6 - i * 7} width={110} height={7} fill={i % 2 ? "#cdd9e6" : "#aebccb"} opacity={0.82} />
          ))}
        </g>
      )}
    </g>
  );
};

export const OfficeTable: React.FC<{ glow?: number; phone?: React.ReactNode; closed?: boolean }> = ({ glow = 1, phone, closed }) => (
  <g>
    {!closed && <Laptop x={560} y={KT} s={1} glow={glow} />}
    {phone}
  </g>
);

/* ------------------------------------------------------------ meeting room */

export const MeetBack: React.FC<{ t: number; slide?: number }> = ({ t, slide = 1 }) => (
  <g>
    <defs>
      <radialGradient id="m8wall" gradientUnits="userSpaceOnUse" cx={540} cy={800} r={1100}>
        <stop offset="0" stopColor="#2f4157" />
        <stop offset="0.6" stopColor="#0f1722" />
        <stop offset="1" stopColor="#06090d" />
      </radialGradient>
    </defs>
    <rect x={-900} y={-900} width={3400} height={3900} fill="url(#m8wall)" />
    {/* screen with a chart */}
    <rect x={590} y={380} width={470} height={380} fill="#0a1017" />
    <rect x={602} y={392} width={446} height={356} fill="#dbe8f6" opacity={0.92 * slide} />
    <g opacity={0.8 * slide} fill="none" stroke="#3a5778" strokeWidth={5}>
      <path d="M640,700 L640,440 M640,700 L1010,700" />
      <path d="M660,670 L740,630 L810,646 L880,560 L950,582 L1020,480" stroke="#2f6fb5" strokeWidth={8} strokeLinejoin="round" />
    </g>
    {[690, 770, 850, 930, 1000].map((x, i) => (
      <rect key={i} x={x - 18} y={700 - (30 + ((i * 53) % 90))} width={36} height={30 + ((i * 53) % 90)} fill="#7aa6d4" opacity={0.5 * slide} />
    ))}
    <path d={P([[590, 760], [1060, 760], [1250, KF + 300], [200, KF + 300]])} fill="#dbe8f6" opacity={0.1 * slide} filter="url(#bl24)" style={{ mixBlendMode: "screen" }} />
    <rect x={-900} y={KF} width={3400} height={1400} fill="#05080b" />
    <rect x={-900} y={KF} width={3400} height={5} fill="#a8c4e2" opacity={0.14} />
  </g>
);

export const MeetTable: React.FC<{ t: number; vib?: number }> = ({ t, vib = 0 }) => (
  <g>
    <g fill="#04070a">
      <rect x={-120} y={KT - 8} width={1360} height={26} rx={6} />
      <rect x={-60} y={KT + 16} width={1260} height={KF - KT - 16} opacity={0.7} />
    </g>
    <rect x={-120} y={KT - 8} width={1360} height={3} fill="#cfe2f5" opacity={0.3} />
    {[120, 360, 600].map((x, i) => (
      <g key={i} transform={`translate(${x} ${KT - 8})`}>
        <rect width={92} height={6} y={-6} fill="#d9e6f2" opacity={0.7} />
        <rect width={110} height={4} y={-2} fill="#04070a" />
      </g>
    ))}
    {/* his phone buzzing on the table */}
    <g transform={`translate(${660 + Math.sin(t * 90) * 3 * vib} ${KT - 14}) rotate(${Math.sin(t * 77) * 2 * vib})`}>
      <rect x={-34} y={-7} width={70} height={9} rx={3} fill="#04070a" />
      <rect x={-31} y={-6} width={64} height={3} rx={1.5} fill="#9cd0ff" opacity={0.9 * vib} />
      {vib > 0 && <ellipse cx={0} cy={-6} rx={140} ry={34} fill="#9cd0ff" opacity={0.22 * vib * (0.6 + 0.4 * Math.sin(t * 40) ** 2)} filter="url(#bl14)" style={{ mixBlendMode: "screen" }} />}
    </g>
  </g>
);

/* ------------------------------------------------------------ living room */

export const FlatBack: React.FC<{ t: number; tv?: number; lamp?: number; sky?: [string, string] }> = ({ t, tv = 1, lamp = 0, sky = ["#0a1424", "#27405f"] }) => {
  const fl = 0.55 + 0.45 * Math.abs(Math.sin(t * 7.3) * Math.sin(t * 2.9 + 1));
  return (
    <g>
      <defs>
        <linearGradient id="f8sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="1" stopColor={sky[1]} />
        </linearGradient>
        <radialGradient id="f8wall" gradientUnits="userSpaceOnUse" cx={800} cy={1150} r={1000}>
          <stop offset="0" stopColor={mixc("#0d141d", "#3a5a82", 0.55 * tv * fl)} />
          <stop offset="0.6" stopColor="#0a1018" />
          <stop offset="1" stopColor="#05080c" />
        </radialGradient>
        <clipPath id="f8win">
          <rect x={90} y={420} width={330} height={640} />
        </clipPath>
      </defs>
      <rect x={-900} y={-900} width={3400} height={3900} fill="url(#f8wall)" />
      <g clipPath="url(#f8win)">
        <rect x={90} y={420} width={330} height={640} fill="url(#f8sky)" />
        {skyline(9, 1060, 7, sky[1], 0.42, t)}
      </g>
      <g stroke="#04070a" fill="none">
        <rect x={90} y={420} width={330} height={640} strokeWidth={18} />
        <path d="M255,420 V1060 M90,740 H420" strokeWidth={9} />
      </g>
      {/* TV */}
      <g>
        <rect x={700} y={1010} width={340} height={200} fill="#04070a" />
        <rect x={712} y={1022} width={316} height={176} fill={mixc("#2c4a74", "#9cc4ff", fl * 0.7)} opacity={0.95 * tv} />
        <path d="M730,1170 L800,1090 L860,1140 L920,1060 L1010,1170Z" fill="#06090d" opacity={0.28 * tv} />
        <path d={P([[700, 1210], [1040, 1210], [1300, KF + 400], [380, KF + 400]])} fill="#8fb8ff" opacity={0.1 * tv * fl} filter="url(#bl24)" style={{ mixBlendMode: "screen" }} />
        <rect x={820} y={1210} width={100} height={26} fill="#04070a" />
        <rect x={660} y={1236} width={420} height={16} fill="#04070a" />
        <rect x={680} y={1252} width={14} height={KF - 1252} fill="#04070a" />
        <rect x={1046} y={1252} width={14} height={KF - 1252} fill="#04070a" />
      </g>
      <rect x={-900} y={KF} width={3400} height={1400} fill="#04070a" />
      <rect x={-900} y={KF} width={3400} height={5} fill="#7fa6d8" opacity={0.12 + 0.1 * tv * fl} />
      {/* sofa */}
      <g fill="#05080c">
        <path d="M-60,1250 Q-60,1190 10,1190 L110,1190 Q160,1190 160,1250 L160,1500 L-60,1500Z" />
        <rect x={-60} y={1400} width={640} height={110} rx={26} />
        <rect x={500} y={1330} width={110} height={170} rx={30} />
      </g>
      {lamp > 0 && <circle cx={20} cy={1010} r={420} fill="#ffcf8a" opacity={0.14 * lamp} filter="url(#fogb)" style={{ mixBlendMode: "screen" }} />}
    </g>
  );
};

/* ------------------------------------------------------------ bar */

export const BarBack: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <Bokeh t={t} a="#1c0f08" b="#0a0604" seed={12} n={34} op={0.5} />
    {[260, 540, 820].map((x, i) => (
      <g key={i} transform={`translate(${x} 0)`}>
        <path d={`M0,300 V${620 + i * 20}`} stroke="#05080b" strokeWidth={4} />
        <path d={`M-52,${660 + i * 20} Q0,${590 + i * 20} 52,${660 + i * 20}Z`} fill="#05080b" />
        <ellipse cx={0} cy={664 + i * 20} rx={34} ry={9} fill="#ffe2a8" opacity={0.95} />
        <ellipse cx={0} cy={1000} rx={300} ry={480} fill="#ffb866" opacity={0.1} filter="url(#fogb)" style={{ mixBlendMode: "screen" }} />
      </g>
    ))}
    <rect x={-900} y={KF} width={3400} height={1400} fill="#060302" />
    <rect x={-900} y={KF} width={3400} height={5} fill="#ffb866" opacity={0.16} />
  </g>
);

export const BarTable: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <g fill="#050302">
      <rect x={-140} y={KT + 20} width={1400} height={30} rx={5} />
      <rect x={120} y={KT + 48} width={22} height={KF - KT - 48} />
      <rect x={940} y={KT + 48} width={22} height={KF - KT - 48} />
    </g>
    <rect x={-140} y={KT + 20} width={1400} height={4} fill="#ffcf8a" opacity={0.5} />
    {[200, 700].map((x, i) => (
      <g key={i} transform={`translate(${x} ${KT + 20})`}>
        <Glass s={1.2} />
      </g>
    ))}
  </g>
);

/* ------------------------------------------------------------ calendar and clock */

export const CalendarPage: React.FC<{ x: number; y: number; month: string; day: number; w?: number; h?: number; circled?: number; flip?: number }> = ({ x, y, month, day, w = 720, h = 900, circled = 0, flip = 0 }) => {
  const sc = Math.max(0.02, 1 - flip);
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2 - 14} y={-h / 2 - 14} width={w + 28} height={h + 28} rx={26} fill="#05080b" />
      <g transform={`translate(0 ${-h / 2}) scale(1 ${sc}) translate(0 ${h / 2})`}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={18} fill="#efe6d2" />
        <rect x={-w / 2} y={-h / 2} width={w} height={150} rx={18} fill="#a8322a" />
        <rect x={-w / 2} y={-h / 2 + 100} width={w} height={50} fill="#a8322a" />
        <text x={0} y={-h / 2 + 106} textAnchor="middle" fontSize={92} fontFamily={FONT} fontWeight={700} fill="#f6ecd8" letterSpacing={6}>
          {month}
        </text>
        <text x={0} y={72} textAnchor="middle" fontSize={440} fontFamily={FONT} fontWeight={700} fill="#1a1410">
          {day}
        </text>
        {circled > 0 && <ellipse cx={0} cy={-80} rx={250 * circled} ry={210 * circled} fill="none" stroke="#c0221a" strokeWidth={14} strokeLinecap="round" strokeDasharray={`${1500 * circled} 1600`} transform="rotate(-6)" opacity={0.95} />}
        <rect x={-w / 2} y={h / 2 - 30} width={w} height={30} rx={14} fill="#d7ccb2" />
      </g>
    </g>
  );
};

export const BigClock: React.FC<{ x: number; y: number; r: number; spin: number; alarm?: number }> = ({ x, y, r, spin, alarm = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r + 24} fill="#05080b" />
    <circle r={r} fill="#e9dfca" />
    {Array.from({ length: 12 }, (_, i) => (
      <rect key={i} x={-4} y={-r + 14} width={8} height={i % 3 === 0 ? 40 : 22} fill="#1a1410" transform={`rotate(${i * 30})`} />
    ))}
    <path d={`M0,0 L${Math.sin(spin * 0.9) * r * 0.5},${-Math.cos(spin * 0.9) * r * 0.5}`} stroke="#1a1410" strokeWidth={16} strokeLinecap="round" />
    <path d={`M0,0 L${Math.sin(spin * 12) * r * 0.78},${-Math.cos(spin * 12) * r * 0.78}`} stroke="#1a1410" strokeWidth={9} strokeLinecap="round" />
    <path d={`M0,0 L${Math.sin(spin * 72) * r * 0.86},${-Math.cos(spin * 72) * r * 0.86}`} stroke="#c0221a" strokeWidth={4} strokeLinecap="round" />
    <circle r={14} fill="#c0221a" />
    {alarm > 0 && <circle r={r + 24} fill="none" stroke="#ff5a4d" strokeWidth={10} opacity={alarm * (0.4 + 0.6 * Math.abs(Math.sin(spin * 30)))} />}
  </g>
);

/* ------------------------------------------------------------ kitchen additions */

export const Garland: React.FC<{ t: number; y?: number; op?: number }> = ({ t, y = 330, op = 1 }) => (
  <g opacity={op}>
    <path d={`M170,${y} Q540,${y + 90} 810,${y}`} stroke="#050302" strokeWidth={4} fill="none" />
    {Array.from({ length: 12 }, (_, i) => {
      const u = i / 11;
      const gx = 170 + u * 640;
      const gy = y + 4 * 90 * u * (1 - u) * 1;
      const col = ["#ffcf6b", "#ff8c6b", "#8fd0ff", "#ffe7a8"][i % 4];
      const on = 0.55 + 0.45 * Math.abs(Math.sin(t * 1.6 + i * 1.3));
      return (
        <g key={i}>
          <circle cx={gx} cy={gy + 14} r={22} fill={col} opacity={0.35 * on} filter="url(#bl8)" />
          <circle cx={gx} cy={gy + 14} r={7} fill={col} opacity={0.5 + 0.5 * on} />
        </g>
      );
    })}
  </g>
);

export const Stove: React.FC<{ x: number }> = ({ x }) => (
  <g transform={`translate(${x} 0)`}>
    <g fill="#060403">
      <rect x={0} y={1340} width={330} height={KF - 1340} />
      <rect x={-12} y={1326} width={354} height={20} rx={4} />
      <rect x={20} y={1380} width={290} height={100} rx={6} fill="#0c0705" />
    </g>
    <rect x={-12} y={1326} width={354} height={3} fill="#ffdca0" opacity={0.3} />
    <g stroke="#2a1a10" strokeWidth={3} fill="none">
      <circle cx={80} cy={1330} r={0} />
    </g>
    <circle cx={290} cy={1432} r={9} fill="#2a1a10" />
    <circle cx={250} cy={1432} r={9} fill="#2a1a10" />
    <circle cx={210} cy={1432} r={9} fill="#2a1a10" />
    <rect x={0} y={1180} width={330} height={150} fill="#080503" opacity={0.0} />
  </g>
);

export const Pie: React.FC<{ x: number; y: number; s?: number; light?: number; fill?: string }> = ({ x, y, s = 1, light = 1, fill = "#0a0604" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={-2} rx={150} ry={20} fill="#0f0a07" />
    <ellipse cx={0} cy={-4} rx={150} ry={20} fill="none" stroke={SOFT} strokeWidth={2} opacity={0.5 * light} />
    <path d="M-124,-14 Q-132,-72 -60,-96 Q0,-110 60,-96 Q132,-72 124,-14 Q0,6 -124,-14Z" fill={fill} />
    <path d="M-124,-14 Q-132,-72 -60,-96 Q0,-110 60,-96" fill="none" stroke="#ffb866" strokeWidth={4} opacity={0.75 * light} />
    <g stroke="#2a1a10" strokeWidth={5} fill="none" opacity={0.9}>
      {[-70, -35, 0, 35, 70].map((k) => (
        <path key={"a" + k} d={`M${k - 40},-90 L${k + 40},-16`} />
      ))}
      {[-70, -35, 0, 35, 70].map((k) => (
        <path key={"b" + k} d={`M${k + 40},-90 L${k - 40},-16`} />
      ))}
    </g>
    <path d="M-124,-14 Q-132,-72 -60,-96 Q0,-110 60,-96 Q132,-72 124,-14" fill="none" stroke="#050302" strokeWidth={8} />
    <path d="M-100,-22 Q-60,-14 0,-12 Q60,-14 100,-22" fill="none" stroke="#ffb866" strokeWidth={2} opacity={0.35 * light} />
  </g>
);

/* ------------------------------------------------------------ the postcard */

export const Postcard: React.FC<{ T: number; x: number; y: number; rot?: number; s?: number; write: [number, number][]; lines: string[]; sign?: number; hover?: number }> = ({ T, x, y, rot = -4, s = 1, write, lines, sign = 0, hover = 1e9 }) => {
  const W = 640, H = 900;
  const pen = (() => {
    if (T >= hover && T < write[0][0]) return { i: 0, p: 0, bob: Math.sin(T * 3) * 6 };
    for (let i = 0; i < lines.length; i++) {
      const [a, b] = write[i];
      if (T >= a && T <= b + 0.15) return { i, p: Math.max(0, Math.min(1, (T - a) / (b - a))), bob: 0 };
    }
    return null;
  })();
  const tree = (cx: number, cy: number) => (
    <g transform={`translate(${cx} ${cy})`}>
      <rect x={-16} y={188} width={32} height={42} fill="#3a2414" />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M0,${-170 + i * 78} L${-86 - i * 38},${-72 + i * 78 + 20} L${86 + i * 38},${-72 + i * 78 + 20}Z`} fill={i % 2 ? "#2d6a45" : "#235a39"} />
      ))}
      <path d="M0,-212 L9,-190 L32,-188 L14,-174 L20,-152 L0,-164 L-20,-152 L-14,-174 L-32,-188 L-9,-190Z" fill="#f2c14e" />
      {[[-34, -60], [30, -20], [-70, 40], [66, 74], [-20, 112], [-112, 150], [104, 160], [10, 36]].map(([ox, oy], i) => (
        <circle key={i} cx={ox} cy={oy} r={9} fill={["#c0392b", "#f2c14e", "#4aa3df"][i % 3]} />
      ))}
      {Array.from({ length: 22 }, (_, i) => (
        <circle key={"s" + i} cx={-230 + ((i * 97) % 460)} cy={-210 + ((i * 53) % 440)} r={3 + (i % 3)} fill="#fff" opacity={0.85} />
      ))}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-W / 2 + 10} y={-H / 2 + 14} width={W} height={H} rx={14} fill="#000" opacity={0.5} filter="url(#bl14)" />
      <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={12} fill="#f1e6cc" />
      <rect x={-W / 2 + 22} y={-H / 2 + 22} width={W - 44} height={500} rx={6} fill="#cfe3ee" />
      <rect x={-W / 2 + 22} y={-H / 2 + 22} width={W - 44} height={500} rx={6} fill="#1a3a52" opacity={0.18} />
      {tree(0, -H / 2 + 270)}
      <text x={0} y={-H / 2 + 570} textAnchor="middle" fontFamily={FONT} fontStyle="italic" fontWeight={600} fontSize={46} fill="#2c4a3a">
        С Новым годом!
      </text>
      <path d={`M-250,${-H / 2 + 596} L250,${-H / 2 + 596}`} stroke="#b8a888" strokeWidth={1.5} />
      {lines.map((ln, i) => {
        const [a, b] = write[i];
        const p = Math.max(0, Math.min(1, (T - a) / (b - a)));
        const baseY = -H / 2 + 668 + i * 82;
        const chars = ln.split("");
        return (
          <g key={i}>
            {chars.map((ch, k) => {
              const u = (k + 1) / chars.length;
              const vis = Math.max(0, Math.min(1, (p - (u - 1 / chars.length)) * chars.length));
              const r = rng(i * 100 + k + 7);
              return (
                <text key={k} x={-262 + k * 30.5 + (r() - 0.5) * 3} y={baseY + (r() - 0.5) * 7 + Math.sin(k * 0.6) * 2} fontSize={56} fontFamily={FONT} fontStyle="italic" fontWeight={600} fill="#1c2a4e" opacity={vis} transform={`rotate(${(r() - 0.5) * 7} ${-262 + k * 30.5} ${baseY})`}>
                  {ch}
                </text>
              );
            })}
          </g>
        );
      })}
      {sign > 0 && (
        <text x={150} y={-H / 2 + 668 + lines.length * 82 + 6} fontSize={52} fontFamily={FONT} fontStyle="italic" fontWeight={600} fill="#1c2a4e" opacity={sign} transform="rotate(-6)">
          Мама
        </text>
      )}
      {pen && (
        <g transform={`translate(${-262 + pen.p * 30.5 * lines[pen.i].length} ${-H / 2 + 668 + pen.i * 82 + 8 - (pen.bob ? 40 + pen.bob : 0)})`}>
          <path d="M0,0 L84,-128" stroke={INK6} strokeWidth={9} strokeLinecap="round" fill="none" />
          <path d="M0,0 L8,-14 L18,-6Z" fill="#1c2a4e" />
          <ellipse cx={96} cy={-70} rx={46} ry={32} transform="rotate(28 96 -70)" fill={INK6} />
          <path d="M110,-60 L860,300 L790,420 L70,-18Z" fill={INK6} />
        </g>
      )}
    </g>
  );
};

export { drape };
