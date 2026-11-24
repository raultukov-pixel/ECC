import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { walk } from "./art";
import type { Pose } from "./art";
import { Particles, Stage2, ez } from "./art2";
import { cam } from "./art4";
import { LadyS } from "./art5";
import { INK6, ManS, mixc } from "./art6";
import { HER, KitchenBack, KitchenTable } from "./art7";
import { Cane } from "./art9";
import { Fence, Frame, HG, HouseSet, Lamp, WindowFit } from "./art10";
import type { HouseP } from "./art10";

const FPS = 30;
const mx = (a: number, b: number, k: number) => a + (b - a) * k;
type Sky = [string, string];
const NIGHT: Sky = ["#060814", "#1a2038"];
const DUSK: Sky = ["#1d2a4a", "#c27348"];
const DAWN: Sky = ["#f2b477", "#fff0c8"];
const COLD: Sky = ["#6c7c98", "#c8d0dc"];
const MS = 1.1;
const WARM = "#ffcf8a";

const Scene: React.FC<{ z: number; px: number; py: number; children: React.ReactNode }> = ({ z, px, py, children }) => (
  <Stage2 cam={{ s: 1, x: 540, y: 960 }} vcam={cam(z, px, py)} ref0={{ x: 540, y: 960 }}>
    {children}
  </Stage2>
);

const Lit: React.FC<{ front?: string; fa?: number; back?: string; ba?: number; flip?: boolean; render: (fill: string) => React.ReactNode }> = ({ front = WARM, fa = 0.5, back = "#9fc0ea", ba = 0.3, flip, render }) => (
  <g>
    {ba > 0 && (
      <g transform={`translate(${flip ? 3 : -3} -1)`} opacity={ba}>
        {render(back)}
      </g>
    )}
    {fa > 0 && (
      <g transform={`translate(${flip ? -3 : 3} -1.5)`} opacity={fa}>
        {render(front)}
      </g>
    )}
    {render(INK6)}
  </g>
);
type LitP = { front?: string; fa?: number; back?: string; ba?: number };
const Man: React.FC<{ x: number; y?: number; t: number; pose: Pose; age?: number; flip?: boolean; s?: number; op?: number; hand?: (f: string) => React.ReactNode; coat?: boolean } & LitP> = ({ x, y = HG, t, pose, age = 0, flip, s = MS, op = 1, hand, coat, ...lit }) => (
  <g opacity={op}>
    <Lit {...lit} flip={flip} render={(f) => <ManS x={x} y={y} s={s} flip={flip} t={t} fill={f} age={age} pose={pose} hand={hand?.(f)} coat={coat} />} />
  </g>
);
const Lady: React.FC<{ x: number; y?: number; t: number; pose?: Pose; flip?: boolean; s?: number } & LitP> = ({ x, y = HG, t, pose = {}, flip, s = 1.3, ...lit }) => (
  <Lit {...lit} flip={flip} render={(f) => <LadyS x={x} y={y} s={s} flip={flip} t={t} fill={f} wind={0.08} pose={pose} />} />
);
const cane = (f: string) => (
  <g transform="translate(6 10)">
    <Cane fill={f} />
  </g>
);
const caneRaised = (a: number) => (f: string) => (
  <g transform={`translate(4 6) rotate(${a})`}>
    <Cane fill={f} />
  </g>
);
const bag = (f: string) => (
  <g transform="translate(2 40)">
    <rect x={-24} y={0} width={48} height={36} rx={6} fill={f} />
    <path d="M-12,0 Q0,-16 12,0" stroke={f} strokeWidth={5} fill="none" />
  </g>
);
const stepP = (x: number, k = 1, s = MS) => (x * 2 * Math.PI * k) / (262 * s);
const track = (T: number, pts: [number, number][]) => {
  if (T <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (T <= pts[i][0]) return mx(pts[i - 1][1], pts[i][1], (T - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0]));
  return pts[pts.length - 1][1];
};
const still: Pose = { armF: [4, 12], armB: [-4, 10], legF: [4, -2], legB: [-4, -2] };

