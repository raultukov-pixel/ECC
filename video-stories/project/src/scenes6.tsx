import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { walk } from "./art";
import type { Pose } from "./art";
import { Particles, Stage2, ez } from "./art2";
import { Blizzard, Flakes, cam } from "./art4";
import { Ash, Ball, DESK, FIREX, FLOOR, INK6, Lit6, ManS, Quill, RED, RoomBack, RoomDesk, mixc } from "./art6";
import type { RoomP } from "./art6";
import { FONT } from "./fonts";

const FPS = 30;
const mx = (a: number, b: number, k: number) => a + (b - a) * k;
const NIGHT: [string, string] = ["#0b1830", "#4a6a98"];
const DAWN: [string, string] = ["#f2b889", "#f6dcb0"];
const DAY: [string, string] = ["#9cc4ea", "#dcebf7"];
const DUSK: [string, string] = ["#b4526a", "#f0a060"];
const mixSky = (a: [string, string], b: [string, string], k: number): [string, string] => [mixc(a[0], b[0], k), mixc(a[1], b[1], k)];
const skyAt = (ph: number): [string, string] => {
  const p = ((ph % 1) + 1) % 1;
  if (p < 0.2) return mixSky(NIGHT, DAWN, p / 0.2);
  if (p < 0.35) return mixSky(DAWN, DAY, (p - 0.2) / 0.15);
  if (p < 0.6) return DAY;
  if (p < 0.78) return mixSky(DAY, DUSK, (p - 0.6) / 0.18);
  return mixSky(DUSK, NIGHT, (p - 0.78) / 0.22);
};

/* ---------------------------------------------------------------- room wrapper */

const SEAT_S = 1.35;
const SEAT_Y = 1400 + 152 * SEAT_S;

const Room: React.FC<RoomP & { z: number; px: number; py: number; children?: React.ReactNode; ashFly?: number; dark?: number; paper?: boolean }> = ({ z, px, py, children, ashFly = 0, dark = 0, paper, ...p }) => (
  <Stage2 cam={{ s: 1, x: 540, y: 960 }} vcam={cam(z, px, py)} ref0={{ x: 540, y: 960 }}>
    <RoomBack {...p} />
    <RoomDesk {...p} paper={paper} />
    {children}
    <Ash t={p.t} op={ashFly} />
    <Particles t={p.t} area={[300, 700, 1000, 1500]} n={26} seed={3} color="#ffd9a0" size={2.2} rise={8} op={0.5 * (p.candle ?? 1)} />
    {dark > 0 && <rect x={-900} y={-900} width={2900} height={3900} fill="#050302" opacity={dark} />}
  </Stage2>
);

const quillHand = (f: string) => (
  <g transform="translate(0,12) rotate(38)">
    <Quill fill={f} s={0.62} />
  </g>
);
const sheetHand = (f: string) => <path d="M-26,4 L26,-2 L30,44 L-22,50Z" fill={f === INK6 ? "#f2e2c0" : f} />;
const envHand = (f: string) => (
  <g>
    <path d="M-30,4 L30,0 L32,40 L-28,44Z" fill={f === INK6 ? "#ecdcb8" : f} />
    {f === INK6 && <circle cx={2} cy={22} r={5} fill={RED} />}
  </g>
);

const Seated: React.FC<{ t: number; pose: Pose; age?: number; candle?: number; hand?: (f: string) => React.ReactNode; handB?: (f: string) => React.ReactNode }> = ({ t, pose, age = 0, candle = 1, hand, handB }) => (
  <Lit6 warm={0.75 * candle} cold={0.4} render={(f) => <ManS x={380} y={SEAT_Y} s={SEAT_S} t={t} fill={f} age={age} pose={{ legF: [88, -88], legB: [80, -82], ...pose }} hand={hand?.(f)} handB={handB?.(f)} />} />
);
const WRITE = (t: number, age = 0): Pose => ({ lean: 10 + 12 * age, head: 14 + 6 * age, armF: [40 + Math.sin(t * 7) * 1.5, 50 + Math.sin(t * 9) * 3], armB: [34, 44] });

