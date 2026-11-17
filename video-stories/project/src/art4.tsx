import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { Limb, P, rng, ez } from "./art";
import type { Pose } from "./art";
import { cloth, INK2, Particles } from "./art2";

export type Mode = "s" | "w";
export const cam = (z: number, px: number, py: number) => ({ s: z / 1.15, x: px, y: py - 110 });

/* ============================================================ arch geometry */

export const CX = 540;
export const Y0 = 1000;
export const BASE = 1240;
const HW = 320;
const HWO = 415;

const archPts = (cx: number, y0: number, hw: number, n = 22) => {
  const w = 2 * hw;
  const pts: number[][] = [];
  for (let i = 0; i <= n; i++) {
    const th = Math.PI - ((Math.PI - (2 * Math.PI) / 3) * i) / n;
    pts.push([cx + hw + w * Math.cos(th), y0 - w * Math.sin(th)]);
  }
  for (let i = 0; i <= n; i++) {
    const th = Math.PI / 3 - ((Math.PI / 3) * i) / n;
    pts.push([cx - hw + w * Math.cos(th), y0 - w * Math.sin(th)]);
  }
  return pts;
};
const archPath = (hw: number, base: number) => P([[CX - hw, base], ...archPts(CX, Y0, hw), [CX + hw, base]]);

const OPEN = archPath(HW, BASE);
const OUTER = archPath(HWO, BASE);
const WALL = "M-400,-400 H1480 V" + BASE + " H-400Z " + OPEN;
const RING = OUTER + " " + OPEN;

/** perspective scale for a character standing at screen y */
export const sc = (y: number) => 0.5 + ((y - 1180) / 520) * 0.85;

/* ============================================================ the world */

const PAL = {
  s: { glow: ["#fffdf0", "#ffe9a0", "#f4b44a", "#b87420"], stone: ["#d2b484", "#9a7c54", "#503e28"], ring: "#e0c590", ground: ["#d8b560", "#8a7a30", "#3e4a1c"], edge: "#fff0b8", haze: "#ffe9b0" },
  w: { glow: ["#f6fcff", "#c8dcee", "#7d97b8", "#334766"], stone: ["#586882", "#3a4660", "#1a2234"], ring: "#6c7c98", ground: ["#f3f8fd", "#c0d0e4", "#6f86a6"], edge: "#dff1ff", haze: "#d0e4f6" },
};

export const WorldBack: React.FC<{ mode: Mode; t: number; id?: string }> = ({ mode, t, id = "wb" }) => {
  const c = PAL[mode];
  const trunks = useMemo(() => {
    const r = rng(11);
    return Array.from({ length: 9 }, () => ({ x: 300 + r() * 480, w: 14 + r() * 34, h: 160 + r() * 260, o: 0.25 + r() * 0.3 }));
  }, []);
  const bokeh = useMemo(() => {
    const r = rng(12);
    return Array.from({ length: 34 }, () => ({ x: 260 + r() * 560, y: 560 + r() * 520, r: 10 + r() * 34, o: 0.15 + r() * 0.3, ph: r() * 6 }));
  }, []);
  const stones = useMemo(() => Array.from({ length: 13 }, (_, i) => ({ y: 1000 + 920 * Math.pow(i / 12, 1.75), k: Math.pow(i / 12, 1.2) })), []);
  return (
    <g>
      <defs>
        <radialGradient id={id + "g"} gradientUnits="userSpaceOnUse" cx={540} cy={1040} r={700}>
          {c.glow.map((cc, i) => (
            <stop key={i} offset={[0, 0.28, 0.62, 1][i]} stopColor={cc} />
          ))}
        </radialGradient>
        <linearGradient id={id + "p"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.ground[0]} />
          <stop offset="0.5" stopColor={c.ground[1]} />
          <stop offset="1" stopColor={c.ground[2]} />
        </linearGradient>
      </defs>
      <rect x={-600} y={-600} width={2300} height={2900} fill={`url(#${id}g)`} />
      {/* forest light behind the arch */}
      <g filter="url(#bl8)">
        {trunks.map((q, i) => (
          <path key={i} d={P([[q.x - q.w / 2, 1010], [q.x - q.w * 0.35, 1010 - q.h], [q.x + q.w * 0.35, 1010 - q.h], [q.x + q.w / 2, 1010]])} fill={mode === "s" ? "#8a5a24" : "#2c3e5a"} opacity={q.o} />
        ))}
        {bokeh.map((q, i) => (
          <circle key={i} cx={q.x + Math.sin(t * 0.4 + q.ph) * 6} cy={q.y} r={q.r} fill={mode === "s" ? "#fff3c4" : "#e6f4ff"} opacity={q.o * (0.7 + 0.3 * Math.sin(t + q.ph))} />
        ))}
      </g>
      {/* ground */}
      <path d={P([[-600, 1000], [1700, 1000], [1700, 2300], [-600, 2300]])} fill={`url(#${id}p)`} />
      <path d={P([[CX - 70, 1000], [CX + 70, 1000], [CX + 760, 2300], [CX - 760, 2300]])} fill={mode === "s" ? "#e9d49a" : "#eef5fc"} opacity={mode === "s" ? 0.55 : 0.8} />
      {stones.map((q, i) => (
        <ellipse key={i} cx={CX} cy={q.y} rx={70 + 720 * q.k} ry={3 + 12 * q.k} fill={mode === "s" ? "#8a6a30" : "#7f95b4"} opacity={0.14} />
      ))}
      <ellipse cx={CX} cy={1010} rx={520} ry={70} fill={c.haze} opacity={0.55} filter="url(#bl24)" />
    </g>
  );
};

