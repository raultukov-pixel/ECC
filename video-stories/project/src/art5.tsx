import React, { useMemo } from "react";
import { Limb, P, rng } from "./art";
import type { Pose } from "./art";

export type Mode = "s" | "w";
export const CX = 540;
const SPR = 1000;
export const BASE = 1260;
const HW = 300;

const archPts = (hw: number, y0 = SPR, n = 26) => {
  const w = 2 * hw;
  const pts: number[][] = [];
  for (let i = 0; i <= n; i++) {
    const th = Math.PI - ((Math.PI / 3) * i) / n;
    pts.push([CX + hw + w * Math.cos(th), y0 - w * Math.sin(th)]);
  }
  for (let i = 0; i <= n; i++) {
    const th = Math.PI / 3 - ((Math.PI / 3) * i) / n;
    pts.push([CX - hw + w * Math.cos(th), y0 - w * Math.sin(th)]);
  }
  return pts;
};
const archD = (hw: number, base = BASE) => P([[CX - hw, base], ...archPts(hw), [CX + hw, base]]);
const OPEN = archD(HW);
const WALL = `M-900,-900 H1980 V${BASE} H-900Z ${OPEN}`;

const smooth = (pts: number[][]) => {
  const n = pts.length;
  let d = `M${((pts[0][0] + pts[n - 1][0]) / 2).toFixed(1)},${((pts[0][1] + pts[n - 1][1]) / 2).toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % n];
    d += `Q${p[0].toFixed(1)},${p[1].toFixed(1)} ${((p[0] + q[0]) / 2).toFixed(1)},${((p[1] + q[1]) / 2).toFixed(1)}`;
  }
  return d + "Z";
};
/** heavy cloth with a smooth edge: no tatters */
export const drape = (x: number, y: number, ang: number, len: number, w0: number, w1: number, t: number, seed: number, amp = 0.12, drag = 0, segs = 9) => {
  const r = rng(seed);
  const p1 = r() * 6.28;
  const k1 = 2.2 + r() * 1.6;
  const s1 = 1.1 + r() * 0.8;
  let cx = x;
  let cy = y;
  const L: number[][] = [];
  const R: number[][] = [];
  for (let i = 0; i <= segs; i++) {
    const u = i / segs;
    const a = ang + drag * Math.pow(u, 1.3) + amp * (0.2 + u) * Math.sin(u * k1 - t * s1 + p1);
    const wi = (w0 + (w1 - w0) * u) / 2;
    const nx = -Math.sin(a);
    const ny = Math.cos(a);
    L.push([cx + nx * wi, cy + ny * wi]);
    R.push([cx - nx * wi, cy - ny * wi]);
    cx += (Math.cos(a) * len) / segs;
    cy += (Math.sin(a) * len) / segs;
  }
  return smooth([...L, ...R.reverse()]);
};

export const COL = {
  s: { light: ["#fffbe6", "#ffe08a", "#f0a23c", "#8a4a14", "#1d0f05"], dark: "#120a04", dark2: "#2c1a0b", rim: "#ffd98a", fig: "#150c05" },
  w: { light: ["#f4faff", "#b9d3ee", "#5f82b0", "#22385c", "#070c18"], dark: "#050912", dark2: "#111d33", rim: "#cfe6ff", fig: "#060a13" },
};

/* ============================================================ set: back (light, far forest, ground) */

export const SetBack: React.FC<{ mode: Mode; t: number; id?: string }> = ({ mode, t, id = "sb" }) => {
  const c = COL[mode];
  const trunks = useMemo(() => {
    const r = rng(11);
    return Array.from({ length: 11 }, () => ({ x: 250 + r() * 580, w: 10 + r() * 30, top: 420 + r() * 300, o: 0.18 + r() * 0.3 }));
  }, []);
  const spots = useMemo(() => {
    const r = rng(13);
    return Array.from({ length: 46 }, () => ({ x: -100 + r() * 1280, y: 1300 + Math.pow(r(), 0.8) * 660, rx: 30 + r() * 110, o: 0.1 + r() * 0.25, ph: r() * 6 }));
  }, []);
  return (
    <g>
      <defs>
        <radialGradient id={id + "l"} gradientUnits="userSpaceOnUse" cx={CX} cy={940} r={1050}>
          {c.light.map((cc, i) => (
            <stop key={i} offset={[0, 0.2, 0.42, 0.7, 1][i]} stopColor={cc} />
          ))}
        </radialGradient>
        <linearGradient id={id + "g"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.light[0]} />
          <stop offset="0.12" stopColor={c.light[1]} />
          <stop offset="0.4" stopColor={c.light[2]} stopOpacity={0.85} />
          <stop offset="0.75" stopColor={c.light[3]} stopOpacity={0.6} />
          <stop offset="1" stopColor={c.dark} stopOpacity={0.2} />
        </linearGradient>
      </defs>
      <rect x={-900} y={-900} width={2900} height={3900} fill={`url(#${id}l)`} />
      <g filter="url(#bl8)">
        {trunks.map((q, i) => (
          <path key={i} d={P([[q.x - q.w / 2, 1150], [q.x - q.w * 0.3, q.top], [q.x + q.w * 0.3, q.top], [q.x + q.w / 2, 1150]])} fill={c.light[3]} opacity={q.o} />
        ))}
      </g>
      {/* ground: dark earth, with the light pouring over it towards the camera */}
      <rect x={-900} y={1130} width={2900} height={2000} fill={c.dark} />
      <path d={P([[CX - 300, 1130], [CX + 300, 1130], [CX + 1350, 2400], [CX - 1350, 2400]])} fill={`url(#${id}g)`} filter="url(#fogb)" />
      <path d={P([[CX - 200, 1130], [CX + 200, 1130], [CX + 620, 2400], [CX - 620, 2400]])} fill={`url(#${id}g)`} opacity={0.55} filter="url(#fogb)" />
      <ellipse cx={CX} cy={1150} rx={420} ry={50} fill={c.light[0]} opacity={0.9} filter="url(#bl14)" />
      {/* broken light on the ground */}
      <g filter="url(#bl14)">
        {spots.map((q, i) => (
          <ellipse key={i} cx={q.x + Math.sin(t * 0.3 + q.ph) * 6} cy={q.y} rx={q.rx * 1.6} ry={q.rx * 0.16} fill={mode === "s" ? c.dark : c.light[0]} opacity={mode === "s" ? q.o * 0.9 : q.o * 0.4} />
        ))}
      </g>
    </g>
  );
};

