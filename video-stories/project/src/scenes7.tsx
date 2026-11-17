import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import vo from "./vo6.json";
import { walk } from "./art";
import type { Pose } from "./art";
import { Particles, Stage2, ez } from "./art2";
import { cam } from "./art4";
import { LadyS } from "./art5";
import { INK6, Lit6, ManS, mixc } from "./art6";
import { Cup, HER, HIS, KF, KT, KitchenBack, KitchenTable, Steam, Teapot } from "./art7";
import type { KitP } from "./art7";

const FPS = 30;
const LA = (i: number) => vo.lines[i].start;
const LE = (i: number) => vo.lines[i].end;
const mx = (a: number, b: number, k: number) => a + (b - a) * k;
type Sky = [string, string];
const MORN: Sky = ["#f2b477", "#fff0c8"];
const DAWN: Sky = ["#3a5078", "#e8b890"];
const GREY: Sky = ["#93a4b6", "#dfe2de"];
const NIGHT: Sky = ["#0b1830", "#3a5078"];
const mixSky = (a: Sky, b: Sky, k: number): Sky => [mixc(a[0], b[0], k), mixc(a[1], b[1], k)];

const MS = 1.35;
const SEAT_Y = 1400 + 152 * MS;
const SEAT_X = 200;

type TableP = { cupHis?: boolean; cupHer?: boolean; steamHis?: number; steamHer?: number; pot?: boolean; ring?: number };
const Kit: React.FC<KitP & TableP & { z: number; px: number; py: number; back?: React.ReactNode; children?: React.ReactNode; dark?: number }> = ({ z, px, py, back, children, dark = 0, cupHis, cupHer, steamHis, steamHer, pot, ring, ...k }) => (
  <Stage2 cam={{ s: 1, x: 540, y: 960 }} vcam={cam(z, px, py)} ref0={{ x: 540, y: 960 }}>
    <KitchenBack {...k} />
    {back}
    <KitchenTable t={k.t} light={k.light} cupHis={cupHis} cupHer={cupHer} steamHis={steamHis} steamHer={steamHer} pot={pot} ring={ring} />
    {children}
    <Particles t={k.t} area={[200, 500, 900, 1500]} n={34} seed={3} color="#ffe9c0" size={2.2} rise={6} op={0.55 * (k.light ?? 1)} />
    {dark > 0 && <rect x={-900} y={-900} width={3400} height={3900} fill="#050302" opacity={dark} />}
  </Stage2>
);

const Man: React.FC<{ x: number; y?: number; t: number; pose: Pose; age?: number; flip?: boolean; warm?: number; hand?: (f: string) => React.ReactNode; handB?: (f: string) => React.ReactNode }> = ({ x, y = KF, t, pose, age = 0, flip, warm = 0.6, hand, handB }) => (
  <Lit6 warm={warm} cold={0.25} flip={flip} render={(f) => <ManS x={x} y={y} s={MS} flip={flip} t={t} fill={f} age={age} pose={pose} hand={hand?.(f)} handB={handB?.(f)} />} />
);
const SIT: Pose = { legF: [88, -88], legB: [80, -82] };
const Seated: React.FC<{ t: number; pose: Pose; age?: number; warm?: number; hand?: (f: string) => React.ReactNode }> = ({ t, pose, age, warm, hand }) => <Man x={SEAT_X} y={SEAT_Y} t={t} age={age} warm={warm} pose={{ ...SIT, ...pose }} hand={hand} />;
const Lady: React.FC<{ x: number; t: number; pose: Pose; flip?: boolean; bun?: boolean; s?: number; op?: number; hand?: (f: string) => React.ReactNode }> = ({ x, t, pose, flip, bun, s = 1.3, op = 1, hand }) => (
  <g opacity={op}>
    <Lit6 warm={0.6} cold={0.25} flip={flip} render={(f) => <LadyS x={x} y={KF} s={s} flip={flip} t={t} fill={f} wind={0.08} pose={pose} bun={bun} hand={hand?.(f)} />} />
  </g>
);
const cupHand = (f: string) => (
  <g transform="translate(0,10)">
    <Cup x={0} y={30} s={1 / MS} saucer={false} fill={f} rim={0} />
  </g>
);

