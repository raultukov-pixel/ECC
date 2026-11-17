import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import vo from "./vo8.json";
import { walk } from "./art";
import type { Pose } from "./art";
import { Particles, Stage2, ez } from "./art2";
import { cam } from "./art4";
import { LadyS } from "./art5";
import { INK6, ManS, mixc } from "./art6";
import { Cup, HIS, KitchenBack, KitchenTable, Steam } from "./art7";
import {
  BarBack, BarTable, BigClock, Bokeh, CalendarPage, CallScreen, ChatScreen, ContactScreen, Finger, FlatBack, Garland, Glass, HistoryScreen, Laptop, MeetBack, MeetTable, OfficeBack, Phone, Pie, Postcard, Stove, UI,
} from "./art8";
import type { Msg } from "./art8";
import { FONT } from "./fonts";

const FPS = 30;
const LA = (i: number) => vo.lines[i].start;
const LE = (i: number) => vo.lines[i].end;
const mx = (a: number, b: number, k: number) => a + (b - a) * k;
const KF = 1508;
const KT = 1330;
const MS = 1.35;
const SEAT_Y = 1400 + 152 * MS;
type Sky = [string, string];
const NIGHT: Sky = ["#0b1830", "#3a5078"];
const DUSK: Sky = ["#3a5078", "#e8b890"];
const NOON: Sky = ["#bcd8ee", "#fff4d6"];
const mixSky = (a: Sky, b: Sky, k: number): Sky => [mixc(a[0], b[0], k), mixc(a[1], b[1], k)];

/** buzz amount 0..1: the phone vibrates for `d` seconds from each start */
const buzz = (T: number, starts: number[], d = 0.5) => {
  for (const s of starts) if (T >= s && T < s + d) return 1;
  return 0;
};
const jit = (T: number, k: number, a = 5) => (k > 0 ? Math.sin(T * 130) * a * k : 0);

const Scene: React.FC<{ z: number; px: number; py: number; children: React.ReactNode }> = ({ z, px, py, children }) => (
  <Stage2 cam={{ s: 1, x: 540, y: 960 }} vcam={cam(z, px, py)} ref0={{ x: 540, y: 960 }}>
    {children}
  </Stage2>
);