/* ---------------------------------------------------------------- shots in the room */

const S1: React.FC<{ T: number }> = ({ T }) => {
  const walkK = ez(T, 1.4, 4.9, 0, 1, (n) => n);
  const sit = ez(T, 5.0, 6.1);
  const x = mx(60, 380, walkK);
  const light = ez(T, 7.0, 7.5);
  const reach = ez(T, 6.4, 7.0) * (1 - ez(T, 7.25, 7.6));
  const k = ez(T, 0, 7.6);
  const moving = walkK > 0 && walkK < 1;
  const p = (x * 2 * Math.PI) / (262 * SEAT_S);
  return (
    <Room t={T} sky={NIGHT} candle={light} fire={0.55} z={mx(1.0, 1.12, k)} px={540} py={mx(990, 1060, k)} paper={false}>
      <Lit6
        warm={0.75 * light + 0.15}
        cold={0.5}
        render={(f) => (
          <ManS
            x={x}
            y={mx(FLOOR, SEAT_Y, sit) - (moving ? Math.abs(Math.sin(p)) * 4 : 0)}
            s={SEAT_S}
            t={T}
            fill={f}
            coat={sit < 0.3}
            pose={moving ? { ...walk(p, 0.6), lean: 5, head: 8 } : { legF: [88 * sit, -88 * sit], legB: [80 * sit, -82 * sit], lean: 6 * sit, head: 10, armF: [mx(8, 84, reach), mx(12, 14, reach)], armB: [mx(-6, 30, sit), mx(10, 40, sit)] }}
          />
        )}
      />
    </Room>
  );
};

const S3: React.FC<{ T: number }> = ({ T }) => {
  const k = ez(T, 9.95, 12.85);
  const mem = ez(T, 10.2, 12.6, 0, 1, (n) => n);
  return (
    <Room t={T} sky={NIGHT} candle={1} fire={0.6} memory={mem} z={mx(1.15, 2.2, k)} px={mx(520, 400, k)} py={mx(1160, 880, k)}>
      <Seated t={T} pose={{ lean: 4, head: -4, armF: [38, 52], armB: [34, 44] }} hand={quillHand} />
    </Room>
  );
};

const flare = (T: number, lands: number[]) => lands.reduce((a, l) => a + (T > l ? Math.exp(-(T - l) * 3.2) : 0), 0);
const arc = (T: number, t0: number, d = 0.62) => {
  const u = (T - t0) / d;
  if (u < 0 || u > 1) return null;
  return { x: mx(560, FIREX + 30, u), y: mx(1285, FLOOR - 60, u) - Math.sin(u * Math.PI) * 190, rot: u * 540, u };
};

const S4: React.FC<{ T: number }> = ({ T }) => {
  const crumple = ez(T, 12.95, 14.2);
  const wind = ez(T, 14.55, 14.9);
  const thr = ez(T, 14.9, 15.1, 0, 1, (n) => n);
  const t0 = 15.02;
  const b = arc(T, t0);
  const fl = flare(T, [t0 + 0.62]);
  const k = ez(T, 12.85, 16.45);
  const inHand = T < t0;
  return (
    <Room t={T} sky={NIGHT} candle={1} fire={0.6 + 1.5 * fl} z={mx(1.3, 1.18, k)} px={mx(600, 660, k)} py={1270} paper={crumple < 0.25}>
      <Seated
        t={T}
        pose={{ lean: mx(10, 4, wind) + 10 * thr, head: mx(14, 2, crumple), armF: [mx(mx(40, 52, crumple), 20, wind) + 100 * thr, mx(mx(50, 78, crumple), 110, wind) - 100 * thr], armB: [mx(34, 48, crumple), mx(44, 74, crumple)] }}
        hand={inHand && crumple > 0.25 ? () => <g transform="translate(0,14)"><Ball x={0} y={0} r={mx(22, 13, crumple) / SEAT_S} /></g> : undefined}
      />
      {b && <Ball x={b.x} y={b.y} rot={b.rot} glow={b.u > 0.8 ? (b.u - 0.8) * 5 : 0} />}
      <Particles t={T} area={[FIREX - 80, FLOOR - 420, FIREX + 160, FLOOR - 60]} n={30} seed={41} color="#ffc060" size={3} rise={170} op={Math.min(1, fl * 1.4)} drift={10} />
    </Room>
  );
};

