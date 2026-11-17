import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import vo from "./vo4.json";
import { walk } from "./art";
import type { Pose } from "./art";
import { Fog, Layer, Particles, Stage2, ez } from "./art2";
import { Blizzard, Flakes, Shatter, cam } from "./art4";
import { Backlit, COL, CX, FlowerS, KnightS, LadyS, SetBack, SetFg, SetFront, SetLight } from "./art5";
import type { Mode } from "./art5";
import { TopDown } from "./scenes4";

const FPS = 30;
type SP = { dur: number };
const LA = (i: number) => vo.lines[i].start;
const LE = (i: number) => vo.lines[i].end;
const useSc = (name: string) => {
  const frame = useCurrentFrame();
  const s = vo.scenes.find((x) => x.name === name)!;
  return { frame, T: s.start + frame / FPS, s };
};
const mx = (a: number, b: number, k: number) => a + (b - a) * k;
/** perspective: scale of a figure standing at ground y */
const ps = (y: number) => 0.42 + ((y - 1200) / 270) * 0.38;

const Set: React.FC<{ mode: Mode; t: number; z: number; px: number; py: number; children: React.ReactNode; light?: number; snow?: number; wind?: number; leaves?: number; cool?: number }> = ({ mode, t, z, px, py, children, light = 1, snow = 0.6, wind = 1, leaves = 0, cool = 0 }) => (
  <Stage2 cam={{ s: 1, x: 540, y: 960 }} vcam={cam(z, px, py)} ref0={{ x: 540, y: 850 }}>
    <Layer k={0.4}>
      <SetBack mode={mode} t={t} />
    </Layer>
    <Layer k={0.8}>
      <SetFront mode={mode} t={t} />
    </Layer>
    <Fog y={1180} h={130} t={t} op={0.3} seed={3} n={4} color={mode === "s" ? "#ffe9b0" : "#cfe2f6"} x0={-300} x1={1400} />
    {children}
    <SetLight mode={mode} t={t} op={light} />
    {mode === "s" ? (
      <>
        <Particles t={t} area={[0, 300, 1080, 1900]} n={60} seed={5} color="#fff1b8" size={3} rise={10} op={0.8 * light} />
        {leaves > 0 && <Particles t={t} area={[-100, 100, 1200, 1900]} n={46} seed={7} color="#b8691c" size={7} rise={-120} drift={26} op={leaves} twinkle={0.4} />}
      </>
    ) : (
      <>
        <Blizzard t={t} amount={snow} speed={wind} wind={wind} seed={2} />
        <Flakes t={t} n={80} />
      </>
    )}
    <Layer k={1.5} blur={8}>
      <SetFg mode={mode} t={t} />
    </Layer>
    {cool > 0 && <rect x={-900} y={-900} width={2900} height={3900} fill="#14203c" opacity={cool} style={{ mixBlendMode: "multiply" }} />}
  </Stage2>
);

const K: React.FC<{ x: number; y: number; s: number; flip?: boolean; t: number; pose?: Pose; mode: Mode; wind?: number; sword?: "sheath" | "hand" | "none"; snow?: number; shadow?: number; hand?: (f: string) => React.ReactNode }> = ({ x, y, s, flip, t, pose, mode, wind = 0.3, sword = "sheath", snow = 0, shadow = 0.45, hand }) => (
  <Backlit x={x} gy={y} mode={mode} flip={flip} shadow={shadow} render={(f) => <KnightS x={x} y={y} s={s} flip={flip} t={t} pose={pose} fill={f} wind={wind} sword={sword} snow={snow} hand={hand?.(f)} />} />
);
const L: React.FC<{ x: number; y: number; s: number; flip?: boolean; t: number; pose?: Pose; wind?: number; shadow?: number; hand?: (f: string) => React.ReactNode }> = ({ x, y, s, flip, t, pose, wind = 0.3, shadow = 0.45, hand }) => (
  <Backlit x={x} gy={y} mode="s" flip={flip} shadow={shadow} render={(f) => <LadyS x={x} y={y} s={s} flip={flip} t={t} pose={pose} fill={f} wind={wind} hand={hand?.(f)} />} />
);
const flower = (f: string, mode: Mode, col = "#ff9db8", s = 1) => (
  <g transform="translate(0,14) rotate(180)">
    <FlowerS s={s} stem={f} col={f === COL[mode].fig ? col : f} />
  </g>
);

/* ---------------------------------------------------------------- summer */

