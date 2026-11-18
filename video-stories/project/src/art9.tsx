import React, { useMemo } from "react";
import { P, rng } from "./art";
import { INK6, mixc } from "./art6";

export const GY = 1500; // the ground line
export const DOOR = { x: 760, w: 190, h: 420 };
const WARM = "#ffcf8a";
const WARM2 = "#fff0cf";

export type StreetP = {
  t: number;
  sky: [string, string];
  open?: number;      // the door really opens (0..1)
  doubt?: number;     // how closed and heavy the door looks through his eyes (0..1)
  lights?: number;    // lit windows and the lamp
  season?: number;    // 0 = summer evening, 1 = winter snow
  snow?: number;      // falling snow
  stars?: number;
  pool?: number;      // how far the doorway light reaches along the ground (0..1)
  ghost?: number;     // a closed door drawn over the open one, fading away
};

export const arch = (cx: number, base: number, w: number, h: number) => {
  const r = w / 2;
  return `M${cx - r},${base} V${base - h + r} A${r},${r} 0 0 1 ${cx + r},${base - h + r} V${base}Z`;
};

export const Street: React.FC<StreetP> = ({ t, sky, open = 0, doubt = 0, lights = 1, season = 0, snow = 0, stars = 0, pool = 0, ghost = 0 }) => {
  const star = useMemo(() => {
    const r = rng(41);
    return Array.from({ length: 70 }, () => ({ x: r() * 1500 - 200, y: r() * 780 - 120, r: 0.8 + r() * 1.8, p: r() * 6 }));
  }, []);
  const flakes = useMemo(() => {
    const r = rng(77);
    return Array.from({ length: 140 }, () => ({ x: r(), y: r(), v: 0.5 + r(), r: 1.4 + r() * 2.6, d: r() * 6 }));
  }, []);
  const flies = useMemo(() => {
    const r = rng(9);
    return Array.from({ length: 22 }, () => ({ x: r() * 900 - 100, y: 1180 + r() * 300, p: r() * 6, f: 0.5 + r() }));
  }, []);
  const lit = lights;
  const dX = DOOR.x, dW = DOOR.w, dH = DOOR.h;
  const winCols = [620, 910, 1010];
  const ground = season > 0.5 ? "#c9d5e4" : "#1c1712";
  return (
    <g>
      <defs>
        <linearGradient id="s9sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="1" stopColor={sky[1]} />
        </linearGradient>
        <linearGradient id="s9wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mixc("#1a1612", "#4a3a2a", 0.4 * lit)} />
          <stop offset="1" stopColor={mixc("#0d0a08", "#2a2018", 0.5 * lit)} />
        </linearGradient>
        <linearGradient id="s9pool" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor={WARM} stopOpacity={0.85} />
          <stop offset="1" stopColor={WARM} stopOpacity={0} />
        </linearGradient>
        <linearGradient id="s9snow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9f0f8" />
          <stop offset="1" stopColor="#7c8ea6" />
        </linearGradient>
      </defs>
      <rect x={-900} y={-1400} width={3400} height={4000} fill="url(#s9sky)" />
      {stars > 0 &&
        star.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#f4f0e0" opacity={stars * (0.4 + 0.6 * Math.abs(Math.sin(t * 0.8 + s.p)))} />
        ))}
      {stars > 0 && (
        <g opacity={stars}>
          <circle cx={230} cy={160} r={46} fill="#f6efd8" />
          <circle cx={254} cy={146} r={44} fill={sky[0]} />
        </g>
      )}
      {/* far houses */}
      <g fill={mixc("#0c0f18", sky[1], 0.1)}>
        {[[-160, 1250, 170], [20, 1200, 200], [230, 1280, 160], [400, 1230, 150]].map(([x, y, w], i) => (
          <g key={i}>
            <rect x={x} y={y} width={w} height={GY - y} />
            <path d={`M${x - 10},${y} L${x + w / 2},${y - 70} L${x + w + 10},${y}Z`} />
            {lit > 0.2 && <rect x={x + 30} y={y + 50} width={22} height={30} fill={WARM} opacity={0.5 * lit} />}
          </g>
        ))}
      </g>
      {/* minaret and dome behind the facade */}
      <g fill="#0a0b10">
        <rect x={1060} y={430} width={56} height={480} />
        <rect x={1046} y={520} width={84} height={20} />
        <rect x={1052} y={430} width={72} height={16} />
        <path d="M1052,430 L1088,330 L1124,430Z" />
        <path d="M1088,330 L1088,290" stroke="#0a0b10" strokeWidth={5} />
        <circle cx={1088} cy={286} r={11} />
        <circle cx={1093} cy={282} r={9} fill={sky[0]} />
        <path d="M740,900 Q740,720 900,716 Q1060,720 1060,900Z" />
        <path d="M900,716 L900,684" stroke="#0a0b10" strokeWidth={5} />
        <circle cx={900} cy={680} r={9} />
      </g>
      {/* the facade */}
      <rect x={560} y={880} width={900} height={GY - 880} fill="url(#s9wall)" />
      <rect x={560} y={880} width={900} height={14} fill="#0a0907" />
      <rect x={560} y={894} width={900} height={4} fill={WARM} opacity={0.18 * lit} />
      {winCols.map((x, i) => (
        <g key={i}>
          <path d={arch(x, 1170, 96, 200)} fill={WARM2} opacity={0.88 * lit * (0.94 + 0.06 * Math.sin(t * 2.3 + i))} />
          <path d={arch(x, 1170, 96, 200)} fill="none" stroke="#080605" strokeWidth={11} />
          <path d={`M${x},${1170 - 200 + 48} V1170 M${x - 48},1090 H${x + 48}`} stroke="#080605" strokeWidth={6} />
          <ellipse cx={x} cy={1090} rx={150} ry={170} fill={WARM} opacity={0.16 * lit} filter="url(#bl24)" style={{ mixBlendMode: "screen" }} />
        </g>
      ))}
      {/* the doorway */}
      <path d={arch(dX, GY, dW + 34, dH + 20)} fill="#070504" />
      <path d={arch(dX, GY, dW, dH)} fill={mixc("#2a1b0f", WARM2, open)} />
      {open > 0.02 && <path d={arch(dX, GY, dW, dH)} fill={WARM2} opacity={open * 0.9} />}
      {open > 0.02 && <path d={arch(dX, GY, dW, dH)} fill={WARM} opacity={0.5 * open} filter="url(#bl8)" />}
      {/* the leaf of the door: planks, a heavy bar, shut tight in his eyes */}
      {(doubt > 0 || open < 1) && (
        <g opacity={Math.max(doubt, 1 - open)} transform={`translate(${-open * (dW / 2 - 6)} 0)`}>
          <clipPath id="s9leaf">
            <path d={arch(dX, GY, dW, dH)} />
          </clipPath>
          <g clipPath="url(#s9leaf)">
            <rect x={dX - dW / 2} y={GY - dH} width={dW} height={dH} fill={mixc("#241508", "#0b0705", doubt)} />
            {[-52, -26, 0, 26, 52].map((o) => (
              <path key={o} d={`M${dX + o},${GY - dH} V${GY}`} stroke="#0a0604" strokeWidth={3} />
            ))}
            <rect x={dX - dW / 2} y={GY - 220} width={dW} height={18} fill="#050302" opacity={doubt} />
            <rect x={dX - dW / 2} y={GY - 110} width={dW} height={18} fill="#050302" opacity={doubt} />
            <circle cx={dX + 60} cy={GY - 150} r={10} fill="#6a5a44" opacity={doubt} />
          </g>
        </g>
      )}
      {ghost > 0.01 && (
        <g opacity={ghost}>
          <clipPath id="s9ghost">
            <path d={arch(dX, GY, dW, dH)} />
          </clipPath>
          <g clipPath="url(#s9ghost)">
            <rect x={dX - dW / 2} y={GY - dH} width={dW} height={dH} fill="#0b0705" />
            {[-60, -30, 0, 30, 60].map((o) => (
              <path key={o} d={`M${dX + o},${GY - dH} V${GY}`} stroke="#050302" strokeWidth={3} />
            ))}
            <rect x={dX - dW / 2} y={GY - 220} width={dW} height={18} fill="#030201" />
            <rect x={dX - dW / 2} y={GY - 110} width={dW} height={18} fill="#030201" />
            <circle cx={dX + 60} cy={GY - 150} r={10} fill="#6a5a44" />
          </g>
        </g>
      )}
      <path d={arch(dX, GY, dW + 34, dH + 20)} fill="none" stroke="#050403" strokeWidth={14} />
      {/* door and steps */}
      <rect x={dX - 130} y={GY - 10} width={260} height={10} fill="#16110c" />
      {open > 0.05 && <path d={P([[dX - dW / 2, GY - 10], [dX + dW / 2, GY - 10], [dX + dW / 2 + 26, GY + 50], [dX - dW / 2 - 70, GY + 50]])} fill={WARM2} opacity={0.5 * open} />}
      {/* the lamp */}
      <g transform="translate(250 0)">
        <rect x={-5} y={1010} width={10} height={GY - 1010} fill="#060505" />
        <rect x={-14} y={GY - 20} width={28} height={20} fill="#060505" />
        <path d="M-6,1012 Q-60,1000 -66,1050" stroke="#060505" strokeWidth={7} fill="none" />
        <path d="M-82,1052 L-50,1052 L-56,1070 L-76,1070Z" fill="#060505" />
        <ellipse cx={-66} cy={1068} rx={13} ry={7} fill={WARM2} opacity={lit} />
        <circle cx={-66} cy={1070} r={150} fill={WARM} opacity={0.22 * lit} filter="url(#bl24)" style={{ mixBlendMode: "screen" }} />
        <path d={P([[-82, 1074], [-50, 1074], [60, GY], [-190, GY]])} fill={WARM} opacity={0.1 * lit} filter="url(#bl14)" style={{ mixBlendMode: "screen" }} />
      </g>
      {/* the ground */}
      <rect x={-900} y={GY} width={3400} height={1500} fill={mixc("#0b0907", ground, season > 0.5 ? 0.5 : 0.15)} />
      <rect x={-900} y={GY} width={3400} height={season > 0.5 ? 14 : 4} fill={season > 0.5 ? "url(#s9snow)" : sky[1]} opacity={season > 0.5 ? 0.9 : 0.28} />
      {season > 0.5 && <rect x={-900} y={GY - 4} width={3400} height={8} fill="#eef4fb" opacity={0.7} />}
      {/* the pool of light from the open door */}
      {pool > 0 && open > 0.1 && (
        <g opacity={open}>
          <path d={P([[dX + dW / 2, GY], [dX - dW / 2 - 10, GY], [dX - dW / 2 - 10 - 700 * pool, GY + 36], [dX - dW / 2 - 700 * pool, GY + 140], [dX + dW / 2 + 60, GY + 140]])} fill="url(#s9pool)" opacity={0.55} filter="url(#bl8)" style={{ mixBlendMode: "screen" }} />
        </g>
      )}
      {open > 0.1 && <ellipse cx={dX} cy={GY - 90} rx={280} ry={260} fill={WARM} opacity={0.2 * open} filter="url(#fogb)" style={{ mixBlendMode: "screen" }} />}
      {/* the tree: leaves in summer, bare and white in winter */}
      <g transform="translate(95 0)">
        <path d={`M0,${GY} Q-8,1320 10,1210 M10,1230 Q-50,1170 -110,1180 M8,1250 Q70,1190 130,1196 M2,1300 Q-40,1260 -80,1270`} stroke="#050404" strokeWidth={14} fill="none" strokeLinecap="round" />
        {season < 0.5 &&
          Array.from({ length: 40 }, (_, i) => {
            const rr = rng(i * 17 + 3);
            const a = rr() * 6.28;
            const d = 40 + rr() * 150;
            return <ellipse key={i} cx={Math.cos(a) * d * 1.1 + 10} cy={1190 + Math.sin(a) * d * 0.6} rx={22 + rr() * 14} ry={14 + rr() * 8} transform={`rotate(${rr() * 180} ${Math.cos(a) * d * 1.1 + 10} ${1190 + Math.sin(a) * d * 0.6})`} fill={mixc("#1a2a14", "#4a6a2a", rr() * 0.6 * lit)} opacity={0.92} />;
          })}
        {season > 0.5 && <path d={`M-110,1178 L-40,1176 M130,1194 L60,1196 M-80,1268 L-30,1268`} stroke="#e9f0f8" strokeWidth={5} opacity={0.8} />}
      </g>
      {/* summer fireflies, winter snow */}
      {season < 0.5 && lit > 0.3 && (
        <g fill="#ffe9a0">
          {flies.map((f, i) => (
            <circle key={i} cx={f.x + Math.sin(t * 0.6 * f.f + f.p) * 34} cy={f.y + Math.cos(t * 0.5 * f.f + f.p) * 22} r={2.4} opacity={0.75 * Math.max(0, Math.sin(t * 1.4 * f.f + f.p)) ** 3} />
          ))}
        </g>
      )}
      {snow > 0 && (
        <g fill="#f6faff">
          {flakes.map((f, i) => {
            const yy = (((f.y * 1700 + t * 110 * f.v) % 1700) + 1700) % 1700 + 100;
            const xx = ((((f.x * 1500 + Math.sin(t * f.v + f.d) * 30 - t * 40 * f.v) % 1500) + 1500) % 1500) - 200;
            return <circle key={i} cx={xx} cy={yy} r={f.r} opacity={0.85 * snow} />;
          })}
        </g>
      )}
    </g>
  );
};