const S5: React.FC<{ T: number }> = ({ T }) => {
  const ph = ez(T, 16.9, 23.5, 0, 1, (n) => n);
  const sky = skyAt(ph);
  const day = Math.sin(Math.PI * ph);
  const k = ez(T, 16.45, 23.9);
  const think = 1 - ez(T, 22.4, 23.2);
  return (
    <Room t={T} sky={sky} outSnow={1 - day * 0.7} candle={1 - 0.75 * day} candleH={mx(1, 0.5, ph)} fire={0.6 - 0.3 * day} beam={1 + day * 1.6} z={mx(1.5, 1.38, k)} px={mx(520, 560, k)} py={1255} paper={think < 0.5}>
      <Seated t={T} candle={1 - 0.6 * day} pose={{ lean: mx(10, 16, think), head: mx(14, 22, think), armF: [mx(40, 72, think), mx(50, 138, think)], armB: [34, 44] }} hand={think < 0.5 ? quillHand : undefined} />
    </Room>
  );
};

const LAUNCH = Array.from({ length: 8 }, (_, i) => 24.15 + i * 0.6);

const S6: React.FC<{ T: number }> = ({ T }) => {
  const u = Math.max(0, T - 23.9);
  const fast = 1 - ez(T, 28.0, 28.8);
  const season = ez(T, 24.4, 28.6, 0, 1, (n) => n);
  const ph = u * 1.3 + u * u * 0.5;
  const dayCol: [string, string] = season < 0.15 || season > 0.86 ? DAY : season < 0.42 ? ["#a8d0ee", "#e6f2d8"] : season < 0.64 ? ["#8cc0ee", "#f4eeb8"] : ["#c9a070", "#f2c890"];
  const dn = 0.5 + 0.5 * Math.sin(ph * Math.PI * 2);
  const sky = mixSky(NIGHT, dayCol, dn * fast);
  const leaves = season > 0.17 && season < 0.42 ? "#7fb858" : season >= 0.42 && season < 0.64 ? "#3f7f45" : season >= 0.64 && season < 0.84 ? "#d9822b" : null;
  const snow = season < 0.13 || season > 0.86 ? 1 : 0;
  const lands = LAUNCH.map((l) => l + 0.5);
  const fl = flare(T, lands);
  const age = ez(T, 24.4, 31.5) * 0.85;
  const sill = ez(T, 28.5, 30.4);
  const sw = LAUNCH.reduce((a, l) => Math.max(a, T > l - 0.25 && T < l + 0.2 ? Math.sin(((T - l + 0.25) / 0.45) * Math.PI) : 0), 0);
  return (
    <Room
      t={T}
      sky={sky}
      outSnow={snow}
      outLeaves={fast > 0.5 ? leaves : null}
      candle={1 - 0.6 * dn * fast}
      candleH={fast > 0.1 ? 1 - ((T * 1.25) % 1) * 0.7 : 0.6}
      fire={0.6 + 1.3 * fl}
      beam={1 + dn * fast * 1.4}
      ash={ez(T, 26.2, 31.6)}
      pile={ez(T, 24.2, 31)}
      ashFly={ez(T, 25, 28.5) * 0.85}
      z={mx(1.0, 2.5, sill)}
      px={mx(540, 345, sill)}
      py={mx(1010, 1005, sill)}
    >
      <Seated t={T} age={age} candle={1 - 0.5 * dn * fast} pose={{ ...WRITE(T * 2, age), armF: [40 + 70 * sw, 50 - 30 * sw] }} hand={sw < 0.2 ? quillHand : undefined} />
      {LAUNCH.map((l, i) => {
        const b = arc(T, l, 0.5);
        return b ? <Ball key={i} x={b.x} y={b.y} rot={b.rot} glow={b.u > 0.8 ? (b.u - 0.8) * 5 : 0} /> : null;
      })}
      <Particles t={T} area={[FIREX - 80, FLOOR - 420, FIREX + 160, FLOOR - 60]} n={30} seed={41} color="#ffc060" size={3} rise={170} op={Math.min(1, fl)} drift={10} />
    </Room>
  );
};