/** profile light: `front` is the side the figure faces */
const Lit8: React.FC<{ front?: string; fa?: number; back?: string; ba?: number; flip?: boolean; render: (fill: string) => React.ReactNode }> = ({ front = "#ffb866", fa = 0.5, back = "#9fc0ea", ba = 0.3, flip, render }) => (
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

const SIT: Pose = { legF: [88, -88], legB: [80, -82] };
type LitP = { front?: string; fa?: number; back?: string; ba?: number };
const Man: React.FC<{ x: number; y?: number; t: number; pose: Pose; age?: number; flip?: boolean; coat?: boolean; hand?: (f: string) => React.ReactNode; handB?: (f: string) => React.ReactNode; s?: number } & LitP> = ({ x, y = KF, t, pose, age = 0, flip, coat, hand, handB, s = MS, ...lit }) => (
  <Lit8 {...lit} flip={flip} render={(f) => <ManS x={x} y={y} s={s} flip={flip} t={t} fill={f} age={age} coat={coat} pose={pose} hand={hand?.(f)} handB={handB?.(f)} />} />
);
const Seated: React.FC<{ x: number; y?: number; t: number; pose?: Pose; age?: number; flip?: boolean; hand?: (f: string) => React.ReactNode } & LitP> = ({ x, y = SEAT_Y, t, pose = {}, age, flip, hand, ...lit }) => (
  <Man x={x} y={y} t={t} age={age} flip={flip} hand={hand} pose={{ ...SIT, ...pose }} {...lit} />
);
const Lady: React.FC<{ x: number; y?: number; t: number; pose?: Pose; flip?: boolean; s?: number; hand?: (f: string) => React.ReactNode } & LitP> = ({ x, y = KF, t, pose = {}, flip, s = 1.3, hand, ...lit }) => (
  <Lit8 {...lit} flip={flip} render={(f) => <LadyS x={x} y={y} s={s} flip={flip} t={t} fill={f} wind={0.08} pose={pose} bun hand={hand?.(f)} />} />
);
const phoneHand = (f: string) => (
  <g transform="translate(8 14) rotate(8)">
    <rect x={-8} y={-8} width={17} height={40} rx={5} fill={f} />
  </g>
);
const glowHand = (c: string, on = 1) => (f: string) => (
  <g transform="translate(6 18) rotate(10)">
    <rect x={-9} y={-10} width={18} height={42} rx={5} fill={f} />
    {f === INK6 && <rect x={-7} y={-8} width={4} height={38} rx={2} fill={c} opacity={on} />}
    {f === INK6 && <circle cx={-6} cy={8} r={150} fill={c} opacity={0.2 * on} filter="url(#glowb)" style={{ mixBlendMode: "screen" }} />}
  </g>
);

const FloatLabel: React.FC<{ x: number; y: number; text: string; op: number; size?: number; col?: string }> = ({ x, y, text, op, size = 44, col = "#fff" }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={UI} fontWeight={600} fontSize={size} fill={col} opacity={op} style={{ filter: "drop-shadow(0 0 14px rgba(150,200,255,0.9))" }}>
    {text}
  </text>
);

const MiniCard: React.FC<{ x: number; y: number; rot?: number; s?: number; lit?: number }> = ({ x, y, rot = 0, s = 1, lit = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-60} y={-170} width={120} height={170} rx={4} fill="#05080b" />
    <rect x={-56} y={-166} width={112} height={110} fill="#cfe3ee" opacity={0.22 * lit} />
    <path d="M0,-150 L-34,-100 L34,-100Z M0,-124 L-42,-72 L42,-72Z" fill="#050302" />
    <rect x={-60} y={-170} width={120} height={3} fill="#ffdca0" opacity={0.5 * lit} />
  </g>
);

/* ================================================================ 1. the call he declines (0 - 3.8) */

const PH = { x: 540, y: 790, s: 1.5 };
const tapAt = (lx: number, ly: number) => ({ x: PH.x + (lx - 180) * PH.s, y: PH.y + (ly - 370) * PH.s });

const S1: React.FC<{ T: number }> = ({ T }) => {
  const k = buzz(T, [0.1, 0.95, 1.8, 2.65]);
  const tip = tapAt(88, 622);
  const come = ez(T, 2.2, 3.15);
  const press = ez(T, 3.2, 3.3) * (1 - ez(T, 3.4, 3.6));
  const ended = ez(T, 3.3, 3.5);
  return (
    <Scene z={mx(1.0, 1.1, ez(T, 0, 3.8))} px={540} py={960}>
      <Bokeh t={T} a="#0c121b" b="#06080c" seed={4} n={24} op={0.35} />
      <Phone x={PH.x + jit(T, k, 3)} y={PH.y} s={PH.s} on={1 - ez(T, 3.55, 3.85) * 0.85} glow={mixc("#8fc4ff", "#ff5a4d", ended * 0.3)}>
        <CallScreen T={T} name="Мама" press={press} ended={ended} />
      </Phone>
      {come > 0 && <Finger x={mx(tip.x + 330, tip.x + 8, come)} y={mx(tip.y + 520, tip.y + 10, come)} press={press} />}
    </Scene>
  );
};

/* ================================================================ 2. he works on (3.8 - 8.0) */

const Office: React.FC<{ T: number; z: number; px: number; py: number; sky: Sky; light?: number; blinds?: number; lamp?: number; papers?: number; sun?: number; glow?: number; children?: React.ReactNode; table?: React.ReactNode; closed?: boolean }> = ({ T, z, px, py, sky, light = 1, blinds = 1, lamp = 0.8, papers = 0.5, sun = 0, glow = 1, children, table, closed }) => (
  <Scene z={z} px={px} py={py}>
    <OfficeBack t={T} sky={sky} light={light} blinds={blinds} lamp={lamp} papers={papers} sun={sun} />
    {children}
    {!closed && <Laptop x={560} y={KT} glow={glow} />}
    {closed && <rect x={556} y={KT - 10} width={150} height={10} fill={INK6} />}
    {table}
    <Particles t={T} area={[200, 500, 900, 1500]} n={22} seed={5} color="#cfe0ff" size={2} rise={4} op={0.35} />
  </Scene>
);

const S2: React.FC<{ T: number }> = ({ T }) => {
  const k = ez(T, 3.8, 8.0);
  const flip = ez(T, 6.6, 7.2);
  const typ = Math.sin(T * 17);
  return (
    <Office T={T} z={mx(1.0, 1.25, k)} px={mx(560, 470, k)} py={mx(1050, 1190, k)} sky={["#16233d", "#3e5f8c"]} lamp={0.9} papers={0.7}
      table={
        <g>
          <rect x={470} y={KT - 8} width={70} height={8} rx={2} fill={INK6} />
          <rect x={473} y={KT - 7} width={64} height={2.5} rx={1} fill="#9cd0ff" opacity={0.8 * (1 - flip)} />
        </g>
      }
    >
      <Seated x={300} t={T} front="#9cd0ff" fa={0.55} back="#ffb866" ba={0.2} pose={{ lean: 10, head: 8 + 2 * Math.sin(T * 3), armF: [52 + 2 * typ, 62 - 2 * typ], armB: [46, 66 + 3 * Math.sin(T * 19)] }} />
    </Office>
  );
};

/* ================================================================ 3. mum waits (8.0 - 10.15) */

const Kit: React.FC<{ T: number; z: number; px: number; py: number; sky: Sky; light?: number; snow?: number; clock?: number; door?: number; plant?: number; back?: React.ReactNode; children?: React.ReactNode; table?: React.ReactNode; garland?: number; dark?: number }> = ({ T, z, px, py, sky, light = 1, snow = 0, clock = 0, door = 0, plant = 0, back, children, table, garland = 0, dark = 0 }) => (
  <Scene z={z} px={px} py={py}>
    <KitchenBack t={T} sky={sky} light={light} snow={snow} clock={clock} door={door} plant={plant} scarf />
    {garland > 0 && <Garland t={T} op={garland} />}
    {back}
    {table}
    {children}
    <Particles t={T} area={[200, 500, 900, 1500]} n={30} seed={3} color="#ffe9c0" size={2.2} rise={6} op={0.5 * light} />
    {dark > 0 && <rect x={-900} y={-900} width={3400} height={3900} fill="#050302" opacity={dark} />}
  </Scene>
);

const S3: React.FC<{ T: number }> = ({ T }) => {
  const k = ez(T, 8.0, 10.15);
  const lower = ez(T, 9.55, 10.1);
  const tilt = Math.sin(T * 4) * 1.5;
  return (
    <Kit T={T} z={mx(1.15, 1.3, k)} px={mx(640, 700, k)} py={1150} sky={NOON}
      table={<KitchenTable t={T} light={1} cupHis={false} cupHer steamHer={0.9} pot={false} />}
      back={<Lady x={820} flip t={T} front="#ffe2a8" fa={0.6} pose={{ armF: [mx(112, 40, lower), mx(104, 40, lower)], armB: [-6, 14], head: mx(-5 + tilt, 12, lower), lean: 2 }} hand={phoneHand} />}
    />
  );
};

/* ================================================================ 4. the meeting (10.15 - 12.2) */

const S4: React.FC<{ T: number }> = ({ T }) => {
  const vib = ez(T, 10.85, 10.9) * (1 - ez(T, 12.0, 12.1)) * (Math.floor(T * 3.4) % 2 === 0 ? 1 : 0.2);
  const look = ez(T, 10.95, 11.4);
  const k = ez(T, 10.15, 12.2);
  const cold = { front: "#cfe2f5", fa: 0.55, back: "#000", ba: 0 };
  return (
    <Scene z={mx(1.0, 1.1, k)} px={560} py={1090}>
      <MeetBack t={T} />
      <Seated x={110} t={T} {...cold} pose={{ lean: 4, head: 2 * Math.sin(T * 0.8), armF: [30, 50], armB: [20, 40] }} />
      <g opacity={1}>
        <Lit8 front="#cfe2f5" fa={0.55} ba={0} render={(f) => <LadyS x={270} y={SEAT_Y - 30} s={1.32} t={T} fill={f} wind={0.05} pose={{ armF: [34, 46], armB: [20, 40], head: 3 }} bun />} />
      </g>
      <Seated x={410} t={T} {...cold} pose={{ lean: 6, head: -2 + Math.sin(T * 1.1) * 2, armF: [36, 52], armB: [24, 44] }} />
      <Seated x={560} t={T} {...cold} pose={{ lean: 8, head: mx(2, 24, look), armF: [mx(30, 56, look), mx(48, 60, look)], armB: [24, 44] }} />
      <MeetTable t={T} vib={vib} />
    </Scene>
  );
};

/* ================================================================ 5. the chat (12.2 - 20.0) */

const CHAT: Msg[] = [
  { who: "her", text: "Как ты?", at: 13.62, time: "13:08" },
  { who: "me", text: "Занят", at: 16.76 },
  { who: "me", text: "Потом", at: 19.36 },
];

const S5: React.FC<{ T: number }> = ({ T }) => {
  const typing = T < 17.5 ? { text: "Занят", from: 15.16, to: 15.8, sendAt: 16.76 } : { text: "Потом", from: 18.76, to: 19.3, sendAt: 19.36 };
  const k = ez(T, 12.2, 20.0);
  const lit = ez(T, 13.5, 13.7) * (1 - ez(T, 13.9, 14.4));
  return (
    <Scene z={mx(1.0, 1.1, k)} px={540} py={960}>
      <Bokeh t={T} a="#101a26" b="#06090d" seed={7} n={22} op={0.3} hot="#ffcf8a" />
      <Phone x={540} y={790 + mx(0, -20, k)} s={1.5} glow={mixc("#8fc4ff", "#ffcf8a", lit * 0.6)}>
        <ChatScreen T={T} msgs={CHAT} typing={typing} />
      </Phone>
    </Scene>
  );
};

/* ================================================================ 6. mum alone (20.0 - 29.8) */

const Bubble: React.FC<{ x: number; y: number; text: string; at: number; T: number }> = ({ x, y, text, at, T }) => {
  const p = ez(T, at, at + 0.35);
  const out = ez(T, at + 1.0, at + 1.4);
  if (p <= 0) return null;
  const w = 56 + text.length * 17;
  return (
    <g transform={`translate(${x} ${y - (p * 26 + out * 40)}) scale(${0.9 + 0.1 * p})`} opacity={p * (1 - out)}>
      <rect x={-w / 2} y={-34} width={w} height={64} rx={30} fill="#f3e3c3" />
      <text x={0} y={10} textAnchor="middle" fontFamily={UI} fontSize={30} fontWeight={500} fill="#2a1a10">
        {text}
      </text>
    </g>
  );
};

const S6: React.FC<{ T: number }> = ({ T }) => {
  const k = ez(T, 20.0, 29.8);
  const sky = mixSky(DUSK, NIGHT, ez(T, 20, 29));
  const type = Math.sin(T * 9) * 3 * (T > 26.8 ? 1 : 0);
  return (
    <Kit T={T} z={mx(1.12, 1.28, k)} px={mx(650, 730, k)} py={1150} sky={sky} light={mx(0.6, 0.28, k)} clock={T * 0.6}
      table={<KitchenTable t={T} light={0.5} cupHis={false} cupHer steamHer={mx(0.8, 0.15, k)} pot={false} />}
      back={<Lady x={820} flip t={T} front="#ffcf8a" fa={0.5} back="#7f9fd0" ba={0.45} pose={{ armF: [48 + type, 70], armB: [-6, 14], head: mx(2, 14, ez(T, 21, 25)), lean: mx(2, 8, k) }} hand={phoneHand} />}
    >
      <Bubble x={640} y={1070} text="Поел?" at={27.27} T={T} />
      <Bubble x={690} y={990} text="Не замёрз?" at={28.33} T={T} />
    </Kit>
  );
};

/* ================================================================ 7. saturday (29.8 - 35.9) */

const S7: React.FC<{ T: number }> = ({ T }) => {
  const ring = buzz(T, [30.12, 30.97, 31.82, 32.67]);
  const glow = T < 33.4 ? 0.55 + 0.45 * ring : 0.6 * (1 - ez(T, 33.4, 34.0));
  const look = ez(T, 32.4, 32.8) * (1 - ez(T, 33.6, 34.1));
  const k = ez(T, 29.8, 35.9);
  const sh = jit(T, ring, 2);
  return (
    <Scene z={mx(1.2, 1.32, k)} px={mx(480, 560, k)} py={mx(1230, 1300, k)}>
      <FlatBack t={T} tv={1} />
      <Seated x={300} t={T} front="#9cc4ff" fa={0.55} back="#000" ba={0} pose={{ lean: -6, head: mx(0, 20, look), armF: [26, 54], armB: [30, 60] }} />
      <g transform={`translate(${640 + sh} ${KF - 62})`}>
        <rect x={-120} y={-8} width={240} height={12} rx={4} fill="#04070a" />
        <rect x={-110} y={-26} width={16} height={18} fill="#04070a" />
        <rect x={94} y={-26} width={16} height={18} fill="#04070a" />
      </g>
      <g transform={`translate(${640 + sh} ${KF - 70})`}>
        <rect x={-34} y={-7} width={70} height={9} rx={3} fill="#04070a" />
        <rect x={-30} y={-6} width={62} height={3} rx={1.5} fill="#9cd0ff" opacity={glow} />
        <ellipse cx={0} cy={-6} rx={110} ry={30} fill="#9cd0ff" opacity={0.28 * glow} filter="url(#bl14)" style={{ mixBlendMode: "screen" }} />
        <FloatLabel x={0} y={-80} text="Мама" op={glow} />
      </g>
    </Scene>
  );
};

/* ================================================================ 8-11. the montage (35.9 - 44.45) */

const S8: React.FC<{ T: number }> = ({ T }) => {
  const clink = ez(T, 36.75, 36.9) * (1 - ez(T, 37.15, 37.35));
  const laugh = Math.sin(T * 11) * 2.4;
  const k = ez(T, 35.9, 38.2);
  const warm = { front: "#ffcf8a", fa: 0.6, back: "#000", ba: 0 };
  const glass = (f: string) => (
    <g transform="translate(4 28)">
      <Glass fill={f} s={1} />
    </g>
  );
  return (
    <Scene z={mx(1.05, 1.15, k)} px={560} py={1100}>
      <BarBack t={T} />
      <Seated x={230} y={SEAT_Y} t={T} {...warm} pose={{ lean: 2 + laugh, head: -4 + laugh, armF: [mx(30, 96, clink), mx(40, 40, clink)], armB: [10, 40] }} hand={glass} />
      <Lit8 front="#ffcf8a" fa={0.6} ba={0} flip render={(f) => <LadyS x={640} y={SEAT_Y - 30} s={1.3} flip t={T} fill={f} wind={0.05} pose={{ armF: [mx(30, 96, clink), mx(36, 40, clink)], armB: [10, 30], head: 3 - laugh * 0.6 }} bun hand={glass(f)} />} />
      <Seated x={900} flip t={T} {...warm} pose={{ lean: 2, head: 6 + laugh * 0.5, armF: [mx(34, 90, clink * 0.6), 50], armB: [10, 40] }} hand={glass} />
      <BarTable t={T} />
      <g transform={`translate(520 ${KT + 18})`}>
        <rect x={-34} y={-7} width={70} height={9} rx={3} fill="#04070a" />
        <rect x={-30} y={-6} width={62} height={3} rx={1.5} fill="#9cd0ff" opacity={0.35 + 0.3 * Math.abs(Math.sin(T * 3))} />
      </g>
    </Scene>
  );
};

const S9: React.FC<{ T: number }> = ({ T }) => {
  const typ = Math.sin(T * 52);
  const vb = buzz(T, [38.75, 39.2], 0.3);
  return (
    <Office T={T} z={mx(1.5, 1.62, ez(T, 38.2, 39.8))} px={520} py={1215} sky={["#080f1c", "#1d3050"]} blinds={0.7} lamp={1} papers={1} glow={1.2}
      table={
        <g transform={`translate(${470 + jit(T, vb, 2)} ${KT - 8})`}>
          <rect x={0} y={0} width={70} height={8} rx={2} fill={INK6} />
          {vb > 0 && <rect x={3} y={1} width={64} height={2.5} fill="#9cd0ff" />}
        </g>
      }
    >
      <Seated x={300} t={T} front="#9cd0ff" fa={0.6} back="#ffb866" ba={0.3} pose={{ lean: 14, head: 14, armF: [54 + 4 * typ, 62 - 3 * typ], armB: [48 - 3 * typ, 66 + 4 * typ] }} />
    </Office>
  );
};

const S10: React.FC<{ T: number }> = ({ T }) => {
  const u = T - 39.8;
  const spin = u * u * 0.9 + u * 1.5;
  return (
    <Scene z={mx(1.0, 1.12, u / 1.9)} px={540} py={960}>
      <Bokeh t={T} a="#1a0d0b" b="#06080c" seed={9} n={20} op={0.3} hot="#ff9a7a" />
      <BigClock x={540} y={820} r={330} spin={spin} alarm={ez(T, 40.6, 41.0)} />
    </Scene>
  );
};

const FLIPS: [string, number][] = [["ОКТЯБРЬ", 3], ["ОКТЯБРЬ", 14], ["ОКТЯБРЬ", 27], ["НОЯБРЬ", 8], ["НОЯБРЬ", 21], ["ДЕКАБРЬ", 4], ["ДЕКАБРЬ", 17], ["ДЕКАБРЬ", 31]];
const S11: React.FC<{ T: number }> = ({ T }) => {
  const u = (T - 41.95) / 0.3;
  const idx = Math.max(0, Math.min(FLIPS.length - 2, Math.floor(u)));
  const fr = Math.max(0, Math.min(1, u - idx));
  const done = u >= FLIPS.length - 1;
  const cur = done ? FLIPS.length - 1 : idx;
  const [m0, d0] = FLIPS[cur];
  const [m1, d1] = FLIPS[Math.min(cur + 1, FLIPS.length - 1)];
  return (
    <Scene z={mx(1.0, 1.06, ez(T, 41.7, 44.45))} px={540} py={960}>
      <Bokeh t={T} a="#10161f" b="#06080c" seed={11} n={18} op={0.25} />
      {!done && <CalendarPage x={540} y={820} month={m1} day={d1} />}
      <CalendarPage x={540} y={820} month={m0} day={d0} flip={done ? 0 : ez(fr, 0.35, 1)} circled={done ? ez(T, 43.9, 44.3) : 0} />
    </Scene>
  );
};

/* ================================================================ 12-13. the postcard (44.45 - 57.0) */

const S12: React.FC<{ T: number }> = ({ T }) => {
  const k = ez(T, 44.45, 47.4);
  const read = ez(T, 44.8, 45.6);
  return (
    <Kit T={T} z={mx(1.2, 1.38, k)} px={mx(720, 690, k)} py={1160} sky={mixSky(NIGHT, ["#101c34", "#26385a"], 0.5)} light={0.5} snow={1} garland={1} clock={0.9}
      table={
        <g>
          <KitchenTable t={T} light={0.55} cupHis={false} cupHer steamHer={0.5} pot={false} />
          <MiniCard x={640} y={KT} rot={-6} s={0.9} lit={0.8} />
        </g>
      }
      back={<Lady x={820} flip t={T} front="#ffcf8a" fa={0.6} back="#8fb0e0" ba={0.4} pose={{ armF: [mx(20, 46, read), mx(30, 64, read)], armB: [-6, 14], head: mx(-2, 14, read), lean: 4 * read }} />}
    />
  );
};

const S13: React.FC<{ T: number }> = ({ T }) => {
  const z = T < 49.6 ? mx(1.5, 1.28, ez(T, 47.4, 49.6)) : mx(1.28, 1.0, ez(T, 49.6, 57.0));
  const py = T < 49.6 ? mx(760, 860, ez(T, 47.4, 49.6)) : 960;
  return (
    <Scene z={z} px={540} py={py}>
      <rect x={-300} y={-300} width={1700} height={2700} fill="#150c06" />
      <rect x={-300} y={300} width={1700} height={1400} fill="#24150a" opacity={0.9} />
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={i} x={-300} y={420 + i * 98} width={1700} height={3} fill="#0d0703" opacity={0.7} />
      ))}
      <circle cx={540} cy={820} r={900} fill="#ffcf8a" opacity={0.2} filter="url(#fogb)" style={{ mixBlendMode: "screen" }} />
      <Postcard T={T} x={540} y={860} rot={-4} s={1.12} lines={["Приезжай, сынок.", "Я пирог испеку."]} write={[[53.0, 54.45], [54.95, 56.8]]} sign={ez(T, 56.85, 57.05)} hover={49.7} />
    </Scene>
  );
};