/* ============================================================ set: front (wall, mouldings, canopy) */

export const SetFront: React.FC<{ mode: Mode; t: number; id?: string }> = ({ mode, t, id = "sf" }) => {
  const c = COL[mode];
  const ivy = useMemo(() => {
    const r = rng(17);
    return Array.from({ length: 150 }, () => {
      const side = r() < 0.6 ? -1 : 1;
      const y = 380 + r() * 880;
      const edge = side < 0 ? 240 - Math.pow(r(), 1.6) * 230 : 840 + Math.pow(r(), 2.2) * 150;
      return { x: edge + (r() - 0.5) * 30, y, rx: 7 + r() * 13, a: r() * 180, lit: r() };
    });
  }, []);
  const leaves = useMemo(() => {
    const r = rng(19);
    return Array.from({ length: 260 }, () => {
      const x = -140 + r() * 1360;
      const arc = 60 + Math.abs(x - 540) * 0.25;
      const y = -120 + Math.pow(r(), 1.5) * (520 - arc);
      return { x, y, rx: 12 + r() * 30, a: r() * 180, lit: r(), ph: r() * 6 };
    });
  }, []);
  const bokeh = useMemo(() => {
    const r = rng(23);
    return Array.from({ length: 34 }, () => ({ x: -60 + r() * 1200, y: -60 + r() * 520, r: 14 + r() * 40, o: 0.2 + r() * 0.45, ph: r() * 6 }));
  }, []);
  const branches = ["M-160,40 Q160,30 330,210 T480,420", "M-120,250 Q120,230 250,370", "M1240,20 Q900,40 750,240 T620,410", "M1220,270 Q960,250 850,390", "M-80,-60 Q300,10 540,130", "M1160,-50 Q790,20 560,130"];
  const s = mode === "s";
  return (
    <g>
      <defs>
        <linearGradient id={id + "w"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.dark} />
          <stop offset="0.7" stopColor={c.dark2} />
          <stop offset="1" stopColor={c.dark} />
        </linearGradient>
      </defs>
      <path d={WALL} fill={`url(#${id}w)`} fillRule="evenodd" />
      {/* stone catching the light: nested mouldings */}
      {[26, 60, 100, 146].map((d, i) => (
        <path key={i} d={archD(HW + d)} fill="none" stroke={c.rim} strokeWidth={6 - i} opacity={0.2 - i * 0.04} />
      ))}
      <path d={P([[CX - 560, 560], [CX, 110], [CX + 560, 560]])} fill="none" stroke={c.rim} strokeWidth={5} opacity={0.1} />
      <g fill="none" stroke={c.rim} opacity={0.16} strokeWidth={4}>
        <circle cx={CX} cy={330} r={62} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle key={i} cx={CX + Math.cos((i * Math.PI) / 3) * 31} cy={330 + Math.sin((i * Math.PI) / 3) * 31} r={17} />
        ))}
      </g>
      {/* the opening burns: light wraps the edge */}
      <path d={OPEN} fill="none" stroke={c.light[1]} strokeWidth={70} opacity={0.5} filter="url(#bl24)" />
      <path d={OPEN} fill="none" stroke={c.light[0]} strokeWidth={7} opacity={0.75} filter="url(#bl2)" />
      {s ? (
        <g>
          {ivy.map((q, i) => (
            <ellipse key={i} cx={q.x} cy={q.y} rx={q.rx} ry={q.rx * 0.6} transform={`rotate(${q.a} ${q.x} ${q.y})`} fill={q.lit > 0.82 ? "#d9a53c" : q.lit > 0.7 ? "#7a5a1c" : c.dark} opacity={q.lit > 0.7 ? 0.85 : 1} />
          ))}
        </g>
      ) : (
        <g>
          <ellipse cx={120} cy={BASE + 6} rx={260} ry={46} fill="#dbe9f8" opacity={0.55} filter="url(#bl8)" />
          <ellipse cx={980} cy={BASE + 6} rx={240} ry={40} fill="#dbe9f8" opacity={0.5} filter="url(#bl8)" />
          {archPts(HW)
            .filter((_, i) => i % 5 === 2 && i > 6 && i < 46)
            .map((p, i) => (
              <path key={i} d={P([[p[0] - 5, p[1]], [p[0] + 5, p[1]], [p[0], p[1] + 26 + (i % 3) * 16]])} fill="#e6f3ff" opacity={0.75} />
            ))}
        </g>
      )}
      {/* canopy */}
      {branches.map((d, i) => (
        <g key={i}>
          <path d={d} stroke={c.dark} strokeWidth={28 - (i % 3) * 7} fill="none" strokeLinecap="round" />
          {!s && <path d={d} stroke="#e6f3ff" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.85} transform="translate(0 -10)" />}
        </g>
      ))}
      {s && (
        <g>
          <g filter="url(#bl14)">
            {bokeh.map((q, i) => (
              <circle key={i} cx={q.x} cy={q.y} r={q.r} fill={c.light[1]} opacity={q.o * (0.7 + 0.3 * Math.sin(t * 1.3 + q.ph))} />
            ))}
          </g>
          {leaves.map((q, i) => (
            <ellipse key={i} cx={q.x + Math.sin(t * 0.9 + q.ph) * 4} cy={q.y + Math.cos(t * 0.7 + q.ph) * 3} rx={q.rx} ry={q.rx * 0.55} transform={`rotate(${q.a} ${q.x} ${q.y})`} fill={q.lit > 0.86 ? "#ffd56a" : q.lit > 0.7 ? "#a8701c" : c.dark} opacity={q.lit > 0.7 ? 0.9 : 1} />
          ))}
        </g>
      )}
    </g>
  );
};