const House: React.FC<HouseP & { z: number; px: number; py: number; children?: React.ReactNode; behind?: React.ReactNode; warmFence?: number }> = ({ z, px, py, children, behind, warmFence, ...h }) => (
  <Scene z={z} px={px} py={py}>
    <HouseSet {...h} />
    {behind}
    <Fence warm={warmFence ?? h.warm ?? 0} />
    {children}
  </Scene>
);

/* ================================================================ 1-4. the haunted house */

const Kid: React.FC<{ T: number; t0: number; x0: number; x1: number; dur: number; s?: number }> = ({ T, t0, x0, x1, dur, s = 0.55 }) => {
  if (T < t0 || T > t0 + dur) return null;
  const x = mx(x0, x1, (T - t0) / dur);
  const p = stepP(x, 2.2, s);
  return <Man x={x} y={HG - Math.abs(Math.sin(p)) * 5} s={s} t={T} front="#a9bad8" fa={0.3} back="#000" ba={0} pose={{ ...walk(p, 1.0), lean: 12, armF: [40, 60], armB: [-30, 50] }} />;
};

const H1: React.FC<{ T: number }> = ({ T }) => {
  const k = ez(T, 0, 5.3);
  return (
    <House t={T} z={mx(1.0, 1.08, k)} px={mx(600, 640, k)} py={1150} sky={NIGHT} warm={0} eyes={0.8}>
      <Kid T={T} t0={1.6} x0={-120} x1={560} dur={3.2} />
      <Kid T={T} t0={1.9} x0={-200} x1={500} dur={3.2} s={0.5} />
      <Kid T={T} t0={2.3} x0={-260} x1={440} dur={3.2} s={0.6} />
    </House>
  );
};

const H2: React.FC<{ T: number }> = ({ T }) => {
  const k = ez(T, 5.3, 7.55);
  const breathe = 1 + Math.sin(T * 5) * 0.004;
  return (
    <Scene z={mx(1.3, 1.6, k) * breathe} px={620} py={mx(1080, 1060, k)}>
      <HouseSet t={T} warm={0} sky={NIGHT} eyes={0.6 + 0.4 * ez(T, 5.6, 6.6)} flicker={0.7} />
      <Fence warm={0} />
    </Scene>
  );
};

const H3: React.FC<{ T: number }> = ({ T }) => {
  const k = ez(T, 7.55, 9.7);
  return (
    <Scene z={mx(1.8, 2.5, k)} px={mx(540, 480, k)} py={mx(1050, 1020, k)}>
      <HouseSet t={T} warm={0} sky={NIGHT} eyes={0.9} flicker={0.4} />
      <g transform={`translate(${470 + mx(0, 30, ez(T, 8.2, 9.2))} 1060)`} opacity={0.9}>
        <circle cx={0} cy={0} r={14} fill="#070509" />
        <circle cx={0} cy={0} r={5} fill="#f4f0e0" />
      </g>
      <Fence warm={0} />
    </Scene>
  );
};

const H4: React.FC<{ T: number }> = ({ T }) => {
  const k = ez(T, 9.7, 12.7);
  const w = 0.35 + 0.65 * Math.abs(Math.sin(T * 1.7) * Math.sin(T * 0.6 + 1));
  return (
    <House t={T} z={mx(1.15, 1.35, k)} px={mx(560, 520, k)} py={mx(1150, 1260, k)} sky={NIGHT} warm={0} eyes={0.25} kitchen={w * 0.5} fog={1.3} />
  );
};

/* ================================================================ 5-7. the old man at the fence */

const OldMan: React.FC<{ T: number; x: number; wave?: number; shake?: number; flipped?: boolean; lean?: number; fa?: number }> = ({ T, x, wave = 0, shake = 0, flipped, lean = 14, fa = 0.35 }) => (
  <Man x={x + Math.sin(T * 38) * 2.5 * shake} t={T} age={1} flip={flipped} front="#d4e0a0" fa={fa} back="#6a7aa0" ba={0.3} pose={{ ...still, lean, head: 10, armF: [mx(14, 128, wave) + Math.sin(T * 30) * 12 * shake, mx(24, 28, wave)], armB: [-4, 14] }} hand={wave > 0.2 ? caneRaised(mx(160, 200, wave)) : cane} />
);