/* ================================================================ 14-15. he smiles, spring (57.0 - 63.5) */

const DAY: Sky = ["#9dbbd6", "#ecdcc0"];
const S14: React.FC<{ T: number }> = ({ T }) => {
  const smile = ez(T, 57.1, 57.9);
  const place = ez(T, 59.0, 60.2);
  const k = ez(T, 57.0, 60.7);
  const hold = (f: string) => (
    <g transform={`translate(10 18) rotate(${mx(-8, 6, place)})`} opacity={1 - ez(T, 60.0, 60.2)}>
      <rect x={-20} y={-6} width={40} height={54} rx={3} fill={f} />
    </g>
  );
  return (
    <Office T={T} z={mx(1.2, 1.3, k)} px={mx(470, 520, k)} py={1190} sky={DAY} light={1.2} blinds={0.45} lamp={0.4} papers={0.5} sun={0.6} closed
      table={ez(T, 60.0, 60.4) > 0 ? <MiniCard x={470 - 5 + 5 * ez(T, 60.0, 60.4)} y={KT} rot={-6} s={0.95} lit={1} /> : undefined}
    >
      <Seated x={300} t={T} front="#ffe2a8" fa={0.7} back="#bcd8ff" ba={0.3} pose={{ lean: mx(6, 12, place), head: mx(-4, 6, smile) - 5 * place, armF: [mx(60, 36, place), mx(90, 50, place)], armB: [40, 60] }} hand={hold} />
    </Office>
  );
};