export const WorldWall: React.FC<{ mode: Mode; t: number; id?: string }> = ({ mode, t, id = "ww" }) => {
  const c = PAL[mode];
  const blocks = useMemo(() => {
    const r = rng(5);
    let d = "";
    for (let y = -300; y < BASE + 400; y += 64) {
      d += `M-400,${y} H1480 `;
      for (let x = -400 + ((y / 64) % 2) * 70; x < 1480; x += 140 + Math.floor(r() * 3) * 20) d += `M${x},${y} v64 `;
    }
    return d;
  }, []);
  const ringLines = useMemo(() => {
    const pts = archPts(CX, Y0, (HW + HWO) / 2, 22);
    const pi = archPts(CX, Y0, HW, 22);
    const po = archPts(CX, Y0, HWO, 22);
    let d = "";
    for (let i = 1; i < pts.length - 1; i += 1) d += `M${pi[i][0]},${pi[i][1]} L${po[i][0]},${po[i][1]} `;
    return d;
  }, []);
  const moss = useMemo(() => {
    const r = rng(9);
    return Array.from({ length: 70 }, () => ({ x: -40 + r() * 330, y: 700 + r() * 600, r: 5 + r() * 12, c: r() }));
  }, []);
  return (
    <g>
      <defs>
        <linearGradient id={id + "w"} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={c.stone[2]} />
          <stop offset="0.35" stopColor={c.stone[1]} />
          <stop offset="0.5" stopColor={c.stone[0]} />
          <stop offset="0.65" stopColor={c.stone[1]} />
          <stop offset="1" stopColor={c.stone[2]} />
        </linearGradient>
      </defs>
      <path d={WALL} fill={`url(#${id}w)`} fillRule="evenodd" />
      <path d={WALL} fill="none" />
      <path d={blocks} stroke="#000" strokeWidth={2} opacity={0.22} fill="none" clipPath={`url(#${id}clip)`} />
      <clipPath id={id + "clip"}>
        <path d={WALL} clipRule="evenodd" />
      </clipPath>
      <path d={RING} fill={c.ring} fillRule="evenodd" opacity={0.92} />
      <path d={ringLines} stroke="#000" strokeWidth={2.4} opacity={0.35} />
      {/* light wrapping the inner edge */}
      <path d={OPEN} fill="none" stroke={c.edge} strokeWidth={44} opacity={0.5} filter="url(#bl14)" />
      <path d={OPEN} fill="none" stroke={c.edge} strokeWidth={5} opacity={0.8} />
      <path d={OUTER} fill="none" stroke="#000" strokeWidth={3} opacity={0.4} />
      {/* rose window above */}
      <g opacity={0.8}>
        <circle cx={CX} cy={Y0 - 790} r={70} fill="#0a0806" opacity={0.55} />
        <circle cx={CX} cy={Y0 - 790} r={70} fill="none" stroke={c.edge} strokeWidth={4} opacity={0.5} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle key={i} cx={CX + Math.cos((i * Math.PI) / 3) * 36} cy={Y0 - 790 + Math.sin((i * Math.PI) / 3) * 36} r={18} fill="none" stroke={c.edge} strokeWidth={3} opacity={0.45} />
        ))}
      </g>
      {mode === "s" ? (
        <g>
          {moss.map((q, i) => (
            <circle key={i} cx={q.x} cy={q.y} r={q.r} fill={q.c < 0.5 ? "#5c7a2c" : "#7a9a3a"} opacity={0.75} />
          ))}
          {moss.slice(0, 40).map((q, i) => (
            <circle key={"f" + i} cx={q.x + 18} cy={q.y - 10} r={3.4} fill={i % 3 ? "#f4a7bd" : "#fff2d0"} />
          ))}
        </g>
      ) : (
        <g>
          <path d={archPts(CX, Y0 - 4, HWO).map((p, i) => (i ? "L" : "M") + p[0] + "," + (p[1] - 8)).join(" ")} fill="none" stroke="#f6fbff" strokeWidth={22} strokeLinecap="round" opacity={0.92} />
          {Array.from({ length: 12 }, (_, i) => (
            <path key={i} d={P([[CX - 250 + i * 46, 560 + Math.abs(i - 5.5) * 40], [CX - 242 + i * 46, 560 + Math.abs(i - 5.5) * 40], [CX - 246 + i * 46, 600 + Math.abs(i - 5.5) * 40 + (i % 3) * 14]])} fill="#e6f4ff" opacity={0.7} />
          ))}
        </g>
      )}
      <rect x={-400} y={BASE} width={1880} height={4} fill="#000" opacity={0.2} />
      <g opacity={0.0}>
        <circle r={1} />
      </g>
      {t < -1 && null}
    </g>
  );
};