const H5: React.FC<{ T: number }> = ({ T }) => {
  const wave = ez(T, 14.2, 14.9);
  const kx = track(T, [[12.7, 40], [14.4, 330], [16.6, 340]]);
  const moving = T < 14.4;
  const p = stepP(kx, 1.2, 0.7);
  return (
    <House t={T} z={1.15} px={mx(480, 520, ez(T, 12.7, 16.6))} py={1190} sky={NIGHT} warm={0} eyes={0.5} behind={<OldMan T={T} x={560} wave={wave} flipped />}>
      <Man x={kx} y={HG - (moving ? Math.abs(Math.sin(p)) * 4 : 0)} s={0.7} t={T} front="#a9bad8" fa={0.3} back="#000" ba={0} pose={moving ? { ...walk(p, 0.6), lean: 4, head: -6 } : { ...still, lean: mx(0, -8, wave), head: -10 }} />
    </House>
  );
};

const H6: React.FC<{ T: number }> = ({ T }) => {
  const flee = ez(T, 17.6, 18.6);
  const kx = mx(340, -200, flee);
  const p = stepP(kx, 2.2, 0.7);
  return (
    <House t={T} z={1.2} px={mx(470, 400, ez(T, 16.6, 20.1))} py={1190} sky={NIGHT} warm={0} eyes={0.6} behind={<OldMan T={T} x={560} wave={1} shake={ez(T, 16.9, 17.2) * (1 - ez(T, 19.2, 19.8))} flipped />}>
      <Man x={kx} y={HG - (flee > 0 && flee < 1 ? Math.abs(Math.sin(p)) * 5 : 0)} s={0.7} flip={flee > 0.02 && flee < 1} t={T} front="#a9bad8" fa={0.3} back="#000" ba={0} pose={flee > 0 && flee < 1 ? { ...walk(p, 1.0), lean: 10 } : { ...still, lean: -8, head: -10 }} op={1 - ez(T, 18.4, 18.8)} />
      <Man x={mx(300, -260, flee)} s={0.55} flip t={T} front="#a9bad8" fa={0.3} back="#000" ba={0} op={flee > 0 ? 1 - ez(T, 18.4, 18.8) : 1} pose={{ ...walk(p + 1, 1.0), lean: 10 }} />
    </House>
  );
};

const H7: React.FC<{ T: number }> = ({ T }) => {
  const k = ez(T, 20.1, 22.2);
  return (
    <Scene z={mx(1.9, 2.2, k)} px={mx(610, 590, k)} py={1230}>
      <HouseSet t={T} warm={0} sky={NIGHT} eyes={0.35} />
      <OldMan T={T} x={600} wave={0.2} shake={0} lean={20} fa={0.75} />
      <circle cx={600} cy={1250} r={300} fill="#ff6a50" opacity={0.08} filter="url(#fogb)" style={{ mixBlendMode: "screen" }} />
      <Fence warm={0} />
    </Scene>
  );
};

/* ================================================================ 8-10. the flashback */

const Flash: React.FC<{ sky: Sky; children: React.ReactNode }> = ({ sky, children }) => (
  <g>
    <defs>
      <linearGradient id="fbsky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={sky[0]} />
        <stop offset="1" stopColor={sky[1]} />
      </linearGradient>
    </defs>
    <rect x={-900} y={-1400} width={3400} height={4000} fill="url(#fbsky)" />
    <rect x={-900} y={HG} width={3400} height={1500} fill="#150d07" />
    <rect x={-900} y={HG} width={3400} height={4} fill="#ffdca0" opacity={0.4} />
    {children}
  </g>
);

const H8: React.FC<{ T: number }> = ({ T }) => {
  const build = ez(T, 22.4, 27.0);
  const hx = track(T, [[22.2, 120], [24.0, 300]]);
  const swing = Math.sin(T * 12) * 18;
  const k = ez(T, 22.2, 28.0);
  return (
    <Scene z={mx(1.0, 1.18, k)} px={mx(620, 600, k)} py={1150}>
      <Flash sky={DAWN}>
        <Frame build={build} sun={1} />
        <Man x={hx} t={T} front="#fff0cf" fa={0.8} back="#000" ba={0} pose={T < 24 ? { ...still, armF: [50, 60], armB: [46, 66], lean: 4 } : { ...still, armF: [100 + swing, 30], armB: [30, 40], lean: 6 }} />
        <Lady x={1010} flip t={T} front="#fff0cf" fa={0.8} back="#000" ba={0} pose={{ armF: [14, 24], armB: [-6, 14], head: 4 }} />
        <Particles t={T} area={[200, 600, 1000, 1500]} n={30} seed={4} color="#ffe9c0" size={2.4} rise={6} op={0.7} />
      </Flash>
    </Scene>
  );
};