const Branch: React.FC<{ g: number }> = ({ g }) => (
  <g clipPath="url(#o8win)">
    <path d="M110,800 Q300,760 430,640 M300,760 Q380,780 470,760 M390,690 Q420,620 400,560" stroke="#07090c" strokeWidth={9} fill="none" strokeLinecap="round" />
    {[[430, 640], [470, 760], [400, 560], [300, 760], [350, 722], [262, 770]].map(([x, y], i) => (
      <g key={i}>
        <ellipse cx={x} cy={y} rx={14 * g + 2} ry={8 * g + 1.5} transform={`rotate(${-30 + i * 25} ${x} ${y})`} fill={mixc("#2d2418", "#7fb858", g)} />
        {g > 0.5 && <ellipse cx={x + 12} cy={y - 8} rx={10 * g} ry={5 * g} transform={`rotate(${-70 + i * 20} ${x} ${y})`} fill="#8fcf62" opacity={0.9} />}
      </g>
    ))}
  </g>
);

const S15: React.FC<{ T: number }> = ({ T }) => {
  const g = ez(T, 60.8, 63.2);
  const k = ez(T, 60.7, 63.5);
  return (
    <Office T={T} z={mx(1.15, 1.32, k)} px={mx(520, 450, k)} py={mx(1130, 1080, k)} sky={mixSky(DAY, ["#bfe0f4", "#fff2cc"], g)} light={1.4} blinds={mx(0.45, 0.1, g)} lamp={0.3} papers={0.5} sun={mx(0.6, 1, g)} closed
      table={<MiniCard x={470} y={KT} rot={-6} s={1.1} lit={1} />}
    >
      <Branch g={g} />
      <Seated x={300} t={T} front="#ffe2a8" fa={0.8} back="#fff" ba={0.3} pose={{ lean: 8, head: 4 - 4 * g, armF: [40, 52], armB: [34, 56] }} />
    </Office>
  );
};