const SummerWide: React.FC<{ T: number }> = ({ T }) => {
  const u = ez(T, 0.6, 8.8, 0, 1, (n) => n);
  const y = mx(1205, 1470, u);
  const s = ps(y);
  const p = T * 4.6;
  const link = ez(T, LA(1) - 0.4, LA(1) + 0.6);
  const k = ez(T, 0, 8.8);
  return (
    <Set mode="s" t={T} z={mx(1.0, 1.14, k)} px={540} py={mx(985, 1070, k)}>
      <K x={CX - 34 * s} y={y} s={s} t={T} mode="s" pose={{ ...walk(p, 0.34), armF: [14 + 10 * link, 30 + 34 * link] }} />
      <L x={CX + 34 * s} y={y + 3} s={s} t={T} pose={{ armF: [-18 - 16 * link, 46], armB: [-6, 14], head: -3 }} />
    </Set>
  );
};

const SummerSteps: React.FC<{ T: number }> = ({ T }) => {
  const k = ez(T, 8.8, 17.36, 0, 1, (n) => n);
  const ph = T * 2.5;
  const care = ez(T, LA(2) - 0.3, LA(2) + 0.8);
  const laugh = ez(T, LA(3) - 0.1, LA(3) + 0.7);
  const hl = Math.abs(Math.sin(T * 8.5)) * laugh;
  const kx = mx(360, 470, k);
  const y = 1500;
  const s = 1.12;
  return (
    <Set mode="s" t={T} z={mx(1.42, 1.52, k)} px={mx(520, 560, k)} py={1235}>
      <K
        x={kx}
        y={y - Math.max(0, Math.sin(ph * 2)) * 3}
        s={s}
        t={T}
        mode="s"
        wind={0.15}
        pose={{ legF: [24 * Math.sin(ph), -Math.max(0, 62 * Math.sin(ph + 2.0)) * (0.5 + 0.5 * care) - 4], legB: [24 * Math.sin(ph + Math.PI), -Math.max(0, 62 * Math.sin(ph + Math.PI + 2.0)) * (0.5 + 0.5 * care) - 4], armF: [24 + 8 * Math.sin(ph), 34], armB: [-20 - 8 * Math.sin(ph), 30], lean: 5 * care, head: 4 }}
      />
      <L x={kx + 205 + 6 * Math.sin(ph)} y={y + 4} s={s} flip t={T} wind={0.35} pose={{ armF: [mx(30, 66, laugh), mx(40, 118, laugh)], armB: [-8, 16], head: -5 - 12 * hl, lean: -2 - 5 * hl }} />
    </Set>
  );
};

const SummerPromise: React.FC<{ T: number }> = ({ T }) => {
  const offer = ez(T, LA(4) - 0.2, LA(4) + 0.9);
  const give = ez(T, LA(4) + 1.6, LA(4) + 2.6);
  const keep = ez(T, LA(4) + 2.6, LE(4) + 0.3);
  const war = ez(T, LA(5) - 0.1, LE(5) + 0.4);
  const k = ez(T, 17.36, 23.83);
  const y = 1500;
  const s = 1.12;
  const hasK = give < 0.5;
  return (
    <Set mode="s" t={T} z={mx(1.52, 1.66, k)} px={545} py={1215} light={1 - 0.45 * war} leaves={war * 0.9} cool={0.3 * war}>
      <K x={mx(440, 415, war)} y={y} s={s} t={T} mode="s" wind={0.15 + 0.3 * war} pose={{ armF: [mx(mx(16, 80, offer), 14, Math.max(keep * 0.6, war)), 12], armB: [-6, 12], legF: [6, -2], legB: [-6, -2], head: mx(2, 12, war) }} hand={hasK && offer > 0.2 ? (f) => flower(f, "s") : undefined} />
      <L x={650} y={y + 4} s={s} flip t={T} wind={0.3 + 0.3 * war} pose={{ armF: [mx(mx(20, 76, give), 44, keep), mx(mx(30, 14, give), 104, keep)], armB: [-6, 14], head: mx(-4, 10, war) }} hand={!hasK ? (f) => flower(f, "s") : undefined} />
    </Set>
  );
};

const SummerWar: React.FC<{ T: number }> = ({ T }) => {
  const u = ez(T, 23.83, 27.2, 0, 1, (n) => n);
  const y = mx(1440, 1215, u);
  const s = ps(y);
  return (
    <Set mode="s" t={T} z={mx(1.12, 1.0, u)} px={540} py={mx(1050, 990, u)} light={0.55 - 0.15 * u} leaves={0.9} cool={mx(0.3, 0.5, u)}>
      <K x={mx(520, CX, u)} y={y} s={s} t={T} mode="s" wind={0.5} pose={{ ...walk(T * 4.6, 0.36), armF: [8, 20] }} />
      <L x={455} y={1476} s={ps(1476)} t={T} wind={0.6} pose={{ armF: [44, 104], armB: [mx(10, 150, ez(T, 24.2, 25.4)) + 8 * Math.sin(T * 5), 20], head: -3 }} hand={(f) => flower(f, "s")} />
    </Set>
  );
};

