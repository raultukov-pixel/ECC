import React, { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";

export const INK = "#120b05";
export const LIGHT = "#fff3cf";
export const W = 1920;
export const H = 1080;

export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const ez = (
  f: number,
  a: number,
  b: number,
  from = 0,
  to = 1,
  e: (n: number) => number = Easing.inOut(Easing.cubic),
) =>
  interpolate(f, [a, b], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: e,
  });

type Pt = number[];
export const P = (pts: Pt[]) =>
  "M" + pts.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join("L") + "Z";

/* ---------- stage ---------- */

export type Cam = { s: number; x: number; y: number };

export const VertCtx = React.createContext(false);

export const Stage: React.FC<{ cam?: Cam; vcam?: Cam; children: React.ReactNode }> = ({
  cam = { s: 1, x: 960, y: 540 },
  vcam,
  children,
}) => {
  const v = React.useContext(VertCtx);
  if (v) {
    const c = vcam ?? cam;
    const E = 1.15 * c.s;
    return (
      <AbsoluteFill style={{ backgroundColor: "#0c0703" }}>
        <svg viewBox="0 0 1080 1920" style={{ width: "100%", height: "100%" }}>
          <g transform={`translate(540 960) scale(${E}) translate(${-c.x} ${-(c.y + 110)})`}>{children}</g>
        </svg>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ backgroundColor: "#0c0703" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
        <g transform={`translate(960 540) scale(${cam.s}) translate(${-cam.x} ${-cam.y})`}>{children}</g>
      </svg>
    </AbsoluteFill>
  );
};

export const Sky: React.FC<{
  id: string;
  sun?: [number, number];
  night?: boolean;
  sunR?: number;
  glow?: number;
  disc?: boolean;
}> = ({ id, sun = [1100, 520], night, sunR = 120, glow = 1, disc = true }) => {
  const c = night
    ? ["#a3a585", "#5f6650", "#2b3024", "#0d0f0a"]
    : ["#f3dca6", "#dbb068", "#a6783a", "#452d12"];
  return (
    <>
      <defs>
        <radialGradient
          id={id + "sky"}
          gradientUnits="userSpaceOnUse"
          cx={sun[0]}
          cy={sun[1]}
          r={1500}
        >
          <stop offset="0" stopColor={c[0]} />
          <stop offset="0.22" stopColor={c[1]} />
          <stop offset="0.58" stopColor={c[2]} />
          <stop offset="1" stopColor={c[3]} />
        </radialGradient>
        <filter id={id + "b1"} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="40" />
        </filter>
        <filter id={id + "b2"} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <rect x={-1800} y={-1800} width={W + 3600} height={H + 3600} fill={`url(#${id}sky)`} />
      {disc && (
        <>
          <circle
            cx={sun[0]}
            cy={sun[1]}
            r={sunR * 1.7}
            fill={night ? "#e3e4bd" : LIGHT}
            opacity={0.5 * glow}
            filter={`url(#${id}b1)`}
          />
          <circle
            cx={sun[0]}
            cy={sun[1]}
            r={sunR}
            fill={night ? "#ecebcb" : "#fdf1c9"}
            opacity={0.96}
            filter={`url(#${id}b2)`}
          />
        </>
      )}
    </>
  );
};

/* ---------- landscape ---------- */

export const makeHill = (seed: number, base: number, amp: number) => {
  const r = rng(seed);
  const a = [r() * 6, r() * 6, r() * 6];
  const f = [0.0016 + r() * 0.001, 0.004 + r() * 0.002, 0.011 + r() * 0.004];
  const y = (x: number) =>
    base -
    amp *
      (0.6 * Math.sin(x * f[0] + a[0]) +
        0.3 * Math.sin(x * f[1] + a[1]) +
        0.1 * Math.sin(x * f[2] + a[2]));
  const pts: Pt[] = [];
  for (let x = -700; x <= W + 700; x += 20) pts.push([x, y(x)]);
  pts.push([W + 700, 3200], [-700, 3200]);
  return { d: P(pts), y };
};

export const grass = (
  seed: number,
  y: (x: number) => number,
  x0: number,
  x1: number,
  step: number,
  hgt: number,
  sway = 0,
) => {
  const r = rng(seed);
  let d = "";
  for (let x = x0; x < x1; x += step * (0.5 + r())) {
    const h = hgt * (0.35 + r() * r() * 1.1);
    const lean = (r() - 0.5) * h * 0.7 + sway * h * 0.25;
    const w = 2.5 + r() * 3.5;
    const by = y(x) + 3;
    d += `M${(x - w).toFixed(1)},${by.toFixed(1)}Q${(x + lean * 0.3).toFixed(1)},${(by - h * 0.6).toFixed(1)} ${(x + lean).toFixed(1)},${(by - h).toFixed(1)}Q${(x + lean * 0.4 + w).toFixed(1)},${(by - h * 0.5).toFixed(1)} ${(x + w).toFixed(1)},${by.toFixed(1)}Z`;
  }
  return d;
};

export const makeTree = (seed: number, x: number, y: number, h: number, lean = 0, depth = 6) => {
  const r = rng(seed);
  const polys: string[] = [];
  const tips: Pt[] = [];
  const br = (bx: number, by: number, ang: number, len: number, w: number, d: number) => {
    const segs = 4;
    let cx = bx;
    let cy = by;
    let a = ang;
    const L: Pt[] = [];
    const R: Pt[] = [];
    for (let i = 0; i <= segs; i++) {
      const nx = Math.cos(a + Math.PI / 2);
      const ny = Math.sin(a + Math.PI / 2);
      const wi = (w * (1 - (0.4 * i) / segs)) / 2;
      L.push([cx + nx * wi, cy + ny * wi]);
      R.push([cx - nx * wi, cy - ny * wi]);
      if (i < segs) {
        cx += (Math.cos(a) * len) / segs;
        cy += (Math.sin(a) * len) / segs;
        a += (r() - 0.5) * 0.42;
      }
    }
    polys.push(P([...L, ...R.reverse()]));
    if (d <= 0 || len < 12) {
      tips.push([cx, cy]);
      return;
    }
    const n = d > 4 ? 2 : r() < 0.4 ? 3 : 2;
    for (let i = 0; i < n; i++) {
      const spread = (i - (n - 1) / 2) * (0.6 + r() * 0.45) + (r() - 0.5) * 0.35;
      br(cx, cy, a + spread, len * (0.62 + r() * 0.2), w * 0.6, d - 1);
    }
  };
  // roots flare
  polys.push(P([[x - h * 0.07, y + 6], [x - h * 0.03, y - h * 0.05], [x + h * 0.03, y - h * 0.05], [x + h * 0.08, y + 6]]));
  br(x, y, -Math.PI / 2 + lean, h * 0.3, h * 0.07, depth);
  return { d: polys.join(" "), tips };
};

export const ribbon = (
  x: number,
  y: number,
  ang: number,
  len: number,
  w: number,
  t: number,
  seed: number,
  amp = 0.28,
  segs = 16,
) => {
  const r = rng(seed);
  const ph = r() * 6.28;
  const k = 3 + r() * 3.5;
  const sp = 1.6 + r() * 1.2;
  let cx = x;
  let cy = y;
  const L: Pt[] = [];
  const R: Pt[] = [];
  for (let i = 0; i <= segs; i++) {
    const u = i / segs;
    const a =
      ang +
      amp * 1.5 * Math.sin(u * k - t * sp + ph) * (0.25 + u) +
      amp * 0.6 * Math.sin(u * k * 2.3 - t * sp * 1.7 + ph * 2) * u;
    const wi = (w * Math.pow(1 - u, 0.75)) / 2 + 0.5 * (1 - u);
    const nx = -Math.sin(a);
    const ny = Math.cos(a);
    L.push([cx + nx * wi, cy + ny * wi]);
    R.push([cx - nx * wi, cy - ny * wi]);
    cx += (Math.cos(a) * len) / segs;
    cy += (Math.sin(a) * len) / segs;
  }
  return P([...L, ...R.reverse()]);
};

/* ---------- crows ---------- */

export const Crow: React.FC<{ x: number; y: number; s?: number; flip?: boolean; bob?: number }> = ({
  x,
  y,
  s = 1,
  flip,
  bob = 0,
}) => (
  <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`} fill={INK}>
    <ellipse cx={0} cy={-12} rx={16} ry={9} transform="rotate(-24 0 -12)" />
    <circle cx={12} cy={-23 + bob} r={6.8} />
    <path d={`M16,${-26 + bob} L31,${-21 + bob} L16,${-19 + bob}Z`} />
    <path d="M-9,-10 L-34,3 L-27,-11Z" />
    <path d="M-2,-5 L-3,1 M4,-5 L5,1" stroke={INK} strokeWidth={1.8} />
  </g>
);

export const FlyCrow: React.FC<{ x: number; y: number; s?: number; flip?: boolean; flap: number }> = ({
  x,
  y,
  s = 1,
  flip,
  flap,
}) => {
  const k = Math.sin(flap);
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`} fill={INK}>
      <path d="M-18,0 Q0,-7 16,-2 L26,0 L16,3 Q0,7 -18,2 L-30,6 Z" />
      <path d={`M-8,0 L10,0 L${-2 - 8 * k},${-34 * k} L${-16},${-12 * k}Z`} />
      <path d={`M-4,1 L8,1 L${-12 - 6 * k},${-26 * k + 3}Z`} opacity={0.9} />
    </g>
  );
};