/* ================================================================ 16-18. the last call (63.5 - 74.5) */

const S16: React.FC<{ T: number }> = ({ T }) => {
  const b = buzz(T, [63.8, 64.65, 65.5, 66.35]);
  const look = ez(T, 64.0, 64.6);
  const k = ez(T, 63.5, 67.0);
  const glow = T < 66.9 ? 0.5 + 0.5 * b : 0.5;
  return (
    <Office T={T} z={mx(1.25, 1.42, k)} px={mx(560, 640, k)} py={1180} sky={mixSky(DAY, ["#bfe0f4", "#fff2cc"], 1)} light={1.4} blinds={0.1} lamp={0.3} papers={0.5} sun={1}
      table={
        <g>
          <MiniCard x={470} y={KT} rot={-6} s={1.1} lit={1} />
          <g transform={`translate(${800 + jit(T, b, 3)} ${KT - 8})`}>
            <rect x={-34} y={-7} width={70} height={9} rx={3} fill="#04070a" />
            <rect x={-30} y={-6} width={62} height={3} rx={1.5} fill="#9cd0ff" opacity={glow} />
            <ellipse cx={0} cy={-6} rx={170} ry={50} fill="#9cd0ff" opacity={0.25 * glow} filter="url(#bl14)" style={{ mixBlendMode: "screen" }} />
            <FloatLabel x={0} y={-76} text="Мама" op={glow} />
          </g>
        </g>
      }
    >
      <Branch g={1} />
      <Seated x={300} t={T} front="#ffe2a8" fa={0.8} back="#fff" ba={0.3} pose={{ lean: 10, head: mx(2, 18, look), armF: [mx(46, 70, look), 56], armB: [34, 56] }} />
    </Office>
  );
};