const S7: React.FC<{ T: number }> = ({ T }) => {
  const done = ez(T, 36.2, 37.3);
  const k = ez(T, 32.6, 37.75);
  return (
    <Room t={T} sky={NIGHT} candle={1} candleH={0.7} fire={0.55} ash={1} pile={1} ashFly={0.5} z={mx(1.4, 1.58, k)} px={mx(540, 575, k)} py={1255} paper={done < 0.4}>
      <Seated t={T} age={1} pose={{ ...WRITE(T, 1), lean: mx(22, 12, done), head: mx(20, 8, done), armF: [mx(40, 62, done), mx(50, 86, done)], armB: [mx(34, 56, done), mx(44, 82, done)] }} hand={done < 0.4 ? quillHand : sheetHand} />
    </Room>
  );
};

const S12: React.FC<{ T: number }> = ({ T }) => {
  const put = ez(T, 52.9, 53.9);
  const take = ez(T, 54.2, 55.1);
  const k = ez(T, 50.1, 55.3);
  return (
    <Room t={T} sky={NIGHT} candle={1} candleH={0.5} fire={0.45} ash={1} pile={1} ashFly={0.6} z={mx(1.62, 1.45, k)} px={560} py={1250} paper={take > 0.5}>
      <Seated t={T} age={1} pose={{ lean: mx(16, 22, put), head: mx(30, 22, take), armF: [mx(58, 42, put), mx(96, 52, put)], armB: [mx(50, 34, put), mx(88, 44, put)] }} hand={put < 0.6 ? envHand : take > 0.6 ? quillHand : undefined} />
      {put >= 0.6 && (
        <g transform={`translate(690 ${DESK - 5}) rotate(-3)`}>
          <rect x={-34} y={-5} width={68} height={6} fill="#ecdcb8" />
          <circle cx={0} cy={-3} r={4} fill={RED} />
        </g>
      )}
    </Room>
  );
};

const S14: React.FC<{ T: number }> = ({ T }) => {
  const k = ez(T, 60.3, 68.2);
  return (
    <Room t={T} sky={NIGHT} candle={1 - 0.25 * k} candleH={0.34} fire={0.4 - 0.2 * k} ash={1} pile={1} ashFly={0.95} z={mx(1.32, 1.0, k)} px={mx(560, 540, k)} py={mx(1230, 1000, k)}>
      <Seated t={T} age={1} pose={WRITE(T * 0.7, 1)} hand={quillHand} />
    </Room>
  );
};

/* ---------------------------------------------------------------- inserts */

const DeskBg: React.FC<{ T: number; glow?: number }> = ({ T, glow = 1 }) => {
  const fk = 0.86 + 0.14 * Math.sin(T * 11) * Math.sin(T * 3.7);
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0604" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 82% 12%, rgba(255,170,80,${0.55 * fk * glow}) 0%, rgba(120,60,20,${0.3 * glow}) 34%, rgba(10,6,3,0) 72%)` }} />
      <AbsoluteFill style={{ background: "repeating-linear-gradient(94deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 46px, rgba(0,0,0,0.16) 48px, rgba(0,0,0,0) 52px)", opacity: 0.7 }} />
      <div style={{ position: "absolute", right: -90, top: -110, width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,214,140,0.95) 0%, rgba(255,160,70,0.5) 30%, rgba(255,140,50,0) 68%)", filter: "blur(22px)", opacity: fk * glow }} />
    </AbsoluteFill>
  );
};

