import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import vo from "./vo4.json";
import { VertCtx, walk } from "./art";
import { Fog, Glow, INK2, Layer, Lit, P, Particles, Puppet2, Stage2, cloth, ez, rng } from "./art2";
import { Blizzard, Bouquet, Canopy, Dapple, Flakes, Foreground, Footprints, Knight, Rays, Shatter, WorldBack, WorldGround, WorldWall, cam, sc } from "./art4";
import type { Mode } from "./art4";

const FPS = 30;
type SP = { dur: number };
const LA = (i: number) => vo.lines[i].start;
const LE = (i: number) => vo.lines[i].end;
const useSc = (name: string) => {
  const frame = useCurrentFrame();
  const s = vo.scenes.find((x) => x.name === name)!;
  return { frame, T: s.start + frame / FPS, s };
};
const mixn = (a: number, b: number, k: number) => a + (b - a) * k;

/* ---------------------------------------------------------------- shared */

const DressDefs: React.FC = () => (
  <defs>
    <linearGradient id="dress" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#fff6e2" />
      <stop offset="0.6" stopColor="#ebd3a4" />
      <stop offset="1" stopColor="#b98c58" />
    </linearGradient>
  </defs>
);

const World: React.FC<{ mode: Mode; t: number; children?: React.ReactNode; fgBlur?: number; rays?: number; fg?: boolean }> = ({ mode, t, children, fgBlur = 8, rays = 1, fg = true }) => (
  <>
    <Layer k={0.3}>
      <WorldBack mode={mode} t={t} />
    </Layer>
    <Layer k={0.7}>
      <WorldWall mode={mode} t={t} />
      <Canopy mode={mode} t={t} />
    </Layer>
    <Layer k={0.9}>
      <WorldGround mode={mode} t={t} />
    </Layer>
    {mode === "s" && <Dapple t={t} mode={mode} />}
    {children}
    <Rays t={t} mode={mode} op={rays * (mode === "s" ? 1 : 0.5)} />
    {fg && (
      <Layer k={1.5} blur={fgBlur as 8}>
        <Foreground mode={mode} t={t} />
      </Layer>
    )}
  </>
);

const KnightL: React.FC<{ x: number; y: number; s?: number; flip?: boolean; t: number; pose?: Parameters<typeof Knight>[0]["pose"]; mode?: Mode; id?: string; wind?: number; sword?: number; frost?: number; breath?: number; rim?: string; shadow?: number; opacity?: number; tear?: number }> = ({ x, y, s, flip, t, pose, mode = "s", id = "kn", wind = 0.4, sword = 0, frost = 0, breath = 0, rim, shadow = 0.22, opacity = 1, tear = 0 }) => (
  <Lit gy={y} x={x} rimOp={0.65} rim={rim ?? (mode === "s" ? "#fff0b8" : "#dff1ff")} shadow={shadow} rimDx={flip ? 3 : -3} render={(f) => <Knight x={x} y={y} s={s ?? sc(y)} flip={flip} t={t} pose={pose} mode={mode} id={id} wind={wind} sword={sword} frost={frost} breath={breath} opacity={opacity} tear={tear} tint={f === INK2 ? undefined : f} />} />
);

const LadyL: React.FC<{ x: number; y: number; s?: number; flip?: boolean; t: number; pose?: Parameters<typeof Puppet2>[0]["pose"]; wind?: number; face?: number; hand?: React.ReactNode }> = ({ x, y, s, flip, t, pose, wind = 0.35, face = 1, hand }) => (
  <Lit gy={y} x={x} rimOp={0.65} rim="#fff0b8" shadow={0.2} rimDx={flip ? 3 : -3} render={(f) => <Puppet2 kind="girl" x={x} y={y} s={(s ?? sc(y)) * 1.04} flip={flip} t={t} wind={wind} fill={f === INK2 ? "url(#dress)" : f} skin={f === INK2 ? "#ecbb92" : undefined} hairc={f === INK2 ? "#5a3420" : undefined} face={face} orn={0} pose={pose} hand={hand} />} />
);

/* ---------------------------------------------------------------- 1. the arch in summer */

