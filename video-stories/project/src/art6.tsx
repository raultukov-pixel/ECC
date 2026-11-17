import React, { useMemo } from "react";
import { Limb, P, rng } from "./art";
import type { Pose } from "./art";
import { drape } from "./art5";

export const INK6 = "#0c0705";
export const RED = "#b3261e";
export const FLOOR = 1508;
export const DESK = 1330;
export const WIN = { cx: 330, hw: 170, spr: 780, base: 1030 };
export const FIREX = 960;

export const mixc = (a: string, b: string, k: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * Math.max(0, Math.min(1, k))).toString(16).padStart(2, "0")).join("");
};

const winPts = (hw: number, n = 18) => {
  const { cx, spr } = WIN;
  const w = 2 * hw;
  const pts: number[][] = [];
  for (let i = 0; i <= n; i++) {
    const th = Math.PI - ((Math.PI / 3) * i) / n;
    pts.push([cx + hw + w * Math.cos(th), spr - w * Math.sin(th)]);
  }
  for (let i = 0; i <= n; i++) {
    const th = Math.PI / 3 - ((Math.PI / 3) * i) / n;
    pts.push([cx - hw + w * Math.cos(th), spr - w * Math.sin(th)]);
  }
  return pts;
};
const WOPEN = P([[WIN.cx - WIN.hw, WIN.base], ...winPts(WIN.hw), [WIN.cx + WIN.hw, WIN.base]]);

/* ============================================================ the man */