const PaperInsert: React.FC<{ T: number; a: number; b: number; shake?: number; env?: boolean; dim?: number }> = ({ T, a, b, shake = 0, env, dim = 0 }) => {
  const prog = ez(T, a, b, 0, 1, (n) => n);
  const k = ez(T, a - 1.2, b + 2.5);
  const jx = Math.sin(T * 31) * shake * 2.2;
  const jy = Math.cos(T * 27) * shake * 1.6;
  const tx = 150 + prog * 690;
  return (
    <AbsoluteFill>
      <DeskBg T={T} glow={1 - dim} />
      <AbsoluteFill style={{ scale: String(mx(1.0, 1.07, k)), transformOrigin: "40% 46%" }}>
        {env && (
          <div style={{ position: "absolute", left: 470, top: 300, width: 640, height: 400, background: "linear-gradient(160deg,#eadbb6,#b89d6c)", rotate: "9deg", boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }}>
            <div style={{ position: "absolute", left: 60, top: 190, border: `7px solid ${RED}`, color: RED, fontFamily: FONT, fontWeight: 700, fontSize: 54, letterSpacing: "0.1em", padding: "6px 22px", rotate: "-8deg", opacity: 0.85 }}>АДРЕСАТ ВЫБЫЛ</div>
          </div>
        )}
        <div style={{ position: "absolute", left: 90, top: 470, width: 900, height: 1250, background: "linear-gradient(200deg,#f6e9c9 0%,#e2cc9c 55%,#b3966a 100%)", rotate: "-5deg", boxShadow: "0 40px 90px rgba(0,0,0,0.7)" }}>
          <div style={{ position: "absolute", left: 80, top: 150, fontFamily: FONT, fontStyle: "italic", fontWeight: 600, fontSize: 168, color: "#2a170c", whiteSpace: "nowrap", clipPath: `inset(-20% ${(1 - prog) * 100}% -20% 0)`, translate: `${jx}px ${jy}px` }}>Здравствуй</div>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ position: "absolute", left: 80, right: 80, top: 430 + i * 130, height: 2, background: "#7a5a3a", opacity: 0.14 }} />
          ))}
          <svg viewBox="0 0 900 1250" style={{ position: "absolute", left: 0, top: 0, width: 900, height: 1250, overflow: "visible" }}>
            <defs>
              <filter id="hb" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="16" />
              </filter>
              <filter id="hb2p" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="7" />
              </filter>
            </defs>
            <g transform={`translate(${tx + jx} ${318 + jy + Math.sin(prog * 46) * 9})`}>
              <ellipse cx={170} cy={210} rx={230} ry={150} fill="#000" opacity={0.42} filter="url(#hb)" />
              <g transform="rotate(10)">
                <Quill fill="#140b06" s={5.2} />
              </g>
              <path d="M70,10 Q130,-30 190,30 Q230,80 250,150 L620,900 L330,980 L150,260 Q80,160 70,10Z" fill="#0c0705" opacity={0.9} filter="url(#hb2p)" />
            </g>
          </svg>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 45% 45%, rgba(0,0,0,0) 40%, rgba(4,2,1,0.75) 100%)" }} />
    </AbsoluteFill>
  );
};

