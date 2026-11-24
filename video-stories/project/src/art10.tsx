import React, { useMemo } from "react";
import { P, rng } from "./art";
import { INK6, mixc } from "./art6";

export const HG = 1500;                          // ground
export const HB = { x0: 330, x1: 930, top: 880 }; // the body of the house
export const KWIN = { x: 480, y: 1250, w: 130, h: 150 }; // her kitchen window
export const HDOOR = { x: 690, w: 110, h: 210 };
const WARM = "#ffcf8a";
const SICK = "#d4e06a";

export type HouseP = {
  t: number;
  warm?: number;      // 0 = a haunted house, 1 = a home that waits
  sky: [string, string];
  eyes?: number;      // glow of the two upstairs windows
  kitchen?: number;   // her window, the one he lights each evening
  down?: number;      // the other downstairs windows
  fog?: number;
  moon?: number;
  flicker?: number;
};

export const HouseSet: React.FC<HouseP> = ({ t, warm = 0, sky, eyes = 1, kitchen = 0, down = 0, fog = 1, moon = 1, flicker = 0 }) => {
  const star = useMemo(() => {
    const r = rng(12);
    return Array.from({ length: 60 }, () => ({ x: r() * 1500 - 200, y: r() * 760 - 100, r: 0.8 + r() * 1.6, p: r() * 6 }));
  }, []);
  const jag = useMemo(() => {
    const r = rng(5);
    return Array.from({ length: 12 }, () => r());
  }, []);
  const fl = flicker > 0 ? 1 - flicker * (0.5 + 0.5 * Math.sin(t * 23) * Math.sin(t * 9.3 + 1)) * 0.6 : 1;
  const wall = mixc("#13111a", "#3d2e22", warm);
  const roof = mixc("#09080e", "#2b1d15", warm);
  const winC = mixc(SICK, WARM, warm);
  const ew = mx(0.52, 1, warm) * 118;
  const up = [470, 790];
  return (
    <g>
      <defs>
        <linearGradient id="h10sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="1" stopColor={sky[1]} />
        </linearGradient>
        <linearGradient id="h10ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mixc("#0c0b10", "#241a12", warm)} />
          <stop offset="1" stopColor="#050408" />
        </linearGradient>
      </defs>
      <rect x={-900} y={-1400} width={3400} height={4000} fill="url(#h10sky)" />
      {star.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#f4f0e0" opacity={0.7 * (0.4 + 0.6 * Math.abs(Math.sin(t * 0.8 + s.p)))} />
      ))}
      {moon > 0 && (
        <g opacity={moon}>
          <circle cx={800} cy={560} r={mx(130, 84, warm)} fill="#f4efd8" opacity={0.92} />
          <circle cx={800} cy={560} r={mx(300, 200, warm)} fill="#f4efd8" opacity={0.14} filter="url(#fogb)" style={{ mixBlendMode: "screen" }} />
        </g>
      )}
      {/* chimney and roof */}
      <rect x={780} y={640} width={70} height={190} fill={roof} />
      <path d={`M300,${HB.top} L${mx(615, 630, warm)},${mx(610, 650, warm)} L960,${HB.top}Z`} fill={roof} />
      {warm < 0.99 && (
        <path d={`M300,${HB.top} L${mx(615, 630, warm)},${mx(610, 650, warm)} L${mx(700, 630, warm)},690 L${mx(600, 630, warm)},700Z`} fill="#000" opacity={0.35 * (1 - warm)} />
      )}
      {/* walls */}
      <rect x={HB.x0} y={HB.top} width={HB.x1 - HB.x0} height={HG - HB.top} fill={wall} />
      <rect x={HB.x0 - 14} y={HB.top - 8} width={HB.x1 - HB.x0 + 28} height={16} fill={roof} />
      <g stroke={mixc("#0a0910", "#241a12", warm)} strokeWidth={3} opacity={0.8}>
        {Array.from({ length: 11 }, (_, i) => (
          <path key={i} d={`M${HB.x0 + i * 60},${HB.top} V${HG}`} />
        ))}
      </g>
      {/* the upstairs windows: eyes while it is haunted, ordinary lit windows once we know */}
      {up.map((cx, i) => (
        <g key={i}>
          <rect x={cx - ew / 2} y={970} width={ew} height={mx(150, 136, warm)} rx={mx(40, 10, warm)} fill={winC} opacity={(0.9 * eyes * (i === 1 ? fl : 1))} />
          <rect x={cx - ew / 2} y={970} width={ew} height={mx(150, 136, warm)} rx={mx(40, 10, warm)} fill="none" stroke="#050408" strokeWidth={9} />
          <path d={`M${cx},970 V${970 + mx(150, 136, warm)} M${cx - ew / 2},1040 H${cx + ew / 2}`} stroke="#050408" strokeWidth={5} opacity={warm} />
          <circle cx={cx} cy={1040} r={170} fill={winC} opacity={0.2 * eyes} filter="url(#bl24)" style={{ mixBlendMode: "screen" }} />
          {/* angry brows, only while haunted */}
          <path d={i === 0 ? `M${cx - 74},946 L${cx + 50},976 L${cx + 50},954Z` : `M${cx + 74},946 L${cx - 50},976 L${cx - 50},954Z`} fill="#050408" opacity={1 - warm} />
        </g>
      ))}
      {/* her kitchen window */}
      <g>
        <rect x={KWIN.x - KWIN.w / 2} y={KWIN.y} width={KWIN.w} height={KWIN.h} fill={mixc("#0a0910", WARM, 0.96)} opacity={0.05 + 0.95 * kitchen} />
        <rect x={KWIN.x - KWIN.w / 2} y={KWIN.y} width={KWIN.w} height={KWIN.h} fill="none" stroke="#050408" strokeWidth={9} />
        <path d={`M${KWIN.x},${KWIN.y} V${KWIN.y + KWIN.h} M${KWIN.x - KWIN.w / 2},${KWIN.y + 70} H${KWIN.x + KWIN.w / 2}`} stroke="#050408" strokeWidth={5} />
        <circle cx={KWIN.x} cy={KWIN.y + 75} r={240} fill={WARM} opacity={0.3 * kitchen} filter="url(#bl24)" style={{ mixBlendMode: "screen" }} />
        <path d={P([[KWIN.x - KWIN.w / 2, KWIN.y + KWIN.h], [KWIN.x + KWIN.w / 2, KWIN.y + KWIN.h], [KWIN.x + 220, HG + 90], [KWIN.x - 260, HG + 90]])} fill={WARM} opacity={0.16 * kitchen} filter="url(#bl14)" style={{ mixBlendMode: "screen" }} />
      </g>
      <g>
        <rect x={850 - 55} y={1260} width={110} height={130} fill={WARM} opacity={0.06 + 0.8 * down} />
        <rect x={850 - 55} y={1260} width={110} height={130} fill="none" stroke="#050408" strokeWidth={8} />
        <circle cx={850} cy={1325} r={180} fill={WARM} opacity={0.2 * down} filter="url(#bl24)" style={{ mixBlendMode: "screen" }} />
      </g>
      {/* the door, a mouth with teeth while haunted */}
      <path d={`M${HDOOR.x - HDOOR.w / 2},${HG} V${HG - HDOOR.h + 50} A${HDOOR.w / 2},${HDOOR.w / 2} 0 0 1 ${HDOOR.x + HDOOR.w / 2},${HG - HDOOR.h + 50} V${HG}Z`} fill={mixc("#060509", "#201610", warm)} />
      <path d={`M${HDOOR.x - HDOOR.w / 2 + 6},${HG} V${HG - HDOOR.h + 54} A${HDOOR.w / 2 - 6},${HDOOR.w / 2 - 6} 0 0 1 ${HDOOR.x + HDOOR.w / 2 - 6},${HG - HDOOR.h + 54} V${HG}Z`} fill={SICK} opacity={0.18 * (1 - warm) * fl} />
      {jag.map((j, i) => (
        <path key={i} d={`M${HDOOR.x - 50 + i * 9},${HG - HDOOR.h + 60} l4.5,${14 + j * 14} l4.5,${-14 - j * 14}Z`} fill="#c9c9a4" opacity={0.7 * (1 - warm)} />
      ))}
      <rect x={HDOOR.x - 70} y={HG - 14} width={140} height={14} fill={mixc("#0a0910", "#2a1c12", warm)} />
      <path d={`M${HDOOR.x - HDOOR.w / 2 - 6},${HG} V${HG - HDOOR.h + 50} A${HDOOR.w / 2 + 6},${HDOOR.w / 2 + 6} 0 0 1 ${HDOOR.x + HDOOR.w / 2 + 6},${HG - HDOOR.h + 50} V${HG}`} fill="none" stroke="#050408" strokeWidth={10} />
      {/* flowers by the door, only when it is a home */}
      {warm > 0.05 && (
        <g opacity={warm}>
          {[-90, 98].map((o, k) => (
            <g key={k} transform={`translate(${HDOOR.x + o} ${HG})`}>
              <rect x={-16} y={-34} width={32} height={34} fill="#0a0604" />
              {[-12, 0, 12].map((fx, j) => (
                <circle key={j} cx={fx} cy={-46 - (j % 2) * 10} r={8} fill={["#e0607a", "#f2c14e", "#e0607a"][j]} />
              ))}
            </g>
          ))}
        </g>
      )}
      {/* the tree: claws while haunted, blossom after */}
      <g transform="translate(150 0)">
        <path d={`M0,${HG} Q-10,1330 12,1190 M12,1210 Q-60,1150 -120,1150 M10,1250 Q80,1180 140,1176 M4,1300 Q-50,1260 -96,1270 M12,1190 Q30,1120 8,1070`} stroke="#04030a" strokeWidth={16} fill="none" strokeLinecap="round" />
        {warm > 0.05 &&
          Array.from({ length: 44 }, (_, i) => {
            const rr = rng(i * 13 + 3);
            const a = rr() * 6.28, d = 30 + rr() * 150;
            const px = Math.cos(a) * d * 1.1 + 10, py = 1150 + Math.sin(a) * d * 0.6;
            return <ellipse key={i} cx={px} cy={py} rx={20 + rr() * 12} ry={13 + rr() * 8} transform={`rotate(${rr() * 180} ${px} ${py})`} fill={mixc("#2a3a1e", "#e9a6b8", rr() * 0.7)} opacity={0.9 * warm} />;
          })}
      </g>
      {/* ground and fog */}
      <rect x={-900} y={HG} width={3400} height={1500} fill="url(#h10ground)" />
      <rect x={-900} y={HG} width={3400} height={4} fill={mixc("#7d86a4", WARM, warm)} opacity={0.2} />
      {fog > 0 && (
        <g opacity={fog * (1 - warm * 0.85)} style={{ mixBlendMode: "screen" }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <ellipse key={i} cx={((i * 380 + t * (14 + i * 4)) % 1900) - 300} cy={HG - 14 + (i % 2) * 14} rx={340} ry={42} fill="#a9b4d0" opacity={0.2} filter="url(#bl24)" />
          ))}
        </g>
      )}
    </g>
  );
};