/** teapot held in the air, pouring into a cup at (cx) */
const Pour: React.FC<{ x: number; y: number; cx: number; t: number; k: number }> = ({ x, y, cx, t, k }) => {
  const tilt = mx(8, 34, k);
  const a = (tilt * Math.PI) / 180;
  const sx = x + 82 * Math.cos(a) - -67 * Math.sin(a);
  const sy = y + 82 * Math.sin(a) + -67 * Math.cos(a);
  return (
    <g>
      {k > 0.6 && (
        <>
          <path d={`M${sx},${sy} Q${sx + 14},${sy + 30} ${cx + Math.sin(t * 30) * 1.5},${KT - 44}`} stroke="#ffe6b0" strokeWidth={4.5} fill="none" strokeLinecap="round" opacity={0.9} />
          <ellipse cx={cx} cy={KT - 46} rx={15} ry={4} fill="#ffe6b0" opacity={0.6} />
        </>
      )}
      <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
        <Teapot />
      </g>
    </g>
  );
};

/* ---------------------------------------------------------------- shots */

const S1: React.FC<{ T: number }> = ({ T }) => {
  const w1 = ez(T, 1.2, 5.4, 0, 1, (n) => n);
  const w2 = ez(T, 6.9, 8.1, 0, 1, (n) => n);
  const x = mx(mx(40, 330, w1), 560, w2);
  const moving = (w1 > 0 && w1 < 1) || (w2 > 0 && w2 < 1);
  const p = (x * 2 * Math.PI) / (262 * MS);
  const put1 = ez(T, 5.7, 6.4) * (1 - ez(T, 6.5, 6.9));
  const put2 = ez(T, 8.1, 8.7) * (1 - ez(T, 8.8, 9.2));
  const c1 = T > 6.45;
  const c2 = T > 8.75;
  const k = ez(T, 0, 9.4);
  return (
    <Kit t={T} sky={mixSky(DAWN, MORN, ez(T, 0, 5))} light={mx(0.6, 1, ez(T, 0, 5))} z={mx(1.0, 1.1, k)} px={540} py={mx(1000, 1050, k)} cupHis={c1} cupHer={c2} steamHis={c1 ? ez(T, 6.45, 7.2) : 0} steamHer={c2 ? ez(T, 8.75, 9.3) : 0} pot back={<Lady x={810} flip t={T} pose={{ armF: [14, 26], armB: [-6, 14], head: -3 }} />}>
      <Man x={x} y={KF - (moving ? Math.abs(Math.sin(p)) * 4 : 0)} t={T} pose={moving ? { ...walk(p, 0.5), armF: [52, 62], armB: [46, 66] } : { armF: [mx(52, 34, Math.max(put1, put2)), mx(62, 40, Math.max(put1, put2))], armB: [46, 66], legF: [5, -2], legB: [-5, -2], lean: 10 * Math.max(put1, put2) }} hand={!c2 ? cupHand : undefined} handB={!c1 ? cupHand : undefined} />
    </Kit>
  );
};

const S2: React.FC<{ T: number }> = ({ T }) => {
  const lift = ez(T, 9.6, 10.3) * (1 - ez(T, 11.6, 12.2));
  const sip = ez(T, 10.3, 10.9) * (1 - ez(T, 11.2, 11.6));
  const grum = ez(T, LA(4), LA(4) + 0.3) * (1 - ez(T, LA(4) + 1.0, LA(4) + 1.3));
  const pour = ez(T, 13.6, 14.3) * (1 - ez(T, 16.0, 16.6));
  const inHand = lift > 0.35;
  const k = ez(T, 9.38, 16.84);
  return (
    <Kit t={T} sky={MORN} light={1} z={mx(1.42, 1.54, k)} px={600} py={1205} cupHer={!inHand} steamHis={1} steamHer={inHand ? 0 : 0.8 + 0.4 * pour} pot={pour < 0.05} back={<Lady x={810} flip t={T} pose={{ armF: [mx(14, 64, lift) + 10 * sip, mx(26, 30, lift) + 86 * sip], armB: [-6, 14], head: -3 - 8 * sip }} hand={inHand ? cupHand : undefined} />}>
      <Man x={540} t={T} pose={{ armF: [mx(14, 84, pour), mx(20, 8, pour)], armB: [-6, 12], legF: [5, -2], legB: [-5, -2], head: Math.sin(T * 13) * 7 * grum, lean: 4 * pour }} />
      {pour > 0.05 && <Pour x={mx(560, 606, pour)} y={KT - mx(60, 150, pour)} cx={HER} t={T} k={pour} />}
    </Kit>
  );
};