const Envelope: React.FC<{ front: boolean; seal?: number; stamp?: number; emboss?: number }> = ({ front, seal = 1, stamp = 0, emboss = 1 }) => (
  <div style={{ position: "absolute", left: -400, top: -255, width: 800, height: 510, background: "linear-gradient(170deg,#f1e3c0 0%,#d9c193 60%,#b09164 100%)", boxShadow: "0 40px 90px rgba(0,0,0,0.75)" }}>
    {!front ? (
      <svg viewBox="0 0 800 510" style={{ position: "absolute", width: 800, height: 510, overflow: "visible" }}>
        <path d="M0,0 L400,290 L800,0" fill="none" stroke="#8a6c44" strokeWidth={4} opacity={0.6} />
        <path d="M0,510 L310,250 M800,510 L490,250" fill="none" stroke="#8a6c44" strokeWidth={3} opacity={0.35} />
        {seal > 0 && (
          <g transform={`translate(400 286) scale(${seal})`}>
            <path d="M-62,6 Q-70,-44 -22,-60 Q30,-74 58,-34 Q80,8 44,48 Q4,76 -40,52 Q-60,34 -62,6Z" fill={RED} />
            <path d="M-62,6 Q-70,-44 -22,-60 Q30,-74 58,-34" fill="none" stroke="#e8685a" strokeWidth={5} opacity={0.6} />
            <g opacity={emboss}>
              <circle r={36} fill="none" stroke="#7a1410" strokeWidth={5} />
              {[0, 1, 2, 3, 4].map((i) => (
                <ellipse key={i} cx={Math.cos((i / 5) * 6.283 - 1.57) * 15} cy={Math.sin((i / 5) * 6.283 - 1.57) * 15} rx={10} ry={6} transform={`rotate(${(i / 5) * 360 - 90} ${Math.cos((i / 5) * 6.283 - 1.57) * 15} ${Math.sin((i / 5) * 6.283 - 1.57) * 15})`} fill="#7a1410" />
              ))}
            </g>
          </g>
        )}
      </svg>
    ) : (
      <>
        <svg viewBox="0 0 800 510" style={{ position: "absolute", width: 800, height: 510 }}>
          <rect x={640} y={34} width={120} height={140} fill="none" stroke="#6a4c2c" strokeWidth={4} strokeDasharray="8 6" />
          <path d="M660,150 q20,-70 40,-20 t40,-30" fill="none" stroke="#6a4c2c" strokeWidth={4} />
          {[250, 320, 390].map((y, i) => (
            <path key={i} d={`M150,${y} q30,-22 60,0 t60,0 t60,-4 t60,6 t60,-4 ${i < 2 ? "t60,2 t50,-4" : ""}`} fill="none" stroke="#2a170c" strokeWidth={5} strokeLinecap="round" opacity={0.85} />
          ))}
        </svg>
        {stamp > 0 && (
          <div style={{ position: "absolute", left: 70, top: 196, border: `9px solid ${RED}`, color: RED, fontFamily: FONT, fontWeight: 700, fontSize: 66, letterSpacing: "0.06em", padding: "4px 24px", whiteSpace: "nowrap", rotate: "-9deg", scale: String(mx(2.2, 1, stamp)), opacity: Math.min(1, stamp * 3) * 0.92, mixBlendMode: "multiply" }}>
            АДРЕСАТ ВЫБЫЛ
          </div>
        )}
      </>
    )}
  </div>
);

const SealInsert: React.FC<{ T: number }> = ({ T }) => {
  const drop = ez(T, 37.85, 38.25);
  const down = ez(T, 38.25, 38.45, 0, 1, (n) => n * n);
  const up = ez(T, 38.75, 39.1);
  const hit = T > 38.45 ? Math.exp(-(T - 38.45) * 9) : 0;
  const sy = mx(-900, 0, down) - up * 700;
  return (
    <AbsoluteFill>
      <DeskBg T={T} />
      <AbsoluteFill style={{ translate: `${Math.sin(T * 80) * hit * 10}px ${hit * 16}px`, scale: String(1.25 + 0.05 * ez(T, 37.75, 39.35)) }}>
        <div style={{ position: "absolute", left: 540, top: 930, rotate: "-4deg" }}>
          <Envelope front={false} seal={drop} emboss={T > 38.45 ? 1 : 0} />
        </div>
        <svg viewBox="0 0 1080 1920" style={{ position: "absolute", width: "100%", height: "100%", overflow: "visible" }}>
          <g transform={`translate(548 ${958 + sy})`}>
            <rect x={-26} y={-520} width={52} height={470} rx={20} fill="#0c0705" />
            <rect x={-58} y={-70} width={116} height={64} rx={12} fill="#1a0f08" stroke="#c98a3c" strokeWidth={3} strokeOpacity={0.6} />
          </g>
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 40%, rgba(4,2,1,0.75) 100%)" }} />
    </AbsoluteFill>
  );
};