/* ---------- puppets ---------- */

const Seg: React.FC<{ len: number; w0: number; w1: number }> = ({ len, w0, w1 }) => (
  <>
    <circle r={w0 / 2} />
    <path d={`M${-w0 / 2},0 L${w0 / 2},0 L${w1 / 2},${len} L${-w1 / 2},${len}Z`} />
  </>
);

export const Limb: React.FC<{
  x: number;
  y: number;
  a: [number, number];
  l1: number;
  l2: number;
  w: number;
  taper?: number;
  deco?: React.ReactNode;
  joint?: React.ReactNode;
  children?: React.ReactNode;
}> = ({ x, y, a, l1, l2, w, taper = 0.72, deco, joint, children }) => (
  <g transform={`translate(${x},${y}) rotate(${-a[0]})`}>
    <Seg len={l1} w0={w} w1={w * taper} />
    {deco}
    <g transform={`translate(0,${l1}) rotate(${-a[1]})`}>
      <Seg len={l2} w0={w * taper} w1={w * taper * 0.62} />
      {joint}
      <g transform={`translate(0,${l2})`}>{children}</g>
    </g>
  </g>
);

export type Pose = {
  lean?: number;
  head?: number;
  armF?: [number, number];
  armB?: [number, number];
  legF?: [number, number];
  legB?: [number, number];
};
export type Kind = "eldest" | "middle" | "young" | "enemy" | "thief" | "boy";