export const WorldGround: React.FC<{ mode: Mode; t: number; id?: string }> = ({ mode, id = "wg" }) => {
  const stones = useMemo(() => Array.from({ length: 12 }, (_, i) => ({ y: BASE + 40 + Math.pow(i / 11, 1.5) * 620, k: i / 11 })), []);
  const flw = useMemo(() => {
    const r = rng(61);
    return Array.from({ length: 46 }, () => ({ x: r() * 1300 - 110, y: BASE + 60 + r() * 560, r: 4 + r() * 7, c: r() }));
  }, []);
  const s = mode === "s";
  return (
    <g>
      <defs>
        <linearGradient id={id + "l"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={s ? "#c9b45a" : "#e8f1fa"} />
          <stop offset="0.45" stopColor={s ? "#8a9a34" : "#c4d4e6"} />
          <stop offset="1" stopColor={s ? "#3a4a1a" : "#6c84a4"} />
        </linearGradient>
      </defs>
      <path d={P([[-400, BASE], [1480, BASE], [1480, 2400], [-400, 2400]])} fill={`url(#${id}l)`} />
      <path d={P([[CX - 330, BASE], [CX + 330, BASE], [CX + 980, 2400], [CX - 980, 2400]])} fill={s ? "#ecd9a0" : "#f4f9fe"} opacity={s ? 0.6 : 0.85} />
      {stones.map((q, i) => (
        <ellipse key={i} cx={CX} cy={q.y} rx={330 + 650 * q.k} ry={3 + 10 * q.k} fill={s ? "#8a6a30" : "#7f95b4"} opacity={0.16} />
      ))}
      {s &&
        flw.map((q, i) => (
          <circle key={i} cx={q.x} cy={q.y} r={q.r} fill={q.c < 0.35 ? "#f4a7bd" : q.c < 0.65 ? "#fff2d0" : "#ffd36a"} opacity={0.85} />
        ))}
      <rect x={-400} y={BASE - 6} width={1880} height={70} fill="#000" opacity={0.18} filter="url(#bl8)" />
    </g>
  );
};

export const Canopy: React.FC<{ mode: Mode; t: number }> = ({ mode, t }) => {
  const leaves = useMemo(() => {
    const r = rng(21);
    return Array.from({ length: 300 }, () => {
      const edge = r();
      const x = edge < 0.5 ? -120 + r() * 700 : 480 + r() * 700;
      const y = -140 + Math.pow(r(), 1.6) * 520 - (x > 300 && x < 780 ? 120 : 0);
      return { x, y, rx: 10 + r() * 22, a: r() * 180, c: r(), ph: r() * 6 };
    });
  }, []);
  const branches = useMemo(
    () => [
      "M-80,60 Q180,40 340,230 T470,430",
      "M-60,260 Q140,240 260,380",
      "M1160,40 Q880,50 740,260 T610,420",
      "M1140,280 Q930,260 830,400",
      "M-40,-40 Q300,30 520,150",
      "M1120,-30 Q780,40 560,150",
    ],
    [],
  );
  return (
    <g>
      {branches.map((d, i) => (
        <g key={i}>
          <path d={d} stroke="#1a110a" strokeWidth={26 - (i % 3) * 6} fill="none" strokeLinecap="round" opacity={0.92} />
          {mode === "w" && <path d={d} stroke="#f4faff" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.9} transform="translate(0 -9)" />}
        </g>
      ))}
      {mode === "s" ? (
        <g>
          <g filter="url(#bl3)">
            {leaves.map((q, i) => (
              <ellipse key={i} cx={q.x + Math.sin(t * 0.9 + q.ph) * 4} cy={q.y + Math.cos(t * 0.7 + q.ph) * 3} rx={q.rx} ry={q.rx * 0.55} transform={`rotate(${q.a} ${q.x} ${q.y})`} fill={q.c < 0.3 ? "#ffd86a" : q.c < 0.6 ? "#f4a63a" : q.c < 0.85 ? "#ffeaa8" : "#c9822a"} opacity={0.9} />
            ))}
          </g>
          <g filter="url(#bl14)">
            {leaves.slice(0, 40).map((q, i) => (
              <circle key={i} cx={q.x + 40} cy={q.y + 120} r={30 + q.rx * 1.4} fill="#fff3c4" opacity={0.28} />
            ))}
          </g>
        </g>
      ) : (
        <g>
          {leaves.slice(0, 90).map((q, i) => (
            <ellipse key={i} cx={q.x} cy={q.y + 40} rx={q.rx * 0.9} ry={4} fill="#f4faff" opacity={0.7} />
          ))}
        </g>
      )}
    </g>
  );
};