/* ================================================================ bench, cane, hands */

export const Bench: React.FC<{ x: number }> = ({ x }) => (
  <g transform={`translate(${x} 0)`} fill="#060403">
    <rect x={-150} y={GY - 112} width={300} height={14} rx={4} />
    <rect x={-132} y={GY - 100} width={12} height={100} />
    <rect x={120} y={GY - 100} width={12} height={100} />
    <rect x={-150} y={GY - 112} width={300} height={3} fill={WARM} opacity={0.45} />
  </g>
);

export const Cane: React.FC<{ fill?: string }> = ({ fill = INK6 }) => (
  <g fill="none" stroke={fill} strokeLinecap="round">
    <path d="M0,0 L12,128" strokeWidth={6} />
    <path d="M0,0 Q-2,-12 -14,-10" strokeWidth={6} />
  </g>
);

/** one open hand in silhouette, fingertips up */
export const HandS: React.FC<{ s?: number; flip?: boolean; fill?: string; cup?: number }> = ({ s = 1, flip, fill = INK6, cup = 0.4 }) => (
  <g transform={`scale(${flip ? -s : s} ${s})`} fill={fill}>
    <path d={P([[-40, 60], [-46, 10], [-38, -10], [-20, -6], [-14, 20], [24, 20], [42, 4], [52, 14], [40, 44], [30, 74], [4, 96], [-26, 92]])} />
    {[[-32, -4, -70 + cup * 18], [-12, 8, -88 + cup * 10], [10, 10, -92 + cup * 8], [30, 14, -78 + cup * 12]].map(([x, y, h], i) => (
      <rect key={i} x={x - 9} y={y + h} width={19} height={Math.abs(h) + 4} rx={9.5} />
    ))}
  </g>
);