export const Wand: React.FC<{ rot?: number; len?: number }> = ({ rot = 0, len = 60 }) => (
  <g transform={`rotate(${rot})`}>
    <path d={`M-2.2,-6 L2.2,-6 L1,${len} L-0.4,${len}Z`} />
    <circle cx={0} cy={6} r={2.6} />
    <circle cx={0.3} cy={22} r={2.1} />
  </g>
);

export const walk = (p: number, amt = 1): Pose => ({
  legF: [26 * Math.sin(p) * amt, -Math.max(0, 38 * Math.sin(p + 2.2)) * amt - 4],
  legB: [26 * Math.sin(p + Math.PI) * amt, -Math.max(0, 38 * Math.sin(p + Math.PI + 2.2)) * amt - 4],
  armF: [-20 * Math.sin(p) * amt, 16],
  armB: [20 * Math.sin(p) * amt, 16],
  lean: 4 * amt,
  head: 0,
});

const HEADS: Record<Kind, React.ReactNode> = {
  eldest: (
    <>
      <path d="M-5,-30 L-24,-40 L-13,-26 L-30,-24 L-14,-17 L-27,-7 L-12,-9 L-16,6 L-4,-4Z" />
      <path d="M1,-9 L16,-9 L15,2 L9,14 L3,1Z" />
    </>
  ),
  middle: (
    <>
      <path d="M-24,-26 L26,-29 L26,-24 L-24,-21Z" />
      <path d="M-13,-25 L15,-27 L6,-56 L-6,-74 L-22,-86 L-12,-62Z" />
      <path d="M-9,-22 L-18,-2 L-12,12 L-3,-6Z" />
    </>
  ),
  young: (
    <>
      <path d="M-15,0 Q-22,-32 0,-38 Q15,-38 15,-27 L8,-31 Q-3,-28 -5,-2Z" />
      <path d="M-12,-30 L-34,-16 L-15,-15Z" />
    </>
  ),
  enemy: (
    <>
      <path d="M-30,-27 L32,-31 L32,-26 L-30,-22Z" />
      <path d="M-13,-27 L13,-29 L11,-47 L-11,-45Z" />
      <path d="M-8,-45 Q-26,-70 -44,-58 Q-28,-60 -14,-42Z" />
      <path d="M6,-10 L27,-3 L9,-3Z" />
      <path d="M-9,-22 L-17,-4 L-9,6 L-3,-8Z" />
    </>
  ),
  thief: (
    <>
      <path d="M-16,2 Q-24,-34 0,-40 Q19,-40 20,-24 L10,-30 Q-3,-28 -5,0Z" />
      <path d="M-13,-32 L-30,-22 L-15,-17Z" />
    </>
  ),
  boy: <path d="M-4,-30 L-10,-42 L-2,-33 L2,-45 L6,-32 L14,-40 L12,-28 L-12,-14 L-16,-28Z" />,
};