/** soft shafts of light falling through the foliage */
export const Rays: React.FC<{ t: number; mode: Mode; op?: number }> = ({ t, mode, op = 1 }) => (
  <g opacity={op} style={{ mixBlendMode: "screen" }}>
    <defs>
      <linearGradient id={"ry" + mode} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={mode === "s" ? "#fff3c0" : "#dff1ff"} stopOpacity={0.55} />
        <stop offset="1" stopColor={mode === "s" ? "#fff3c0" : "#dff1ff"} stopOpacity={0} />
      </linearGradient>
    </defs>
    {[0, 1, 2, 3, 4, 5].map((i) => {
      const x = -120 + i * 190 + Math.sin(t * 0.3 + i) * 14;
      const w = 54 + (i % 3) * 30;
      return <path key={i} d={P([[x, -80], [x + w, -80], [x + w + 330, 1500], [x + 150, 1500]])} fill={`url(#ry${mode})`} opacity={0.4 + 0.2 * Math.sin(t * 0.5 + i * 1.7)} filter="url(#bl8)" />;
    })}
  </g>
);

export const Dapple: React.FC<{ t: number; mode: Mode }> = ({ t, mode }) => {
  const d = useMemo(() => {
    const r = rng(33);
    return Array.from({ length: 36 }, () => ({ x: 100 + r() * 880, y: 1260 + r() * 640, rx: 20 + r() * 60, ph: r() * 6 }));
  }, []);
  if (mode !== "s") return null;
  return (
    <g filter="url(#bl5)">
      {d.map((q, i) => (
        <ellipse key={i} cx={q.x + Math.sin(t * 0.4 + q.ph) * 8} cy={q.y} rx={q.rx} ry={q.rx * 0.28} fill="#fff1b8" opacity={0.28 + 0.12 * Math.sin(t + q.ph)} />
      ))}
    </g>
  );
};

/** flowers and grass at the very front (blurred depth) */
export const Foreground: React.FC<{ mode: Mode; t: number }> = ({ mode, t }) => {
  const f = useMemo(() => {
    const r = rng(44);
    return Array.from({ length: 34 }, () => ({ x: r() * 1200 - 60, y: 1780 + r() * 260, h: 80 + r() * 200, c: r(), ph: r() * 6 }));
  }, []);
  return (
    <g>
      {f.map((q, i) => (
        <g key={i} transform={`translate(${q.x + Math.sin(t * 0.8 + q.ph) * 6} ${q.y})`}>
          <path d={`M0,0 Q${6},${-q.h * 0.5} ${Math.sin(q.ph) * 14},${-q.h}`} stroke={mode === "s" ? "#4a5a1c" : "#2b3a52"} strokeWidth={6} fill="none" strokeLinecap="round" />
          {mode === "s" ? <circle cx={Math.sin(q.ph) * 14} cy={-q.h} r={14 + q.c * 12} fill={q.c < 0.4 ? "#f4a7bd" : q.c < 0.7 ? "#fff2d0" : "#ffd36a"} /> : <ellipse cx={Math.sin(q.ph) * 14} cy={-q.h - 4} rx={16} ry={6} fill="#f4faff" opacity={0.9} />}
        </g>
      ))}
    </g>
  );
};

/* ============================================================ snow */