/* ============================================================ light on top of everything */

export const SetLight: React.FC<{ mode: Mode; t: number; op?: number }> = ({ mode, t, op = 1 }) => {
  const c = COL[mode];
  return (
    <g opacity={op} style={{ mixBlendMode: "screen" }}>
      <defs>
        <radialGradient id={"ray" + mode} gradientUnits="userSpaceOnUse" cx={CX} cy={900} r={1300}>
          <stop offset="0" stopColor={c.light[1]} stopOpacity={0.7} />
          <stop offset="0.5" stopColor={c.light[2]} stopOpacity={0.22} />
          <stop offset="1" stopColor={c.light[2]} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g filter="url(#bl14)">
        {[-62, -40, -20, -4, 14, 34, 58].map((a, i) => {
          const a0 = ((a + 90 + Math.sin(t * 0.25 + i) * 2) * Math.PI) / 180;
          const w = 0.035 + (i % 3) * 0.018;
          const R = 1700;
          return <path key={i} d={P([[CX, 900], [CX + Math.cos(a0 - w) * R, 900 + Math.sin(a0 - w) * R], [CX + Math.cos(a0 + w) * R, 900 + Math.sin(a0 + w) * R]])} fill={`url(#ray${mode})`} opacity={(mode === "s" ? 0.55 : 0.3) * (0.7 + 0.3 * Math.sin(t * 0.6 + i * 1.9))} />;
        })}
      </g>
      <ellipse cx={CX} cy={900} rx={360} ry={520} fill={c.light[1]} opacity={mode === "s" ? 0.3 : 0.22} filter="url(#fogb)" />
    </g>
  );
};

