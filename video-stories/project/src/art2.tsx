import React, { useContext, useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { Limb, P, rng, ez, LIGHT, VertCtx, Wand } from "./art";
import type { Cam, Pose } from "./art";

export const INK2 = "#0b0911";
export const GROUND = "#171420";
export { ez, rng, P, LIGHT };

/* ============================================================ stage + depth */

type CamState = { c: Cam; ref: { x: number; y: number } };
export const CamCtx = React.createContext<CamState>({ c: { s: 1, x: 960, y: 540 }, ref: { x: 960, y: 540 } });

export const Stage2: React.FC<{
  cam: Cam;
  vcam?: Cam;
  ref0?: { x: number; y: number };
  children: React.ReactNode;
}> = ({ cam, vcam, ref0, children }) => {
  const v = useContext(VertCtx);
  const c = v ? (vcam ?? cam) : cam;
  const ref = ref0 ?? { x: c.x, y: c.y };
  const defs = (
    <defs>
      {[1, 2, 3, 5, 8, 14, 24].map((b) => (
        <filter key={b} id={`bl${b}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={b} />
        </filter>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <filter key={"h" + i} id={`heat${i}`} x="-25%" y="-12%" width="150%" height="124%">
          <feTurbulence type="fractalNoise" baseFrequency="0.011 0.028" numOctaves={2} seed={i * 5 + 2} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={30} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      ))}
      <filter id="fogb" x="-50%" y="-100%" width="200%" height="300%">
        <feGaussianBlur stdDeviation="46" />
      </filter>
      <filter id="glowb" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="26" />
      </filter>
    </defs>
  );
  if (v) {
    const E = 1.15 * c.s;
    return (
      <CamCtx.Provider value={{ c, ref }}>
        <AbsoluteFill style={{ backgroundColor: "#07060b" }}>
          <svg viewBox="0 0 1080 1920" style={{ width: "100%", height: "100%" }}>
            {defs}
            <g transform={`translate(540 960) scale(${E}) translate(${-c.x} ${-(c.y + 110)})`}>{children}</g>
          </svg>
        </AbsoluteFill>
      </CamCtx.Provider>
    );
  }
  return (
    <CamCtx.Provider value={{ c, ref }}>
      <AbsoluteFill style={{ backgroundColor: "#07060b" }}>
        <svg viewBox="0 0 1920 1080" style={{ width: "100%", height: "100%" }}>
          {defs}
          <g transform={`translate(960 540) scale(${c.s}) translate(${-c.x} ${-c.y})`}>{children}</g>
        </svg>
      </AbsoluteFill>
    </CamCtx.Provider>
  );
};

/** parallax layer: k<1 far (moves less), k>1 foreground */
export const Layer: React.FC<{ k?: number; blur?: number; children: React.ReactNode }> = ({ k = 1, blur = 0, children }) => {
  const { c, ref } = useContext(CamCtx);
  const dx = (c.x - ref.x) * (1 - k);
  const dy = (c.y - ref.y) * (1 - k) * 0.7;
  return (
    <g transform={`translate(${dx.toFixed(1)} ${dy.toFixed(1)})`} filter={blur ? `url(#bl${blur})` : undefined}>
      {children}
    </g>
  );
};

/* ============================================================ sky, moon, stars */

export const PAL: Record<string, string[]> = {
  dusk: ["#f1e8d2", "#b9bfd2", "#6b7295", "#22203d"],
  night: ["#d4dcda", "#84969a", "#37484a", "#0a1012"],
  warm: ["#ffe7b4", "#e4b06a", "#98602e", "#2c190a"],
  ghost: ["#f6fcff", "#abcadf", "#506f8e", "#0e1827"],
  indoor: ["#f2c987", "#b97a3c", "#5a3416", "#150b05"],
  dawn: ["#fff8e2", "#fddc9c", "#eeae7c", "#8a6a86"],
  noon: ["#fffdf0", "#cde6f3", "#86b7da", "#2e4f7c"],
  sunset: ["#ffe9be", "#f9b273", "#cb6a6c", "#52305a"],
  winter: ["#eef3fa", "#b8c6dc", "#6d7fa6", "#202a48"],
};

export const Sky2: React.FC<{
  id: string;
  pal?: string;
  sun?: [number, number];
  sunR?: number;
  glow?: number;
  disc?: boolean;
  t?: number;
  stars?: number;
  rings?: boolean;
}> = ({ id, pal = "dusk", sun = [1100, 480], sunR = 130, glow = 1, disc = true, t = 0, stars = 0, rings = true }) => {
  const c = PAL[pal];
  const st = useMemo(() => {
    const r = rng(77);
    return Array.from({ length: 140 }, () => ({ a: r() * 6.283, d: 200 + r() * 1700, r: 0.8 + r() * 1.9, p: r() * 6, f: 1 + r() * 3 }));
  }, []);
  const cr = useMemo(() => {
    const r = rng(12);
    return Array.from({ length: 9 }, () => ({ x: (r() - 0.5) * 1.2, y: (r() - 0.5) * 1.2, r: 0.05 + r() * 0.11, o: 0.035 + r() * 0.05 }));
  }, []);
  return (
    <>
      <defs>
        <radialGradient id={id + "g"} gradientUnits="userSpaceOnUse" cx={sun[0]} cy={sun[1]} r={1800}>
          <stop offset="0" stopColor={c[0]} />
          <stop offset="0.2" stopColor={c[1]} />
          <stop offset="0.55" stopColor={c[2]} />
          <stop offset="1" stopColor={c[3]} />
        </radialGradient>
        <clipPath id={id + "cp"}>
          <circle cx={sun[0]} cy={sun[1]} r={sunR} />
        </clipPath>
      </defs>
      <rect x={-2400} y={-2400} width={6800} height={6800} fill={`url(#${id}g)`} />
      {stars > 0 &&
        st.map((s, i) => {
          const a = s.a + t * 0.035;
          const x = 960 + Math.cos(a) * s.d;
          const y = 1250 + Math.sin(a) * s.d * 0.62 - 400;
          if (y > 760) return null;
          return <circle key={i} cx={x} cy={y} r={s.r} fill="#f4f1de" opacity={stars * (0.35 + 0.45 * Math.sin(t * s.f + s.p) ** 2)} />;
        })}
      {disc && (
        <>
          <circle cx={sun[0]} cy={sun[1]} r={sunR * 2.2} fill={c[0]} opacity={0.34 * glow} filter="url(#glowb)" />
          {rings && (
            <>
              <circle cx={sun[0]} cy={sun[1]} r={sunR * 1.55} fill="none" stroke={c[0]} strokeWidth={2} opacity={0.18 * glow} />
              <circle cx={sun[0]} cy={sun[1]} r={sunR * 2.1} fill="none" stroke={c[0]} strokeWidth={1.5} opacity={0.1 * glow} />
            </>
          )}
          <circle cx={sun[0]} cy={sun[1]} r={sunR} fill={c[0]} filter="url(#bl2)" />
          <g clipPath={`url(#${id}cp)`} filter="url(#bl5)">
            {cr.map((k, i) => (
              <circle key={i} cx={sun[0] + k.x * sunR} cy={sun[1] + k.y * sunR} r={k.r * sunR} fill={c[2]} opacity={k.o} />
            ))}
          </g>
        </>
      )}
    </>
  );
};

/* ============================================================ atmosphere */

export const Fog: React.FC<{ y: number; h?: number; t: number; speed?: number; op?: number; seed?: number; n?: number; color?: string; x0?: number; x1?: number }> = ({
  y,
  h = 150,
  t,
  speed = 8,
  op = 0.22,
  seed = 1,
  n = 5,
  color = "#e9e4d6",
  x0 = -500,
  x1 = 2500,
}) => {
  const r = useMemo(() => {
    const g = rng(seed * 31 + 7);
    return Array.from({ length: n }, () => ({ x: g(), w: 260 + g() * 520, hh: 0.6 + g() * 0.8, o: 0.6 + g() * 0.4, dy: (g() - 0.5) * h * 0.7 }));
  }, [seed, n, h]);
  const span = x1 - x0;
  return (
    <g filter="url(#fogb)" fill={color}>
      {r.map((q, i) => {
        const x = x0 + ((q.x * span + t * speed * (0.6 + q.o * 0.6)) % span);
        return <ellipse key={i} cx={x} cy={y + q.dy} rx={q.w} ry={h * q.hh * 0.5} opacity={op * q.o} />;
      })}
    </g>
  );
};

export const Particles: React.FC<{
  t: number;
  n?: number;
  area: [number, number, number, number];
  seed?: number;
  color?: string;
  size?: number;
  rise?: number;
  drift?: number;
  twinkle?: number;
  op?: number;
}> = ({ t, n = 40, area, seed = 3, color = "#fff1c8", size = 2.2, rise = 10, drift = 12, twinkle = 2, op = 0.8 }) => {
  const pts = useMemo(() => {
    const g = rng(seed * 97 + 5);
    return Array.from({ length: n }, () => ({ x: g(), y: g(), r: 0.5 + g() * 1.1, p: g() * 6.28, f: 0.6 + g() * twinkle, v: 0.5 + g(), d: g() * 6.28 }));
  }, [n, seed, twinkle]);
  const [x0, y0, x1, y1] = area;
  const w = x1 - x0;
  const h = y1 - y0;
  return (
    <g fill={color}>
      {pts.map((q, i) => {
        const yy = (((q.y * h - t * rise * q.v) % h) + h) % h;
        const xx = (((q.x * w + Math.sin(t * 0.7 * q.v + q.d) * drift * 3 + t * drift * 0.4 * q.v) % w) + w) % w;
        const o = op * (0.35 + 0.65 * Math.sin(t * q.f + q.p) ** 2) * Math.min(1, yy / 60) * Math.min(1, (h - yy) / 60);
        return <circle key={i} cx={x0 + xx} cy={y0 + yy} r={size * q.r} opacity={o} />;
      })}
    </g>
  );
};

/* ============================================================ cloth */

type Pt = number[];
/** ribbon with gust-driven sway and motion drag */
export const cloth = (x: number, y: number, ang: number, len: number, w: number, t: number, seed: number, amp = 0.26, drag = 0, segs = 18) => {
  const r = rng(seed);
  const p1 = r() * 6.28;
  const p2 = r() * 6.28;
  const k1 = 2.4 + r() * 2.2;
  const k2 = 5.5 + r() * 3;
  const s1 = 1.3 + r();
  const s2 = 2.4 + r() * 1.5;
  const gust = 0.55 + 0.45 * Math.sin(t * 0.55 + p1) * Math.sin(t * 0.23 + p2);
  let cx = x;
  let cy = y;
  const L: Pt[] = [];
  const R: Pt[] = [];
  for (let i = 0; i <= segs; i++) {
    const u = i / segs;
    const a =
      ang +
      drag * Math.pow(u, 1.3) +
      amp * gust * 1.3 * (0.15 + u) * Math.sin(u * k1 - t * s1 + p1) +
      amp * 0.55 * u * Math.sin(u * k2 - t * s2 + p2);
    const tear = i === segs ? 0 : 1 + 0.35 * Math.sin(i * 2.7 + p1) * u;
    const wi = ((w * Math.pow(1 - u, 0.8)) / 2) * tear + 0.4;
    const nx = -Math.sin(a);
    const ny = Math.cos(a);
    L.push([cx + nx * wi, cy + ny * wi]);
    R.push([cx - nx * wi, cy - ny * wi]);
    cx += (Math.cos(a) * len) / segs;
    cy += (Math.sin(a) * len) / segs;
  }
  return P([...L, ...R.reverse()]);
};

/* ============================================================ hands */

export const Hand: React.FC<{ curl?: number; size?: number; spread?: number; thumb?: number }> = ({ curl = 0.3, size = 1, spread = 1, thumb = 1 }) => {
  const F = [
    [-0.5, 24],
    [-0.18, 31],
    [0.12, 29],
    [0.38, 22],
  ];
  return (
    <g transform={`scale(${size})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
      {F.map(([a, l], i) => {
        const aa = a * spread;
        const j = [Math.sin(aa) * l * 0.55, 3 + Math.cos(aa) * l * 0.55];
        const bend = aa + curl * 1.15 * (i === 0 ? 0.8 : 1);
        const tip = [j[0] + Math.sin(bend) * l * 0.5, j[1] + Math.cos(bend) * l * 0.5 * (1 - curl * 0.8)];
        return <path key={i} d={`M0,3 L${j[0]},${j[1]} L${tip[0]},${tip[1]}`} strokeWidth={3.1 - i * 0.2} />;
      })}
      <path d={`M-4,4 L${-13 * thumb},${14 + curl * 4} L${-10 * thumb},${22 + curl * 4}`} strokeWidth={3} />
      <ellipse cx={0} cy={5} rx={5.4} ry={7} fill="currentColor" stroke="none" />
    </g>
  );
};

/* ============================================================ puppets */

export type K2 = "kadm" | "girl" | "young";

const orn = (op: number, col = LIGHT) => ({ fill: col, opacity: op, stroke: "none" as const });

export const Puppet2: React.FC<{
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
  rot?: number;
  kind: K2;
  pose?: Pose;
  t?: number;
  wand?: boolean;
  wandRot?: number;
  hand?: React.ReactNode;
  wind?: number;
  drag?: number;
  fill?: string;
  opacity?: number;
  curlF?: number;
  curlB?: number;
  eye?: number;
  float?: number;
  orn?: number;
  hat?: boolean;
  silver?: number;
  skin?: string;
  hairc?: string;
  face?: number;
}> = ({ x, y, s = 1, flip, rot = 0, kind, pose = {}, t = 0, wand, wandRot = 0, hand, wind = 0.4, drag = 0, fill = INK2, opacity = 1, curlF = 0.3, curlB = 0.3, eye = 0, float = 0, orn: ornOp = 0.5, hat = true, silver = 0, skin, hairc, face = 0 }) => {
  const { lean = 0, head = 0, armF = [0, 10], armB = [0, 10], legF = [0, 0], legB = [0, 0] } = pose;
  const hipY = -150;
  const girl = kind === "girl";
  const kad = kind === "kadm";
  const hemY = girl ? -8 : kad ? hipY + 112 : hipY + 96;
  const hemW = girl ? 66 : kad ? 34 : 38;
  const sw = Math.sin(t * 2.0) * wind;
  const N = girl ? 16 : 12;
  const hem: Pt[] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const hx = hemW - u * hemW * 2 - (sw * 12 + wind * 10 + drag * 0.4) * (0.3 + u);
    const sc = girl ? (i % 2 ? -5 : 5) : i % 2 ? -12 : 5;
    hem.push([hx, hemY + sc + Math.sin(t * 2.6 + i * 1.3) * 2.4 * wind]);
  }
  const bodyY = float ? Math.sin(t * 1.1) * float : 0;
  const armW = girl ? 7 : kad ? 10 : 9;
  const shoulderY = -99;
  const handNode = (curl: number) => (
    <g color={skin ?? fill} stroke={skin ?? fill}>
      <Hand curl={curl} size={girl ? 0.85 : 1} />
    </g>
  );
  return (
    <g transform={`translate(${x},${y + bodyY}) rotate(${rot}) scale(${flip ? -s : s},${s})`} fill={fill} stroke={fill} strokeWidth={0.4} opacity={opacity}>
      {/* back arm + back drapery */}
      <g transform={`translate(0,${hipY}) rotate(${lean})`}>
        <Limb x={-5} y={shoulderY} a={armB} l1={52} l2={50} w={armW}>
          {handNode(curlB)}
        </Limb>
        {kad &&
          [0, 1, 2].map((i) => (
            <path key={i} d={cloth(-12 - i * 3, -100 + i * 5, Math.PI / 2 + 0.22 + wind * 0.8 + i * 0.12, 120 - i * 16, 34 - i * 5, t, 140 + i * 5, 0.16 + wind * 0.1, drag * 0.9)} />
          ))}
        {kind === "young" && silver < 0.05 &&
          [0, 1, 2].map((i) => (
            <path key={i} d={cloth(-10 - i * 3, -104 + i * 5, Math.PI / 2 + 0.3 + wind * 0.9 + i * 0.14, 150 - i * 18, 40 - i * 6, t * 1.2, 160 + i * 5, 0.2 + wind * 0.1, drag)} />
          ))}
        {kind === "young" && silver >= 0.05 && (
          <g opacity={silver}>
            <defs>
              <linearGradient id="svr" x1="0" y1="0" x2="0.6" y2="1">
                <stop offset="0" stopColor="#f2fcf7" />
                <stop offset="0.4" stopColor="#9fc9c4" />
                <stop offset="0.8" stopColor="#56808a" />
                <stop offset="1" stopColor="#d3ece5" />
              </linearGradient>
            </defs>
            <path d={cloth(-7, -108, Math.PI / 2 + 0.1 + wind * 0.4, 172, 96, t * 0.8, 175, 0.12, drag)} fill="url(#svr)" stroke="#e9fbf4" strokeWidth={1.4} strokeOpacity={0.6} />
            {[0, 1, 2, 3].map((i) => (
              <path key={i} d={cloth(-6 - i * 5, -108 + i * 5, Math.PI / 2 + 0.16 + wind * 0.45 + i * 0.07, 168 - i * 12, 62 - i * 6, t * 0.9, 170 + i * 5, 0.15 + wind * 0.08, drag)} fill="url(#svr)" stroke="#e9fbf4" strokeWidth={1.4} strokeOpacity={0.65} />
            ))}
            <path d={cloth(-8, -100, Math.PI / 2 + 0.28 + wind * 0.5, 120, 40, t * 1.1, 190, 0.18, drag)} fill="#f4fffb" opacity={0.4} />
          </g>
        )}
      </g>
      {/* legs */}
      {!girl && (
        <>
          <Limb x={-3} y={hipY} a={legB} l1={76} l2={74} w={13}>
            <path d="M-4,-3 L18,2 L18,7 L-5,7Z" />
          </Limb>
          <Limb x={3} y={hipY} a={legF} l1={76} l2={74} w={13}>
            <path d="M-4,-3 L18,2 L18,7 L-5,7Z" />
          </Limb>
        </>
      )}
      {/* skirt / coat skirts */}
      {girl ? (
        <>
          <path opacity={0.4} d={cloth(-4, hipY + 6, Math.PI / 2 + 0.22 + wind * 0.3, 128, 56, t * 0.8, 210, 0.1, drag * 0.5)} />
          <path
            d={`M11,${hipY - 8} Q30,${hipY + 54} ${hem[0][0].toFixed(1)},${hem[0][1].toFixed(1)} ${hem.slice(1).map((p) => `L${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ")} Q-30,${hipY + 54} -11,${hipY - 8}Z`}
          />
        </>
      ) : (
        <path d={P([[-15, hipY - 8], [15, hipY - 8], ...hem])} />
      )}
      {/* torso */}
      <g transform={`translate(0,${hipY}) rotate(${lean})`}>
        {girl ? (
          <path d={P([[-9, 8], [9, 8], [8, -40], [14, -94], [8, -108], [-8, -108], [-14, -93], [-8, -40]])} />
        ) : kad ? (
          <path d={P([[-15, 8], [15, 8], [12, -44], [26, -96], [15, -110], [14, -126], [4, -112], [-4, -112], [-14, -126], [-15, -110], [-26, -96], [-12, -44]])} />
        ) : (
          <path d={P([[-13, 6], [13, 6], [10, -50], [20, -101], [12, -109], [-12, -109], [-20, -100], [-10, -50]])} />
        )}
        <path d="M-4.5,-120 L4.5,-120 L5,-104 L-5,-104Z" />
        {kind === "young" && silver >= 0.05 && (
          <g opacity={silver}>
            <path d={P([[-20, -101], [-8, -114], [11, -112], [24, -101], [18, -84], [10, -70], [-2, -78], [-14, -84]])} fill="url(#svr)" stroke="#e9fbf4" strokeWidth={1.4} strokeOpacity={0.7} />
            <path d="M-12,-100 Q0,-92 14,-102 M-8,-90 Q4,-80 16,-92" fill="none" stroke="#f4fffb" strokeWidth={1.4} opacity={0.55} />
          </g>
        )}
        {/* cut-out ornament, as if the paper were backlit */}
        {kad && ornOp > 0 && (
          <g {...orn(ornOp * 0.9)}>
            {[-86, -68, -50, -32, -14].map((yy, i) => (
              <circle key={i} cx={1.5} cy={yy} r={2.4} />
            ))}
            <path d="M-12,-44 L12,-44 L12,-40 L-12,-40Z" />
            <path d={P([[-24, -96], [-17, -100], [-12, -92], [-19, -90]])} />
            <path d={P([[24, -96], [17, -100], [12, -92], [19, -90]])} />
          </g>
        )}
        {girl && ornOp > 0 && (
          <g {...orn(ornOp * 0.8)}>
            {[-86, -70, -54].map((yy, i) => (
              <path key={i} d={P([[0, yy - 5], [4, yy], [0, yy + 5], [-4, yy]])} />
            ))}
          </g>
        )}
        {/* head */}
        <g transform={`translate(1,-116) rotate(${head})`}>
          <ellipse cx={3} cy={-17} rx={11.5} ry={15} fill={girl && skin ? skin : undefined} />
          <path d="M12,-23 L23,-15 L12,-11Z" fill={girl && skin ? skin : undefined} />
          {girl && face > 0 && (
            <g opacity={face}>
              <path d="M8,-22 q3.2,-2.4 6.4,0" stroke="#3a2418" strokeWidth={1.5} fill="none" strokeLinecap="round" />
              <path d="M12.5,-10 q3,3.2 7,-0.4" stroke="#a0524a" strokeWidth={1.4} fill="none" strokeLinecap="round" />
              <circle cx={8} cy={-14} r={3.4} fill="#f08a7a" opacity={0.4} stroke="none" />
            </g>
          )}
          {kad && (
            <>
              <path d={P([[8, -8], [14, 0], [8, 36], [0, 8]])} />
              <path d="M10,-30 L14,-26 L11,-25Z" />
              {hat && (
                <>
                  <ellipse cx={0} cy={-31} rx={40} ry={5.4} transform="rotate(-4 0 -31)" />
                  <path d={P([[-18, -33], [18, -33], [13, -68], [9, -104], [-6, -152], [-18, -138], [-8, -104], [-13, -68]])} />
                  {ornOp > 0 && <rect x={-17} y={-40} width={34} height={3} {...orn(ornOp)} />}
                </>
              )}
            </>
          )}
          {girl && (
            <>
              <path d={P([[-13, -8], [-16, -28], [-7, -40], [6, -41], [12, -33], [3, -35], [-5, -28], [-4, -8]])} fill={hairc} />
              <circle cx={-12} cy={-30} r={7} fill={hairc} />
              {[0, 1, 2, 3, 4].map((i) => (
                <path key={i} fill={hairc} d={cloth(-10 - i, -28 + i * 4, Math.PI * (0.52 + i * 0.07), 120 - i * 10, 15 - i, t * 0.9, 300 + i * 3, 0.32, drag * 0.5)} />
              ))}
            </>
          )}
          {kind === "young" && (
            <>
              <path d={P([[-16, 4], [-26, -26], [-12, -46], [8, -44], [18, -28], [10, -32], [0, -30], [-6, -4]])} />
              <path d={cloth(-14, -30, Math.PI * 0.72, 70, 26, t, 330, 0.2, drag)} />
            </>
          )}
          {eye > 0 && <ellipse cx={9.5} cy={-19} rx={3.2} ry={1.5} fill={LIGHT} opacity={eye} />}
        </g>
        {/* front arm */}
        <Limb x={4} y={shoulderY} a={armF} l1={52} l2={50} w={armW}>
          {handNode(curlF)}
          {wand && <Wand rot={wandRot} />}
          {hand}
        </Limb>
      </g>
      {/* hem trims */}
      {ornOp > 0 && (kad || girl) && (
        <g {...orn(ornOp * 0.75)}>
          {hem.slice(1, -1).map((p, i) => (
            <path key={i} d={P([[p[0] - 3, p[1] - 14], [p[0], p[1] - 22], [p[0] + 3, p[1] - 14], [p[0], p[1] - 7]])} />
          ))}
        </g>
      )}
    </g>
  );
};

/* ============================================================ light helpers */

/** draws a figure with rim light and a cast shadow. render(fill, opacity) draws the figure */
export const Lit: React.FC<{
  gy: number;
  x: number;
  rim?: string;
  rimOp?: number;
  rimDx?: number;
  rimDy?: number;
  shadow?: number;
  skew?: number;
  render: (fill: string, op: number) => React.ReactNode;
}> = ({ gy, x, rim = "#f3e9cf", rimOp = 0.6, rimDx = -2.6, rimDy = -1.6, shadow = 0.28, skew = -18, render }) => (
  <g>
    {shadow > 0 && (
      <g transform={`translate(${x} ${gy}) skewX(${skew}) scale(1 -0.26) translate(${-x} ${-gy})`} filter="url(#bl3)" opacity={shadow}>
        {render("#000", 1)}
      </g>
    )}
    {rimOp > 0 && <g transform={`translate(${rimDx} ${rimDy})`}>{render(rim, rimOp)}</g>}
    {render(INK2, 1)}
  </g>
);

export const Glow: React.FC<{ x: number; y: number; r: number; color?: string; op?: number }> = ({ x, y, r, color = "#fff2cf", op = 0.6 }) => (
  <circle cx={x} cy={y} r={r} fill={color} opacity={op} filter="url(#glowb)" />
);

export const GroundBand: React.FC<{ y: number; hill: string; fog?: number }> = ({ y, hill, fog = 0.18 }) => (
  <>
    <path d={hill} fill={GROUND} />
    <rect x={-1500} y={y} width={5000} height={80} fill={LIGHT} opacity={fog} filter="url(#bl14)" />
  </>
);


/* ============================================================ foliage and cloak */

const mix = (a: string, b: string, k: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * k).toString(16).padStart(2, "0")).join("");
};
export const leafColor = (season: number, i: number) => {
  if (season < 0.22) return i % 4 === 0 ? "#f2b6c6" : mix("#8fc765", "#a8d878", (i % 3) / 3);
  if (season < 0.5) return mix("#3f7f45", "#5a9b4c", (i % 3) / 3);
  if (season < 0.8) return mix("#d9822b", "#b5442e", (i % 4) / 4);
  return "#b5442e";
};
export const leafOp = (season: number) => (season < 0.78 ? 1 : Math.max(0, 1 - (season - 0.78) / 0.1));

export const Foliage: React.FC<{ tips: number[][]; season: number; t: number; seed?: number; size?: number; dark?: number }> = ({ tips, season, t, seed = 1, size = 1, dark = 0.55 }) => {
  const lf = useMemo(() => {
    const r = rng(seed * 13 + 3);
    return tips.map((p) => Array.from({ length: 5 }, () => ({ dx: (r() - 0.5) * 34, dy: (r() - 0.5) * 30, rx: 8 + r() * 9, a: r() * 180, ph: r() * 6 })));
  }, [tips, seed]);
  const op = leafOp(season);
  if (op <= 0.01) return null;
  return (
    <g opacity={op * 0.95}>
      {tips.map((p, i) =>
        lf[i].map((q, j) => (
          <ellipse key={i + "_" + j} cx={p[0] + q.dx + Math.sin(t * 1.2 + q.ph) * 2} cy={p[1] + q.dy} rx={q.rx * size} ry={q.rx * 0.6 * size} transform={`rotate(${q.a} ${p[0] + q.dx} ${p[1] + q.dy})`} fill={mix(leafColor(season, i + j), "#10140c", dark)} />
        )),
      )}
    </g>
  );
};

/** the silver cloak: liquid-looking cloth */
export const CloakSheet: React.FC<{ x: number; y: number; ang: number; len: number; w: number; t: number; seed: number; id: string; op?: number; amp?: number }> = ({ x, y, ang, len, w, t, seed, id, op = 1, amp = 0.22 }) => (
  <g opacity={op}>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#eafaf4" />
        <stop offset="0.35" stopColor="#8fbcb8" />
        <stop offset="0.7" stopColor="#4d7480" />
        <stop offset="1" stopColor="#cfe9e2" />
      </linearGradient>
    </defs>
    <path d={cloth(x, y, ang, len, w, t, seed, amp)} fill="#bfe6dc" opacity={0.5} filter="url(#bl8)" />
    <path d={cloth(x, y, ang, len, w, t, seed, amp)} fill={`url(#${id})`} />
    <path d={cloth(x + 4, y + 3, ang + 0.04, len * 0.92, w * 0.6, t * 1.1, seed + 3, amp)} fill="#f1fbf7" opacity={0.45} />
  </g>
);