const SummerWide: React.FC<{ T: number }> = ({ T }) => {
  const u = ez(T, 1.2, 8.8, 0, 1, (n) => n);
  const y = 1170 + 360 * u;
  const p = T * 5.4;
  const z = 1.0 + 0.16 * ez(T, 0, 8.8);
  const link = ez(T, LA(1) - 0.2, LA(1) + 0.6);
  return (
    <Stage2 cam={{ s: 1, x: 540, y: 960 }} vcam={cam(z, 540, mixn(960, 1180, ez(T, 0, 8.8)))} ref0={{ x: 540, y: 850 }}>
      <DressDefs />
      <World mode="s" t={T}>
        <KnightL x={500} y={y} t={T} id="ks" pose={{ ...walk(p, 0.55), armF: [20 + 16 * link, 42 + 22 * link] }} wind={0.3} />
        <LadyL x={560 + 4 * link} y={y + 4} t={T} pose={{ ...walk(p + 0.4, 0.4), armF: [30 + 20 * link, 40], armB: [-8, 16] }} />
        <Bouquet x={560} y={y - 98 * sc(y)} s={0.0} t={T} />
      </World>
    </Stage2>
  );
};

/* ---------------------------------------------------------------- 2. careful steps, laughter */

const SummerMedium: React.FC<{ T: number }> = ({ T }) => {
  const k = ez(T, 8.8, 17.3, 0, 1, (n) => n);
  const y = 1600 + 90 * k;
  const step = Math.max(0, Math.sin(T * 3.2 - 0.5));
  const lift = ez(T, LA(2), LA(2) + 1.2) * (1 - ez(T, LA(3) - 0.3, LA(3) + 0.3));
  const laugh = ez(T, LA(3) + 0.1, LA(3) + 0.8);
  const p = T * 3.6;
  return (
    <Stage2 cam={{ s: 1, x: 540, y: 960 }} vcam={cam(1.55 + 0.1 * k, 560, 1420 + 40 * k)} ref0={{ x: 540, y: 850 }}>
      <DressDefs />
      <World mode="s" t={T}>
        <KnightL x={430} y={y} s={sc(1700) * 1.1} t={T} id="ks" wind={0.15} pose={{ legF: [10 + 22 * Math.sin(p) * lift, -4 - 58 * step * lift], legB: [-10, -3], armF: [14, 46], armB: [-8, 20], lean: 3 + 6 * lift, head: 8 * lift }} />
        <LadyL x={640} y={y + 4} s={sc(1700) * 1.08} t={T} wind={0.3} pose={{ legF: [6, -2], legB: [-6, -2], armF: [24 + 40 * laugh * Math.abs(Math.sin(T * 9)), 56], armB: [-8, 16], head: -10 * laugh - 4, lean: -3 * laugh }} />
        <Particles t={T} area={[0, 900, 1080, 1900]} n={30} seed={91} color="#fff1b8" size={3} rise={12} op={0.7} />
      </World>
    </Stage2>
  );
};

/* ---------------------------------------------------------------- 3. the promise */