export const Puppet: React.FC<{
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
  rot?: number;
  kind?: Kind;
  pose?: Pose;
  t?: number;
  wand?: boolean;
  wandRot?: number;
  hand?: React.ReactNode;
  handB?: React.ReactNode;
  wind?: number;
  cape?: boolean;
  fill?: string;
  opacity?: number;
  eye?: number;
}> = ({
  x,
  y,
  s = 1,
  flip,
  rot = 0,
  kind = "eldest",
  pose = {},
  t = 0,
  wand,
  wandRot = 0,
  hand,
  handB,
  wind = 0.4,
  cape,
  fill = INK,
  opacity = 1,
  eye = 0,
}) => {
  const { lean = 0, head = 0, armF = [0, 10], armB = [0, 10], legF = [0, 0], legB = [0, 0] } = pose;
  const wide = kind === "eldest" ? 1.22 : kind === "boy" ? 0.85 : kind === "enemy" ? 1.1 : 1;
  const long = kind === "middle" || kind === "enemy" || kind === "thief";
  const hipY = -150;
  const hasCape = cape ?? (kind === "eldest" || kind === "enemy");
  const hemY = hipY + (long ? 104 : 62);
  const sw = Math.sin(t * 2.1) * wind;
  const hem: Pt[] = [];
  const n = 9;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const hx = 26 - u * 50 - sw * 10 * (0.4 + u) - wind * 8 * u;
    hem.push([hx, hemY + (i % 2 ? -11 : 4) + Math.sin(t * 3 + i) * 2 * wind]);
  }
  return (
    <g
      transform={`translate(${x},${y}) rotate(${rot}) scale(${flip ? -s : s},${s})`}
      fill={fill}
      opacity={opacity}
    >
      <g transform={`translate(0,${hipY}) rotate(${lean})`}>
        <Limb x={-5} y={-99} a={armB} l1={52} l2={50} w={9}>
          <circle cx={0} cy={3} r={4.6} />
          {handB}
        </Limb>
        {hasCape &&
          [0, 1, 2].map((i) => (
            <path
              key={i}
              d={ribbon(-10 - i * 3, -104 + i * 4, Math.PI / 2 + 0.25 + wind * 0.9 + i * 0.16, 150 - i * 14, 46 - i * 6, t * 1.4, 40 + i * 7, 0.16 + wind * 0.12)}
            />
          ))}
      </g>
      <Limb x={-3} y={hipY} a={legB} l1={76} l2={74} w={13}>
        <path d="M-4,-3 L17,2 L17,6 L-4,6Z" />
      </Limb>
      <Limb x={3} y={hipY} a={legF} l1={76} l2={74} w={13}>
        <path d="M-4,-3 L17,2 L17,6 L-4,6Z" />
      </Limb>
      <path d={P([[-13, hipY - 6], [13, hipY - 6], ...hem])} />
      <g transform={`translate(0,${hipY}) rotate(${lean})`}>
        <path
          d={P([[-13, 6], [13, 6], [10, -50], [21 * wide, -102], [13 * wide, -109], [-13 * wide, -109], [-20 * wide, -101], [-10, -50]])}
        />
        <path d="M-4.5,-120 L4.5,-120 L5,-104 L-5,-104Z" />
        <g transform={`translate(1,-116) rotate(${head})`}>
          <ellipse cx={3} cy={-17} rx={11.5} ry={15} />
          <path d="M12,-23 L23,-15 L12,-11Z" />
          {HEADS[kind]}
          {eye > 0 && <ellipse cx={9.5} cy={-19} rx={3.2} ry={1.5} fill={LIGHT} opacity={eye} />}
        </g>
        <Limb x={4} y={-99} a={armF} l1={52} l2={50} w={9}>
          <circle cx={0} cy={3} r={4.6} />
          {wand && <Wand rot={wandRot} />}
          {hand}
        </Limb>
      </g>
    </g>
  );
};