const S17: React.FC<{ T: number }> = ({ T }) => {
  const k = ez(T, 67.0, 70.9);
  const tip = tapAt(88, 622);
  const come = ez(T, 67.6, 68.6);
  const hov = Math.sin(T * 5) * 4 * come * (1 - ez(T, 69.8, 70.1));
  const press = ez(T, 70.27, 70.37) * (1 - ez(T, 70.5, 70.8));
  const ended = ez(T, 70.37, 70.6);
  const b = T < 70.3 ? buzz(T, [67.3, 68.15, 69.0, 69.85]) : 0;
  return (
    <Scene z={mx(1.0, 1.2, k)} px={mx(540, 450, k)} py={mx(960, 1060, k)}>
      <Bokeh t={T} a="#171322" b="#06070b" seed={14} n={22} op={0.3} hot="#ffd29a" />
      <Phone x={PH.x + jit(T, b, 3)} y={PH.y} s={PH.s} on={1 - ez(T, 70.7, 71.3) * 0.95} glow={mixc("#8fc4ff", "#c3b0ff", 0.3)}>
        <CallScreen T={T} name="Мама" press={press} ended={ended} />
      </Phone>
      {come > 0 && <Finger x={mx(tip.x + 300, tip.x + 12 + hov, come)} y={mx(tip.y + 520, tip.y + 26 + hov, come)} press={press} />}
    </Scene>
  );
};