const MiniFlower: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({ x, y, s = 1, t = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${Math.sin(t * 1.6) * 6}) scale(${s})`}>
    <path d="M0,0 Q4,24 -2,58" stroke="#4a6a24" strokeWidth={4} fill="none" strokeLinecap="round" />
    <path d="M1,30 Q22,22 28,34 Q12,40 1,30Z" fill="#6a8a34" />
    {[0, 1, 2, 3, 4].map((k) => (
      <ellipse key={k} cx={Math.cos((k / 5) * Math.PI * 2) * 14} cy={Math.sin((k / 5) * Math.PI * 2) * 14} rx={12} ry={8} transform={`rotate(${(k / 5) * 360} ${Math.cos((k / 5) * Math.PI * 2) * 14} ${Math.sin((k / 5) * Math.PI * 2) * 14})`} fill="#f2a3b8" stroke="#ffffff" strokeWidth={1.2} />
    ))}
    <circle r={7} fill="#ffd36a" />
  </g>
);

const Promise: React.FC<{ T: number }> = ({ T }) => {
  const hold = ez(T, LA(4) - 0.1, LA(4) + 1.0);
  const flowerK = ez(T, LA(4) + 1.4, LA(4) + 3.0);
  const part = ez(T, LA(5) + 0.4, LE(5) + 1.0);
  const dim = ez(T, LA(5), LE(5) + 2.0);
  const kx = 270;
  const lx = 810;
  const y = 1780;
  const reach = 88 - 18 * part;
  const fx = mixn(540, 330 + 40, flowerK);
  const fy = mixn(1230, 1120, flowerK);
  return (
    <Stage2 cam={{ s: 1, x: 540, y: 960 }} vcam={cam(1.2 + 0.08 * ez(T, 17.3, 23.8), 540, 1460)} ref0={{ x: 540, y: 850 }}>
      <DressDefs />
      <World mode="s" t={T} rays={1 - 0.5 * dim}>
        <KnightL x={kx} y={y} s={2.3} t={T} id="ks" wind={0.15} pose={{ armF: [mixn(40, reach, hold), 6], armB: [-8, 18], legF: [4, -2], legB: [-4, -2], head: mixn(2, -4, part) }} />
        <LadyL x={lx} y={y + 6} s={2.3} flip t={T} wind={0.25} pose={{ armF: [mixn(40, reach, hold), 6], armB: [-8, 18], head: -4 + 3 * Math.sin(T * 1.4) }} />
        <MiniFlower x={fx} y={fy} s={1.5 + 0.5 * (1 - flowerK)} t={T} />
        <Particles t={T} area={[0, 900, 1080, 1900]} n={30} seed={92} color="#fff1b8" size={3.2} rise={12} op={0.75 * (1 - dim)} />
      </World>
      <rect x={-300} y={-300} width={1900} height={2600} fill="#1a2438" opacity={0.45 * dim} />
    </Stage2>
  );
};

/* ---------------------------------------------------------------- 4. war: he walks away, she waves */

const SummerWar: React.FC<{ T: number }> = ({ T }) => {
  const walkU = ez(T, LA(5) + 1.0, 26.9, 0, 1, (n) => n);
  const ky = mixn(1500, 1190, walkU);
  const dim = ez(T, 23.8, 26.9);
  return (
    <Stage2 cam={{ s: 1, x: 540, y: 960 }} vcam={cam(mixn(1.25, 1.0, ez(T, 23.8, 26.9)), 540, mixn(1400, 1180, ez(T, 23.8, 26.9)))} ref0={{ x: 540, y: 850 }}>
      <DressDefs />
      <World mode="s" t={T} rays={1 - 0.5 * dim}>
        <KnightL x={mixn(520, 545, walkU)} y={ky} t={T} id="ks" wind={0.3} pose={{ ...walk(T * 5, 0.5), armF: [10, 30] }} />
        <LadyL x={440} y={1640} s={sc(1640)} t={T} wind={0.4} pose={{ legF: [4, -2], legB: [-4, -2], armF: [150 + 12 * Math.sin(T * 5), 24], armB: [-6, 14], head: -4 }} />
        <Bouquet x={470} y={1480} s={0.0} t={T} />
      </World>
      <rect x={-300} y={-300} width={1900} height={2600} fill="#15203a" opacity={0.4 * dim} />
    </Stage2>
  );
};

/* ---------------------------------------------------------------- 5. winter: he returns alone */

const camBack = (T: number) => {
  const kA = ez(T, LA(8) - 0.5, LA(8) + 0.5);
  const kB = ez(T, LA(9) - 0.2, LA(9) + 1.0);
  const kC = ez(T, LA(10) + 0.2, LE(10) + 1.0);
  let z = mixn(1.0, 1.9, kA);
  let px = mixn(540, 560, kA);
  let py = mixn(1000, 1380, kA);
  z = mixn(z, 1.0, kB);
  px = mixn(px, 540, kB);
  py = mixn(py, 1000, kB);
  z = mixn(z, 1.5, kC);
  px = mixn(px, 380, kC);
  py = mixn(py, 1260, kC);
  return { z, px, py };
};

const WinterBack: React.FC<{ T: number }> = ({ T }) => {
  const c = camBack(T);
  const u = ez(T, LA(7) - 0.3, LE(7) + 0.5, 0, 1, (n) => n);
  const y = mixn(1190, 1620, u);
  const walkAmt = 0.55 * (1 - ez(T, LE(7) + 0.2, LE(7) + 1.0));
  const p = T * 4.2;
  const toBouq = ez(T, LA(10) + 0.4, LE(10) + 1.2);
  const kx = mixn(560, 470, toBouq);
  return (
    <Stage2 cam={{ s: 1, x: 540, y: 960 }} vcam={cam(c.z, c.px, c.py)} ref0={{ x: 540, y: 850 }}>
      <World mode="w" t={T} fgBlur={8}>
        <Bouquet x={260} y={1318} s={0.9} frozen={1} t={T} />
        {u > 0.01 && <KnightL x={kx} y={y} t={T} mode="w" id="kw" frost={1} breath={1} sword={1} wind={0.6} shadow={0.15} pose={{ ...walk(p, walkAmt), armF: [mixn(24, 12, 1 - walkAmt), 16], armB: [-8, 18], head: 8, lean: 6 }} />}
        <Blizzard t={T} amount={0.55} seed={2} />
        <Flakes t={T} n={70} />
      </World>
    </Stage2>
  );
};

/* ---------------------------------------------------------------- 6. the frozen flowers */

const Gauntlet: React.FC<{ x: number; y: number; s?: number; rot?: number; grip?: number }> = ({ x, y, s = 1, rot = 0, grip = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <defs>
      <linearGradient id="gaun" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#e2ecf7" />
        <stop offset="0.45" stopColor="#8aa0bb" />
        <stop offset="1" stopColor="#26344c" />
      </linearGradient>
    </defs>
    {/* forearm plate widening towards the elbow */}
    <path d={P([[-34, -30], [34, -30], [52, -230], [-52, -230]])} fill="url(#gaun)" stroke="#1a2434" strokeWidth={2} />
    {[-70, -110, -150, -190].map((yy, i) => (
      <path key={i} d={`M${-34 - (-yy - 30) * 0.11},${yy} Q0,${yy + 14} ${34 + (-yy - 30) * 0.11},${yy}`} stroke="#1a2434" strokeWidth={2.4} fill="none" opacity={0.6} />
    ))}
    <path d="M-20,-40 L-30,-214" stroke="#f4faff" strokeWidth={3} opacity={0.55} />
    {/* flared cuff */}
    <path d={P([[-52, -34], [52, -34], [44, 6], [-44, 6]])} fill="url(#gaun)" stroke="#1a2434" strokeWidth={2} />
    {[-34, -12, 12, 34].map((rx, i) => (
      <circle key={i} cx={rx} cy={-14} r={3.2} fill="#f4faff" opacity={0.8} />
    ))}
    <ellipse cx={0} cy={-36} rx={46} ry={7} fill="#f4faff" opacity={0.85} />
    {/* fingers: two plates each */}
    {[-33, -11, 11, 33].map((fx, i) => (
      <g key={i} transform={`rotate(${(i - 1.5) * (3 + grip * 11)} ${fx} 6)`}>
        <rect x={fx - 10} y={4} width={20} height={34 - grip * 8} rx={9} fill="url(#gaun)" stroke="#1a2434" strokeWidth={1.8} />
        <rect x={fx - 9} y={32 - grip * 8} width={18} height={30 - grip * 12 - (i % 2) * 6} rx={9} fill="url(#gaun)" stroke="#1a2434" strokeWidth={1.8} transform={`rotate(${grip * -18} ${fx} ${32 - grip * 8})`} />
      </g>
    ))}
    <rect x={-60} y={-8} width={24} height={52} rx={11} fill="url(#gaun)" stroke="#1a2434" strokeWidth={1.8} transform={`rotate(${30 - grip * 22} -48 -4)`} />
  </g>
);

const Flowers: React.FC<{ T: number }> = ({ T }) => {
  const reachK = ez(T, LA(11) + 0.2, LA(11) + 1.6);
  const liftK = ez(T, LA(11) + 1.8, LE(11) + 0.4);
  const tight = ez(T, LA(12) - 0.4, LA(12) + 0.8);
  const still = ez(T, LA(13) - 0.2, LA(13) + 0.6);
  const bx = 540;
  const by = mixn(1560, 1400, liftK);
  const z = mixn(1.0, 1.7, tight);
  return (
    <Stage2 cam={{ s: 1, x: 540, y: 960 }} vcam={cam(z, 540, mixn(1450, 1250, tight))} ref0={{ x: 540, y: 850 }}>
      <World mode="w" t={T} fgBlur={14} rays={0.5}>
        <rect x={-300} y={1500} width={1900} height={1000} fill="#dfe9f4" opacity={0.0} />
        <Bouquet x={bx} y={by} s={2.8} frozen={1} t={T * (1 - still)} rot={-4 * liftK} />
        <Gauntlet x={mixn(1260, 660, reachK)} y={mixn(1180, by - 10, reachK)} s={1.55} rot={mixn(-52, -26, reachK)} grip={liftK} />
        {tight > 0.2 && <Glow x={bx} y={by - 200} r={380} color="#e6f4ff" op={0.4 * tight} />}
        <Blizzard t={T * (1 - 0.7 * still)} amount={0.4} seed={3} />
        <Flakes t={T * (1 - 0.7 * still)} n={60} />
      </World>
    </Stage2>
  );
};

/* ---------------------------------------------------------------- 7. he stands; the blizzard grows */

const StandSide: React.FC<{ T: number }> = ({ T }) => {
  const close = 1 - ez(T, LA(14) + 0.4, LA(15) + 0.5);
  const pull = ez(T, LA(15) + 0.2, LE(16));
  const storm = ez(T, LA(15), LE(16));
  const z = mixn(mixn(3.6, 1.7, 1 - close), 0.95, pull);
  const py = mixn(mixn(1260, 1400, 1 - close), 1060, pull);
  const prints = Array.from({ length: 16 }, (_, i) => {
    const yy = 1710 - i * 30;
    const k = sc(yy) * 0.95;
    return { x: 540 + (i % 2 ? 22 : -22) * k, y: yy, k };
  });
  return (
    <Stage2 cam={{ s: 1, x: 540, y: 960 }} vcam={cam(z, 540, py)} ref0={{ x: 540, y: 850 }}>
      <World mode="w" t={T} fgBlur={8}>
        <g fill="#6d86a6" opacity={0.9 * (1 - storm)}>
          {prints.map((q, i) => (
            <ellipse key={i} cx={q.x} cy={q.y} rx={13 * q.k} ry={5 * q.k} opacity={0.7} />
          ))}
        </g>
        <KnightL x={540} y={1700} s={sc(1700)} t={T} mode="w" id="kw" frost={1} tear={ez(T, LA(14) + 0.2, LE(14) + 0.6)} breath={1 - 0.3 * storm} sword={1} wind={0.7 + 0.5 * storm} shadow={0.1} pose={{ armF: [14, 14], armB: [-8, 14], legF: [6, -2], legB: [-6, -2], head: 6 - 6 * ez(T, LA(14), LE(14)), lean: 4 }} />
        <Blizzard t={T} amount={0.5 + 0.5 * storm} speed={1 + storm} wind={1 + storm} seed={4} />
        <Flakes t={T} n={90} />
      </World>
      <rect x={-300} y={-300} width={1900} height={2600} fill="#e8f3ff" opacity={0.5 * ez(T, LE(16) - 1.2, LE(16) + 0.1)} />
    </Stage2>
  );
};

/* ---------------------------------------------------------------- 8. from above: one trail */

const trailPt = (u: number) => [540 + 230 * Math.sin(u * 5.6) * (0.25 + u * 0.75), 330 + 1560 * u];

const FOOT = (() => {
  const N = 72;
  const out: number[][] = [];
  for (let i = 0; i < N; i++) {
    const u = i / (N - 1);
    const a = trailPt(u);
    const b = trailPt(Math.min(1, u + 0.004));
    const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI - 90;
    const side = i % 2 ? 1 : -1;
    const nx = -Math.sin(((ang + 90) * Math.PI) / 180);
    const ny = Math.cos(((ang + 90) * Math.PI) / 180);
    out.push([a[0] + nx * 15 * side, a[1] + ny * 15 * side, ang]);
  }
  return out;
})();

export const TopDown: React.FC<{ T: number }> = ({ T }) => {
  const idx = mixn(46, 71, ez(T, LA(18) - 0.3, LE(19) + 0.6, 0, 1, (n) => n));
  const head = FOOT[Math.min(71, Math.floor(idx))];
  const hu = Math.min(1, idx / 71);
  const ang = (head[2] * Math.PI) / 180;
  const z = mixn(1.5, 1.0, ez(T, 52, 66));
  const cy = mixn(head[1] - 200, 960, ez(T, 52, 66));
  const cx = mixn(head[0], 540, ez(T, 52, 66));
  const fade = ez(T, LE(20) + 0.3, LE(20) + 4.5);
  const r = rng(7);
  void r;
  const treeL = "M-60,-40 Q220,60 360,260 T440,430 M-40,200 Q160,260 260,380";
  const treeR = "M1140,-40 Q860,60 720,240 T640,420 M1130,220 Q930,260 840,360";
  return (
    <Stage2 cam={{ s: 1, x: 540, y: 960 }} vcam={cam(z, cx, cy)} ref0={{ x: 540, y: 850 }}>
      <defs>
        <linearGradient id="snowg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e9f2fb" />
          <stop offset="0.5" stopColor="#b8cce4" />
          <stop offset="1" stopColor="#5f7aa0" />
        </linearGradient>
        <radialGradient id="pathglow" cx="0.5" cy="0.2" r="0.9">
          <stop offset="0" stopColor="#f6fbff" />
          <stop offset="1" stopColor="#8aa4c6" />
        </radialGradient>
      </defs>
      <rect x={-800} y={-800} width={2700} height={3700} fill="url(#snowg)" />
      <path d={"M" + Array.from({ length: 40 }, (_, i) => trailPt(i / 39).join(",")).join(" L")} stroke="#f6fbff" strokeWidth={170} strokeLinecap="round" fill="none" opacity={0.7} filter="url(#bl24)" />
      {/* the arch seen from above */}
      <g>
        <rect x={150} y={150} width={190} height={190} rx={18} fill="#2f3f5c" />
        <rect x={740} y={150} width={190} height={190} rx={18} fill="#2f3f5c" />
        <path d="M150,170 Q540,40 930,170 L930,230 Q540,110 150,230Z" fill="#3a4a68" />
        <path d="M170,176 Q540,56 910,176" fill="none" stroke="#f6fbff" strokeWidth={22} strokeLinecap="round" opacity={0.95} />
        <rect x={150} y={150} width={190} height={26} fill="#f6fbff" opacity={0.9} />
        <rect x={740} y={150} width={190} height={26} fill="#f6fbff" opacity={0.9} />
      </g>
      <g stroke="#1a2438" strokeWidth={22} fill="none" strokeLinecap="round" opacity={0.9}>
        <path d={treeL} />
        <path d={treeR} />
      </g>
      <g stroke="#f6fbff" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.95} transform="translate(0 -9)">
        <path d={treeL} />
        <path d={treeR} />
      </g>
      <Footprints pts={FOOT} upTo={idx} fade={0.95 * (1 - 0.0 * fade)} col="#6d86a6" />
      {/* the knight from above */}
      <g transform={`translate(${head[0]},${head[1]}) rotate(${(ang * 180) / Math.PI})`} opacity={1 - fade}>
        <ellipse cx={0} cy={6} rx={34} ry={16} fill="#000" opacity={0.18} filter="url(#bl5)" />
        <path d={P([[-16, 8], [0, 120], [16, 8]])} fill="#25101a" opacity={0.9} transform="translate(0 -4)" />
        <ellipse cx={0} cy={0} rx={30} ry={15} fill="#6f87a0" stroke="#d4e0ee" strokeWidth={2.4} transform="rotate(90)" />
        <circle cx={0} cy={0} r={13} fill="#8aa0bb" stroke="#d4e0ee" strokeWidth={2} />
        <path d="M0,-40 L0,-100" stroke="#dfe9f3" strokeWidth={3} opacity={0.0} />
        <path d="M34,4 L36,-70" stroke="#dfe9f3" strokeWidth={3.4} strokeLinecap="round" />
        <ellipse cx={0} cy={-6} rx={9} ry={5} fill="#f6fbff" opacity={0.9} />
      </g>
      <Blizzard t={T} amount={0.8} speed={1.4} wind={1.6} seed={5} />
      <Flakes t={T} n={80} size={3.4} />
      <rect x={-300} y={-300} width={1900} height={2600} fill="#e8f3ff" opacity={0.85 * (1 - ez(T, 51.4, 53.4))} />
      <rect x={-300} y={-300} width={1900} height={2600} fill="#0c1426" opacity={ez(T, LE(20) + 1.6, LE(20) + 5.4) * 0.92} />
      <Glow x={540} y={1300} r={0} color="#ffd36a" op={0} />
      {hu > 2 ? null : null}
    </Stage2>
  );
};

/* ---------------------------------------------------------------- scene components */

const ArchScene: React.FC<SP> = ({ dur }) => {
  const { frame, T } = useSc("arch");
  return (
    <AbsoluteFill>
      <SummerWide T={T} />
      <Fade frame={frame} dur={dur} i={12} o={0} />
    </AbsoluteFill>
  );
};
const StepsScene: React.FC<SP> = () => {
  const { T } = useSc("steps");
  return <SummerMedium T={T} />;
};
const PromiseScene: React.FC<SP> = () => {
  const { T } = useSc("promise");
  return <Promise T={T} />;
};

const WarScene: React.FC<SP> = () => {
  const { T } = useSc("war");
  const Ts = LE(6) + 0.0;
  const fs = (T - Ts) * FPS;
  if (fs < 0) return <SummerWar T={T} />;
  return (
    <AbsoluteFill>
      <WinterBack T={T} />
      <Shatter f={fs}>
        <SummerWar T={Ts} />
      </Shatter>
      <AbsoluteFill style={{ backgroundColor: "#ffffff", opacity: ez(fs, 0, 3, 0.85, 0) * (fs < 3 ? 1 : 0) }} />
    </AbsoluteFill>
  );
};

const BackScene: React.FC<SP> = () => {
  const { T } = useSc("back");
  return <WinterBack T={T} />;
};
const FlowersScene: React.FC<SP> = () => {
  const { T } = useSc("flowers");
  return <Flowers T={T} />;
};

const StandScene: React.FC<SP> = ({ dur }) => {
  const { T, s } = useSc("stand");
  const cut = Math.round((LE(16) + 0.15 - s.start) * FPS);
  return (
    <>
      <Sequence durationInFrames={cut}>
        <StandSide T={T} />
      </Sequence>
      <Sequence from={cut} durationInFrames={dur - cut}>
        <TopDownWrap name="stand" off={cut / FPS} />
      </Sequence>
    </>
  );
};
const TopDownWrap: React.FC<{ name: string; off?: number }> = ({ name, off = 0 }) => {
  const { T } = useSc(name);
  return <TopDown T={T + off} />;
};
const AwayScene: React.FC<SP> = () => <TopDownWrap name="away" />;

const Fade: React.FC<{ frame: number; dur: number; i?: number; o?: number }> = ({ frame, dur, i = 10, o = 10 }) => {
  const op = Math.max(i > 0 ? ez(frame, 0, i, 1, 0) : 0, o > 0 ? ez(frame, dur - o, dur, 0, 1) : 0);
  return <AbsoluteFill style={{ backgroundColor: "#07060b", opacity: op }} />;
};

export const SCENES4: Record<string, React.FC<SP>> = {
  arch: ArchScene,
  steps: StepsScene,
  promise: PromiseScene,
  war: WarScene,
  back: BackScene,
  flowers: FlowersScene,
  stand: StandScene,
  away: AwayScene,
};
export const TopDownVert: React.FC = () => (
  <VertCtx.Provider value={true}>
    <TopDown T={53} />
  </VertCtx.Provider>
);
void [Fog, cloth];