const mx = (a: number, b: number, k: number) => a + (b - a) * k;

export const Fence: React.FC<{ warm?: number; x0?: number; x1?: number }> = ({ warm = 0, x0 = -300, x1 = 1500 }) => {
  const posts = useMemo(() => {
    const r = rng(21);
    const out: { x: number; lean: number; h: number }[] = [];
    for (let x = x0; x < x1; x += 46) out.push({ x, lean: (r() - 0.5) * 14, h: 112 + r() * 26 });
    return out;
  }, [x0, x1]);
  const col = mixc("#06050a", "#241a12", warm);
  return (
    <g>
      {posts.map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${HG}) rotate(${p.lean * (1 - warm)})`}>
          <path d={warm > 0.5 ? `M-9,0 V${-p.h} Q0,${-p.h - 10} 9,${-p.h} V0Z` : `M-9,0 V${-p.h} L0,${-p.h - 22} L9,${-p.h} V0Z`} fill={col} />
          {warm > 0.1 && <rect x={-9} y={-p.h} width={3} height={p.h} fill="#ffcf8a" opacity={0.25 * warm} />}
        </g>
      ))}
      <rect x={x0} y={HG - 96} width={x1 - x0} height={10} fill={col} />
      <rect x={x0} y={HG - 44} width={x1 - x0} height={10} fill={col} />
    </g>
  );
};

/* ================================================================ the flashback */

export const Frame: React.FC<{ build: number; sun?: number }> = ({ build, sun = 1 }) => {
  const posts = 7;
  const gap = (HB.x1 - HB.x0) / (posts - 1);
  const wall = Math.max(0, Math.min(1, build / 0.55));
  const roofK = Math.max(0, Math.min(1, (build - 0.5) / 0.5));
  const L = (a: number, b: number, c: number, d: number, k: number) => `M${a},${b} L${a + (c - a) * k},${b + (d - b) * k}`;
  return (
    <g>
      <circle cx={620} cy={1000} r={520} fill="#ffd9a0" opacity={0.3 * sun} filter="url(#fogb)" style={{ mixBlendMode: "screen" }} />
      <g fill="#120a05">
        <rect x={HB.x0 - 20} y={HG - 22} width={HB.x1 - HB.x0 + 40} height={22} />
        {Array.from({ length: posts }, (_, i) => {
          const k = Math.max(0, Math.min(1, wall * posts - i * 0.7));
          return <rect key={i} x={HB.x0 + i * gap - 9} y={HG - 22 - (HG - 22 - HB.top) * k} width={18} height={(HG - 22 - HB.top) * k} />;
        })}
        <rect x={HB.x0 - 14} y={HB.top - 10} width={(HB.x1 - HB.x0 + 28) * Math.max(0, Math.min(1, wall * 1.6 - 0.6))} height={20} />
        <rect x={HB.x0 - 14} y={1170} width={(HB.x1 - HB.x0 + 28) * Math.max(0, Math.min(1, wall * 1.4 - 0.2))} height={14} />
      </g>
      <g stroke="#120a05" strokeWidth={10} fill="none" strokeLinecap="square">
        <path d={L(HB.x0, HG - 22, HB.x0 + gap, 1170, wall)} />
        <path d={L(HB.x1, HG - 22, HB.x1 - gap, 1170, wall)} />
        <path d={L(300, HB.top, 630, 640, roofK)} strokeWidth={16} />
        <path d={L(960, HB.top, 630, 640, roofK)} strokeWidth={16} />
        <path d={L(465, HB.top - 40, 465, 770, roofK)} />
        <path d={L(795, HB.top - 40, 795, 770, roofK)} />
        <path d={L(380, 800, 880, 800, roofK)} strokeWidth={8} />
      </g>
    </g>
  );
};

export const WindowFit: React.FC<{ fit: number; t: number }> = ({ fit, t }) => (
  <g>
    <defs>
      <linearGradient id="wfsky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f7b46a" />
        <stop offset="1" stopColor="#fff0c8" />
      </linearGradient>
    </defs>
    <rect x={-300} y={-300} width={1700} height={2700} fill="#150c07" />
    <rect x={330} y={620} width={420} height={460} fill="url(#wfsky)" />
    <circle cx={560} cy={940} r={90} fill="#fffbe6" opacity={0.9} filter="url(#bl14)" />
    <path d={P([[330, 1080], [750, 1080], [1100, HG + 300], [-60, HG + 300]])} fill="#ffd9a0" opacity={0.22} filter="url(#bl24)" style={{ mixBlendMode: "screen" }} />
    <g fill="#0c0603">
      {[260, 330, 750, 820].map((x, i) => (
        <rect key={i} x={x - 14} y={300} width={28} height={HG - 300} />
      ))}
      <rect x={250} y={590} width={580} height={34} />
      <rect x={250} y={1080} width={580} height={34} />
    </g>
    <g transform={`translate(${(1 - fit) * -380} ${(1 - fit) * -40})`}>
      <rect x={338} y={628} width={404} height={448} fill="none" stroke="#0c0603" strokeWidth={22} />
      <path d="M540,628 V1076 M338,850 H742" stroke="#0c0603" strokeWidth={12} />
    </g>
    <rect x={-300} y={HG} width={1700} height={1000} fill="#0a0603" />
  </g>
);

export const Lamp: React.FC<{ x: number; y: number; on: number; t: number; s?: number }> = ({ x, y, on, t, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-22} y={-10} width={44} height={10} rx={3} fill={INK6} />
    <path d="M-18,-10 Q-26,-46 0,-52 Q26,-46 18,-10Z" fill={INK6} />
    <rect x={-6} y={-70} width={12} height={20} fill={INK6} />
    {on > 0.02 && (
      <g>
        <path d={`M0,-62 Q${5 + Math.sin(t * 9) * 2},-84 0,-104 Q${-5 + Math.sin(t * 7) * 2},-84 0,-62Z`} fill="#fff3cf" opacity={on} />
        <circle cx={0} cy={-72} r={240 * on} fill={WARM} opacity={0.34 * on} filter="url(#bl24)" style={{ mixBlendMode: "screen" }} />
        <circle cx={0} cy={-72} r={60} fill="#fff3cf" opacity={0.5 * on} filter="url(#bl8)" />
      </g>
    )}
  </g>
);