const S18: React.FC<{ T: number }> = ({ T }) => {
  const b = buzz(T, [71.67, 72.57, 73.47], 0.55);
  const on = ez(T, 71.5, 71.7);
  return (
    <Scene z={mx(1.0, 1.06, ez(T, 71.5, 74.5))} px={540} py={960}>
      <rect x={-300} y={-300} width={1700} height={2700} fill="#030406" />
      <Phone x={540 + jit(T, b, 4)} y={820} s={1.3} on={on * (1 - ez(T, 74.1, 74.5))} glow="#9cc4ff">
        <CallScreen T={T} name="Соседка" kind="neighbor" />
      </Phone>
    </Scene>
  );
};

/* ================================================================ 19-21. the empty flat (74.5 - 84.2) */

const S19: React.FC<{ T: number }> = ({ T }) => {
  const open = ez(T, 74.8, 75.3);
  const w = ez(T, 75.2, 76.9, 0, 1, (n) => n);
  const x = mx(1160, 700, w);
  const p = (x * 2 * Math.PI) / (262 * MS);
  const moving = w > 0 && w < 1;
  const k = ez(T, 74.5, 77.0);
  return (
    <Kit T={T} z={mx(1.0, 1.22, k)} px={mx(700, 640, k)} py={mx(1060, 1120, k)} sky={NIGHT} light={0.28} door={open} clock={T * 0.05}
      table={<KitchenTable t={T} light={0.3} cupHis={false} cupHer steamHer={0} pot={false} />}
    >
      {w > 0 && <Man x={x} y={KF - (moving ? Math.abs(Math.sin(p)) * 4 : 0)} flip t={T} age={0.2} front="#fff1cf" fa={0.5} back="#7f9fd0" ba={0.4} pose={moving ? { ...walk(p, 0.5), lean: 6, head: 6, armF: [10, 20], armB: [-8, 14] } : { armF: [8, 16], armB: [-6, 12], legF: [5, -2], legB: [-5, -2], head: 14, lean: 6 }} />}
    </Kit>
  );
};

const S20: React.FC<{ T: number }> = ({ T }) => {
  const k = ez(T, 77.0, 79.1);
  return (
    <Kit T={T} z={mx(1.22, 1.5, k)} px={mx(640, 560, k)} py={mx(1120, 1260, k)} sky={NIGHT} light={0.26} clock={T * 0.05}
      table={<KitchenTable t={T} light={0.3} cupHis={false} cupHer steamHer={0} pot={false} />}
    >
      <Man x={700} flip t={T} age={0.2} front="#fff1cf" fa={0.4} back="#7f9fd0" ba={0.4} pose={{ armF: [8, 16], armB: [-6, 12], legF: [5, -2], legB: [-5, -2], head: mx(14, 22, k), lean: 6 + 4 * k }} />
    </Kit>
  );
};

const S21: React.FC<{ T: number }> = ({ T }) => {
  const k = ez(T, 79.1, 84.2);
  const cool = ez(T, 81.0, 81.5);
  const set = ez(T, 82.8, 83.4);
  return (
    <Kit T={T} z={mx(1.3, 1.7, k)} px={mx(260, 100, k)} py={mx(1230, 1260, k)} sky={NIGHT} light={mx(0.3, 0.18, cool)} clock={T * 0.05}
      table={
        <g>
          <KitchenTable t={T} light={0.25} cupHis={false} cupHer steamHer={0} pot={false} />
          <g opacity={set} transform={`translate(${HIS} ${KT})`}>
            <ellipse cx={0} cy={-2} rx={78} ry={9} fill="#0b0705" />
            <ellipse cx={0} cy={-3} rx={78} ry={9} fill="none" stroke="#ffdca0" strokeWidth={2} opacity={0.5} />
            <rect x={96} y={-4} width={6} height={4} fill="#0b0705" />
            <path d="M118,-3 L190,-3" stroke="#0b0705" strokeWidth={5} strokeLinecap="round" />
          </g>
        </g>
      }
    >
      <Stove x={-110} />
      <Pie x={60} y={1326} s={1} light={mx(1, 0.35, cool)} />
      <Steam x={60} y={1260} t={T} s={0.55 * (1 - ez(T, 79.1, 81.1))} h={220} seed={5} />
      <circle cx={60} cy={1200} r={300} fill="#ffb866" opacity={0.1 * (1 - cool * 0.7)} filter="url(#fogb)" style={{ mixBlendMode: "screen" }} />
      <Man x={380} flip t={T} age={0.2} front="#fff1cf" fa={0.3} back="#7f9fd0" ba={0.45} pose={{ armF: [6, 14], armB: [-4, 12], legF: [4, -2], legB: [-4, -2], head: mx(18, 30, k), lean: 8 }} />
    </Kit>
  );
};

