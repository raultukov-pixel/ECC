import React, { useMemo } from "react";
import { P, rng } from "./art";
import { drape } from "./art5";
import { INK6, mixc } from "./art6";

export const KF = 1508;
export const KT = 1330;
export const KW = { x0: 230, x1: 750, y0: 380, y1: 1160 };
export const HIS = 390;
export const HER = 690;
export const SCARF = "#a8322a";

export const Steam: React.FC<{ x: number; y: number; t: number; s: number; h?: number; seed?: number; col?: string }> = ({ x, y, t, s, h = 330, seed = 1, col = "#fff3d6" }) => {
  if (s <= 0.01) return null;
  const pts: React.ReactNode[] = [];
  for (let k = 0; k < 3; k++) {
    for (let i = 0; i < 16; i++) {
      const u = ((i / 16 + t * 0.16 + k * 0.33 + seed * 0.37) % 1 + 1) % 1;
      const yy = y - u * h * (0.6 + 0.4 * s);
      const xx = x + (k - 1) * 9 + Math.sin(u * 5.2 + t * 0.9 + k * 2.1 + seed) * (8 + u * 46);
      const o = Math.sin(Math.PI * Math.min(1, u * 1.15)) * (1 - u * 0.55) * 0.34 * s;
      pts.push(<circle key={k + "_" + i} cx={xx} cy={yy} r={7 + u * 34} fill={col} opacity={o} />);
    }
  }
  return (
    <g filter="url(#bl8)" style={{ mixBlendMode: "screen" }}>
      {pts}
    </g>
  );
};

export const Cup: React.FC<{ x: number; y: number; s?: number; flip?: boolean; fill?: string; saucer?: boolean; rim?: number }> = ({ x, y, s = 1, flip, fill = INK6, saucer = true, rim = 0.6 }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    {saucer && <ellipse cx={0} cy={1} rx={38} ry={5} fill={fill} />}
    <path d="M26,-38 Q50,-36 45,-20 Q40,-6 20,-9" fill="none" stroke={fill} strokeWidth={6.5} strokeLinecap="round" />
    <path d="M-25,-47 L25,-47 Q23,-9 12,-1 L-12,-1 Q-23,-9 -25,-47Z" fill={fill} />
    {rim > 0 && fill === INK6 && <path d="M-25,-47 L25,-47" stroke="#ffdca0" strokeWidth={2.4} opacity={rim} />}
  </g>
);

export const Teapot: React.FC<{ fill?: string }> = ({ fill = INK6 }) => (
  <g fill={fill}>
    <ellipse cx={0} cy={-34} rx={44} ry={33} />
    <rect x={-30} y={-8} width={60} height={8} rx={3} />
    <ellipse cx={0} cy={-66} rx={22} ry={6} />
    <circle cx={0} cy={-76} r={6.5} />
    <path d="M38,-40 Q64,-44 78,-70 L86,-64 Q72,-30 40,-22Z" />
    <path d="M-40,-52 Q-76,-56 -72,-30 Q-68,-10 -38,-16" fill="none" stroke={fill} strokeWidth={8} strokeLinecap="round" />
  </g>
);

export type KitP = {
  t: number;
  sky: [string, string];
  light?: number;
  plant?: number;
  leaves?: string | null;
  snow?: number;
  door?: number;
  clock?: number;
  scarf?: boolean;
  hope?: number;
};