const S3: React.FC<{ T: number }> = ({ T }) => {
  const open = ez(T, 17.0, 17.8) * (1 - ez(T, 20.5, 20.9));
  const w = ez(T, 17.0, 19.0, 0, 1, (n) => n);
  const back = T > 19.05 && T < 20.25;
  const out = ez(T, 20.25, 20.75);
  const x = mx(810, 1100, w) + out * 70;
  const p = (x * 2 * Math.PI) / (262 * 1.3);
  const wave = ez(T, 19.1, 19.5) * (1 - ez(T, 20.0, 20.3));
  const k = ez(T, 16.84, 20.9);
  return (
    <Kit t={T} sky={MORN} light={mx(1, 0.75, ez(T, 20.5, 20.9))} door={open} z={mx(1.12, 1.2, k)} px={mx(700, 800, k)} py={1130} steamHis={0.9} steamHer={0.8} pot>
      <Man x={540} t={T} pose={{ armF: [mx(8, 40, ez(T, 18.6, 19.4)), 30], armB: [-6, 12], legF: [5, -2], legB: [-5, -2], head: -2 }} />
      <Lady x={x} flip={back} t={T} op={1 - out} pose={{ armF: back ? [mx(20, 150, wave) + Math.sin(T * 9) * 8 * wave, 20] : [10 + 10 * Math.sin(p), 24], armB: [-4, 8], head: -3 }} hand={undefined} />
      <g opacity={1 - out}>
        <rect x={x + (back ? 26 : -64)} y={KF - 150} width={56} height={74} rx={8} fill={INK6} />
        <rect x={x + (back ? 44 : -46)} y={KF - 170} width={20} height={24} rx={8} fill="none" stroke={INK6} strokeWidth={5} />
      </g>
    </Kit>
  );
};

const S4a: React.FC<{ T: number }> = ({ T }) => {
  const k = ez(T, 20.9, 23.6);
  return <Kit t={T} sky={mixSky(MORN, GREY, 0.5)} light={0.72} z={mx(2.2, 2.6, k)} px={mx(590, 640, k)} py={1245} steamHis={0.5} steamHer={0} pot />;
};

const S4b: React.FC<{ T: number }> = ({ T }) => {
  const pour = ez(T, 23.7, 24.3) * (1 - ez(T, 25.5, 25.95));
  const k = ez(T, 23.6, 26.0);
  return (
    <Kit t={T} sky={mixSky(MORN, GREY, 0.3)} light={0.85} z={mx(1.45, 1.52, k)} px={600} py={1205} steamHis={1} steamHer={ez(T, 24.3, 25.2)} pot={pour < 0.05}>
      <Man x={540} t={T} pose={{ armF: [mx(14, 84, pour), mx(20, 8, pour)], armB: [-6, 12], legF: [5, -2], legB: [-5, -2], head: 6, lean: 4 * pour }} />
      {pour > 0.05 && <Pour x={mx(560, 606, pour)} y={KT - mx(60, 150, pour)} cx={HER} t={T} k={pour} />}
    </Kit>
  );
};

const S5: React.FC<{ T: number }> = ({ T }) => {
  const sip = ez(T, 26.6, 27.3) * (1 - ez(T, 28.0, 28.6));
  const push = ez(T, 28.6, 32.2);
  const her = 1 - ez(T, 27.0, 32.7);
  return (
    <Kit t={T} sky={mixSky(MORN, GREY, 0.3)} light={0.85} z={mx(1.2, 3.0, push)} px={mx(520, HER, push)} py={mx(1200, 1215, push)} cupHis={sip < 0.3} steamHis={sip < 0.3 ? 0.9 : 0} steamHer={her} pot back={<Seated t={T} pose={{ lean: 8, head: mx(6, -4, sip), armF: [mx(52, 76, sip), mx(40, 128, sip)], armB: [34, 44] }} hand={sip >= 0.3 ? cupHand : undefined} />} />
  );
};