const ReturnInsert: React.FC<{ T: number }> = ({ T }) => {
  const flip = ez(T, 46.45, 47.2);
  const sx = Math.abs(Math.cos(flip * Math.PI));
  const front = flip > 0.5;
  const TS = 48.6;
  const stamp = ez(T, TS - 0.12, TS, 0, 1, (n) => n * n);
  const hit = T > TS ? Math.exp(-(T - TS) * 7) : 0;
  const reach = ez(T, 42.3, 44.2) * (1 - ez(T, 46.2, 46.7));
  const k = ez(T, 41.75, 50.1);
  const close = ez(T, 44.7, 45.6) * (1 - ez(T, 46.2, 46.6));
  return (
    <AbsoluteFill>
      <DeskBg T={T} />
      <AbsoluteFill style={{ translate: `${Math.sin(T * 90) * hit * 16}px ${Math.cos(T * 70) * hit * 12}px`, scale: String(mx(1.0, 1.1, k) + 0.5 * close), transformOrigin: "50% 48%" }}>
        <div style={{ position: "absolute", left: 540, top: 930, rotate: `${mx(-7, -3, flip)}deg`, scale: `${Math.max(0.02, sx)} 1` }}>
          <Envelope front={front} seal={1} stamp={stamp} />
        </div>
        <svg viewBox="0 0 1080 1920" style={{ position: "absolute", width: "100%", height: "100%", overflow: "visible" }}>
          <defs>
            <filter id="hb2" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>
          <g transform={`translate(${mx(1300, 800, reach)} ${mx(1900, 1240, reach) + Math.sin(T * 5) * 5})`} filter="url(#hb2)" fill="#0c0705">
            <path d="M-40,-30 Q-90,-60 -150,-50 Q-176,-40 -150,-22 L-96,-6 Q-170,6 -190,30 Q-196,50 -168,46 L-80,34 Q-130,70 -122,96 Q-100,110 -70,80 L10,40 L420,560 L640,380 L90,-70Z" />
          </g>
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 40%, rgba(4,2,1,0.75) 100%)" }} />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- street */

const Street: React.FC<{ T: number }> = ({ T }) => {
  const u = ez(T, 39.35, 41.05, 0, 1, (n) => n);
  const x = mx(150, 520, u);
  const s = 1.25;
  const p = (x * 2 * Math.PI) / (262 * s);
  const post = ez(T, 41.0, 41.5);
  const gy = 1500;
  const fk = 0.9 + 0.1 * Math.sin(T * 9);
  return (
    <Stage2 cam={{ s: 1, x: 540, y: 960 }} vcam={cam(1.12 + 0.05 * u, 560, 1130)} ref0={{ x: 540, y: 960 }}>
      <defs>
        <linearGradient id="stsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#060b18" />
          <stop offset="1" stopColor="#2c4468" />
        </linearGradient>
      </defs>
      <rect x={-900} y={-900} width={2900} height={3900} fill="url(#stsky)" />
      <g fill="#070b14">
        <path d="M-200,1500 V900 L-20,760 L160,900 V1500Z M190,1500 V1010 L330,900 L470,1010 V1500Z M860,1500 V840 L1040,700 L1300,840 V1500Z" />
      </g>
      {[[30, 1040], [300, 1130], [990, 1000], [1060, 1180]].map((w, i) => (
        <g key={i}>
          <rect x={w[0]} y={w[1]} width={52} height={76} fill="#ffc977" opacity={0.85 * fk} />
          <circle cx={w[0] + 26} cy={w[1] + 38} r={90} fill="#ffb24a" opacity={0.2} filter="url(#glowb)" />
        </g>
      ))}
      <rect x={-900} y={gy} width={2900} height={1600} fill="#b9cde6" />
      <rect x={-900} y={gy} width={2900} height={1600} fill="#0b1830" opacity={0.45} />
      <ellipse cx={760} cy={gy + 60} rx={420} ry={80} fill="#ffd9a0" opacity={0.4} filter="url(#fogb)" />
      {/* lamp */}
      <circle cx={770} cy={870} r={260} fill="#ffc977" opacity={0.4 * fk} filter="url(#fogb)" />
      <g fill="#05070c">
        <rect x={764} y={890} width={12} height={gy - 890} />
        <path d="M740,890 L800,890 L790,820 L750,820Z M745,820 L795,820 L770,790Z" />
      </g>
      <ellipse cx={770} cy={858} rx={13} ry={22} fill="#fff1c0" />
      {/* post box */}
      <g fill="#05070c">
        <rect x={618} y={1310} width={12} height={gy - 1310} />
        <rect x={580} y={1190} width={90} height={130} rx={8} />
        <path d="M574,1196 Q625,1150 676,1196Z" />
      </g>
      <rect x={596} y={1226} width={58} height={7} fill="#ffd9a0" opacity={0.75} />
      <rect x={580} y={1190} width={90} height={130} rx={8} fill="none" stroke="#ffd9a0" strokeWidth={2} opacity={0.35} />
      <Lit6
        warm={0.7}
        cold={0.3}
        render={(f) => (
          <ManS
            x={x}
            y={gy + 4 - (u < 1 ? Math.abs(Math.sin(p)) * 3 : 0)}
            s={s}
            t={T}
            fill={f}
            age={1}
            coat
            wind={0.5}
            pose={u < 1 ? { ...walk(p, 0.45), lean: 14, head: 14, armF: [34, 60] } : { lean: 12, head: 10, armF: [mx(34, 88, post), mx(60, 20, post)], armB: [-4, 10] }}
            hand={post < 0.85 ? envHand(f) : undefined}
            handB={<rect x={-2.6} y={0} width={5.2} height={150} rx={2.4} fill={f} />}
          />
        )}
      />
      <Blizzard t={T} amount={0.7} seed={6} />
      <Flakes t={T} n={90} />
    </Stage2>
  );
};

/* ---------------------------------------------------------------- the film */

export const Letter: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const T = frame / FPS;
  let shot: React.ReactNode;
  if (T < 7.6) shot = <S1 T={T} />;
  else if (T < 9.95) shot = <PaperInsert T={T} a={8.55} b={9.75} />;
  else if (T < 12.85) shot = <S3 T={T} />;
  else if (T < 16.45) shot = <S4 T={T} />;
  else if (T < 23.9) shot = <S5 T={T} />;
  else if (T < 32.6) shot = <S6 T={T} />;
  else if (T < 37.75) shot = <S7 T={T} />;
  else if (T < 39.35) shot = <SealInsert T={T} />;
  else if (T < 41.75) shot = <Street T={T} />;
  else if (T < 50.1) shot = <ReturnInsert T={T} />;
  else if (T < 55.3) shot = <S12 T={T} />;
  else if (T < 60.3) shot = <PaperInsert T={T} a={56.95} b={58.35} shake={1} env dim={0.25} />;
  else shot = <S14 T={T} />;
  const fade = Math.max(ez(frame, 0, 30, 1, 0), ez(frame, dur - 105, dur - 12, 0, 1));
  return (
    <AbsoluteFill style={{ backgroundColor: "#050302" }}>
      {shot}
      <AbsoluteFill style={{ backgroundColor: "#050302", opacity: fade }} />
    </AbsoluteFill>
  );
};

export const SCENES6: Record<string, React.FC<{ dur: number }>> = { all: Letter };