const H9: React.FC<{ T: number }> = ({ T }) => {
  const fit = ez(T, 28.6, 32.4);
  const point = ez(T, 30.5, 31.3) * (1 - ez(T, 33.3, 33.9));
  const k = ez(T, 28.0, 34.3);
  return (
    <Scene z={mx(1.05, 1.2, k)} px={mx(540, 560, k)} py={mx(1100, 1080, k)}>
      <WindowFit fit={fit} t={T} />
      <Man x={240} t={T} front="#fff0cf" fa={0.8} back="#000" ba={0} pose={{ ...still, armF: [mx(40, 140, fit), mx(60, 20, fit)], armB: [mx(30, 130, fit), 20], lean: 4, head: -6 }} />
      <Lady x={950} flip t={T} front="#fff0cf" fa={0.8} back="#000" ba={0} pose={{ armF: [mx(14, 100, point), mx(24, 8, point)], armB: [-6, 14], head: 2 }} />
      <Particles t={T} area={[300, 400, 800, 1450]} n={50} seed={7} color="#ffe9c0" size={2.6} rise={5} op={0.8} />
    </Scene>
  );
};

const H10: React.FC<{ T: number }> = ({ T }) => {
  const dim = ez(T, 34.4, 36.4);
  const SEAT = HG - 90 + 152 * MS;
  return (
    <Scene z={mx(1.1, 1.3, ez(T, 34.3, 37.15))} px={620} py={1170}>
      <Flash sky={[mixc(DAWN[0], "#4a5a78", dim), mixc(DAWN[1], "#9aa6b8", dim)]}>
        <Frame build={1} sun={1 - dim} />
        <rect x={560} y={HG - 90} width={120} height={90} fill="#0c0603" />
        <Man x={620} y={SEAT} t={T} front="#cfd8ea" fa={0.2} back="#000" ba={0} pose={{ legF: [88, -88], legB: [80, -82], lean: mx(6, 22, dim), head: mx(8, 30, dim), armF: [30, 80], armB: [20, 70] }} />
      </Flash>
    </Scene>
  );
};

/* ================================================================ 11. he stays */

const H11: React.FC<{ T: number }> = ({ T }) => {
  const turn = ez(T, 39.2, 40.0);
  const put = ez(T, 39.8, 40.5);
  return (
    <House t={T} z={mx(1.0, 1.12, ez(T, 37.15, 41.2))} px={600} py={1130} sky={COLD} warm={0.85} eyes={0.04} fog={0.3} moon={0}>
      <Man x={560} t={T} age={0.6} flip={turn < 0.5} front="#f4f0ff" fa={0.3} back="#000" ba={0} pose={{ ...still, lean: mx(8, 16, put), head: mx(10, 28, put), armF: [mx(8, 24, put), mx(14, 30, put)] }} hand={put < 0.9 ? bag : undefined} />
      {put >= 0.9 && (
        <g transform="translate(494 0)">
          <rect x={-24} y={HG - 38} width={48} height={36} rx={6} fill={INK6} />
          <path d={`M-12,${HG - 38} Q0,${HG - 54} 12,${HG - 38}`} stroke={INK6} strokeWidth={5} fill="none" />
        </g>
      )}
    </House>
  );
};

/* ================================================================ 12-14. inside */

const Kit: React.FC<{ T: number; z: number; px: number; py: number; sky: Sky; light: number; children?: React.ReactNode; table?: React.ReactNode }> = ({ T, z, px, py, sky, light, children, table }) => (
  <Scene z={z} px={px} py={py}>
    <KitchenBack t={T} sky={sky} light={light} scarf />
    {table}
    {children}
    <Particles t={T} area={[200, 500, 900, 1500]} n={24} seed={3} color="#ffe9c0" size={2.2} rise={6} op={0.4 * light} />
  </Scene>
);