/* ---------------------------------------------------------------- winter */

const SPOT = [455, 1482];

const WinterBack: React.FC<{ T: number }> = ({ T }) => {
  const u = ez(T, 27.0, LE(7) + 0.4, 0, 1, (n) => n);
  const y = mx(1215, 1470, u);
  const s = ps(y);
  const walking = u < 1 ? 0.36 : 0;
  const kA = ez(T, LA(8) - 0.5, LA(8) + 0.6);
  const kB = ez(T, LA(9) - 0.3, LA(9) + 1.0);
  const kC = ez(T, LA(10) - 0.2, LA(10) + 1.2);
  let z = mx(1.0, 1.5, kA);
  let px = 540;
  let py = mx(990, 1300, kA);
  z = mx(z, 1.0, kB);
  py = mx(py, 990, kB);
  z = mx(z, 1.4, kC);
  px = mx(px, 495, kC);
  py = mx(py, 1360, kC);
  const ghost = Math.sin(Math.PI * ez(T, LA(10) + 0.2, LE(10) + 1.3)) * 0.42;
  const turn = kC > 0.5;
  return (
    <Set mode="w" t={T} z={z} px={px} py={py} snow={0.55} light={0.9}>
      <path d={`M${CX},1215 L${CX},${y}`} stroke="#3c5880" strokeWidth={3 * s} opacity={0.3} strokeLinecap="round" />
      <g transform={`translate(${SPOT[0] + 16} ${SPOT[1]}) rotate(-78)`}>
        <FlowerS s={ps(SPOT[1]) * 1.2} stem="#0b1830" col="#c7dcf2" />
      </g>
      {ghost > 0.01 && (
        <g opacity={ghost} filter="url(#bl3)">
          <LadyS x={SPOT[0]} y={SPOT[1]} s={ps(SPOT[1])} t={T * 0.5} fill="#ffd98a" wind={0.2} pose={{ armF: [44, 104], armB: [-6, 14], head: -3 }} />
        </g>
      )}
      {ghost > 0.01 && <Particles t={T} area={[SPOT[0] - 90, SPOT[1] - 280, SPOT[0] + 90, SPOT[1]]} n={26} seed={21} color="#ffe6a8" size={2.6} rise={40} op={ghost * 2} />}
      {u > 0.005 && <K x={CX} y={y} s={s} flip={turn} t={T} mode="w" sword="hand" snow={0.7} wind={0.6} pose={{ ...walk(T * 3.8, walking), armF: [8, 6], armB: [-6, 12], head: mx(10, 16, kC), lean: 5 }} />}
    </Set>
  );
};

const WinterFlower: React.FC<{ T: number }> = ({ T }) => {
  const reach = ez(T, LA(11) - 0.1, LA(11) + 1.3);
  const lift = ez(T, LA(11) + 1.6, LE(11) + 0.3);
  const brk = ez(T, LA(12) - 0.1, LA(12) + 1.0, 0, 1, (n) => n);
  const still = ez(T, LA(13) - 0.3, LA(13) + 0.5);
  const k = ez(T, 37.2, 44.04);
  const s = 0.86;
  const kx = 585;
  const gy = 1486;
  const held = lift > 0.02;
  const col = "#c7dcf2";
  const tt = T * (1 - 0.75 * still) + (still > 0 ? LA(13) * 0.75 * still : 0);
  const hx = kx - 95 * s;
  const hy = gy - 150 * s;
  return (
    <Set mode="w" t={tt} z={mx(1.55, 1.8, k)} px={515} py={mx(1380, 1350, k)} snow={0.5 * (1 - 0.6 * still)} wind={1 - 0.7 * still} light={0.9}>
      {!held && (
        <g transform={`translate(${SPOT[0] + 16} ${SPOT[1]}) rotate(-78)`}>
          <FlowerS s={ps(SPOT[1]) * 1.2} stem="#0b1830" col={col} />
        </g>
      )}
      <K
        x={kx}
        y={gy + 74 * s}
        s={s}
        flip
        t={T}
        mode="w"
        sword="sheath"
        snow={0.8}
        wind={0.08}
        shadow={0.3}
        pose={{ legF: [86, -92], legB: [-6, -94], lean: mx(22, 10, lift), head: mx(22, 28, lift), armF: [mx(mx(20, 62, reach), 52, lift), mx(mx(10, 6, reach), 92, lift)], armB: [-8, 16] }}
        hand={held ? (f) => flower(f, "w", brk > 0.3 ? "#9fb6d2" : col, 1.25) : undefined}
      />
      {brk > 0 &&
        brk < 1 &&
        [0, 1, 2, 3, 4, 5, 6].map((i) => {
          const a = brk * 1.3;
          return <ellipse key={i} cx={hx + (i - 3) * 9 * a + Math.sin(i * 2.1) * 6} cy={hy + a * a * 150 + i * 3} rx={5} ry={3} fill="#e6f3ff" opacity={(1 - brk) * 0.95} transform={`rotate(${i * 50 + brk * 200} ${hx + (i - 3) * 9 * a} ${hy + a * a * 150})`} />;
        })}
    </Set>
  );
};