/* ================================================================ 22. the phone in the dark (84.2 - 87.1) */

const S22: React.FC<{ T: number }> = ({ T }) => {
  const k = ez(T, 84.2, 87.1);
  const raise = ez(T, 84.4, 85.4);
  return (
    <Scene z={mx(1.35, 1.55, k)} px={420} py={1290}>
      <FlatBack t={T} tv={0} sky={["#04070d", "#0e1a2c"]} />
      <Seated x={300} t={T} front="#9cd0ff" fa={mx(0.2, 0.9, raise)} back="#000" ba={0} pose={{ lean: mx(-2, 10, raise), head: mx(0, 24, raise), armF: [mx(20, 60, raise), mx(40, 76, raise)], armB: [30, 60] }} hand={glowHand("#bfe0ff", raise)} />
    </Scene>
  );
};

/* ================================================================ 23. the call history (87.1 - 99.0) */

const S23: React.FC<{ T: number }> = ({ T }) => {
  const focus = ez(T, 90.5, 92.2) * (1 - 0) ;
  const zoom = ez(T, 90.6, 95.4);
  const zoom2 = ez(T, 95.8, 98.6);
  const pulse = ez(T, 91.0, 92.5);
  return (
    <Scene z={mx(mx(1.0, 2.1, zoom), 2.4, zoom2)} px={mx(540, 560, zoom)} py={mx(960, 600, zoom)}>
      <Bokeh t={T} a="#0e1620" b="#06080c" seed={17} n={20} op={0.3} hot="#ff9a8a" />
      <Phone x={540} y={790} s={1.5} glow={mixc("#8fc4ff", "#ff5a4d", focus)}>
        <HistoryScreen T={T} focus={focus} pulse={pulse} />
      </Phone>
    </Scene>
  );
};

/* ================================================================ 24. call mum (99.0 - end) */

const S24: React.FC<{ T: number }> = ({ T }) => {
  const k = ez(T, 99.0, 105.5);
  return (
    <Scene z={mx(1.0, 1.12, ez(T, 99, 110))} px={540} py={960}>
      <Bokeh t={T} a="#2a180c" b="#08060a" seed={21} n={26} op={0.4} hot="#ffcf8a" />
      <Phone x={540} y={790} s={1.5} glow={mixc("#ffcf8a", "#7fe0a0", k)}>
        <ContactScreen T={T} k={k} />
      </Phone>
    </Scene>
  );
};

/* ================================================================ the film */

type Shot = { a: number; C: React.FC<{ T: number }>; hard?: boolean };
const SHOTS: Shot[] = [
  { a: 0, C: S1 },
  { a: 3.8, C: S2 },
  { a: 8.0, C: S3 },
  { a: 10.15, C: S4 },
  { a: 12.2, C: S5 },
  { a: 20.0, C: S6 },
  { a: 29.8, C: S7 },
  { a: 35.9, C: S8, hard: true },
  { a: 38.2, C: S9, hard: true },
  { a: 39.8, C: S10, hard: true },
  { a: 41.7, C: S11, hard: true },
  { a: 44.45, C: S12 },
  { a: 47.4, C: S13 },
  { a: 57.0, C: S14 },
  { a: 60.7, C: S15 },
  { a: 63.5, C: S16 },
  { a: 67.0, C: S17, hard: true },
  { a: 71.5, C: S18 },
  { a: 74.5, C: S19 },
  { a: 77.0, C: S20, hard: true },
  { a: 79.1, C: S21 },
  { a: 84.2, C: S22 },
  { a: 87.1, C: S23 },
  { a: 99.0, C: S24 },
];

export const Call: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const T = frame / FPS;
  let i = 0;
  for (let j = 0; j < SHOTS.length; j++) if (T >= SHOTS[j].a) i = j;
  const C = SHOTS[i].C;
  let dip = 0;
  for (const s of SHOTS.slice(1)) {
    const d = s.hard ? 0.05 : 0.2;
    const q = 1 - Math.min(1, Math.abs(T - s.a) / d);
    dip = Math.max(dip, q * (s.hard ? 0.5 : 1));
  }
  const total = dur / FPS;
  const fade = Math.max(ez(T, 0, 0.7, 1, 0), ez(T, 71.1, 71.5, 0, 1) * (T < 71.5 ? 1 : 0), ez(T, 107.0, 110.2, 0, 1), dip);
  return (
    <AbsoluteFill style={{ backgroundColor: "#030406" }}>
      <C T={T} />
      <AbsoluteFill style={{ backgroundColor: "#030406", opacity: Math.min(1, fade) }} />
      {T > total + 1 && null}
    </AbsoluteFill>
  );
};

export const SCENES8: Record<string, React.FC<{ dur: number }>> = { all: Call };
void [Cup, FONT, LA, LE, Phone, Laptop];