export const ManS: React.FC<{
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
  t?: number;
  pose?: Pose;
  fill: string;
  age?: number;
  coat?: boolean;
  hand?: React.ReactNode;
  handB?: React.ReactNode;
  wind?: number;
}> = ({ x, y, s = 1, flip, t = 0, pose = {}, fill, age = 0, coat, hand, handB, wind = 0.1 }) => {
  const { lean = 0, head = 0, armF = [0, 8], armB = [0, 8], legF = [0, 0], legB = [0, 0] } = pose;
  const hipY = -152;
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`} fill={fill} stroke="none">
      <g transform={`translate(0,${hipY}) rotate(${lean})`}>
        <Limb x={-16} y={-94} a={armB} l1={56} l2={52} w={17} taper={0.8}>
          <ellipse cx={0} cy={6} rx={6} ry={9} />
          {handB}
        </Limb>
      </g>
      <Limb x={-7} y={hipY} a={legB} l1={78} l2={72} w={28} taper={0.72}>
        <path d="M-7,-5 L22,2 L30,9 L-8,10Z" />
      </Limb>
      <Limb x={7} y={hipY} a={legF} l1={78} l2={72} w={28} taper={0.72}>
        <path d="M-7,-5 L22,2 L30,9 L-8,10Z" />
      </Limb>
      {coat && <path d={drape(0, hipY - 20, Math.PI / 2 + 0.04 + wind * 0.2, 150, 62, 84, t, 71, 0.05 + wind * 0.08)} />}
      <g transform={`translate(0,${hipY}) rotate(${lean})`}>
        <path d={P([[-24, 6], [24, 6], [25, -40], [31, -86], [24, -103], [-24, -103], [-31, -86], [-25, -40]])} />
        <path d="M-10,-116 L10,-116 L13,-99 L-13,-99Z" />
        <g transform={`translate(0,-104) rotate(${head})`}>
          <ellipse cx={2} cy={-22} rx={15} ry={19} />
          <path d="M14,-28 L23,-18 L16,-13 L18,-6 L9,0Z" />
          <path d={P([[-15, -14], [-19, -30], [-12, -44], [2, -48], [15, -42], [19, -32], [10, -36], [-2, -34], [-8, -22], [-9, -6]])} />
          {age > 0.05 && <path d={P([[6, -8], [19, -8], [20, 2], [14, 12 + 16 * age], [4, 2]])} />}
        </g>
        <Limb x={16} y={-94} a={armF} l1={56} l2={52} w={17} taper={0.8}>
          <ellipse cx={0} cy={6} rx={6} ry={9} />
          {hand}
        </Limb>
      </g>
    </g>
  );
};

/** rim light from the candle (warm, on the facing side) and the window (cold, behind) */
export const Lit6: React.FC<{ warm?: number; cold?: number; flip?: boolean; render: (fill: string) => React.ReactNode }> = ({ warm = 0.7, cold = 0.35, flip, render }) => (
  <g>
    {cold > 0 && (
      <g transform={`translate(${flip ? 3 : -3} -1)`} opacity={cold}>
        {render("#9fc0ea")}
      </g>
    )}
    {warm > 0 && (
      <g transform={`translate(${flip ? -3 : 3} -1.5)`} opacity={warm}>
        {render("#ffb866")}
      </g>
    )}
    {render(INK6)}
  </g>
);

export const Quill: React.FC<{ fill?: string; s?: number }> = ({ fill = INK6, s = 1 }) => (
  <g transform={`scale(${s})`} fill={fill}>
    <path d="M0,0 L3,-10 Q26,-70 60,-104 Q40,-52 9,-6Z" />
    <path d="M0,0 L-1.5,10 L2,2Z" />
  </g>
);

/* ============================================================ the room */

export type RoomP = {
  t: number;
  sky: [string, string];
  outSnow?: number;
  outLeaves?: string | null;
  candle?: number;
  candleH?: number;
  fire?: number;
  ash?: number;
  pile?: number;
  memory?: number;
  beam?: number;
};

export const RoomBack: React.FC<RoomP> = ({ t, sky, outSnow = 1, outLeaves = null, candle = 1, fire = 1, memory = 0, beam = 1 }) => {
  const fk = 0.85 + 0.15 * Math.sin(t * 11) * Math.sin(t * 3.7);
  const flakes = useMemo(() => {
    const r = rng(31);
    return Array.from({ length: 60 }, () => ({ x: r(), y: r(), v: 0.5 + r(), r: 1.5 + r() * 2.5 }));
  }, []);
  const { cx, hw, base } = WIN;
  return (
    <g>
      <defs>
        <linearGradient id="r6sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="1" stopColor={sky[1]} />
        </linearGradient>
        <clipPath id="r6win">
          <path d={WOPEN} />
        </clipPath>
        <radialGradient id="r6wall" gradientUnits="userSpaceOnUse" cx={710} cy={1200} r={900}>
          <stop offset="0" stopColor={mixc("#1a0f08", "#6a3c18", 0.75 * candle * fk)} />
          <stop offset="0.5" stopColor={mixc("#120a06", "#2e1a0c", 0.7 * candle)} />
          <stop offset="1" stopColor="#0a0604" />
        </radialGradient>
      </defs>
      <rect x={-900} y={-900} width={2900} height={3900} fill="url(#r6wall)" />
      {/* the world outside */}
      <g clipPath="url(#r6win)">
        <rect x={cx - hw} y={300} width={hw * 2} height={760} fill="url(#r6sky)" />
        <path d={`M${cx - hw},${base - 60} Q${cx - 40},${base - 120} ${cx + 30},${base - 70} T${cx + hw},${base - 96} V${base} H${cx - hw}Z`} fill={mixc(sky[1], "#0a1020", 0.55)} />
        <g stroke="#0a0f1a" strokeLinecap="round" fill="none" opacity={0.85}>
          <path d={`M${cx + hw + 10},${base - 300} Q${cx + 60},${base - 330} ${cx + 10},${base - 420} M${cx + 80},${base - 330} Q${cx + 60},${base - 380} ${cx + 90},${base - 440} M${cx + 120},${base - 316} Q${cx + 110},${base - 260} ${cx + 60},${base - 240}`} strokeWidth={7} />
        </g>
        {outLeaves && (
          <g fill={outLeaves}>
            {flakes.slice(0, 26).map((q, i) => (
              <ellipse key={i} cx={cx + 20 + q.x * 150} cy={base - 440 + q.y * 210} rx={9} ry={5.5} transform={`rotate(${i * 40} ${cx + 20 + q.x * 150} ${base - 440 + q.y * 210})`} />
            ))}
          </g>
        )}
        {outSnow > 0 &&
          flakes.map((q, i) => {
            const yy = ((q.y * 760 + t * 70 * q.v) % 760) + 300;
            const xx = cx - hw + ((q.x * hw * 2 + Math.sin(t * q.v + i) * 14 - t * 16 * q.v) % (hw * 2) + hw * 2) % (hw * 2);
            return <circle key={i} cx={xx} cy={yy} r={q.r} fill="#f4faff" opacity={0.85 * outSnow} />;
          })}
        {memory > 0.01 && (
          <g opacity={memory} fill="#0a0f1a">
            <path d={`M${cx - 70},${base - 62} l-9,-66 q9,-22 18,0 l-9,66Z`} />
            <circle cx={cx - 70} cy={base - 142} r={9} />
            <g transform={`translate(${60 * Math.min(1, memory * 1.4)} 0)`} opacity={1.2 - memory * 0.6}>
              <path d={`M${cx + 6},${base - 66} l-13,0 l8,-56 q5,-16 10,0Z`} />
              <circle cx={cx + 4} cy={base - 134} r={8} />
            </g>
          </g>
        )}
      </g>
      <path d={WOPEN} fill="none" stroke={sky[1]} strokeWidth={46} opacity={0.3} filter="url(#bl24)" />
      {/* mullions and frame */}
      <g stroke="#070403" fill="none">
        <path d={WOPEN} strokeWidth={16} />
        <path d={`M${cx},${300} V${base} M${cx - hw},${WIN.spr - 40} H${cx + hw} M${cx - hw},${WIN.spr + 120} H${cx + hw}`} strokeWidth={9} />
      </g>
      <rect x={cx - hw - 40} y={base} width={hw * 2 + 80} height={26} fill="#070403" />
      <rect x={cx - hw - 40} y={base} width={hw * 2 + 80} height={5} fill={sky[1]} opacity={0.35} />
      {/* cold light falling into the room */}
      <path d={P([[cx - hw, base + 26], [cx + hw, base + 26], [cx + hw + 420, FLOOR + 500], [cx - hw + 120, FLOOR + 500]])} fill={sky[1]} opacity={0.13 * beam} filter="url(#bl24)" style={{ mixBlendMode: "screen" }} />
      {/* floor */}
      <rect x={-900} y={FLOOR} width={2900} height={1400} fill="#080504" />
      <rect x={-900} y={FLOOR} width={2900} height={6} fill="#c98a3c" opacity={0.12 + 0.1 * candle} />
      <ellipse cx={FIREX + 20} cy={FLOOR + 30} rx={420} ry={70} fill="#ff8a3c" opacity={0.22 * fire} filter="url(#bl24)" />
      {/* fireplace */}
      <g>
        <circle cx={FIREX + 40} cy={FLOOR - 110} r={300} fill="#ff8a3c" opacity={0.3 * fire * fk} filter="url(#fogb)" />
        <path d={P([[FIREX - 130, FLOOR], [FIREX - 130, FLOOR - 330], [FIREX - 160, FLOOR - 330], [FIREX - 160, FLOOR - 372], [1400, FLOOR - 372], [1400, FLOOR]])} fill="#070403" />
        <path d={`M${FIREX - 82},${FLOOR} V${FLOOR - 190} Q${FIREX + 40},${FLOOR - 290} ${FIREX + 160},${FLOOR - 190} V${FLOOR}Z`} fill="#1d0a04" />
        <path d={`M${FIREX - 82},${FLOOR} V${FLOOR - 190} Q${FIREX + 40},${FLOOR - 290} ${FIREX + 160},${FLOOR - 190} V${FLOOR}Z`} fill="#ff7a2c" opacity={0.35 * fire * fk} />
        {[0, 1, 2, 3, 4].map((i) => {
          const h = (70 + 40 * Math.sin(t * (7 + i) + i * 2)) * (0.6 + 0.4 * fire);
          const fx = FIREX - 30 + i * 34;
          return <path key={i} d={`M${fx - 22},${FLOOR - 6} Q${fx - 10},${FLOOR - h * 0.6} ${fx + Math.sin(t * 9 + i) * 8},${FLOOR - h} Q${fx + 12},${FLOOR - h * 0.5} ${fx + 22},${FLOOR - 6}Z`} fill={i % 2 ? "#ffd27a" : "#ff9a3c"} opacity={0.9} />;
        })}
        <rect x={FIREX - 60} y={FLOOR - 16} width={200} height={16} rx={7} fill="#070403" />
      </g>
    </g>
  );
};

export const RoomDesk: React.FC<RoomP & { paper?: boolean }> = ({ t, candle = 1, candleH = 1, ash = 0, pile = 0, paper = true, sky }) => {
  const fk = 0.85 + 0.15 * Math.sin(t * 11) * Math.sin(t * 3.7);
  const balls = useMemo(() => {
    const r = rng(53);
    return Array.from({ length: 16 }, () => ({ x: 120 + r() * 620, y: FLOOR + 22 + r() * 90, r: 9 + r() * 6, a: r() * 360 }));
  }, []);
  const ch = 70 * candleH;
  const cxn = 710;
  const { cx, hw, base } = WIN;
  return (
    <g>
      {/* chair */}
      <g fill="#070403">
        <rect x={300} y={1240} width={16} height={FLOOR - 1240} rx={5} />
        <rect x={300} y={1396} width={150} height={14} rx={5} />
        <rect x={436} y={1396} width={12} height={FLOOR - 1396} />
      </g>
      {/* desk */}
      <g fill="#070403">
        <rect x={450} y={DESK} width={370} height={22} rx={4} />
        <rect x={470} y={DESK + 18} width={16} height={FLOOR - DESK - 18} />
        <rect x={786} y={DESK + 18} width={16} height={FLOOR - DESK - 18} />
        <rect x={450} y={DESK + 22} width={370} height={40} opacity={0.9} />
      </g>
      <rect x={450} y={DESK} width={370} height={4} fill="#ffb866" opacity={0.5 * candle * fk} />
      {paper && <path d={P([[520, DESK - 2], [632, DESK - 2], [626, DESK - 8], [528, DESK - 8]])} fill="#f2e2c0" opacity={0.55 + 0.4 * candle} />}
      <path d={P([[650, DESK], [664, DESK], [668, DESK - 20], [646, DESK - 20]])} fill="#070403" />
      {/* candle */}
      <g>
        <circle cx={cxn} cy={DESK - ch - 30} r={230} fill="#ffb24a" opacity={0.42 * candle * fk} filter="url(#fogb)" />
        <rect x={cxn - 22} y={DESK - 8} width={44} height={8} rx={3} fill="#070403" />
        <rect x={cxn - 9} y={DESK - 8 - ch} width={18} height={ch} rx={3} fill="#e9d9b8" opacity={0.9} />
        <rect x={cxn - 9} y={DESK - 8 - ch} width={7} height={ch} fill="#000" opacity={0.25} />
        {candle > 0.02 && (
          <g transform={`translate(${cxn} ${DESK - 10 - ch})`}>
            <ellipse cx={0} cy={-18} rx={16 * candle} ry={30 * candle * fk} fill="#ffd27a" opacity={0.55} filter="url(#bl5)" />
            <path d={`M-7,0 Q-9,-16 ${Math.sin(t * 9) * 2.5},${-34 * candle * fk} Q9,-16 7,0 Q0,5 -7,0Z`} fill="#fff1c0" />
            <path d={`M-3.4,0 Q-4,-8 0,${-15 * candle} Q4,-8 3.4,0Z`} fill="#ff9a3c" />
          </g>
        )}
      </g>
      {/* ash on the windowsill */}
      {ash > 0.01 && (
        <g>
          <path d={`M${cx - hw + 10},${base + 2} Q${cx - 40},${base - 6 - 46 * ash} ${cx + 30},${base - 4 - 30 * ash} T${cx + hw - 10},${base + 2}Z`} fill="#c9c6c0" opacity={0.92} />
          <path d={`M${cx - hw + 30},${base} Q${cx - 30},${base - 4 - 34 * ash} ${cx + 40},${base - 2 - 22 * ash}`} stroke={mixc("#ffffff", sky[1], 0.3)} strokeWidth={3} fill="none" opacity={0.7} />
        </g>
      )}
      {/* crumpled letters that missed the fire */}
      {balls.slice(0, Math.floor(pile * 16)).map((q, i) => (
        <g key={i} transform={`translate(${q.x} ${q.y}) rotate(${q.a})`}>
          <path d={P([[-q.r, 2], [-q.r * 0.5, -q.r * 0.8], [q.r * 0.3, -q.r], [q.r, -q.r * 0.2], [q.r * 0.7, q.r * 0.7], [-q.r * 0.3, q.r * 0.9]])} fill="#b59c72" opacity={0.6} />
          <path d={`M${-q.r * 0.4},${-q.r * 0.2} L${q.r * 0.2},${q.r * 0.3} L${q.r * 0.6},${-q.r * 0.3}`} stroke="#000" strokeWidth={1.6} fill="none" opacity={0.35} />
        </g>
      ))}
    </g>
  );
};

/** ash drifting through the room like snow */
export const Ash: React.FC<{ t: number; op: number; n?: number }> = ({ t, op, n = 70 }) => {
  const p = useMemo(() => {
    const r = rng(88);
    return Array.from({ length: n }, () => ({ x: r(), y: r(), v: 0.4 + r(), s: 1.5 + r() * 3, ph: r() * 6 }));
  }, [n]);
  if (op <= 0.01) return null;
  return (
    <g fill="#d8d4cc">
      {p.map((q, i) => {
        const yy = ((q.y * 1500 + t * 60 * q.v) % 1500) + 300;
        const xx = (((q.x * 1300 - t * 46 * q.v + Math.sin(t * q.v + q.ph) * 40) % 1300) + 1300) % 1300 - 110;
        return <ellipse key={i} cx={xx} cy={yy} rx={q.s} ry={q.s * 0.6} opacity={op * (0.4 + 0.6 * Math.sin(t * 2 + q.ph) ** 2)} />;
      })}
    </g>
  );
};

export const Ball: React.FC<{ x: number; y: number; r?: number; rot?: number; glow?: number }> = ({ x, y, r = 15, rot = 0, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    {glow > 0 && <circle r={r * 3} fill="#ff9a3c" opacity={glow * 0.6} filter="url(#bl8)" />}
    <path d={P([[-r, 2], [-r * 0.5, -r * 0.8], [r * 0.3, -r], [r, -r * 0.2], [r * 0.7, r * 0.7], [-r * 0.3, r * 0.9]])} fill={mixc("#e6d2a6", "#ff9a3c", glow)} />
    <path d={`M${-r * 0.4},${-r * 0.2} L${r * 0.2},${r * 0.3} L${r * 0.6},${-r * 0.3}`} stroke="#000" strokeWidth={1.6} fill="none" opacity={0.35} />
  </g>
);