const WinterStand: React.FC<{ T: number }> = ({ T }) => {
  const storm = ez(T, LA(15), LE(16));
  const k = ez(T, 44.04, LE(16) + 0.2);
  const y = 1470;
  const s = ps(y);
  const prints = Array.from({ length: 11 }, (_, i) => {
    const yy = 1228 + i * 22;
    return { x: CX + (i % 2 ? 9 : -9) * ps(yy), y: yy, k: ps(yy) };
  });
  return (
    <Set mode="w" t={T} z={mx(1.5, 0.98, k)} px={540} py={mx(1290, 1010, k)} snow={0.5 + 0.5 * storm} wind={1 + 1.2 * storm} light={0.9 - 0.2 * storm}>
      <g fill="#3c5880" opacity={0.5 * (1 - storm)}>
        {prints.map((q, i) => (
          <ellipse key={i} cx={q.x} cy={q.y} rx={12 * q.k} ry={4.5 * q.k} />
        ))}
      </g>
      <K x={CX} y={y} s={s} t={T} mode="w" sword="sheath" snow={0.7 + 0.5 * storm} wind={0.6 + 0.7 * storm} pose={{ armF: [8, 12], armB: [-6, 12], legF: [5, -2], legB: [-5, -2], head: 20, lean: 4 }} hand={(f) => flower(f, "w", "#9fb6d2", 1.2)} />
      <rect x={-900} y={-900} width={2900} height={3900} fill="#e8f3ff" opacity={0.75 * ez(T, LE(16) - 1.3, LE(16) + 0.15)} />
    </Set>
  );
};

/* ---------------------------------------------------------------- scenes */

const FadeIn: React.FC<{ frame: number; n?: number }> = ({ frame, n = 14 }) => <AbsoluteFill style={{ backgroundColor: "#07060b", opacity: ez(frame, 0, n, 1, 0) }} />;

const ArchScene: React.FC<SP> = () => {
  const { frame, T } = useSc("arch");
  return (
    <AbsoluteFill>
      <SummerWide T={T} />
      <FadeIn frame={frame} />
    </AbsoluteFill>
  );
};
const StepsScene: React.FC<SP> = () => <SummerSteps T={useSc("steps").T} />;
const PromiseScene: React.FC<SP> = () => <SummerPromise T={useSc("promise").T} />;
const WarScene: React.FC<SP> = () => {
  const { T } = useSc("war");
  const Ts = LE(6);
  const fs = (T - Ts) * FPS;
  if (fs < 0) return <SummerWar T={T} />;
  return (
    <AbsoluteFill>
      <WinterBack T={T} />
      <Shatter f={fs}>
        <SummerWar T={Ts} />
      </Shatter>
      {fs < 3 && <AbsoluteFill style={{ backgroundColor: "#ffffff", opacity: ez(fs, 0, 3, 0.8, 0) }} />}
    </AbsoluteFill>
  );
};
const BackScene: React.FC<SP> = () => <WinterBack T={useSc("back").T} />;
const FlowersScene: React.FC<SP> = () => <WinterFlower T={useSc("flowers").T} />;
const TopWrap: React.FC<{ name: string; off?: number }> = ({ name, off = 0 }) => (
  <AbsoluteFill>
    <TopDown T={useSc(name).T + off} />
    <AbsoluteFill style={{ backgroundColor: "#7f9cc8", mixBlendMode: "multiply", opacity: 0.55 }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 35%, rgba(4,8,20,0.6) 100%)" }} />
  </AbsoluteFill>
);
const StandScene: React.FC<SP> = ({ dur }) => {
  const { T, s } = useSc("stand");
  const cut = Math.round((LE(16) + 0.15 - s.start) * FPS);
  return (
    <>
      <Sequence durationInFrames={cut}>
        <WinterStand T={T} />
      </Sequence>
      <Sequence from={cut} durationInFrames={dur - cut}>
        <TopWrap name="stand" off={cut / FPS} />
      </Sequence>
    </>
  );
};
const AwayScene: React.FC<SP> = () => <TopWrap name="away" />;

export const SCENES5: Record<string, React.FC<SP>> = { arch: ArchScene, steps: StepsScene, promise: PromiseScene, war: WarScene, back: BackScene, flowers: FlowersScene, stand: StandScene, away: AwayScene };