export const KitchenBack: React.FC<KitP> = ({ t, sky, light = 1, plant = 0, leaves = null, snow = 0, door = 0, clock = 0, scarf = true, hope = 0 }) => {
  const { x0, x1, y0, y1 } = KW;
  const cx = (x0 + x1) / 2;
  const fl = useMemo(() => {
    const r = rng(3);
    return Array.from({ length: 50 }, () => ({ x: r(), y: r(), v: 0.5 + r(), r: 1.5 + r() * 2.5 }));
  }, []);
  const droop = plant * 1.1;
  return (
    <g>
      <defs>
        <linearGradient id="k7sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="1" stopColor={sky[1]} />
        </linearGradient>
        <radialGradient id="k7wall" gradientUnits="userSpaceOnUse" cx={cx} cy={900} r={1150}>
          <stop offset="0" stopColor={mixc("#1c110a", mixc("#a8743c", sky[1], 0.25), 0.85 * light)} />
          <stop offset="0.45" stopColor={mixc("#140b06", "#4a2c14", 0.8 * light)} />
          <stop offset="1" stopColor="#080504" />
        </radialGradient>
        <clipPath id="k7win">
          <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} />
        </clipPath>
      </defs>
      <rect x={-900} y={-900} width={3400} height={3900} fill="url(#k7wall)" />
      <g clipPath="url(#k7win)">
        <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="url(#k7sky)" />
        <circle cx={cx + 60} cy={y1 - 250} r={90} fill="#fffbe6" opacity={0.75 * light} filter="url(#bl14)" />
        <path d={`M${x0},${y1 - 90} Q${cx - 80},${y1 - 170} ${cx + 20},${y1 - 110} T${x1},${y1 - 140} V${y1} H${x0}Z`} fill={mixc(sky[1], "#3a2a1a", 0.55)} />
        <path d={`M${x0 - 10},${y1 - 420} Q${x0 + 90},${y1 - 470} ${x0 + 150},${y1 - 580} M${x0 + 70},${y1 - 456} Q${x0 + 110},${y1 - 400} ${x0 + 170},${y1 - 410} M${x0 + 110},${y1 - 520} Q${x0 + 90},${y1 - 590} ${x0 + 120},${y1 - 640}`} stroke="#1a0f08" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.85} />
        {leaves && (
          <g fill={leaves}>
            {fl.slice(0, 30).map((q, i) => (
              <ellipse key={i} cx={x0 + 20 + q.x * 190} cy={y1 - 660 + q.y * 260} rx={11} ry={6.5} transform={`rotate(${i * 40} ${x0 + 20 + q.x * 190} ${y1 - 660 + q.y * 260})`} />
            ))}
          </g>
        )}
        {snow > 0 &&
          fl.map((q, i) => {
            const yy = ((q.y * 780 + t * 70 * q.v) % 780) + y0;
            const xx = x0 + ((((q.x * (x1 - x0) + Math.sin(t * q.v + i) * 14 - t * 14 * q.v) % (x1 - x0)) + (x1 - x0)) % (x1 - x0));
            return <circle key={i} cx={xx} cy={yy} r={q.r} fill="#ffffff" opacity={0.85 * snow} />;
          })}
      </g>
      <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="none" stroke={sky[1]} strokeWidth={50} opacity={0.3 * light} filter="url(#bl24)" />
      <g stroke="#070403" fill="none">
        <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} strokeWidth={18} />
        <path d={`M${cx},${y0} V${y1} M${x0},${y0 + 250} H${x1}`} strokeWidth={10} />
      </g>
      {/* curtains */}
      <g fill="#0a0604" opacity={0.96}>
        <path d={drape(x0 - 6, y0 - 40, Math.PI / 2 + 0.02, 830, 110, 150, t * 0.5, 11, 0.02)} />
        <path d={drape(x1 + 6, y0 - 40, Math.PI / 2 - 0.02, 830, 110, 150, t * 0.5, 12, 0.02)} />
        <rect x={x0 - 90} y={y0 - 64} width={x1 - x0 + 180} height={26} rx={8} />
      </g>
      {/* sill and the plant */}
      <rect x={x0 - 30} y={y1} width={x1 - x0 + 60} height={24} fill="#070403" />
      <rect x={x0 - 30} y={y1} width={x1 - x0 + 60} height={5} fill={sky[1]} opacity={0.4 * light} />
      <g transform={`translate(${x1 - 150} ${y1})`}>
        {[-1, 0, 1].map((k) => {
          const a = k * 0.5 + droop * (k === 0 ? 0.9 : k * 1.2);
          const tx = Math.sin(a) * 110;
          const ty = -Math.cos(a) * 110 * (1 - plant * 0.25);
          return (
            <g key={k}>
              <path d={`M0,-40 Q${tx * 0.3},${-40 + ty * 0.7} ${tx},${-40 + ty}`} stroke="#0a0604" strokeWidth={5} fill="none" strokeLinecap="round" />
              {[0.45, 0.75, 1].map((u, j) => (
                <ellipse key={j} cx={tx * u} cy={-40 + ty * u} rx={17 * (1 - plant * 0.45)} ry={8 * (1 - plant * 0.4)} transform={`rotate(${(a * 180) / Math.PI + (j % 2 ? 50 : -50)} ${tx * u} ${-40 + ty * u})`} fill={mixc("#3f6a2c", "#1c120a", 0.25 + plant * 0.75)} />
              ))}
            </g>
          );
        })}
        {hope > 0 && <ellipse cx={8} cy={-64} rx={13 * hope} ry={6.5 * hope} transform="rotate(-50 8 -64)" fill="#7fb858" />}
        <path d="M-30,-42 L30,-42 L22,0 L-22,0Z" fill="#070403" />
      </g>
      {/* morning light falling into the room */}
      <path d={P([[x0, y1 + 24], [x1, y1 + 24], [x1 + 330, KF + 500], [x0 - 60, KF + 500]])} fill={sky[1]} opacity={0.2 * light} filter="url(#bl24)" style={{ mixBlendMode: "screen" }} />
      {/* clock */}
      <g transform="translate(890 600)">
        <circle r={46} fill="#070403" />
        <circle r={38} fill={mixc("#2a1a0e", "#c9a06a", 0.5 * light)} />
        <path d={`M0,0 L${Math.sin(clock * 6.283) * 26},${-Math.cos(clock * 6.283) * 26}`} stroke="#070403" strokeWidth={4} strokeLinecap="round" />
        <path d={`M0,0 L${Math.sin(clock * 75.4) * 17},${-Math.cos(clock * 75.4) * 17}`} stroke="#070403" strokeWidth={5} strokeLinecap="round" />
      </g>
      {/* floor */}
      <rect x={-900} y={KF} width={3400} height={1400} fill="#070403" />
      <rect x={-900} y={KF} width={3400} height={6} fill="#c98a3c" opacity={0.1 + 0.12 * light} />
      {/* door on the right */}
      <g>
        <rect x={1040} y={720} width={260} height={KF - 720} fill="#050302" />
        {door > 0.01 && (
          <>
            <rect x={1062} y={742} width={216 * door} height={KF - 742} fill="#fff1cf" opacity={0.95} />
            <circle cx={1170} cy={1100} r={420} fill="#ffe6b0" opacity={0.3 * door} filter="url(#fogb)" />
            <path d={P([[1062, KF], [1062 + 216 * door, KF], [1062 + 216 * door - 420, KF + 500], [1062 - 620, KF + 500]])} fill="#fff1cf" opacity={0.2 * door} filter="url(#bl24)" />
          </>
        )}
        <rect x={1040} y={720} width={22} height={KF - 720} fill="#030201" />
        <rect x={1040} y={720} width={260} height={22} fill="#030201" />
      </g>
      {/* her scarf on the hook */}
      <g>
        <rect x={944} y={884} width={38} height={8} rx={3} fill="#030201" />
        <circle cx={976} cy={888} r={6} fill="#030201" />
        {scarf && (
          <g fill={SCARF}>
            <path d={drape(962, 890, Math.PI / 2 + 0.05, 250, 30, 38, t * 0.4, 21, 0.02)} />
            <path d={drape(984, 892, Math.PI / 2 - 0.04, 190, 26, 34, t * 0.4, 23, 0.02)} />
          </g>
        )}
      </g>
      {/* chairs */}
      <g fill="#060403">
        <rect x={110} y={1230} width={16} height={KF - 1230} rx={5} />
        <rect x={110} y={1396} width={150} height={14} rx={5} />
        <rect x={246} y={1396} width={12} height={KF - 1396} />
        <rect x={930} y={1230} width={16} height={KF - 1230} rx={5} />
        <rect x={796} y={1396} width={150} height={14} rx={5} />
        <rect x={798} y={1396} width={12} height={KF - 1396} />
      </g>
    </g>
  );
};