export const SetFg: React.FC<{ mode: Mode; t: number }> = ({ mode, t }) => {
  const c = COL[mode];
  const f = useMemo(() => {
    const r = rng(44);
    return Array.from({ length: 30 }, () => ({ x: r() * 1300 - 110, y: 1800 + r() * 240, h: 110 + r() * 260, lit: r(), ph: r() * 6 }));
  }, []);
  return (
    <g>
      {f.map((q, i) => {
        const tip = Math.sin(q.ph) * 60 + Math.sin(t * 0.8 + q.ph) * 12;
        return (
          <g key={i} transform={`translate(${q.x} ${q.y})`}>
            <path d={`M-9,0 Q4,${-q.h * 0.55} ${tip},${-q.h} Q14,${-q.h * 0.5} 9,0Z`} fill={c.dark} />
            <path d={`M-30,0 Q-26,${-q.h * 0.4} ${-tip * 0.8 - 40},${-q.h * 0.7} Q-12,${-q.h * 0.35} -14,0Z`} fill={c.dark} />
            {mode === "s" && q.lit > 0.75 && <circle cx={tip} cy={-q.h} r={9} fill="#ffd56a" opacity={0.9} />}
            {mode === "w" && <path d={`M-9,0 Q4,${-q.h * 0.55} ${tip},${-q.h}`} stroke="#dbe9f8" strokeWidth={5} fill="none" opacity={0.7} />}
          </g>
        );
      })}
    </g>
  );
};

/* ============================================================ figures */

const Rim: React.FC<{ rim: string; dx?: number; dy?: number; op?: number; children: (fill: string) => React.ReactNode }> = ({ rim, dx = -3, dy = -2, op = 0.8, children }) => (
  <>
    <g transform={`translate(${dx} ${dy})`} opacity={op}>
      {children(rim)}
    </g>
  </>
);

/** backlit figure: long shadow thrown towards the camera, a rim of light, then the dark body */
export const Backlit: React.FC<{ x: number; gy: number; mode: Mode; shadow?: number; len?: number; rimOp?: number; flip?: boolean; render: (fill: string) => React.ReactNode }> = ({ x, gy, mode, shadow = 0.5, len = 0.75, rimOp = 0.8, flip, render }) => {
  const c = COL[mode];
  return (
    <g>
      {shadow > 0 && (
        <g transform={`translate(${x} ${gy}) skewX(${((x - CX) / 540) * -26}) scale(1 ${-len}) translate(${-x} ${-gy})`} filter="url(#bl5)" opacity={shadow}>
          {render(mode === "s" ? "#1a0c03" : "#0b1830")}
        </g>
      )}
      <Rim rim={c.rim} dx={flip ? 3 : -3} op={rimOp}>
        {render}
      </Rim>
      {render(c.fig)}
    </g>
  );
};