/* ---------- Death ---------- */

export const Death: React.FC<{
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
  t: number;
  lean?: number;
  armF?: [number, number] | null;
  armB?: [number, number] | null;
  hand?: React.ReactNode;
  wind?: number;
  eye?: number;
  fill?: string;
  smile?: number;
}> = ({ x, y, s = 1, flip, t, lean = 0, armF = [20, 25], armB = [-8, 20], hand, wind = 0, eye = 0, fill = INK, smile = 0 }) => {
  const rb = useMemo(() => {
    const r = rng(99);
    return Array.from({ length: 20 }, (_, i) => ({
      y: -500 + r() * 470,
      x: -18 - r() * 26,
      ang: Math.PI + (r() - 0.6) * 0.95,
      len: 170 + r() * 280,
      w: 12 + r() * 30,
      seed: i * 13 + 5,
    }));
  }, []);
  const fingers = (
    <g stroke={fill} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M0,2 L-9,26 L-13,46 L-14,58 M0,2 L-3,32 L-4,56 L-4,72 M0,2 L5,31 L7,53 L8,67 M0,2 L11,24 L16,40 L18,52" strokeWidth={2.6} />
      <path d="M-2,4 L12,12 L22,10" strokeWidth={3} />
      {[[-9, 26], [-13, 46], [-3, 32], [-4, 56], [5, 31], [7, 53], [11, 24], [16, 40]].map((q, i) => (
        <circle key={i} cx={q[0]} cy={q[1]} r={2.7} fill={fill} stroke="none" />
      ))}
    </g>
  );
  const sleeve = (k: number) => (
    <>
      {[0, 1, 2].map((i) => (
        <path key={i} d={ribbon(-2, 30 + i * 38, Math.PI * 0.72 + i * 0.1, 110 + i * 26, 24, t * 1.3, k + i * 3, 0.22)} />
      ))}
    </>
  );
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s}) rotate(${lean})`} fill={fill}>
      {armB && (
        <Limb x={-6} y={-432} a={armB} l1={150} l2={150} w={17} taper={0.55} deco={sleeve(71)}>
          {fingers}
        </Limb>
      )}
      {rb.map((r, i) => (
        <path key={i} d={ribbon(r.x, r.y, r.ang - wind * 0.3, r.len, r.w, t * 1.2, r.seed, 0.26)} />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={ribbon(-50 + i * 24, -30, Math.PI * (0.62 + i * 0.05), 130 + i * 18, 34, t, 300 + i, 0.2)} />
      ))}
      <path
        d={P([[-34, -452], [-46, -380], [-56, -200], [-74, 0], [-44, -22], [-24, 8], [-2, -16], [22, 10], [42, -14], [64, 4], [46, -220], [36, -380], [30, -452]])}
      />
      <path d="M-38,-436 C-52,-500 -32,-552 6,-560 C38,-556 50,-522 46,-486 C48,-470 60,-462 52,-452 C40,-448 34,-442 30,-432 Z" />
      <path d={ribbon(-12, -548, Math.PI + 0.5, 120, 30, t * 1.3, 77, 0.22)} />
      {smile > 0 && (
        <g fill="none" stroke={LIGHT} strokeLinecap="round" opacity={smile}>
          <path d="M22,-474 Q38,-455 55,-478" strokeWidth={3.4} />
          <path d="M21,-476 l-4,-5 M56,-480 l4,-5" strokeWidth={2.4} />
        </g>
      )}
      {eye > 0 && (
        <g fill={LIGHT} opacity={eye}>
          <ellipse cx={27} cy={-510} rx={5} ry={2.3} transform="rotate(14 27 -510)" />
          <ellipse cx={39} cy={-501} rx={3.2} ry={1.6} transform="rotate(14 39 -501)" />
        </g>
      )}
      {armF && (
        <Limb x={12} y={-430} a={armF} l1={150} l2={150} w={17} taper={0.55} deco={sleeve(55)}>
          {fingers}
          {hand}
        </Limb>
      )}
    </g>
  );
};

/* ---------- misc ---------- */

export const House: React.FC<{ x: number; y: number; w: number; h: number; roof?: number; lit?: boolean; chimney?: boolean }> = ({
  x,
  y,
  w,
  h,
  roof = 0.8,
  lit,
  chimney,
}) => (
  <g>
    <path
      fill={INK}
      d={P([[x - w / 2, y + 40], [x - w / 2, y - h], [x - w / 2 - w * 0.09, y - h], [x + w * 0.04, y - h - w * roof], [x + w / 2 + w * 0.09, y - h], [x + w / 2, y - h], [x + w / 2, y + 40]])}
    />
    {chimney && <rect fill={INK} x={x + w * 0.2} y={y - h - w * roof * 0.85} width={w * 0.1} height={w * 0.5} />}
    {lit && <rect x={x - w * 0.12} y={y - h * 0.62} width={w * 0.2} height={h * 0.28} fill="#f7dd9c" opacity={0.85} />}
  </g>
);

export const Fade: React.FC<{ frame: number; dur: number; i?: number; o?: number; color?: string }> = ({
  frame,
  dur,
  i = 10,
  o = 10,
  color = "#0c0703",
}) => {
  const op = Math.max(i > 0 ? ez(frame, 0, i, 1, 0) : 0, o > 0 ? ez(frame, dur - o, dur, 0, 1) : 0);
  return <AbsoluteFill style={{ backgroundColor: color, opacity: op }} />;
};