export const Blizzard: React.FC<{ t: number; amount?: number; speed?: number; wind?: number; seed?: number }> = ({ t, amount = 1, speed = 1, wind = 1, seed = 1 }) => {
  const s = useMemo(() => {
    const r = rng(seed * 7 + 2);
    return Array.from({ length: 140 }, () => ({ x: r(), y: r(), v: 0.5 + r(), l: 10 + r() * 36, o: 0.25 + r() * 0.5, w: 1.2 + r() * 2.4 }));
  }, [seed]);
  return (
    <g stroke="#f4faff" strokeLinecap="round">
      {s.slice(0, Math.floor(140 * amount)).map((q, i) => {
        const x = (((q.x * 1500 - t * 220 * wind * q.v * speed) % 1500) + 1500) % 1500 - 200;
        const y = (((q.y * 2100 + t * 260 * q.v * speed) % 2100) + 2100) % 2100 - 100;
        return <line key={i} x1={x} y1={y} x2={x - q.l * wind} y2={y - q.l * 0.4} strokeWidth={q.w} opacity={q.o * Math.min(1, amount)} />;
      })}
    </g>
  );
};

export const Flakes: React.FC<{ t: number; n?: number; seed?: number; size?: number; op?: number }> = ({ t, n = 80, seed = 3, size = 3, op = 0.85 }) => (
  <Particles t={t} area={[-100, -100, 1200, 2000]} n={n} seed={seed} color="#f6fbff" size={size} rise={-60} drift={10} op={op} twinkle={0.6} />
);

/* ============================================================ the knight */

const ARM = {
  s: ["#fff0c4", "#e3b25e", "#9a622a", "#4b2c12"],
  w: ["#d4e0ee", "#8aa0bb", "#3e5068", "#171f2e"],
};
const CAPE = {
  s: ["#c04040", "#7a1c1c"],
  w: ["#6a3038", "#25101a"],
};