export const KnightS: React.FC<{
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
  t?: number;
  pose?: Pose;
  fill: string;
  wind?: number;
  drag?: number;
  sword?: "sheath" | "hand" | "none";
  snow?: number;
  hand?: React.ReactNode;
}> = ({ x, y, s = 1, flip, t = 0, pose = {}, fill, wind = 0.3, drag = 0, sword = "sheath", snow = 0, hand }) => {
  const { lean = 0, head = 0, armF = [0, 8], armB = [0, 8], legF = [0, 0], legB = [0, 0] } = pose;
  const hipY = -152;
  const sn = snow > 0 && fill !== "#0b1830" && fill !== "#1a0c03";
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`} fill={fill} stroke="none">
      <g transform={`translate(0,${hipY}) rotate(${lean})`}>
        <path d={drape(-14, -102, Math.PI / 2 + 0.12 + wind * 0.55, 196, 52, 92, t, 41, 0.1 + wind * 0.08, drag)} />
        <path d={drape(-20, -98, Math.PI / 2 + 0.2 + wind * 0.7, 176, 40, 70, t * 1.1, 47, 0.12 + wind * 0.1, drag)} />
        <Limb x={-20} y={-96} a={armB} l1={56} l2={52} w={18} taper={0.8}>
          <rect x={-7} y={-2} width={14} height={22} rx={6} />
        </Limb>
        {sword === "sheath" && (
          <g transform="translate(-16,-2) rotate(26)">
            <rect x={-3} y={-22} width={6} height={130} rx={3} />
            <rect x={-10} y={-4} width={20} height={5} />
          </g>
        )}
      </g>
      <Limb x={-8} y={hipY} a={legB} l1={78} l2={72} w={31} taper={0.74}>
        <path d="M-8,-5 L24,2 L33,9 L-9,10Z" />
      </Limb>
      <Limb x={8} y={hipY} a={legF} l1={78} l2={72} w={31} taper={0.74}>
        <path d="M-8,-5 L24,2 L33,9 L-9,10Z" />
      </Limb>
      <g transform={`translate(0,${hipY}) rotate(${lean})`}>
        <path d={P([[-30, -22], [30, -22], [37, 28], [20, 34], [0, 26], [-20, 34], [-37, 28]])} />
        <path d={P([[-27, -2], [27, -2], [25, -40], [37, -86], [29, -104], [-29, -104], [-37, -86], [-25, -40]])} />
        <ellipse cx={-35} cy={-97} rx={17} ry={13} />
        <ellipse cx={35} cy={-97} rx={17} ry={13} />
        <path d="M-9,-116 L9,-116 L11,-100 L-11,-100Z" />
        <g transform={`translate(0,-104) rotate(${head})`}>
          <path d="M-16,-2 Q-21,-24 -16,-40 Q-8,-56 7,-53 Q18,-50 20,-37 L29,-27 L19,-19 L17,-2Z" />
          <path d="M-12,-44 Q-2,-62 12,-52 L8,-50 Q-2,-56 -9,-42Z" />
          {sn && <ellipse cx={-1} cy={-54} rx={13 * snow} ry={4.5 * snow} fill="#eaf4ff" />}
        </g>
        {sn && (
          <g fill="#eaf4ff">
            <ellipse cx={-35} cy={-108} rx={15 * snow} ry={5 * snow} />
            <ellipse cx={35} cy={-108} rx={15 * snow} ry={5 * snow} />
          </g>
        )}
        <Limb x={20} y={-96} a={armF} l1={56} l2={52} w={18} taper={0.8}>
          <rect x={-7} y={-2} width={14} height={22} rx={6} />
          {sword === "hand" && (
            <g transform="rotate(8)">
              <rect x={-11} y={12} width={22} height={5} />
              <path d="M-3,16 L3,16 L2.2,150 L0,162 L-2.2,150Z" />
              <rect x={-2.6} y={-6} width={5.2} height={20} />
            </g>
          )}
          {hand}
        </Limb>
      </g>
    </g>
  );
};

export const LadyS: React.FC<{
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
  t?: number;
  pose?: Pose;
  fill: string;
  wind?: number;
  drag?: number;
  hand?: React.ReactNode;
  sway?: number;
}> = ({ x, y, s = 1, flip, t = 0, pose = {}, fill, wind = 0.3, drag = 0, hand, sway = 0 }) => {
  const { lean = 0, head = 0, armF = [10, 20], armB = [-6, 14] } = pose;
  const sw = Math.sin(t * 1.8) * 5 * (0.4 + wind) + sway;
  const skirt: number[][] = [[15, -178], [30, -120], [52 - sw * 0.5, -40]];
  for (let i = 0; i <= 8; i++) {
    const u = i / 8;
    skirt.push([64 - u * 128 - sw * (0.5 + u * 0.7) - wind * 16 * u, 2 + Math.sin(u * 9 + t * 1.6) * 3]);
  }
  skirt.push([-52 - sw, -40], [-30, -120], [-15, -178]);
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`} fill={fill} stroke="none">
      <path d={drape(-30, -34, Math.PI * 0.93 + wind * 0.08, 120, 64, 3, t * 0.8, 61, 0.06, drag)} />
      <path d={smooth(skirt)} />
      <path d={P([[-15, -182], [15, -182], [22, -150], [-22, -150]])} />
      <g transform={`translate(0,-176) rotate(${lean})`}>
        <Limb x={-9} y={-68} a={armB} l1={50} l2={46} w={11} taper={0.78}>
          <ellipse cx={0} cy={5} rx={4.6} ry={7.5} />
        </Limb>
        <path d={P([[-15, 4], [15, 4], [20, -56], [15, -74], [-15, -74], [-20, -56]])} />
        <path d="M-5,-92 L5,-92 L6,-70 L-6,-70Z" />
        <g transform={`translate(0,-90) rotate(${head})`}>
          <ellipse cx={2} cy={-17} rx={13} ry={17} />
          <path d="M12,-22 L19,-14 L13,-10 L14,-4 L7,-1Z" />
          <path d="M-13,-10 Q-20,-30 -8,-36 Q6,-40 13,-30 Q4,-34 -3,-28 Q-8,-18 -6,-4Z" />
          <path d={drape(-8, -30, Math.PI * 0.56 + wind * 0.2, 118, 26, 12, t * 0.9, 301, 0.1 + wind * 0.08, drag * 0.6)} />
          <path d={drape(-11, -22, Math.PI * 0.62 + wind * 0.25, 96, 20, 6, t * 1.0, 307, 0.12 + wind * 0.1, drag * 0.6)} />
        </g>
        <Limb x={9} y={-68} a={armF} l1={50} l2={46} w={11} taper={0.78}>
          <ellipse cx={0} cy={5} rx={4.6} ry={7.5} />
          {hand}
        </Limb>
      </g>
    </g>
  );
};

/** a single flower: the one spot of colour */
export const FlowerS: React.FC<{ s?: number; col?: string; stem?: string; len?: number }> = ({ s = 1, col = "#ff9db8", stem = "#150c05", len = 44 }) => (
  <g transform={`scale(${s})`}>
    <path d={`M0,0 Q4,${-len * 0.5} -1,${-len}`} stroke={stem} strokeWidth={3} fill="none" strokeLinecap="round" />
    <path d={`M0,${-len * 0.45} q14,-8 18,4 q-12,6 -18,-4Z`} fill={stem} />
    {[0, 1, 2, 3, 4].map((k) => {
      const a = (k / 5) * Math.PI * 2 - Math.PI / 2;
      return <ellipse key={k} cx={-1 + Math.cos(a) * 9} cy={-len + Math.sin(a) * 9} rx={8} ry={5.4} transform={`rotate(${(a * 180) / Math.PI} ${-1 + Math.cos(a) * 9} ${-len + Math.sin(a) * 9})`} fill={col} />;
    })}
    <circle cx={-1} cy={-len} r={4} fill="#ffe08a" />
  </g>
);