export const KitchenTable: React.FC<{ t: number; light?: number; cupHis?: boolean; cupHer?: boolean; steamHis?: number; steamHer?: number; pot?: boolean; ring?: number }> = ({ t, light = 1, cupHis = true, cupHer = true, steamHis = 0, steamHer = 0, pot = true, ring = 0 }) => (
  <g>
    <g fill="#060403">
      <rect x={250} y={KT} width={600} height={22} rx={4} />
      <rect x={274} y={KT + 18} width={16} height={KF - KT - 18} />
      <rect x={810} y={KT + 18} width={16} height={KF - KT - 18} />
    </g>
    <rect x={250} y={KT} width={600} height={4} fill="#ffdca0" opacity={0.5 * light} />
    {pot && (
      <g transform={`translate(545 ${KT})`}>
        <Teapot />
      </g>
    )}
    {ring > 0 && <ellipse cx={HER} cy={KT + 2} rx={30} ry={3.2} fill="none" stroke="#ffdca0" strokeWidth={2} opacity={0.7 * ring} />}
    {cupHis && <Cup x={HIS} y={KT} flip />}
    {cupHer && <Cup x={HER} y={KT} />}
    <Steam x={HIS} y={KT - 50} t={t} s={steamHis} seed={1} />
    <Steam x={HER} y={KT - 50} t={t} s={steamHer} seed={2} />
  </g>
);