const S6: React.FC<{ T: number }> = ({ T }) => {
  const u = Math.max(0, T - 33.5);
  const ph = u * 1.5 + u * u * 0.4;
  const dn = 0.5 + 0.5 * Math.sin(ph * Math.PI * 2);
  const season = ez(T, 33.9, 38.7, 0, 1, (n) => n);
  const dayCol: Sky = season < 0.2 ? MORN : season < 0.45 ? ["#9cc4ea", "#f4eeb8"] : season < 0.7 ? ["#c9a070", "#f2c890"] : ["#aab8c8", "#eef2f4"];
  const leaves = season < 0.2 ? "#7fb858" : season < 0.45 ? "#3f7f45" : season < 0.7 ? "#d9822b" : null;
  const sip = Math.max(0, Math.sin(ph * Math.PI * 2 - 1)) ** 2;
  return (
    <Kit t={T} sky={mixSky(NIGHT, dayCol, dn)} light={0.3 + 0.7 * dn} leaves={leaves} snow={season > 0.74 ? 1 : 0} plant={ez(T, 34.2, 38.8)} clock={u * 1.7} z={mx(1.0, 1.06, u / 5.5)} px={540} py={1010} cupHis={sip < 0.4} steamHis={dn * 0.9} steamHer={Math.max(0, Math.sin(ph * Math.PI * 2)) ** 6 * (1 - season) * 0.7} pot back={<Seated t={T} age={season * 0.45} warm={0.2 + 0.5 * dn} pose={{ lean: 8 + 8 * season, head: 8, armF: [mx(52, 76, sip), mx(40, 128, sip)], armB: [34, 44] }} hand={sip >= 0.4 ? cupHand : undefined} />} />
  );
};

const S7: React.FC<{ T: number }> = ({ T }) => {
  const open = ez(T, 39.2, 39.9) * (1 - ez(T, 46.3, 47.1));
  const step = ez(T, 39.6, 40.8);
  const point = ez(T, LA(15) - 0.2, LA(15) + 0.4) * (1 - ez(T, LE(15) + 0.1, LE(15) + 0.5));
  const shake = ez(T, LA(16) - 0.1, LA(16) + 0.2) * (1 - ez(T, LE(16), LE(16) + 0.3));
  const leave = ez(T, 45.3, 46.3);
  const close = ez(T, 44.6, 46.0);
  return (
    <Kit t={T} sky={GREY} light={0.7} snow={1} plant={1} door={open} z={mx(1.0, 1.6, close)} px={mx(640, 340, close)} py={mx(1050, 1240, close)} steamHis={0.8} steamHer={0} pot back={<Seated t={T} age={0.5} pose={{ lean: mx(10, 18, close), head: mx(-4, 22, ez(T, 44.9, 46.2)), armF: [50, 44], armB: [42, 50] }} />}>
      <Lady x={mx(1150, 1075, step) + leave * 90} flip bun s={1.22} t={T} op={1 - leave} pose={{ armF: [mx(16, 80, point), mx(30, 8, point)], armB: [-6, 16], head: Math.sin(T * 12) * 6 * shake - 2, lean: 3 }} />
    </Kit>
  );
};

const S8: React.FC<{ T: number }> = ({ T }) => {
  const w = ez(T, 48.0, 51.5, 0, 1, (n) => n);
  const x = mx(30, 330, w);
  const p = (x * 2 * Math.PI) / (262 * MS);
  const put = ez(T, 51.5, 52.0);
  const has = T < 51.95;
  const k = ez(T, 47.75, 52.5);
  return (
    <Kit t={T} sky={mixSky(DAWN, MORN, k)} light={mx(0.5, 0.95, k)} plant={1} z={mx(1.0, 1.06, k)} px={540} py={1010} cupHis={!has} cupHer steamHis={0} steamHer={0} pot>
      <Man x={x} y={KF - (w < 1 ? Math.abs(Math.sin(p)) * 4 : 0)} t={T} age={0.5} pose={w < 1 ? { ...walk(p, 0.45), lean: 8, head: 8, armF: [52, 62] } : { armF: [mx(52, 34, put), mx(62, 40, put)], armB: [-4, 12], legF: [5, -2], legB: [-5, -2], lean: 8 + 8 * put, head: 8 }} hand={has ? cupHand : undefined} />
    </Kit>
  );
};

