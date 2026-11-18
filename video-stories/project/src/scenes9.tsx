import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import vo from "./vo9.json";
import { walk } from "./art";
import type { Pose } from "./art";
import { Stage2, ez } from "./art2";
import { cam } from "./art4";
import { INK6, ManS, mixc } from "./art6";
import { Bokeh } from "./art8";
import { Bench, Cane, DOOR, GY, HandS, Street, arch } from "./art9";

const FPS = 30;
const LA = (i: number) => vo.lines[i].start;
const LE = (i: number) => vo.lines[i].end;
const mx = (a: number, b: number, k: number) => a + (b - a) * k;
type Sky = [string, string];
const DUSK: Sky = ["#1a2848", "#c27348"];
const DUSK2: Sky = ["#142038", "#8c5a46"];
const WINTER: Sky = ["#222c44", "#8b93a6"];
const NIGHT: Sky = ["#050a18", "#1a2c4a"];
const mixSky = (a: Sky, b: Sky, k: number): Sky => [mixc(a[0], b[0], k), mixc(a[1], b[1], k)];
const MS = 1.1;
const WARM = "#ffcf8a";

const Scene: React.FC<{ z: number; px: number; py: number; children: React.ReactNode }> = ({ z, px, py, children }) => (
  <Stage2 cam={{ s: 1, x: 540, y: 960 }} vcam={cam(z, px, py)} ref0={{ x: 540, y: 960 }}>
    {children}
  </Stage2>
);