const H12: React.FC<{ T: number }> = ({ T }) => {
  const a = ez(T, 41.2, 45.6);
  const b = ez(T, 45.7, 47.7);
  return (
    <Kit T={T} z={mx(mx(1.1, 2.1, a), 1.9, b)} px={mx(mx(560, HER, a), 960, b)} py={mx(mx(1180, 1290, a), 960, b)} sky={COLD} light={0.4}
      table={<KitchenTable t={T} light={0.35} cupHis={false} cupHer steamHer={0} pot={false} />}
    />
  );
};

const H14: React.FC<{ T: number }> = ({ T }) => {
  const on = ez(T, 49.4, 50.6);
  const reach = ez(T, 48.2, 49.4) * (1 - ez(T, 50.4, 51.2));
  const k = ez(T, 47.75, 51.5);
  return (
    <Kit T={T} z={mx(1.25, 1.45, k)} px={mx(480, 520, k)} py={1210} sky={mixSkyL(DUSK, NIGHT, on)} light={mx(0.3, 0.55, on)}
      table={<KitchenTable t={T} light={0.4} cupHis={false} cupHer steamHer={0} pot={false} />}
    >
      <Lamp x={500} y={1160} on={on} t={T} s={1.4} />
      <Man x={350} t={T} age={0.6} front="#ffcf8a" fa={mx(0.2, 0.9, on)} back="#8fa0c8" ba={0.3} pose={{ ...still, lean: 6 + 4 * reach, head: 8, armF: [mx(10, 74, reach), mx(14, 60, reach)] }} />
    </Kit>
  );
};
const mixSkyL = (a: Sky, b: Sky, k: number): Sky => [mixc(a[0], b[0], k), mixc(a[1], b[1], k)];

/* ================================================================ 15-16. the same house, seen again */

const H15: React.FC<{ T: number }> = ({ T }) => {
  const k = ez(T, 51.5, 54.5);
  return (
    <House t={T} z={mx(1.0, 1.2, k)} px={mx(620, 560, k)} py={mx(1130, 1190, k)} sky={DUSK} warm={mx(0.55, 0.85, k)} eyes={mx(0.1, 0.5, k)} kitchen={1} down={mx(0, 0.5, k)} fog={0.3} moon={0.5}>
      <Kid T={T} t0={51.6} x0={-100} x1={500} dur={3.0} s={0.55} />
    </House>
  );
};

const H16: React.FC<{ T: number }> = ({ T }) => {
  const k = ez(T, 54.5, 56.7);
  const sway = Math.sin(T * 2.2) * 6;
  return (
    <Scene z={mx(2.2, 2.9, k)} px={480} py={mx(1300, 1290, k)}>
      <HouseSet t={T} warm={0.85} sky={DUSK} eyes={0.6} kitchen={1} down={0.6} fog={0} moon={0.4} />
      <path d={`M${420 + sway},1252 Q${430 + sway},1310 ${424 + sway},1400 L${446 + sway},1400 Q${452 + sway},1320 ${446 + sway},1252Z`} fill="#0a0604" opacity={0.55} />
      <Lamp x={470} y={1400} on={1} t={T} s={0.7} />
      <Fence warm={0.85} />
    </Scene>
  );
};

/* ================================================================ 17-19. now */

const H17: React.FC<{ T: number }> = ({ T }) => {
  const x = track(T, [[56.7, -120], [59.4, 520], [61.8, 520]]);
  const moving = T < 59.4;
  const p = stepP(x, 0.9);
  const k = ez(T, 56.7, 61.8);
  const rest = ez(T, 59.8, 60.6);
  return (
    <House t={T} z={mx(1.0, 1.15, k)} px={mx(560, 560, k)} py={1130} sky={mixSkyL(DUSK, NIGHT, 0.4)} warm={1} eyes={0.9} kitchen={1} down={0.9} fog={0} moon={0.6}>
      <Man x={x} y={HG - (moving ? Math.abs(Math.sin(p)) * 4 : 0)} t={T} front={WARM} fa={0.7} back="#8fa0c8" ba={0.3} pose={moving ? { ...walk(p, 0.5), lean: 4, head: 10 } : { ...still, lean: mx(4, 10, rest), head: mx(8, 22, rest), armF: [mx(4, 54, rest), mx(10, 30, rest)] }} />
    </House>
  );
};