const S9: React.FC<{ T: number }> = ({ T }) => {
  const pour = ez(T, 52.7, 53.2) * (1 - ez(T, 54.3, 54.8));
  const sit = ez(T, 55.0, 55.9);
  const push = ez(T, LA(21) - 0.2, LE(21) + 0.2);
  return (
    <Kit t={T} sky={MORN} light={0.95} plant={1} z={mx(1.06, 2.0, push)} px={mx(540, 540, push)} py={mx(1010, 1215, push)} cupHer steamHis={ez(T, 53.2, 54.2)} steamHer={0} pot={pour < 0.05} back={sit > 0.02 ? <Man x={mx(330, SEAT_X, sit)} y={mx(KF, SEAT_Y, sit)} t={T} age={0.5} pose={{ legF: [88 * sit, -88 * sit], legB: [80 * sit, -82 * sit], lean: 10, head: mx(8, 16, push), armF: [mx(14, 50, sit), mx(20, 44, sit)], armB: [mx(-4, 40, sit), mx(12, 50, sit)] }} /> : undefined}>
      {sit <= 0.02 && <Man x={330} t={T} age={0.5} pose={{ armF: [mx(14, 80, pour), mx(20, 8, pour)], armB: [-4, 12], legF: [5, -2], legB: [-5, -2], lean: 8, head: 8 }} />}
      {pour > 0.05 && <Pour x={mx(330, 318, pour)} y={KT - mx(60, 150, pour)} cx={HIS} t={T} k={pour} />}
    </Kit>
  );
};

const S10: React.FC<{ T: number }> = ({ T }) => {
  const up = ez(T, LA(23) - 0.1, LE(23) + 0.2);
  const k = ez(T, 59.4, 62.7);
  return <Kit t={T} sky={MORN} light={0.95} plant={1} z={mx(1.5, 1.3, k)} px={mx(400, 470, k)} py={mx(1235, 1190, k)} cupHer steamHis={0.9} steamHer={0} pot back={<Man x={mx(SEAT_X, 330, up)} y={mx(SEAT_Y, KF, up)} t={T} age={0.5} pose={{ legF: [88 * (1 - up), -88 * (1 - up)], legB: [80 * (1 - up), -82 * (1 - up)], lean: mx(16, 6, up), head: mx(22, 8, up), armF: [mx(50, 10, up), mx(44, 16, up)], armB: [mx(42, -4, up), mx(50, 12, up)] }} />} />;
};

const S11: React.FC<{ T: number }> = ({ T }) => {
  const reach = ez(T, 62.8, 63.4);
  const lift = ez(T, 63.45, 64.4);
  const k = ez(T, 62.7, 64.6);
  const mxn = 641;
  const a1 = mx(mx(8, 22, reach), 50, lift);
  const a2 = mx(mx(14, 6, reach), 60, lift);
  const r = Math.PI / 180;
  const hx = mxn + 16 * MS + (Math.sin(a1 * r) * 56 + Math.sin((a1 + a2) * r) * 52) * MS;
  const hy = KF - (152 + 94) * MS + (Math.cos(a1 * r) * 56 + Math.cos((a1 + a2) * r) * 52) * MS;
  const held = lift > 0.001;
  return (
    <Kit t={T} sky={MORN} light={0.95} plant={1} z={mx(2.3, 2.6, k)} px={mx(640, 680, k)} py={mx(1230, 1170, k)} cupHer={!held} steamHis={0.9} steamHer={0} ring={lift} pot>
      <Man x={mxn} t={T} age={0.5} pose={{ armF: [a1, a2], armB: [-4, 12], legF: [5, -2], legB: [-5, -2], lean: 0, head: 16 }} />
      {held && <Cup x={hx - 34} y={hy + 22} />}
    </Kit>
  );
};