export const Knight: React.FC<{
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
  t?: number;
  pose?: Pose;
  mode?: Mode;
  id?: string;
  wind?: number;
  drag?: number;
  tint?: string;
  sword?: number;
  frost?: number;
  breath?: number;
  opacity?: number;
  helm?: boolean;
  sheath?: boolean;
  tear?: number;
}> = ({ x, y, s = 1, flip, t = 0, pose = {}, mode = "s", id = "kn", wind = 0.4, drag = 0, tint, sword = 0, frost = 0, breath = 0, opacity = 1, helm = true, sheath = true, tear = 0 }) => {
  const { lean = 0, head = 0, armF = [0, 10], armB = [0, 10], legF = [0, 0], legB = [0, 0] } = pose;
  const hipY = -150;
  const A = tint ?? `url(#${id}a)`;
  const C = tint ?? `url(#${id}c)`;
  const D = tint ?? "#120d0a";
  const HL = tint ? tint : "#fff7dc";
  const w = mode === "w";
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`} opacity={opacity} fill={A} stroke="none">
      {!tint && (
        <defs>
          <linearGradient id={id + "a"} x1="0" y1="0" x2="1" y2="1">
            {ARM[mode].map((c, i) => (
              <stop key={i} offset={i / 3} stopColor={c} />
            ))}
          </linearGradient>
          <linearGradient id={id + "c"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={CAPE[mode][0]} />
            <stop offset="1" stopColor={CAPE[mode][1]} />
          </linearGradient>
        </defs>
      )}
      {/* back arm + cape */}
      <g transform={`translate(0,${hipY}) rotate(${lean})`}>
        {[0, 1, 2].map((i) => (
          <path key={i} fill={C} d={cloth(-12 - i * 3, -104 + i * 4, Math.PI / 2 + 0.22 + wind * 0.7 + i * 0.1, (w ? 130 : 160) - i * 14, 44 - i * 5, t * 1.1, 40 + i * 7, 0.15 + wind * 0.09, drag)} />
        ))}
        <Limb x={-6} y={-99} a={armB} l1={52} l2={50} w={25} joint={<ellipse cx={0} cy={0} rx={15} ry={13} fill={A} stroke={tint ? "none" : "#fff0c4"} strokeWidth={1.6} strokeOpacity={0.5} />}>
          <path d="M-6,-2 L6,-2 L8,16 L-8,16Z" />
        </Limb>
      </g>
      {/* legs */}
      <Limb x={-3} y={hipY} a={legB} l1={76} l2={74} w={32} joint={<g><ellipse cx={4} cy={0} rx={19} ry={17} fill={A} stroke={tint ? "none" : "#fff0c4"} strokeWidth={1.8} strokeOpacity={0.55} /><path d="M-8,-4 Q6,-12 18,-2" stroke={tint ?? "#fff7dc"} strokeWidth={2} fill="none" opacity={0.6} /></g>}>
        <path d="M-8,-4 L26,2 L27,11 L-9,11Z" />
      </Limb>
      <Limb x={3} y={hipY} a={legF} l1={76} l2={74} w={32} joint={<g><ellipse cx={4} cy={0} rx={19} ry={17} fill={A} stroke={tint ? "none" : "#fff0c4"} strokeWidth={1.8} strokeOpacity={0.55} /><path d="M-8,-4 Q6,-12 18,-2" stroke={tint ?? "#fff7dc"} strokeWidth={2} fill="none" opacity={0.6} /></g>}>
        <path d="M-8,-4 L26,2 L27,11 L-9,11Z" />
      </Limb>
      <g transform={`translate(0,${hipY}) rotate(${lean})`}>
        {/* sheathed sword */}
        {sheath && sword < 0.5 && (
          <g transform="translate(-8,-2) rotate(24)">
            <rect x={-3.5} y={0} width={7} height={92} rx={3} fill={tint ?? "#2a1a12"} />
            <rect x={-9} y={-4} width={18} height={5} fill={tint ?? "#d9b45a"} />
            <rect x={-2.5} y={-18} width={5} height={14} fill={tint ?? "#3a2418"} />
            <circle cx={0} cy={-21} r={4.4} fill={tint ?? "#d9b45a"} />
          </g>
        )}
        {/* tassets */}
        <path d={P([[-24, 6], [24, 6], [33, 48], [-33, 48]])} />
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M${-30 + i * 2},${12 + i * 9} Q0,${20 + i * 9} ${30 - i * 2},${12 + i * 9}`} stroke={tint ?? "#2a1608"} strokeWidth={2} opacity={0.38} fill="none" />
        ))}
        {/* torso */}
        <path d={P([[-21, 8], [21, 8], [17, -44], [31, -96], [17, -110], [-17, -110], [-31, -96], [-17, -44]])} />
        <path d="M0,-106 L0,6" stroke={tint ?? HL} strokeWidth={2} opacity={0.5} fill="none" />
        {[-82, -62, -42, -22].map((yy, i) => (
          <path key={i} d={`M-${22 - i * 1.4},${yy} Q0,${yy + 8} ${22 - i * 1.4},${yy}`} stroke={tint ?? "#2a1608"} strokeWidth={2} opacity={0.3} fill="none" />
        ))}
        <path d="M-12,-100 Q-18,-60 -11,-40" stroke={tint ?? HL} strokeWidth={2.4} opacity={0.55} fill="none" />
        <rect x={-21} y={-6} width={42} height={8} fill={D} opacity={0.85} />
        <circle cx={0} cy={-2.5} r={4.5} fill={tint ?? "#f0cc78"} />
        {/* pauldrons */}
        <ellipse cx={-31} cy={-101} rx={21} ry={15} />
        <ellipse cx={31} cy={-101} rx={21} ry={15} />
        {w && frost > 0 && (
          <g fill={tint ?? "#f4faff"} opacity={0.95 * frost}>
            <ellipse cx={-31} cy={-113} rx={18} ry={6} />
            <ellipse cx={31} cy={-113} rx={18} ry={6} />
            <ellipse cx={0} cy={-110} rx={10} ry={3.4} />
          </g>
        )}
        {/* neck + helmet */}
        <path d="M-6,-120 L6,-120 L7,-104 L-7,-104Z" fill={D} />
        {helm && (
          <g transform={`translate(1,-118) rotate(${head}) scale(1.28)`}>
            <path d="M-15,4 Q-18,-22 -15,-42 Q-9,-58 4,-58 Q17,-56 18,-40 L17,4Z" />
            <path d="M-12,-40 Q-4,-54 8,-52" stroke={tint ?? HL} strokeWidth={2.4} opacity={0.6} fill="none" />
            <path d="M3,-33 L18,-33 L18,-27 L3,-27Z" fill={D} />
            {[-14, -8, -2].map((yy, i) => (
              <circle key={i} cx={11} cy={yy} r={1.8} fill={D} opacity={0.8} />
            ))}
            <path d="M-6,-58 Q0,-66 8,-58" fill="none" stroke={tint ?? HL} strokeWidth={2} opacity={0.5} />
            {!w && <path fill={C} d={cloth(-2, -58, -Math.PI / 2 - 0.75 - wind * 0.45, 62, 18, t * 1.3, 90, 0.18, drag)} />}
            {w && frost > 0 && (
              <g stroke="#f4faff" strokeLinecap="round" fill="none" opacity={frost}>
                <path d="M-14,-20 l8,-6 l-2,-8 M-13,-8 l7,2 M12,-50 l-6,-4 M16,-36 l-5,-3 M2,-56 l4,-6" strokeWidth={1.6} />
                <ellipse cx={0} cy={-58} rx={11} ry={3.6} fill="#f4faff" stroke="none" />
              </g>
            )}
            {tear > 0 && (
              <g opacity={tear}>
                <ellipse cx={13} cy={-20} rx={2.3} ry={3.6} fill="#eaf8ff" stroke="#ffffff" strokeWidth={0.9} />
                <circle cx={12.4} cy={-21} r={0.9} fill="#fff" />
              </g>
            )}
            {breath > 0 &&
              [0, 1, 2, 3].map((k) => {
                const age = (t * 0.55 + k * 0.25) % 1;
                return <circle key={k} cx={20 + age * 70} cy={-12 - age * 26} r={6 + age * 22} fill="#eaf5ff" opacity={(1 - age) * 0.3 * breath} />;
              })}
          </g>
        )}
        {/* front arm */}
        <Limb x={5} y={-99} a={armF} l1={52} l2={50} w={25} joint={<ellipse cx={0} cy={0} rx={15} ry={13} fill={A} stroke={tint ? "none" : "#fff0c4"} strokeWidth={1.6} strokeOpacity={0.5} />}>
          <path d="M-6,-2 L6,-2 L8,16 L-8,16Z" />
          {sword > 0.5 && (
            <g>
              <rect x={-9} y={0} width={18} height={4} fill={tint ?? "#d9b45a"} />
              <path d="M-2.6,4 L2.6,4 L2,128 L0,138 L-2,128Z" fill={tint ?? "#dfe9f3"} stroke={tint ? "none" : "#7f93a8"} strokeWidth={0.8} />
              <rect x={-2.5} y={-14} width={5} height={14} fill={tint ?? "#3a2418"} />
            </g>
          )}
        </Limb>
      </g>
    </g>
  );
};