const H19: React.FC<{ T: number }> = ({ T }) => {
  const k = ez(T, 61.8, 64.8);
  const bow = ez(T, 62.4, 63.6);
  return (
    <Scene z={mx(1.7, 2.1, k)} px={mx(560, 540, k)} py={1230}>
      <HouseSet t={T} warm={1} sky={mixSkyL(DUSK, NIGHT, 0.55)} eyes={0.9} kitchen={1} down={0.9} fog={0} moon={0.5} />
      <path d={`M${480 - 200},${HG} L${480 + 200},${HG} L${620},${HG + 120} L${200},${HG + 120}Z`} fill={WARM} opacity={0.12 * k} filter="url(#bl14)" style={{ mixBlendMode: "screen" }} />
      <Man x={440} t={T} front={WARM} fa={0.85} back="#8fa0c8" ba={0.2} pose={{ ...still, lean: mx(10, 18, bow), head: mx(22, 44, bow), armF: [54, 30], armB: [30, 40] }} />
      <Fence warm={1} />
    </Scene>
  );
};

/* ================================================================ 20-21. the house, truly */

const H20: React.FC<{ T: number }> = ({ T }) => {
  const k = ez(T, 64.8, 66.75);
  return (
    <House t={T} z={mx(1.0, 0.95, k)} px={620} py={1130} sky={mixSkyL(DUSK, NIGHT, 0.5)} warm={1} eyes={1} kitchen={1} down={1} fog={0} moon={0.6} />
  );
};

const H21: React.FC<{ T: number }> = ({ T }) => {
  const k = ez(T, 66.75, 72.5);
  return (
    <Scene z={mx(0.95, 0.7, k)} px={620} py={mx(1130, 800, k)}>
      <HouseSet t={T} warm={1} sky={NIGHT} eyes={1} kitchen={1} down={1} fog={0} moon={0.9} />
      <Fence warm={1} />
    </Scene>
  );
};

/* ================================================================ the film */

type Shot = { a: number; C: React.FC<{ T: number }>; hard?: boolean };
const SHOTS: Shot[] = [
  { a: 0, C: H1 },
  { a: 5.3, C: H2, hard: true },
  { a: 7.55, C: H3, hard: true },
  { a: 9.7, C: H4 },
  { a: 12.7, C: H5 },
  { a: 16.65, C: H6, hard: true },
  { a: 20.1, C: H7 },
  { a: 22.2, C: H8 },
  { a: 28.0, C: H9 },
  { a: 34.3, C: H10 },
  { a: 37.15, C: H11 },
  { a: 41.2, C: H12 },
  { a: 47.75, C: H14 },
  { a: 51.5, C: H15 },
  { a: 54.5, C: H16 },
  { a: 56.7, C: H17 },
  { a: 61.8, C: H19 },
  { a: 64.8, C: H20 },
  { a: 66.75, C: H21 },
];

export const HouseFilm: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const T = frame / FPS;
  let i = 0;
  for (let j = 0; j < SHOTS.length; j++) if (T >= SHOTS[j].a) i = j;
  const C = SHOTS[i].C;
  let dip = 0;
  for (const s of SHOTS.slice(1)) {
    const d = s.hard ? 0.05 : 0.22;
    dip = Math.max(dip, (1 - Math.min(1, Math.abs(T - s.a) / d)) * (s.hard ? 0.5 : 1));
  }
  const total = dur / FPS;
  const fade = Math.max(ez(T, 0, 0.9, 1, 0), ez(T, total - 4.0, total - 0.8, 0, 1), dip);
  return (
    <AbsoluteFill style={{ backgroundColor: "#030406" }}>
      <C T={T} />
      <AbsoluteFill style={{ backgroundColor: "#030406", opacity: Math.min(1, fade) }} />
    </AbsoluteFill>
  );
};

export const SCENES10: Record<string, React.FC<{ dur: number }>> = { all: HouseFilm };