const S14: React.FC<{ T: number }> = ({ T }) => {
  const k = ez(T, 70.9, 77.27);
  const sip = ez(T, 72.2, 72.9) * (1 - ez(T, 73.8, 74.5));
  return <Kit t={T} sky={MORN} light={1} plant={1} hope={ez(T, 71.2, 74.5)} z={mx(1.12, 1.0, k)} px={540} py={mx(1080, 1000, k)} cupHis={sip < 0.3} cupHer={false} steamHis={sip < 0.3 ? 1 : 0} steamHer={0} ring={0.6} pot back={<Seated t={T} age={0.5} pose={{ lean: 8, head: mx(6, -4, sip), armF: [mx(52, 76, sip), mx(40, 128, sip)], armB: [34, 44] }} hand={sip >= 0.3 ? cupHand : undefined} />} />;
};

/* ---------------------------------------------------------------- inserts */

const Bg: React.FC<{ T: number; cool?: boolean }> = ({ T, cool }) => (
  <AbsoluteFill style={{ backgroundColor: "#0a0604" }}>
    <AbsoluteFill style={{ background: cool ? "radial-gradient(ellipse at 50% 20%, rgba(255,236,196,0.85) 0%, rgba(170,120,60,0.4) 36%, rgba(10,6,3,0) 76%)" : "radial-gradient(ellipse at 50% 46%, rgba(255,196,120,0.75) 0%, rgba(140,80,30,0.45) 40%, rgba(10,6,3,0) 80%)" }} />
    <div style={{ position: "absolute", left: 220 + Math.sin(T) * 6, top: 120, width: 640, height: 640, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,244,214,0.5) 0%, rgba(255,220,160,0) 66%)", filter: "blur(30px)", opacity: cool ? 1 : 0 }} />
  </AbsoluteFill>
);

const Wash: React.FC<{ T: number }> = ({ T }) => {
  const k = ez(T, 64.6, 65.75);
  const drops = Array.from({ length: 16 }, (_, i) => {
    const u = ((T * 2.2 + i * 0.137) % 1 + 1) % 1;
    const a = (i / 16) * Math.PI - Math.PI;
    return { x: 540 + Math.cos(a) * (60 + u * 260), y: 1040 + Math.sin(a) * u * 200 + u * u * 300, o: 1 - u, r: 5 + (i % 3) * 3 };
  });
  return (
    <AbsoluteFill>
      <Bg T={T} cool />
      <svg viewBox="0 0 1080 1920" style={{ position: "absolute", width: "100%", height: "100%", scale: String(mx(1.0, 1.08, k)) }}>
        <defs>
          <filter id="wb" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>
        <g fill="#080503">
          <rect x={500} y={-40} width={80} height={330} rx={30} />
          <rect x={300} y={250} width={300} height={70} rx={34} />
          <rect x={300} y={270} width={70} height={110} rx={26} />
        </g>
        <path d={`M335,380 Q${338 + Math.sin(T * 22) * 3},700 ${520 + Math.sin(T * 17) * 5},1020`} stroke="#eaf6ff" strokeWidth={22} fill="none" strokeLinecap="round" opacity={0.85} />
        <path d={`M335,380 Q${338 + Math.sin(T * 22) * 3},700 ${520 + Math.sin(T * 17) * 5},1020`} stroke="#ffffff" strokeWidth={7} fill="none" strokeLinecap="round" />
        {drops.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#eaf6ff" opacity={d.o * 0.8} />
        ))}
        <g transform={`rotate(${-14 + Math.sin(T * 5) * 4} 560 1160)`}>
          <Cup x={560} y={1330} s={7.2} saucer={false} rim={0} />
        </g>
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 42%, rgba(4,2,1,0.75) 100%)" }} />
    </AbsoluteFill>
  );
};