const Lit: React.FC<{ front?: string; fa?: number; back?: string; ba?: number; flip?: boolean; render: (fill: string) => React.ReactNode }> = ({ front = WARM, fa = 0.55, back = "#9fc0ea", ba = 0.3, flip, render }) => (
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
const Man: React.FC<{ x: number; y?: number; t: number; pose: Pose; age?: number; flip?: boolean; s?: number; op?: number; hand?: (f: string) => React.ReactNode } & LitP> = ({ x, y = GY, t, pose, age = 0, flip, s = MS, op = 1, hand, ...lit }) => (
  <g opacity={op}>
    <Lit {...lit} flip={flip} render={(f) => <ManS x={x} y={y} s={s} flip={flip} t={t} fill={f} age={age} pose={pose} hand={hand?.(f)} />} />
  </g>
);
const SIT: Pose = { legF: [88, -88], legB: [80, -82] };
const SEATY = GY - 112 + 152 * MS;
const cane = (f: string) => (
  <g transform="translate(6 10)">
    <Cane fill={f} />
  </g>
);

/** x(t) of a walker given waypoints [t, x] with easing */
const track = (T: number, pts: [number, number][]) => {
  if (T <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (T <= pts[i][0]) return mx(pts[i - 1][1], pts[i][1], (T - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0]));
  return pts[pts.length - 1][1];
};
const stepP = (x: number, k = 1) => (x * 2 * Math.PI * k) / (262 * MS);
const walkPose = (x: number, moving: boolean, k = 1, extra: Pose = {}): Pose => (moving ? { ...walk(stepP(x, k), 0.5), ...extra } : { armF: [4, 12], armB: [-4, 10], legF: [4, -2], legB: [-4, -2], ...extra });
const bob = (x: number, moving: boolean, k = 1) => (moving ? Math.abs(Math.sin(stepP(x, k))) * 4 : 0);

/* ======================================================================== 1. he passes the door */

const S1: React.FC<{ T: number }> = ({ T }) => {
  const pts: [number, number][] = [[0.9, -130], [6.1, 590], [7.74, 650], [9.97, 650], [11.5, 1180]];
  const x = track(T, pts);
  const moving = T < 7.7 || T > 9.97;
  const look = ez(T, 7.8, 8.6) * (1 - ez(T, 9.6, 10.1));
  const k = ez(T, 0.9, 11.4);
  return (
    <Scene z={mx(1.0, 1.08, k)} px={mx(560, 640, k)} py={1130}>
      <Street t={T} sky={DUSK} lights={1} doubt={0.35} />
      <Man x={x} y={GY - bob(x, moving)} t={T} front={WARM} fa={0.55} back="#9fc0ea" ba={0.3} pose={walkPose(x, moving, 1, { lean: 6, head: mx(4, -22, look) })} />
    </Scene>
  );
};

/* ======================================================================== 2. "I can't go there" */

const S2: React.FC<{ T: number }> = ({ T }) => {
  const k = ez(T, 11.4, 17.3);
  const toward = ez(T, 12.9, 13.6) * (1 - ez(T, 14.0, 14.6));
  return (
    <Scene z={mx(1.2, 1.32, k)} px={mx(480, 520, k)} py={1200}>
      <Street t={T} sky={mixSky(DUSK, DUSK2, k)} lights={1} doubt={0.55} />
      <Man x={360} t={T} front="#ffcf8a" fa={0.4} back="#9fc0ea" ba={0.35} pose={{ armF: [8, 18], armB: [-4, 14], legF: [3, -1], legB: [-3, -1], lean: mx(8, 14, k), head: mx(14, 26, k) - 16 * toward }} />
    </Scene>
  );
};

/* ======================================================================== 3. the door is closed, he thinks */

const S3: React.FC<{ T: number }> = ({ T }) => {
  const k = ez(T, 17.3, 24.3);
  return (
    <Scene z={mx(1.05, 1.5, k)} px={mx(600, 700, k)} py={mx(1160, 1220, k)}>
      <Street t={T} sky={mixSky(DUSK2, ["#0a1426", "#5a3a3a"], k)} lights={mx(0.85, 0.55, k)} doubt={ez(T, 19.6, 21.4, 0.55, 1)} />
      <Man x={mx(440, 470, k)} t={T} front="#ffcf8a" fa={0.25} back="#9fc0ea" ba={0.4} pose={{ armF: [4, 10], armB: [-4, 8], legF: [3, -1], legB: [-3, -1], lean: mx(10, 18, k), head: mx(22, 34, k) }} />
    </Scene>
  );
};

/* ======================================================================== 4. winter, hurrying */

const S4: React.FC<{ T: number }> = ({ T }) => {
  const x = track(T, [[24.33, 140], [26.8, 1150]]);
  return (
    <Scene z={1.0} px={mx(480, 700, ez(T, 24.33, 26.8))} py={1130}>
      <Street t={T} sky={WINTER} lights={0.9} doubt={0.9} season={1} snow={1} />
      <Man x={x} y={GY - bob(x, true, 1.7)} t={T} front="#cfe0ff" fa={0.4} back="#9fc0ea" ba={0.2} pose={walkPose(x, true, 1.7, { lean: 16, head: 26, armF: [30, 40], armB: [30, 40] })} />
    </Scene>
  );
};

/* ======================================================================== 5. summer, slowly */

const S5: React.FC<{ T: number }> = ({ T }) => {
  const x = track(T, [[26.83, 330], [28.95, 560]]);
  const look = ez(T, 27.4, 28.4);
  return (
    <Scene z={mx(1.05, 1.15, ez(T, 26.8, 28.95))} px={mx(520, 600, ez(T, 26.8, 28.95))} py={1150}>
      <Street t={T} sky={DUSK} lights={1} doubt={0.9} season={0} />
      <Man x={x} y={GY - bob(x, true, 0.6)} t={T} front={WARM} fa={0.5} back="#9fc0ea" ba={0.3} pose={walkPose(x, true, 0.6, { lean: 4, head: mx(14, -6, look), armF: [6, 14], armB: [-6, 12] })} />
    </Scene>
  );
};

/* ======================================================================== 6. the door was open all along */

const S6: React.FC<{ T: number }> = ({ T }) => {
  const open = ez(T, 29.2, 30.9);
  const pool = ez(T, 34.9, 37.9);
  const k = ez(T, 28.95, 38.1);
  const walker = (t0: number, t1: number, x0: number, s: number, age: number, withCane: boolean) => {
    const x = track(T, [[t0, x0], [t1, DOOR.x - 20]]);
    const on = T > t0 && T < t1;
    const fade = 1 - ez(T, t1 - 0.5, t1);
    if (!on) return null;
    return (
      <Man key={t0} x={x} y={GY - bob(x, true, 0.9 * (1.1 / s))} s={s} t={T} age={age} op={fade} front={WARM} fa={0.7} back="#000" ba={0} pose={walkPose(x, true, 0.9 * (1.1 / s), withCane ? { lean: 10, armF: [14, 24], armB: [-4, 10] } : {})} hand={withCane ? cane : undefined} />
    );
  };
  return (
    <Scene z={mx(1.0, 1.28, k)} px={mx(620, 640, k)} py={mx(1130, 1200, k)}>
      <Street t={T} sky={mixSky(DUSK, DUSK2, 0.4)} lights={1} open={open} doubt={ez(T, 29.2, 29.8, 0.9, 0)} pool={pool} />
      {walker(31.9, 34.5, 330, MS, 1, true)}
      {walker(32.7, 35.1, 250, MS, 0, false)}
      {walker(33.4, 35.7, 180, 0.7, 0, false)}
      <Man x={mx(440, 440, k)} t={T} front={WARM} fa={mx(0.2, 0.7, pool)} back="#9fc0ea" ba={0.3} pose={{ armF: [6, 14], armB: [-4, 10], legF: [3, -1], legB: [-3, -1], lean: 6, head: mx(22, 4, ez(T, 33.8, 36.5)) }} />
    </Scene>
  );
};

/* ======================================================================== 7. the threshold, the hands */

const S7: React.FC<{ T: number }> = ({ T }) => {
  const tremble = ez(T, 40.0, 41.4);
  const k = ez(T, 38.1, 42.9);
  return (
    <Scene z={mx(1.3, 1.55, k)} px={mx(680, 700, k)} py={1230}>
      <Street t={T} sky={mixSky(DUSK2, NIGHT, 0.3)} lights={1} open={1} pool={1} />
      <Man x={mx(600, 640, ez(T, 38.1, 40.5))} t={T} front={WARM} fa={0.75} back="#9fc0ea" ba={0.2} pose={{ armF: [mx(8, 22, tremble) + Math.sin(T * 34) * 3.5 * tremble, mx(14, 38, tremble) + Math.sin(T * 41) * 4 * tremble], armB: [-4 + Math.sin(T * 37) * 3 * tremble, 12], legF: [3, -1], legB: [-3, -1], lean: 6, head: mx(8, 16, k) }} />
    </Scene>
  );
};

const S7b: React.FC<{ T: number }> = ({ T }) => {
  const tr = (a: number) => Math.sin(T * 38 + a) * 1.8 + Math.sin(T * 23 + a * 2) * 1.2;
  return (
    <Scene z={1.0} px={540} py={960}>
      <Bokeh t={T} a="#3a2412" b="#0a0604" seed={44} n={20} op={0.5} hot={WARM} />
      <ellipse cx={540} cy={900} rx={560} ry={460} fill={WARM} opacity={0.3} filter="url(#fogb)" style={{ mixBlendMode: "screen" }} />
      <g transform={`translate(${380 + tr(0)} ${1000 + tr(1)}) rotate(${-8 + tr(2)})`}>
        <HandS s={2.5} cup={0.5} />
      </g>
      <g transform={`translate(${690 + tr(3)} ${1010 + tr(4)}) rotate(${8 + tr(5)})`}>
        <HandS s={2.5} flip cup={0.5} />
      </g>
    </Scene>
  );
};

/* ======================================================================== 8-9. the bench */

const S8: React.FC<{ T: number }> = ({ T }) => {
  const shift = ez(T, 45.0, 45.9);
  const walkX = track(T, [[44.5, 660], [47.3, 900]]);
  const sit = ez(T, 47.4, 48.3);
  const k = ez(T, 44.5, 52.3);
  const moving = T < 47.4;
  const old = (
    <Man x={mx(960, 1070, shift)} y={SEATY} age={1} t={T} front={WARM} fa={0.7} back="#000" ba={0} pose={{ ...SIT, lean: 12, head: 12, armF: [18, 30], armB: [10, 24] }} hand={cane} />
  );
  return (
    <Scene z={mx(1.15, 1.35, k)} px={mx(840, 900, k)} py={1230}>
      <Street t={T} sky={mixSky(DUSK2, NIGHT, 0.35)} lights={1} open={1} pool={1} />
      <Bench x={1010} />
      {old}
      {moving ? (
        <Man x={walkX} y={GY - bob(walkX, true, 0.7)} t={T} front={WARM} fa={0.75} back="#9fc0ea" ba={0.2} pose={walkPose(walkX, true, 0.7, { lean: 6, head: 14 })} />
      ) : (
        <Man x={mx(900, 900, sit)} y={mx(GY, SEATY, sit)} t={T} front={WARM} fa={0.75} back="#9fc0ea" ba={0.2} pose={{ legF: [88 * sit, -88 * sit], legB: [80 * sit, -82 * sit], lean: mx(6, 10, sit), head: 14, armF: [mx(4, 40, sit), mx(10, 64, sit)], armB: [mx(-4, 30, sit), mx(10, 60, sit)] }} />
      )}
    </Scene>
  );
};

const S9: React.FC<{ T: number }> = ({ T }) => {
  const k = ez(T, 52.3, 57.6);
  const down = ez(T, 52.4, 53.6);
  return (
    <Scene z={mx(1.35, 1.08, k)} px={mx(910, 860, k)} py={mx(1230, 1180, k)}>
      <Street t={T} sky={mixSky(mixSky(DUSK2, NIGHT, 0.35), NIGHT, k)} lights={1} open={1} pool={1} stars={ez(T, 54.5, 58, 0, 0.7)} />
      <Bench x={1010} />
      <Man x={1070} y={SEATY} age={1} t={T} front={WARM} fa={0.7} back="#000" ba={0} pose={{ ...SIT, lean: 12, head: 12, armF: [18, 30], armB: [10, 24] }} hand={cane} />
      <Man x={900} y={SEATY} t={T} front={WARM} fa={0.75} back="#9fc0ea" ba={0.2} pose={{ ...SIT, lean: mx(10, 18, down), head: mx(14, 36, down), armF: [40, 64], armB: [30, 60] }} />
    </Scene>
  );
};

/* ======================================================================== 10. the sky */

const S10: React.FC<{ T: number }> = ({ T }) => {
  const k = ez(T, 57.6, 61.5);
  return (
    <Scene z={mx(1.08, 0.82, k)} px={mx(860, 760, k)} py={mx(1180, 820, k)}>
      <Street t={T} sky={NIGHT} lights={1} open={1} pool={1} stars={ez(T, 57.6, 59.5, 0.7, 1)} />
      <Bench x={1010} />
      <Man x={1070} y={SEATY} age={1} t={T} front={WARM} fa={0.7} back="#000" ba={0} pose={{ ...SIT, lean: 12, head: 12, armF: [18, 30], armB: [10, 24] }} hand={cane} />
      <Man x={900} y={SEATY} t={T} front={WARM} fa={0.75} back="#9fc0ea" ba={0.2} pose={{ ...SIT, lean: 16, head: 30, armF: [40, 64], armB: [30, 60] }} />
    </Scene>
  );
};

/* ======================================================================== 11. the door, closed only in his head */

const S11: React.FC<{ T: number }> = ({ T }) => {
  const k = ez(T, 61.5, 70.5);
  const ghost = ez(T, 61.6, 62.2, 0, 0.85) * (1 - ez(T, 64.4, 66.4));
  return (
    <Scene z={mx(1.5, 3.0, k)} px={mx(760, 760, k)} py={mx(1260, 1230, k)}>
      <Street t={T} sky={NIGHT} lights={1} open={1} pool={1} stars={1} ghost={ghost} />
      <path d={arch(DOOR.x, GY, DOOR.w, DOOR.h)} fill="#fff6e0" opacity={ez(T, 66.5, 70.5) * 0.55} />
    </Scene>
  );
};

/* ======================================================================== the film */

type Shot = { a: number; C: React.FC<{ T: number }>; hard?: boolean };
const SHOTS: Shot[] = [
  { a: 0, C: S1 },
  { a: 11.4, C: S2 },
  { a: 17.3, C: S3 },
  { a: 24.33, C: S4, hard: true },
  { a: 26.83, C: S5, hard: true },
  { a: 28.95, C: S6 },
  { a: 38.1, C: S7 },
  { a: 42.9, C: S7b },
  { a: 44.5, C: S8 },
  { a: 52.3, C: S9, hard: true },
  { a: 57.6, C: S10, hard: true },
  { a: 61.5, C: S11 },
];

export const Door: React.FC<{ dur: number }> = ({ dur }) => {
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
  const fade = Math.max(ez(T, 0, 0.9, 1, 0), ez(T, total - 3.2, total - 0.6, 0, 1), dip);
  return (
    <AbsoluteFill style={{ backgroundColor: "#030406" }}>
      <C T={T} />
      <AbsoluteFill style={{ backgroundColor: "#030406", opacity: Math.min(1, fade) }} />
    </AbsoluteFill>
  );
};

export const SCENES9: Record<string, React.FC<{ dur: number }>> = { all: Door };
void [LA, LE, mixc];