/* ============================================================ flowers */

export const Bouquet: React.FC<{ x: number; y: number; s?: number; frozen?: number; t?: number; rot?: number }> = ({ x, y, s = 1, frozen = 0, t = 0, rot = 0 }) => {
  const fl = useMemo(() => {
    const r = rng(77);
    return Array.from({ length: 11 }, (_, i) => ({ a: -0.9 + (i / 10) * 1.8 + (r() - 0.5) * 0.2, h: 70 + r() * 50, r: 9 + r() * 7, c: r() }));
  }, []);
  const mix = (a: string, b: string, k: number) => {
    const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
    const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
    return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * k).toString(16).padStart(2, "0")).join("");
  };
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
      {fl.map((q, i) => {
        const hx = Math.sin(q.a) * q.h + Math.sin(t * 0.8 + i) * (1 - frozen) * 1.5;
        const hy = -Math.cos(q.a) * q.h;
        const base = q.c < 0.35 ? "#f2a3b8" : q.c < 0.6 ? "#fff2d0" : q.c < 0.85 ? "#ffd36a" : "#c9a0e8";
        const col = mix(base, "#d6e8f6", frozen * 0.85);
        return (
          <g key={i}>
            <path d={`M0,0 Q${hx * 0.4},${hy * 0.55} ${hx},${hy}`} stroke={mix("#4a6a24", "#5f7a90", frozen)} strokeWidth={3.2} fill="none" strokeLinecap="round" />
            {[0, 1, 2, 3, 4].map((k) => (
              <ellipse key={k} cx={hx + Math.cos((k / 5) * Math.PI * 2) * q.r * 0.8} cy={hy + Math.sin((k / 5) * Math.PI * 2) * q.r * 0.8} rx={q.r * 0.62} ry={q.r * 0.42} transform={`rotate(${(k / 5) * 360} ${hx + Math.cos((k / 5) * Math.PI * 2) * q.r * 0.8} ${hy + Math.sin((k / 5) * Math.PI * 2) * q.r * 0.8})`} fill={col} />
            ))}
            <circle cx={hx} cy={hy} r={q.r * 0.4} fill={mix("#f0b030", "#cfe3f2", frozen)} />
            {frozen > 0 && <ellipse cx={hx} cy={hy - q.r * 0.7} rx={q.r * 0.9} ry={q.r * 0.3} fill="#fbfdff" opacity={0.9 * frozen} />}
          </g>
        );
      })}
      <path d="M-14,-6 L14,-6 L10,14 L-10,14Z" fill={mix("#b83a3a", "#6c7c8e", frozen)} />
      <path d="M-22,10 Q0,22 22,10 L16,26 L-16,26Z" fill={mix("#b83a3a", "#58687a", frozen)} />
      {frozen > 0 && <path d="M-16,-4 l8,8 M10,-2 l6,6 M-6,6 l4,6" stroke="#f4faff" strokeWidth={2.2} opacity={0.9 * frozen} />}
    </g>
  );
};