const Cupboard: React.FC<{ T: number }> = ({ T }) => {
  const put = ez(T, 65.9, 67.1);
  const away = ez(T, 67.1, 67.9);
  const shut = ez(T, 68.0, 70.4);
  const k = ez(T, 65.75, 70.9);
  const cx = mx(980, 730, put);
  const cy = mx(1500, 1066, put);
  return (
    <AbsoluteFill>
      <Bg T={T} />
      <svg viewBox="0 0 1080 1920" style={{ position: "absolute", width: "100%", height: "100%", scale: String(mx(1.0, 1.05, k)) }}>
        <defs>
          <filter id="cb" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <linearGradient id="cdoor" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#1c110a" />
            <stop offset="0.08" stopColor="#0d0805" />
            <stop offset="1" stopColor="#060403" />
          </linearGradient>
        </defs>
        <rect x={100} y={420} width={880} height={1000} fill="#3a2414" />
        <rect x={100} y={420} width={880} height={1000} fill="#ffc77a" opacity={0.22} />
        <g fill="#080503">
          <rect x={60} y={380} width={960} height={50} />
          <rect x={60} y={1410} width={960} height={60} />
          <rect x={60} y={380} width={50} height={1090} />
          <rect x={970} y={380} width={50} height={1090} />
          <rect x={100} y={1066} width={880} height={22} />
          <rect x={100} y={740} width={880} height={18} />
        </g>
        <rect x={100} y={1066} width={880} height={4} fill="#ffdca0" opacity={0.5} />
        {[230, 400, 565].map((x, i) => (
          <Cup key={i} x={x} y={1066} s={2.6} saucer={false} flip={i === 1} />
        ))}
        {[250, 470, 700].map((x, i) => (
          <rect key={i} x={x} y={640 - (i % 2) * 30} width={120} height={100 + (i % 2) * 30} rx={12} fill="#080503" />
        ))}
        <Cup x={cx} y={cy} s={2.6} saucer={false} />
        <g fill="#060403" opacity={1 - away} transform={`translate(${away * 260} ${away * 320})`}>
          <path d={`M${cx + 60},${cy - 90} Q${cx + 130},${cy - 120} ${cx + 160},${cy - 40} L${cx + 620},${cy + 520} L${cx + 380},${cy + 660} L${cx + 70},${cy - 10}Z`} />
        </g>
        {shut > 0 && (
          <g>
            <rect x={1020 - 960 * shut} y={380} width={960 * shut + 4} height={1090} fill="url(#cdoor)" />
            <rect x={1020 - 960 * shut} y={380} width={10} height={1090} fill="#ffdca0" opacity={0.28 * (1 - shut)} />
            <circle cx={1020 - 960 * shut + 70} cy={930} r={16} fill="#2a1a0e" />
          </g>
        )}
      </svg>
      <AbsoluteFill style={{ backgroundColor: "#050302", opacity: 0.8 * ez(T, 69.6, 70.6) }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 42%, rgba(4,2,1,0.75) 100%)" }} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- the film */

export const Cups: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const T = frame / FPS;
  let shot: React.ReactNode;
  if (T < 9.38) shot = <S1 T={T} />;
  else if (T < 16.84) shot = <S2 T={T} />;
  else if (T < 20.9) shot = <S3 T={T} />;
  else if (T < 23.6) shot = <S4a T={T} />;
  else if (T < 26.0) shot = <S4b T={T} />;
  else if (T < 33.5) shot = <S5 T={T} />;
  else if (T < 39.05) shot = <S6 T={T} />;
  else if (T < 47.75) shot = <S7 T={T} />;
  else if (T < 52.5) shot = <S8 T={T} />;
  else if (T < 59.4) shot = <S9 T={T} />;
  else if (T < 62.7) shot = <S10 T={T} />;
  else if (T < 64.6) shot = <S11 T={T} />;
  else if (T < 65.75) shot = <Wash T={T} />;
  else if (T < 70.9) shot = <Cupboard T={T} />;
  else shot = <S14 T={T} />;
  const fade = Math.max(ez(frame, 0, 30, 1, 0), ez(frame, dur - 100, dur - 10, 0, 1), ez(T, 70.6, 70.9) * (T < 70.9 ? 1 : 0), T >= 70.9 ? ez(T, 70.9, 71.6, 1, 0) : 0);
  return (
    <AbsoluteFill style={{ backgroundColor: "#050302" }}>
      {shot}
      <AbsoluteFill style={{ backgroundColor: "#050302", opacity: fade }} />
    </AbsoluteFill>
  );
};

export const SCENES7: Record<string, React.FC<{ dur: number }>> = { all: Cups };
void [Steam, LE];