/* ============================================================ footprints and a view from above */

export const Footprints: React.FC<{ pts: number[][]; upTo: number; fade?: number; col?: string }> = ({ pts, upTo, fade = 1, col = "#5f7898" }) => (
  <g fill={col} opacity={fade}>
    {pts.slice(0, Math.floor(upTo)).map((p, i) => (
      <g key={i} transform={`translate(${p[0]} ${p[1]}) rotate(${p[2]})`}>
        <ellipse cx={0} cy={0} rx={7} ry={15} opacity={0.75} />
        <ellipse cx={0} cy={-3} rx={4} ry={9} fill="#f4faff" opacity={0.5} />
      </g>
    ))}
  </g>
);

/* ============================================================ shattering glass */

const GRID = (() => {
  const r = rng(404);
  const cols = 4;
  const rows = 6;
  const W = 1080;
  const H = 1920;
  const pts: number[][][] = [];
  for (let j = 0; j <= rows; j++) {
    pts.push([]);
    for (let i = 0; i <= cols; i++) {
      const x = (i / cols) * (W + 80) - 40 + (i > 0 && i < cols ? (r() - 0.5) * 150 : 0);
      const y = (j / rows) * (H + 80) - 40 + (j > 0 && j < rows ? (r() - 0.5) * 170 : 0);
      pts[j].push([x, y]);
    }
  }
  const tri: number[][][] = [];
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const a = pts[j][i];
      const b = pts[j][i + 1];
      const c = pts[j + 1][i + 1];
      const d = pts[j + 1][i];
      if ((i + j) % 2) {
        tri.push([a, b, c], [a, c, d]);
      } else {
        tri.push([a, b, d], [b, c, d]);
      }
    }
  return tri;
})();

export const Shatter: React.FC<{ f: number; impact?: number[]; children: React.ReactNode }> = ({ f, impact = [540, 860], children }) => {
  const shards = useMemo(() => {
    const r = rng(505);
    return GRID.map((tr) => {
      const cx = (tr[0][0] + tr[1][0] + tr[2][0]) / 3;
      const cy = (tr[0][1] + tr[1][1] + tr[2][1]) / 3;
      const d = Math.hypot(cx - impact[0], cy - impact[1]);
      return { tr, cx, cy, delay: 6 + d / 55 + r() * 3, vx: (cx - impact[0]) * 0.012 + (r() - 0.5) * 3, vy: -2 + r() * 2, rot: (r() - 0.5) * 7, spin: (r() - 0.5) * 0.4 };
    });
  }, [impact]);
  const crack = ez(f, 0, 6);
  return (
    <AbsoluteFill>
      {shards.map((q, i) => {
        const k = Math.max(0, f - q.delay);
        const dx = q.vx * k;
        const dy = q.vy * k + 0.55 * k * k;
        const rot = q.rot * k * 0.6;
        const clip = `polygon(${q.tr.map((p) => `${p[0]}px ${p[1]}px`).join(",")})`;
        const op = f < q.delay ? 1 : Math.max(0, 1 - (k - 14) / 12);
        return (
          <AbsoluteFill key={i} style={{ clipPath: clip, transform: `translate(${dx}px,${dy}px) rotate(${rot}deg)`, transformOrigin: `${q.cx}px ${q.cy}px`, opacity: op }}>
            {children}
            <svg viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%" }}>
              <path d={P(q.tr)} fill="none" stroke="#ffffff" strokeWidth={3} opacity={0.75} />
              <path d={P(q.tr)} fill="#ffffff" opacity={k > 0 ? 0.12 : 0} />
            </svg>
          </AbsoluteFill>
        );
      })}
      {f < 8 && (
        <svg viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%" }}>
          <g stroke="#ffffff" strokeLinecap="round" fill="none" opacity={0.95}>
            {GRID.slice(0, 30).map((tr, i) => {
              const cx = (tr[0][0] + tr[1][0] + tr[2][0]) / 3;
              const cy = (tr[0][1] + tr[1][1] + tr[2][1]) / 3;
              const L = crack;
              return <line key={i} x1={impact[0]} y1={impact[1]} x2={impact[0] + (cx - impact[0]) * L} y2={impact[1] + (cy - impact[1]) * L} strokeWidth={2.4 + (i % 3)} />;
            })}
          </g>
        </svg>
      )}
    </AbsoluteFill>
  );
};

void [INK2];
