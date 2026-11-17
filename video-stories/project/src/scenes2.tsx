import React, { useMemo } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import vo from "./vo2.json";
import { Death, Fade, VertCtx, grass, makeHill, makeTree, Puppet, walk } from "./art";
import { Fog, GROUND, Glow, Hand, INK2, LIGHT, Layer, Lit, P, Particles, Puppet2, Sky2, Stage2, cloth, ez, rng } from "./art2";
import { FONT } from "./fonts";

const FPS = 30;
type SP = { dur: number };
const sc = (n: string) => vo.scenes.find((s) => s.name === n)!;
const ls = (i: number) => (vo.lines[i].start - sc(vo.lines[i].scene).start) * FPS;
const le = (i: number) => (vo.lines[i].end - sc(vo.lines[i].scene).start) * FPS;
const use2 = () => {
  const frame = useCurrentFrame();
  const f = Math.floor(frame / 2) * 2;
  return { frame, f, t: f / FPS };
};
export const STRIDE = (x: number, s: number) => (x * 2 * Math.PI) / (262 * s);
export const lerp = (a: number[], b: number[], k: number) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
export const GHOST = "#e6f0ff";

/* ---------------------------------------------------------------- shared sets */

export const deck = (x: number) => 690 - 40 * Math.sin(Math.PI * Math.max(0, Math.min(1, (x - 120) / 1680)));
export const BRIDGE = (() => {
  const top: number[][] = [];
  const bot: number[][] = [];
  for (let x = 100; x <= 1820; x += 40) {
    top.push([x, deck(x)]);
    bot.push([x, deck(x) + 30]);
  }
  let d = P([...top, ...bot.slice().reverse()]);
  const piers = [330, 750, 1170, 1590];
  for (const px of piers) d += P([[px - 30, deck(px) + 20], [px + 30, deck(px) + 20], [px + 40, 1500], [px - 40, 1500]]);
  for (let i = 0; i < piers.length - 1; i++) {
    const x0 = piers[i] + 28;
    const x1 = piers[i + 1] - 28;
    const m = (x0 + x1) / 2;
    d += `M${x0},${deck(x0) + 26}L${x1},${deck(x1) + 26}L${x1},${deck(x1) + 230}Q${m},${deck(m) - 60} ${x0},${deck(x0) + 230}Z`;
  }
  for (let x = 140; x <= 1780; x += 60) d += P([[x - 3, deck(x) + 4], [x - 3, deck(x) - 34], [x + 3, deck(x) - 34], [x + 3, deck(x) + 4]]);
  let rail = "M";
  for (let x = 130; x <= 1790; x += 20) rail += `${x},${deck(x) - 34}L`;
  return { d, rail: rail.slice(0, -1) };
})();

export const Banks: React.FC = () => (
  <>
    <path fill={INK2} d={P([[-1800, 1500], [-1800, 560], [-60, 600], [150, 660], [260, 760], [330, 1500]])} />
    <path fill={INK2} d={P([[3600, 1500], [3600, 580], [1960, 610], [1760, 660], [1650, 760], [1590, 1500]])} />
  </>
);

export const River: React.FC<{ t: number; moonX?: number; y0?: number; op?: number }> = ({ t, moonX = 960, y0 = 905, op = 0.5 }) => {
  const rip = useMemo(() => {
    const r = rng(15);
    return Array.from({ length: 56 }, () => ({ x: r() * 2800 - 440, y: y0 + r() * r() * 420, w: 40 + r() * 190, p: r() * 6 }));
  }, [y0]);
  return (
    <>
      <rect x={-1800} y={y0 - 20} width={5600} height={2000} fill="#171827" opacity={0.55} />
      <ellipse cx={moonX} cy={y0 + 220} rx={110} ry={420} fill={LIGHT} opacity={0.12 * op * 2} filter="url(#bl24)" />
      {rip.map((r, i) => (
        <rect key={i} x={r.x + Math.sin(t * 0.8 + r.p) * 16} y={r.y} width={r.w} height={3} fill={i % 3 ? INK2 : LIGHT} opacity={i % 3 ? op : op * 0.5} />
      ))}
    </>
  );
};

export const Lamp: React.FC<{ x: number; t: number; seed?: number }> = ({ x, t, seed = 0 }) => {
  const fk = 0.82 + 0.18 * Math.sin(t * 8 + seed * 3) * Math.sin(t * 3.1 + seed);
  const y = deck(x);
  return (
    <g>
      <Glow x={x} y={y - 170} r={120} color="#ffc977" op={0.5 * fk} />
      <rect x={x - 3} y={y - 150} width={6} height={120} fill={INK2} />
      <path fill={INK2} d={P([[x - 17, y - 150], [x + 17, y - 150], [x + 12, y - 140], [x - 12, y - 140]])} />
      <path fill={INK2} d={P([[x - 13, y - 192], [x + 13, y - 192], [x + 17, y - 150], [x - 17, y - 150]])} />
      <ellipse cx={x} cy={y - 168} rx={8} ry={14 * fk} fill="#ffe2a8" />
      <path d={P([[x - 20, y - 192], [x + 20, y - 192], [x, y - 210]])} fill={INK2} />
    </g>
  );
};

export const BridgeSet: React.FC<{ t: number; lamps?: number[] }> = ({ t, lamps = [210, 1690] }) => (
  <>
    <Banks />
    <path d={BRIDGE.d} fill={INK2} />
    <path d={BRIDGE.rail} stroke={INK2} strokeWidth={6} fill="none" />
    {lamps.map((x, i) => (
      <Lamp key={i} x={x} t={t} seed={i} />
    ))}
  </>
);

export const Rig: React.FC<{ x: number; gy: number; flip?: boolean; s?: number; k: "kadm" | "girl" | "young"; t: number; pose?: Parameters<typeof Puppet2>[0]["pose"]; wind?: number; drag?: number; hat?: boolean; rimOp?: number; rim?: string; shadow?: number; float?: number; curlF?: number; wand?: boolean }> = ({
  x,
  gy,
  flip,
  s = 1.15,
  k,
  t,
  pose,
  wind = 0.4,
  drag = 0,
  hat = true,
  rimOp = 0.55,
  rim,
  shadow = 0.3,
  float = 0,
  curlF = 0.3,
  wand,
}) => (
  <Lit gy={gy} x={x} rimOp={rimOp} rim={rim} shadow={shadow} rimDx={flip ? 2.6 : -2.6} render={(f, o) => <Puppet2 kind={k} x={x} y={gy} s={s} flip={flip} t={t} wind={wind} drag={drag} pose={pose} fill={f} opacity={o} hat={hat} float={float} curlF={curlF} wand={wand} />} />
);

/* ---------------------------------------------------------------- intro */

export const Intro2: React.FC<SP> = ({ dur }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const vt = React.useContext(VertCtx);
  const rise = ez(f, 0, dur, 0, 1, (n) => n);
  return (
    <AbsoluteFill>
      <Stage2 cam={{ s: 1 + f * 0.0005, x: 960, y: 540 }}>
        <Sky2 id="i2" pal="dusk" sun={[960, 640 - 110 * rise]} sunR={210} t={t} stars={0.5} />
        <rect x={-1800} y={-1800} width={5400} height={5400} fill="#0c0a14" opacity={0.58} />
        <Fog y={820} h={220} t={t} op={0.22} seed={7} n={6} />
        <Particles t={t} area={[0, 100, 1920, 1000]} n={50} seed={9} op={0.5} />
      </Stage2>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: FONT, color: "#eee8d6" }}>
        <div style={{ fontSize: vt ? 31 : 40, letterSpacing: vt ? "0.3em" : "0.42em", fontWeight: 600, opacity: ez(f, 8, 30) * 0.85, marginRight: vt ? "-0.3em" : "-0.42em", textShadow: "0 2px 6px rgba(0,0,0,0.8)" }}>
          СКАЗКА О ТРЁХ БРАТЬЯХ
        </div>
        <svg width={560} height={40} style={{ margin: "18px 0 6px", opacity: ez(f, 16, 40) }}>
          <path d={`M${280 - 250 * ez(f, 14, 50)},20 L${280 + 250 * ez(f, 14, 50)},20`} stroke="#d8c690" strokeWidth={2} />
          <path d="M280,6 L294,20 L280,34 L266,20Z" fill="#d8c690" />
        </svg>
        <div style={{ fontSize: vt ? 176 : 190, fontWeight: 700, fontStyle: "italic", lineHeight: 1.05, opacity: ez(f, 22, 50), scale: String(0.96 + 0.04 * ez(f, 22, dur)), textShadow: "0 4px 10px rgba(0,0,0,0.85), 0 0 50px rgba(10,8,20,0.9)" }}>
          Средний
        </div>
      </AbsoluteFill>
      <Fade frame={f} dur={dur} i={14} o={14} color="#07060b" />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- 1: the bridge */

const BridgeScene: React.FC<SP> = ({ dur }) => {
  const { frame, f, t } = use2();
  const V = React.useContext(VertCtx);
  const dX = V ? 1010 : 1190;
  const gX = V ? 370 : 300;
  const far = useMemo(() => makeHill(131, 760, 50), []);
  const trL = useMemo(() => makeTree(133, 60, 660, 600, 0.1, 5), []);
  const trR = useMemo(() => makeTree(134, 1860, 670, 680, -0.08, 5), []);
  const push = ez(frame, 0, dur);
  const dissolve = ez(f, ls(0) - 4, ls(0) + 70);
  const look = ez(f, ls(1) - 4, ls(1) + 40);
  const dust = ez(f, ls(0) + 4, ls(0) + 30) * (1 - ez(f, ls(0) + 60, ls(0) + 110));
  return (
    <AbsoluteFill>
      <Stage2 cam={{ s: 1 + 0.13 * push, x: 960 + 110 * push, y: 540 + 10 * push }} vcam={{ s: 0.8 + 0.04 * push, x: 880 + 15 * push, y: 540 }} ref0={{ x: 960, y: 540 }}>
        <Sky2 id="b1" pal="dusk" sun={[820, 430]} sunR={150} t={t} stars={0.25} />
        <Layer k={0.35}>
          <path d={far.d} fill="#4a5074" opacity={0.75} />
          <Fog y={770} t={t} op={0.32} seed={2} />
        </Layer>
        <Layer k={0.7}>
          <path d={trL.d} fill={INK2} opacity={0.9} />
          <path d={trR.d} fill={INK2} opacity={0.9} />
        </Layer>
        <River t={t} moonX={820} />
        <Fog y={900} h={120} t={t} op={0.2} seed={4} n={4} />
        <BridgeSet t={t} />
        {dissolve < 1 && (
          <g opacity={0.6 * (1 - dissolve)}>
            <Puppet x={gX} y={deck(gX) + 6} s={1.1} t={t} wind={0.3} wand fill={GHOST} pose={walk(0, 0)} />
          </g>
        )}
        <Particles t={t} area={[gX - 80, 380, gX + 100, 700]} n={34} seed={5} rise={60} color="#dfe9ff" size={2.6} op={0.9 * dust} />
        <Rig k="kadm" x={560} gy={deck(560) + 6} s={1.15} t={t} wind={0.45} pose={{ armF: [8, 24], armB: [-6, 14], legF: [5, -2], legB: [-5, -2], head: 4 + 6 * look }} />
        <Rig k="young" x={450} gy={deck(450) + 6} s={1.0} t={t + 1} wind={0.5} pose={{ armF: [10, 40], armB: [-4, 10], legF: [4, -2], legB: [-4, -2], head: -8 * (1 - dissolve) }} />
        <Lit gy={deck(dX) + 6} x={dX} rimOp={0.35} shadow={0.25} rimDx={2} render={(fl) => <Death x={dX} y={deck(dX) + 8} s={1.0} flip t={t} wind={0.25} eye={0.9 * look + 0.2} fill={fl} armF={[34 + 10 * look, 28]} armB={[-12, 24]} lean={-1 - 2 * look} />} />
        <Fog y={880} h={90} t={t + 3} op={0.14} seed={9} n={3} />
        <Particles t={t} area={[0, 250, 1920, 900]} n={46} seed={11} op={0.55} />
        <Layer k={1.4} blur={5}>
          <path d={grass(21, () => 1100, -300, 2400, 24, 150)} fill={INK2} />
        </Layer>
      </Stage2>
      <Fade frame={frame} dur={dur} i={10} o={10} color="#07060b" />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- 2: Kadm */

const KadmPortrait: React.FC<SP> = ({ dur }) => {
  const { frame, t } = use2();
  const drift = frame / dur;
  const look = Math.sin(t * 0.9) * 2;
  return (
    <AbsoluteFill>
      <Stage2 cam={{ s: 1 + 0.07 * drift, x: 960 - 20 * drift, y: 540 }} vcam={{ s: 0.78 + 0.07 * drift, x: 880, y: 560 }} ref0={{ x: 960, y: 540 }}>
        <Sky2 id="k1" pal="night" sun={[1240, 400]} sunR={250} glow={1.2} t={t} stars={0.5} />
        <Layer k={0.3}>
          <Fog y={820} h={200} t={t} op={0.3} seed={3} n={5} color="#d9e3e0" />
        </Layer>
        <Particles t={t} area={[0, 100, 1920, 1000]} n={60} seed={6} op={0.6} color="#e6eee8" rise={-6} />
        <Lit gy={1400} x={720} rimOp={0.85} rimDx={5} rimDy={-2} rim="#dfeee8" shadow={0} render={(fl, op) => <Puppet2 kind="kadm" x={720} y={1400} s={3.1} t={t} wind={0.7} fill={fl} opacity={op} orn={0.45} pose={{ armF: [14, 112], armB: [-10, 20], head: -9 + look, lean: -2 }} curlF={0.55} />} />
        <Layer k={1.4} blur={8}>
          <Particles t={t * 1.4} area={[-100, 0, 2100, 1100]} n={22} seed={21} size={5} op={0.35} color="#f1f3e8" rise={-14} />
        </Layer>
      </Stage2>
      <Fade frame={frame} dur={dur} i={8} o={8} color="#07060b" />
    </AbsoluteFill>
  );
};

const KadmStride: React.FC<SP> = ({ dur }) => {
  const { frame, f, t } = use2();
  const far = useMemo(() => makeHill(141, 770, 45), []);
  const kx = 260 + f * 3.5;
  const p = STRIDE(kx, 1.15);
  const camx = Math.min(1250, Math.max(820, kx + 260));
  const posts = useMemo(() => Array.from({ length: 12 }, (_, i) => 120 + i * 360), []);
  const eyes = ez(f, 40, 140);
  return (
    <AbsoluteFill>
      <Stage2 cam={{ s: 1.12, x: camx, y: 560 }} vcam={{ s: 0.9, x: camx - 60, y: 580 }} ref0={{ x: 960, y: 540 }}>
        <Sky2 id="k2" pal="dusk" sun={[1350, 420]} sunR={150} t={t} stars={0.3} />
        <Layer k={0.3}>
          <path d={far.d} fill="#4a5074" opacity={0.75} />
          <Fog y={780} t={t} op={0.3} seed={2} />
        </Layer>
        <River t={t} moonX={1350} />
        <BridgeSet t={t} lamps={[210, 900, 1690]} />
        <Fog y={880} h={110} t={t} op={0.18} seed={4} n={4} />
        <Lit gy={deck(1560) + 8} x={1560} rimOp={0.4} shadow={0.25} rimDx={-2} render={(fl, op) => <Death x={1560} y={deck(1560) + 8} s={1.0} flip t={t} wind={0.25} eye={eyes} fill={fl} armF={[40, 26]} armB={[-12, 24]} />} />
        <Rig k="kadm" x={kx} gy={deck(kx) + 6 - Math.abs(Math.sin(p)) * 3} s={1.15} t={t} wind={0.7} drag={0.5} pose={{ ...walk(p, 0.85), lean: -4, head: -8, armF: [-26 * Math.sin(p), 18], armB: [30 * Math.sin(p), 18] }} />
        <Particles t={t} area={[0, 250, 2000, 900]} n={46} seed={11} op={0.55} />
        <Layer k={1.5} blur={5}>
          {posts.map((x) => (
            <rect key={x} x={x - 8} y={deck(x) - 240} width={16} height={340} fill={INK2} />
          ))}
        </Layer>
      </Stage2>
      <Fade frame={frame} dur={dur} i={8} o={10} color="#07060b" />
    </AbsoluteFill>
  );
};

const KadmScene: React.FC<SP> = ({ dur }) => {
  const a = Math.round(ls(3) - 6);
  return (
    <>
      <Sequence durationInFrames={a}>
        <KadmPortrait dur={a} />
      </Sequence>
      <Sequence from={a} durationInFrames={dur - a}>
        <KadmStride dur={dur - a} />
      </Sequence>
    </>
  );
};

/* ---------------------------------------------------------------- 3: the request */

const Graves: React.FC<{ t: number; a: number }> = ({ t, a }) => {
  const g = useMemo(() => {
    const r = rng(61);
    return Array.from({ length: 22 }, (_, i) => ({ x: 120 + i * 82 + r() * 40, h: 36 + r() * 60, kind: r() < 0.4 ? 0 : 1, w: 14 + r() * 12, o: 0.5 + r() * 0.5 }));
  }, []);
  const wisps = useMemo(() => {
    const r = rng(62);
    return Array.from({ length: 11 }, () => ({ x: 120 + r() * 1700, h: 300 + r() * 240, ph: r() * 6 }));
  }, []);
  return (
    <g opacity={a}>
      {wisps.map((w, i) => {
        const up = 0.5 + 0.5 * Math.sin(t * 0.8 + w.ph);
        return (
          <g key={i} opacity={0.34 + 0.26 * up}>
            <path d={cloth(w.x, 770, -Math.PI / 2 + Math.sin(t + w.ph) * 0.08, w.h, 64, t * 0.7, 400 + i, 0.16)} fill="#dcecff" filter="url(#bl3)" />
            <circle cx={w.x + Math.sin(t * 0.7 + w.ph) * 6} cy={770 - w.h * 0.97} r={17} fill="#e9f4ff" filter="url(#bl2)" />
          </g>
        );
      })}
      <g fill={INK2} opacity={0.8}>
        {g.map((q, i) =>
          q.kind ? (
            <path key={i} d={P([[q.x - q.w / 2, 770], [q.x - q.w / 2, 770 - q.h * 0.8], [q.x, 770 - q.h], [q.x + q.w / 2, 770 - q.h * 0.8], [q.x + q.w / 2, 770]])} opacity={q.o} />
          ) : (
            <g key={i} opacity={q.o}>
              <rect x={q.x - 3} y={770 - q.h} width={6} height={q.h} />
              <rect x={q.x - 14} y={770 - q.h * 0.75} width={28} height={5} />
            </g>
          ),
        )}
      </g>
    </g>
  );
};

const AskScene: React.FC<SP> = ({ dur }) => {
  const { frame, f, t } = use2();
  const V = React.useContext(VertCtx);
  const dX = V ? 1130 : 1290;
  const far = useMemo(() => makeHill(151, 780, 25), []);
  const push = ez(frame, 0, dur);
  const raise = ez(f, ls(4) - 4, ls(4) + 26);
  const rise = ez(f, ls(5) - 10, ls(5) + 50);
  const tilt = ez(f, ls(5) + 10, le(5));
  return (
    <AbsoluteFill>
      <Stage2 cam={{ s: 1.08 + 0.12 * push, x: 980 - 20 * push, y: 560 }} vcam={{ s: 0.82 + 0.08 * push, x: 970, y: 580 }} ref0={{ x: 960, y: 540 }}>
        <Sky2 id="a" pal="night" sun={[960, 430]} sunR={170} glow={1.1} t={t} stars={0.55} />
        <Layer k={0.35}>
          <path d={far.d} fill="#2e3c3e" opacity={0.85} />
          <Graves t={t} a={rise} />
          <Fog y={790} t={t} op={0.34} seed={2} color="#cfe0dc" />
        </Layer>
        <Banks />
        <path d={BRIDGE.d} fill={INK2} />
        <path d={BRIDGE.rail} stroke={INK2} strokeWidth={6} fill="none" />
        <Rig k="kadm" x={760} gy={deck(760) + 6} s={1.3} t={t} wind={0.4} rimOp={0.65} shadow={0.25} pose={{ armF: [20 + 128 * raise, 10 - 14 * raise], armB: [-8 - 10 * raise, 14], legF: [8, -3], legB: [-8, -3], head: -8 - 6 * raise }} curlF={0.1} />
        <Lit gy={deck(dX) + 8} x={dX} rimOp={0.45} shadow={0.2} rimDx={2} render={(fl) => <Death x={dX} y={deck(dX) + 8} s={1.05} flip t={t} wind={0.3} eye={0.5 + 0.5 * rise} fill={fl} armF={[34, 28]} armB={[-12, 24]} lean={-2 - 4 * tilt} />} />
        <Fog y={880} h={110} t={t} op={0.2} seed={4} n={4} />
        <Particles t={t} area={[0, 250, 1920, 900]} n={50} seed={13} op={0.6} color="#d6ecff" rise={22} />
        <Layer k={1.4} blur={5}>
          <path d={grass(23, () => 1100, -300, 2400, 24, 150)} fill={INK2} />
        </Layer>
      </Stage2>
      <Fade frame={frame} dur={dur} i={8} o={10} color="#07060b" />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- 4: the stone */

export const ik = (S: number[], T: number[], l1: number, l2: number, bend = 1) => {
  const dx = T[0] - S[0];
  const dy = T[1] - S[1];
  const d = Math.hypot(dx, dy);
  const m = Math.min(d, l1 + l2 - 2);
  const a = Math.atan2(dy, dx);
  const c = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + m * m - l2 * l2) / (2 * l1 * m))));
  const E = [S[0] + Math.cos(a + bend * c) * l1, S[1] + Math.sin(a + bend * c) * l1];
  const Hd = [S[0] + (dx / d) * m, S[1] + (dy / d) * m];
  return { E, H: Hd };
};
export const bone = (A: number[], B: number[], w0: number, w1: number) => {
  const a = Math.atan2(B[1] - A[1], B[0] - A[0]);
  const nx = -Math.sin(a);
  const ny = Math.cos(a);
  return P([[A[0] + (nx * w0) / 2, A[1] + (ny * w0) / 2], [B[0] + (nx * w1) / 2, B[1] + (ny * w1) / 2], [B[0] - (nx * w1) / 2, B[1] - (ny * w1) / 2], [A[0] - (nx * w0) / 2, A[1] - (ny * w0) / 2]]);
};

export const wavy = (A: number[], B: number[], w0: number, w1: number, t: number, amp = 14) => {
  const a = Math.atan2(B[1] - A[1], B[0] - A[0]);
  const nx = -Math.sin(a);
  const ny = Math.cos(a);
  const n = 16;
  const e1: number[][] = [];
  const e2: number[][] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const w = (w0 + (w1 - w0) * u) / 2;
    const cx = A[0] + (B[0] - A[0]) * u;
    const cy = A[1] + (B[1] - A[1]) * u;
    const o1 = Math.sin(u * 9 - t * 2.2) * amp * u;
    const o2 = Math.sin(u * 7 - t * 1.8 + 2) * amp * u * (i % 2 ? 1.4 : 0.7);
    e1.push([cx + nx * (w + o1), cy + ny * (w + o1)]);
    e2.push([cx - nx * (w + o2), cy - ny * (w + o2)]);
  }
  return P([...e1, ...e2.reverse()]);
};

const StoneScene: React.FC<SP> = ({ dur }) => {
  const { frame, f, t } = use2();
  const bank = useMemo(() => makeHill(155, 960, 22), []);
  const rocks = useMemo(() => {
    const r = rng(156);
    return Array.from({ length: 34 }, () => ({ x: r() * 2200 - 200, y: 940 + r() * 120, w: 10 + r() * 46, h: 6 + r() * 20 }));
  }, []);
  const S = [1560, -40];
  const peb = [900, 925];
  const mid = [1010, 470];
  const k1 = ez(f, 6, ls(6) + 30, 0, 1, (n) => n * n * (3 - 2 * n));
  const k2 = ez(f, ls(6) + 30, le(6) + 16);
  let Hn = lerp([1500, 120], peb, k1);
  Hn = lerp(Hn, mid, k2);
  const turn = ez(f, ls(7) + 6, le(7) - 4, 0, 3, (n) => n);
  Hn = [Hn[0], Hn[1] + Math.sin(turn * Math.PI * 2) * 6];
  const arm = ik(S, Hn, 600, 560, -1);
  const fa = Math.atan2(arm.H[1] - arm.E[1], arm.H[0] - arm.E[0]);
  const wr = lerp(arm.E, arm.H, 0.8);
  const held = f > ls(6) + 34;
  const sp = held ? mid : peb;
  const sx = held ? Hn[0] - 18 : peb[0];
  const sy = held ? Hn[1] + 12 : peb[1];
  void sp;
  const ang = turn * Math.PI * 2;
  const face = Math.cos(ang);
  const pulse = (n: number) => Math.max(0, 1 - Math.abs(turn - n) * 2.6);
  const rings = [1, 2, 3].map(pulse);
  const glow = held ? 0.2 + 0.8 * ez(f, ls(7) - 6, le(7)) : 0;
  const sh = (turn > 0 ? rings.reduce((a, b) => a + b, 0) : 0) * Math.sin(f * 2) * 2.5;
  return (
    <AbsoluteFill>
      <Stage2 cam={{ s: 1.04, x: 990 + sh, y: 590 + sh }} vcam={{ s: 0.98, x: 1010 + sh, y: 580 + sh }} ref0={{ x: 990, y: 590 }}>
        <Sky2 id="s" pal="dusk" sun={[640, 430]} sunR={190} t={t} stars={0.3} />
        <Layer k={0.4}>
          <Fog y={700} t={t} op={0.28} seed={3} />
        </Layer>
        <rect x={-1800} y={720} width={5600} height={2000} fill="#14152a" />
        <ellipse cx={640} cy={900} rx={150} ry={520} fill={LIGHT} opacity={0.2} filter="url(#bl24)" />
        {Array.from({ length: 40 }, (_, i) => {
          const g = rng(i * 7 + 3);
          const yy = 740 + g() * g() * 360;
          return <rect key={i} x={g() * 2400 - 300 + Math.sin(t * 0.8 + i) * 20} y={yy} width={30 + g() * 170} height={3} fill={i % 3 ? "#05050c" : LIGHT} opacity={i % 3 ? 0.5 : 0.25} />;
        })}
        <path d={bank.d} fill={GROUND} />
        <g fill={INK2}>
          {rocks.map((r, i) => (
            <ellipse key={i} cx={r.x} cy={r.y} rx={r.w} ry={r.h} />
          ))}
        </g>
        {/* Death's arm, drawn huge */}
        <g fill={INK2}>
          <path d={wavy(S, arm.E, 96, 52, t * 0.7, 8)} />
          <circle cx={arm.E[0]} cy={arm.E[1]} r={27} />
          {[0, 1].map((i) => (
            <path key={"e" + i} d={cloth(arm.E[0] + i * 10, arm.E[1] + 6, Math.PI * (0.52 + i * 0.07) + 0.1, 230 + i * 60, 46 - i * 8, t * 1.2, 610 + i, 0.2)} />
          ))}
          <path d={wavy(arm.E, wr, 58, 150, t)} />
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={"s" + i} d={cloth(wr[0] - 40 + i * 20, wr[1] + 6, Math.PI * (0.5 + (i - 2) * 0.045) + 0.12, 250 + (i % 3) * 70, 30 + (i % 2) * 8, t * 1.3, 630 + i, 0.22)} />
          ))}
          <path d={bone(wr, arm.H, 26, 18)} />
          <g transform={`translate(${arm.H[0]} ${arm.H[1]}) rotate(${(fa * 180) / Math.PI - 90}) scale(3.3)`} color={INK2} stroke={INK2} strokeWidth={0.5}>
            <Hand curl={held ? 0.7 : 0.2} />
          </g>
        </g>
        {/* the stone */}
        <g transform={`translate(${sx} ${sy})`}>
          <circle r={190} fill="#bfe3ff" opacity={0.4 * glow} filter="url(#glowb)" />
          {[0, 1, 2].map((i) =>
            rings[i] > 0 ? (
              <g key={i}>
                <circle r={40 + (1 - rings[i]) * 460} fill="none" stroke="#e6f6ff" strokeWidth={5 + 6 * rings[i]} opacity={0.75 * rings[i]} />
                <circle r={20 + (1 - rings[i]) * 260} fill="#e6f6ff" opacity={0.3 * rings[i]} filter="url(#bl14)" />
              </g>
            ) : null,
          )}
          <ellipse rx={Math.max(4, 22 * Math.abs(face) + 4)} ry={30} fill={INK2} stroke={held ? "#cfeaff" : INK2} strokeWidth={held ? 2 : 0} />
          {face > 0.25 && held && (
            <g fill="none" stroke="#e6f6ff" strokeWidth={2.4} opacity={face * glow}>
              <circle r={9} />
              <path d="M0,-17 L-14,9 L14,9Z" />
              <path d="M0,-17 L0,9" />
            </g>
          )}
        </g>
        <Particles t={t} area={[200, 300, 1800, 1000]} n={50} seed={17} op={0.5} color="#d6ecff" size={2.4} />
        <Layer k={1.5} blur={8}>
          <path d={grass(31, () => 1120, -300, 800, 34, 420)} fill={INK2} />
          <path d={grass(32, () => 1120, 1500, 2400, 34, 380)} fill={INK2} />
        </Layer>
      </Stage2>
      <Fade frame={frame} dur={dur} i={8} o={10} color="#07060b" />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- 5: she appears */

const SheScene: React.FC<SP> = ({ dur }) => {
  const { frame, f, t } = use2();
  const V = React.useContext(VertCtx);
  const kXs = V ? 700 : 650;
  const gr = useMemo(() => makeHill(161, 860, 12), []);
  const far = useMemo(() => makeHill(162, 710, 55), []);
  const gd = useMemo(() => grass(8, gr.y, -300, 2300, 9, 30), [gr]);
  const tree = useMemo(() => makeTree(163, 1710, 880, 760, -0.07, 6), []);
  const appear = ez(f, ls(8) + 4, ls(8) + 70);
  const ring = ez(f, ls(8) - 4, ls(8) + 60);
  const reach = ez(f, ls(9) - 20, ls(9) + 60);
  const push = ez(frame, ls(9) - 10, dur);
  const gx = V ? 1180 : 1250;
  return (
    <AbsoluteFill>
      <Stage2 cam={{ s: 1.04 + 0.18 * push, x: 1000 + 120 * push, y: 560 }} vcam={{ s: 0.9 + 0.06 * push, x: 950 + 50 * push, y: 570 }} ref0={{ x: 1000, y: 560 }}>
        <Sky2 id="sh" pal="ghost" sun={[1290, 400]} sunR={0} disc={false} t={t} stars={0.4} />
        <rect x={-1800} y={-1800} width={5400} height={5400} fill="#0b0f1c" opacity={0.5} />
        <Layer k={0.4}>
          <path d={far.d} fill="#2a3750" opacity={0.85} />
          <Fog y={770} t={t} op={0.3} seed={2} color="#cfe3f5" />
        </Layer>
        <Layer k={0.75}>
          <path d={tree.d} fill={INK2} opacity={0.9} />
        </Layer>
        <path d={gr.d} fill={GROUND} />
        <path d={gd} fill={GROUND} />
        <ellipse cx={gx} cy={gr.y(gx) + 6} rx={ring * 330} ry={ring * 46} fill="#bfe0ff" opacity={0.5 * (1 - appear * 0.6)} filter="url(#bl14)" />
        <rect x={gx - 70} y={-200} width={140} height={gr.y(gx) + 210} fill="#dff0ff" opacity={0.28 * Math.sin(Math.min(1, ring * 1.4) * Math.PI) * (1 - appear * 0.5)} filter="url(#bl24)" />
        <Glow x={gx} y={gr.y(gx) - 190} r={260} color="#a9d3ff" op={0.55 * appear} />
        <Particles t={t} area={[gx - 260, 300, gx + 260, 900]} n={60} seed={19} op={0.9 * (0.3 + ring)} color="#e6f4ff" size={2.8} rise={46} drift={8} />
        <Rig k="kadm" x={kXs} gy={gr.y(kXs) + 4} s={1.3} t={t} wind={0.4} rimOp={0.8} rim="#c9e6ff" shadow={0.2} pose={{ armF: [14 + 70 * reach, 20 + 10 * reach], armB: [-8, 14], legF: [8 + 8 * reach, -3], legB: [-8, -3], head: 4 - 6 * reach, lean: 2 + 7 * reach }} curlF={0.1} />
        {appear > 0.01 && (
          <g>
            <g filter="url(#bl8)" opacity={0.55 * appear}>
              <Puppet2 kind="girl" flip x={gx} y={gr.y(gx) + 4 - 6 * Math.sin(t)} s={1.3} t={t * 0.5} wind={0.15} fill="#9fd0ff" float={7} orn={0} pose={{ armF: [20, 30], armB: [-14, 20] }} />
            </g>
            <Puppet2 kind="girl" flip x={gx} y={gr.y(gx) + 4 - 6 * Math.sin(t)} s={1.3} t={t * 0.5} wind={0.15} fill={GHOST} opacity={0.9 * appear} float={7} orn={0.25} pose={{ armF: [20 + 40 * reach, 30], armB: [-14, 20], head: -4 + 4 * Math.sin(t * 0.7) }} />
          </g>
        )}
        <Particles t={t} area={[0, 250, 2000, 900]} n={46} seed={11} op={0.5} color="#cfe6ff" />
        <Layer k={1.4} blur={5}>
          <path d={grass(33, () => 1100, -300, 2400, 24, 150)} fill={INK2} />
        </Layer>
      </Stage2>
      <Fade frame={frame} dur={dur} i={8} o={10} color="#07060b" />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- 6: the veil */

const hits = (f: number) => {
  const t0 = [ls(12) + 6, ls(12) + 38, ls(12) + 72];
  return t0.map((h) => ({ x: 920, y: 600 + (h % 3) * 20, age: f - h }));
};

const VeilScene: React.FC<SP> = ({ dur }) => {
  const { frame, f, t } = use2();
  const gr = useMemo(() => makeHill(171, 870, 10), []);
  const push = ez(frame, 0, dur);
  const flick = f > ls(11) - 6 ? 0.55 + 0.45 * Math.sin((f - ls(11)) * 0.32) * Math.sin((f - ls(11)) * 0.11) : 1;
  const hs = hits(f);
  const shake = hs.reduce((a, h) => a + (h.age > 0 && h.age < 18 ? (1 - h.age / 18) * 7 : 0), 0);
  const pts: number[][] = [];
  const pts2: number[][] = [];
  for (let y = -200; y <= 1100; y += 25) {
    const w = Math.sin(y * 0.016 + t * 1.5) * 9 + Math.sin(y * 0.041 - t * 2.3) * 4;
    pts.push([935 + w, y]);
    pts2.push([985 + w * 0.8, y]);
  }
  const kx = 790 + 18 * Math.min(1, ez(f, ls(10) - 10, ls(10) + 60));
  return (
    <AbsoluteFill>
      <Stage2 cam={{ s: 1.05 + 0.1 * push, x: 960 + Math.sin(f * 1.7) * shake, y: 560 + Math.cos(f * 2.1) * shake }} vcam={{ s: 1.0 + 0.12 * push, x: 960 + Math.sin(f * 1.7) * shake, y: 575 }} ref0={{ x: 960, y: 560 }}>
        <Sky2 id="v" pal="ghost" sun={[960, 380]} sunR={0} disc={false} t={t} stars={0.3} />
        <rect x={-1800} y={-1800} width={5400} height={5400} fill="#0a0f1d" opacity={0.42} />
        <Layer k={0.4}>
          <Fog y={780} t={t} op={0.3} seed={6} color="#d8ecff" />
        </Layer>
        <path d={gr.d} fill={GROUND} />
        {/* the veil */}
        <g>
          <path d={P([...pts, ...pts2.slice().reverse()])} fill="#dff0ff" opacity={0.3 + 0.16 * Math.sin(t * 2)} filter="url(#bl5)" />
          <path d={P([...pts, ...pts2.slice().reverse()])} fill="#eaf6ff" opacity={0.22} />
          <path d={"M" + pts.map((q) => q.join(",")).join("L")} fill="none" stroke="#f2faff" strokeWidth={2.6} opacity={0.75} />
          <path d={"M" + pts2.map((q) => q.join(",")).join("L")} fill="none" stroke="#f2faff" strokeWidth={1.6} opacity={0.45} />
          {hs.map((h, i) =>
            h.age > 0 && h.age < 46 ? (
              <g key={i}>
                <ellipse cx={h.x + 40} cy={h.y} rx={30 + h.age * 14} ry={40 + h.age * 20} fill="none" stroke="#f2faff" strokeWidth={4 * (1 - h.age / 46)} opacity={0.85 * (1 - h.age / 46)} />
                <ellipse cx={h.x + 40} cy={h.y} rx={14 + h.age * 6} ry={20 + h.age * 9} fill="#f2faff" opacity={0.35 * (1 - h.age / 30 > 0 ? 1 - h.age / 30 : 0)} filter="url(#bl14)" />
              </g>
            ) : null,
          )}
        </g>
        <Glow x={960} y={560} r={420} color="#cfe6ff" op={0.22 + 0.12 * Math.sin(t * 1.6)} />
        <Rig k="kadm" x={kx} gy={gr.y(kx) + 4} s={1.3} t={t} wind={0.35} rimOp={0.9} rim="#d6ecff" shadow={0.2} pose={{ armF: [96 + shake * 0.6, 8], armB: [-8, 12], legF: [10, -3], legB: [-10, -3], head: 2, lean: 3 + shake * 0.2 }} curlF={0.0} />
        <g opacity={flick}>
          <g filter="url(#bl8)" opacity={0.45}>
            <Puppet2 kind="girl" flip x={1150} y={gr.y(1150) + 4} s={1.3} t={t * 0.5} wind={0.12} fill="#9fd0ff" orn={0} pose={{ armF: [96, 8], armB: [-10, 16] }} />
          </g>
          <Puppet2 kind="girl" flip x={1150} y={gr.y(1150) + 4} s={1.3} t={t * 0.5} wind={0.12} fill={GHOST} opacity={0.85} orn={0.2} pose={{ armF: [96, 8], armB: [-10, 16], head: -3 }} curlF={0.0} />
        </g>
        <Particles t={t} area={[0, 200, 2000, 950]} n={54} seed={23} op={0.6} color="#dff0ff" rise={20} />
        <Layer k={1.4} blur={5}>
          <path d={grass(34, () => 1100, -300, 2400, 24, 140)} fill={INK2} />
        </Layer>
      </Stage2>
      <Fade frame={frame} dur={dur} i={8} o={10} color="#07060b" />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- 7: calls every night */

const CallsScene: React.FC<SP> = ({ dur }) => {
  const { frame, f, t } = use2();
  const bankL = useMemo(() => makeHill(181, 880, 14), []);
  const far = useMemo(() => makeHill(182, 800, 30), []);
  const u = frame / dur;
  const moon: [number, number] = [380 + 1260 * u, 520 - 330 * Math.sin(Math.PI * u)];
  const gaze = ez(f, ls(14) - 4, ls(14) + 40);
  const push = ez(f, ls(14) - 10, ls(14) + 70);
  const cal = Math.sin(t * 2.4) * 0.5 + 0.5;
  const V = React.useContext(VertCtx);
  const kx = V ? 570 : 480;
  const gx = V ? 1450 : 1520;
  return (
    <AbsoluteFill>
      <Stage2 cam={{ s: 1.02 + 1.35 * push, x: 960 + 540 * push, y: 560 - 60 * push }} vcam={{ s: 0.76 + 1.2 * push, x: 1000 + 500 * push, y: 570 - 40 * push }} ref0={{ x: 960, y: 560 }}>
        <Sky2 id="c" pal="night" sun={moon} sunR={110} glow={1.2} t={frame / FPS * 5} stars={1} />
        <Layer k={0.35}>
          <path d={far.d} fill="#1f2a2c" opacity={0.9} />
          <Fog y={810} t={t} op={0.3} seed={3} color="#cfe0dc" />
        </Layer>
        <rect x={-1800} y={820} width={5600} height={2000} fill="#0e1618" />
        <ellipse cx={moon[0]} cy={1000} rx={90} ry={360} fill="#e8f0ea" opacity={0.28} filter="url(#bl14)" />
        {Array.from({ length: 38 }, (_, i) => {
          const g = rng(i * 11 + 1);
          return <rect key={i} x={g() * 2400 - 300 + Math.sin(t * 0.8 + i) * 18} y={830 + g() * g() * 300} width={30 + g() * 140} height={3} fill={i % 3 ? "#04080a" : "#e8f0ea"} opacity={i % 3 ? 0.55 : 0.28} />;
        })}
        <path d={bankL.d} fill={GROUND} opacity={0.0} />
        <path d={P([[-1800, 1200], [-1800, 880], [-300, 880], [600, 900], [760, 940], [780, 1200]])} fill={INK2} />
        <g opacity={0.9}>
          <path d={P([[1160, 1200], [1180, 910], [1500, 880], [2200, 880], [3600, 880], [3600, 1200]])} fill={INK2} />
        </g>
        {/* the girl on the far bank */}
        <Glow x={gx} y={820} r={170 + 90 * gaze} color="#a9d3ff" op={0.28 + 0.4 * gaze} />
        <g filter="url(#bl5)" opacity={0.4}>
          <Puppet2 kind="girl" flip x={gx} y={884} s={1.05} t={t * 0.5} wind={0.12} fill="#9fd0ff" orn={0} float={5} pose={{ armF: [10, 20], armB: [-8, 14], head: -2 }} />
        </g>
        <Puppet2 kind="girl" flip x={gx} y={884} s={1.05} t={t * 0.5} wind={0.12} fill={GHOST} opacity={0.88} orn={0.25} float={5} pose={{ armF: [10, 20 + 14 * gaze], armB: [-8, 14], head: -2 + 6 * gaze }} />
        {gaze > 0.1 && (
          <g fill="#f4fbff" opacity={gaze}>
            <ellipse cx={gx - 12 * 1.05 - 9} cy={884 - 150 * 1.05 - 290 * 1.05 + 8} rx={0} ry={0} />
          </g>
        )}
        {/* Kadm calling across the water */}
        <Rig k="kadm" x={kx} gy={904} s={1.25} t={t} wind={0.5} rimOp={0.7} rim="#d8e6e0" shadow={0.2} pose={{ armF: [100 + 8 * cal, 8], armB: [-6, 14], legF: [8, -3], legB: [-8, -3], head: -12 + 4 * cal, lean: -3 }} curlF={0.05} />
        <Particles t={t} area={[0, 300, 2000, 1000]} n={54} seed={29} op={0.8} color="#eaffd0" size={2.8} rise={10} twinkle={4} />
        <Layer k={1.5} blur={8}>
          <path d={grass(35, () => 1120, -300, 700, 30, 360)} fill={INK2} />
        </Layer>
      </Stage2>
      <Fade frame={frame} dur={dur} i={10} o={12} color="#07060b" />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- 8: fading away */

const RoomScene: React.FC<SP> = ({ dur }) => {
  const { frame, f, t } = use2();
  const floor = 905;
  const eatEnd = le(15);
  const cycStart = ls(17) - 10;
  const cycEnd = le(17) + 20;
  const cyc = f > cycStart && f < cycEnd ? (f - cycStart) * 0.5 : 0;
  const slow = f < cycStart ? 0.6 + 0.05 * ez(f, 0, cycStart, 0, 10) : 0;
  const ph = f < cycStart ? slow : cyc;
  const sunUp = Math.max(0, Math.sin(ph));
  const moonUp = Math.max(0, -Math.sin(ph));
  const stand = ez(f, ls(18) + 24, ls(18) + 70);
  const walkK = ez(f, ls(18) + 74, dur - 12, 0, 1, (n) => n);
  const kx = 1100 + walkK * 520;
  const wp = STRIDE(kx, 1.15);
  const door = ez(f, ls(18) + 70, ls(18) + 120);
  const candle = 1 - 0.7 * ez(f, 0, dur - 12);
  const push = ez(frame, ls(18), dur);
  const fl = 0.85 + 0.15 * Math.sin(t * 9) * Math.sin(t * 3.7);
  const steam = ez(f, 0, eatEnd - 10, 1, 0.1) * (f < eatEnd + 40 ? 1 : 0.0);
  const sitting = stand < 0.5;
  const wx = 700;
  return (
    <AbsoluteFill>
      <Stage2 cam={{ s: 1.05 + 0.18 * push, x: 960 + 160 * push, y: 560 }} vcam={{ s: 0.9 + 0.15 * push, x: 960 + 160 * push, y: 580 }} ref0={{ x: 960, y: 560 }}>
        <rect x={-1800} y={-1800} width={5400} height={5400} fill="#0c0806" />
        <rect x={-300} y={60} width={2500} height={floor - 60} fill="#2a1a10" />
        <rect x={-300} y={60} width={2500} height={floor - 60} fill="#6a4426" opacity={0.2} />
        {/* window: the day-night cycle */}
        <g>
          <rect x={wx - 30} y={170} width={300} height={400} fill="#0a0806" />
          <rect x={wx - 8} y={192} width={256} height={356} fill="#26324e" />
          <rect x={wx - 8} y={192} width={256} height={356} fill="#ffd493" opacity={sunUp * 0.95} />
          <rect x={wx - 8} y={192} width={256} height={356} fill="#2a3d66" opacity={moonUp * 0.9} />
          <clipPath id="rw">
            <rect x={wx - 8} y={192} width={256} height={356} />
          </clipPath>
          <g clipPath="url(#rw)">
            <circle cx={wx + 120 + Math.cos(ph) * 190} cy={380 - Math.sin(ph) * 190} r={30} fill={sunUp > 0 ? "#fff1c4" : "#e6edf7"} />
          </g>
          <path d={`M${wx + 120},170 v400 M${wx - 30},370 h300`} stroke="#0a0806" strokeWidth={13} />
          <path d={P([[wx - 8, 548], [wx + 248, 548], [wx + 560 + 80 * Math.cos(ph), floor], [wx - 330 + 80 * Math.cos(ph), floor]])} fill={sunUp > moonUp ? "#ffd493" : "#8fb0e6"} opacity={(sunUp > moonUp ? sunUp * 0.28 : moonUp * 0.2) + 0.03} />
        </g>
        {/* the closed bed in the corner */}
        <g fill="#050403">
          <rect x={1560} y={760} width={420} height={40} />
          <rect x={1560} y={720} width={14} height={floor - 720} />
          <rect x={1966} y={650} width={14} height={floor - 650} />
          <path d={P([[1590, 760], [1600, 726], [1760, 716], [1900, 722], [1950, 760]])} />
        </g>
        {/* door */}
        <g>
          <rect x={1700} y={210} width={230} height={floor - 210} fill="#0a0604" />
          <path d={P([[1700, 210], [1700 + 60 + door * 150, 240], [1700 + 60 + door * 150, floor - 20], [1700, floor]])} fill="#050302" />
          <rect x={1700 + 60 + door * 150} y={236} width={170 - door * 150} height={floor - 256} fill="#cfe6ff" opacity={door * 0.9} />
          <Glow x={1840} y={560} r={420} color="#cfe6ff" op={door * 0.6} />
        </g>
        <rect x={-300} y={floor} width={2800} height={2000} fill="#070402" />
        <rect x={-300} y={floor} width={2800} height={14} fill="#a8742f" opacity={0.18} />
        {/* table */}
        <g fill="#050302">
          <rect x={900} y={780} width={460} height={20} />
          <rect x={920} y={796} width={22} height={floor - 796} />
          <rect x={1320} y={796} width={22} height={floor - 796} />
          <path d={P([[1050, 780], [1056, 756], [1108, 756], [1114, 780]])} />
        </g>
        {/* steam off the bowl */}
        <Particles t={t} area={[1060, 600, 1110, 760]} n={16} seed={31} size={5} op={0.5 * steam} rise={16} color="#e8dcc8" drift={4} />
        {/* candle */}
        <g>
          <Glow x={1290} y={720} r={190} color="#ffb660" op={0.55 * fl} />
          <rect x={1283} y={780 - 52 * candle} width={14} height={52 * candle} fill="#0a0604" stroke="#f0d49a" strokeWidth={1.4} strokeOpacity={0.6} />
          <ellipse cx={1290} cy={780 - 52 * candle - 14} rx={6} ry={13 * fl} fill="#ffe7ab" />
        </g>
        {sitting ? (
          <Lit gy={floor + 30} x={1140} rimOp={0.7} rim="#ffcf88" rimDx={4} shadow={0} render={(fc, op) => <Puppet2 kind="kadm" flip x={1140} y={floor + 140} s={1.15} t={t * 0.4} wind={0.12} fill={fc} opacity={op} orn={0.35} pose={{ legF: [88, -88], legB: [84, -84], lean: 5 + 5 * ez(f, ls(16), le(17)), armF: [58, 30], armB: [46, 40], head: 12 + 14 * ez(f, eatEnd, ls(16) + 30) }} />} />
        ) : (
          <Lit gy={floor + 4} x={kx} rimOp={0.7} rim={door > 0.1 ? "#cfe6ff" : "#ffcf88"} rimDx={walkK > 0 ? 3 : -3} shadow={0.2} render={(fc, op) => <Puppet2 kind="kadm" x={kx} y={floor + 4 - (walkK > 0 ? Math.abs(Math.sin(wp)) * 3 : 0)} s={1.15} t={t} wind={0.5} fill={fc} opacity={op} pose={walkK > 0 ? { ...walk(wp, 0.8), lean: 3, head: -6 } : { armF: [10, 14], armB: [-6, 12], legF: [6 + 40 * (1 - stand), -3 - 80 * (1 - stand)], legB: [-6, -3], head: 4 }} />} />
        )}
        <Particles t={t} area={[200, 200, 1900, 900]} n={40} seed={33} op={0.45} color="#ffd9a0" rise={6} />
      </Stage2>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 38%, rgba(5,3,2,0.55) 100%)" }} />
      <Fade frame={frame} dur={dur} i={10} o={10} color="#07060b" />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- 9: the end */

const EndScene: React.FC<SP> = ({ dur }) => {
  const { frame, f, t } = use2();
  const V = React.useContext(VertCtx);
  const dX = V ? 1130 : 1380;
  const far = useMemo(() => makeHill(191, 770, 45), []);
  const walkU = ez(f, ls(19) - 20, le(19) + 40, 0, 1, (n) => n);
  const px = 760 - walkU * 380;
  const dissolve = ez(f, le(19) - 10, le(19) + 70);
  const wp = STRIDE(px, 1.0);
  const card = le(19) + 56;
  const cardIn = ez(frame, card, card + 34);
  const vt = React.useContext(VertCtx);
  return (
    <AbsoluteFill>
      <Stage2 cam={{ s: 1.04 + 0.05 * (frame / dur), x: 1000 - 40 * walkU, y: 560 }} vcam={{ s: 0.78 + 0.04 * (frame / dur), x: 900 - 80 * walkU, y: 575 }} ref0={{ x: 1000, y: 560 }}>
        <Sky2 id="e2" pal="dusk" sun={[420, 470]} sunR={160} glow={1.3} t={t} stars={0.7} />
        <rect x={-1800} y={-1800} width={5400} height={5400} fill="#0a0814" opacity={0.28 + 0.2 * ez(frame, 0, dur)} />
        <Layer k={0.35}>
          <path d={far.d} fill="#3a4062" opacity={0.8} />
          <Fog y={780} t={t} op={0.3} seed={2} />
        </Layer>
        <River t={t} moonX={420} />
        <BridgeSet t={t} lamps={[210, 1690]} />
        {/* the hat left behind */}
        <g transform={`translate(1060 ${deck(1060) - 4}) rotate(-8)`} fill={INK2}>
          <ellipse cx={0} cy={0} rx={44} ry={6} />
          <path d={P([[-20, -2], [20, -2], [14, -34], [8, -62], [-12, -84], [-18, -66], [-10, -40]])} transform="rotate(90 0 0) translate(-4 -28)" />
        </g>
        <Fog y={880} h={100} t={t} op={0.16} seed={4} n={4} />
        {/* the couple walks into the light */}
        <g opacity={1 - dissolve}>
          <Glow x={px - 20} y={deck(px) - 200} r={260 + 80 * dissolve} color="#cfe6ff" op={0.3 + 0.4 * dissolve} />
          <Puppet2 kind="girl" flip x={px + 70} y={deck(px) + 6 - Math.abs(Math.sin(wp)) * 2} s={1.0} t={t * 0.7} wind={-0.1} fill={GHOST} opacity={0.85} orn={0.2} float={3} pose={{ ...walk(wp + 1, 0.4), armF: [-24, 24], armB: [10, 20] }} />
          <Lit gy={deck(px) + 6} x={px} rimOp={0.6} rim="#e6f2ff" shadow={0.2} render={(fc, op) => <Puppet2 kind="kadm" flip x={px} y={deck(px) + 6 - Math.abs(Math.sin(wp)) * 2} s={1.0} t={t} wind={-0.2} fill={fc} opacity={op} pose={{ ...walk(wp, 0.5), armF: [30, 14], head: -2 }} />} />
        </g>
        <Particles t={t} area={[px - 200, 300, px + 300, 800]} n={50} seed={37} op={0.9 * dissolve + 0.2} color="#e6f4ff" size={2.8} rise={40} />
        <Lit gy={deck(dX) + 8} x={dX} rimOp={0.4} shadow={0.25} rimDx={2} render={(fl) => <Death x={dX} y={deck(dX) + 8} s={1.0} flip t={t} wind={0.3} eye={0.9} fill={fl} armF={[26 + 18 * ez(f, ls(19), le(19)), 28]} armB={[-12, 24]} lean={-1} />} />
        <Particles t={t} area={[0, 250, 2000, 900]} n={46} seed={11} op={0.5} />
        <Layer k={1.4} blur={5}>
          <path d={grass(36, () => 1100, -300, 2400, 24, 150)} fill={INK2} />
        </Layer>
      </Stage2>
      <AbsoluteFill style={{ backgroundColor: "#07060b", opacity: cardIn * 0.94 }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: FONT, color: "#eee8d6", opacity: ez(frame, card + 16, card + 50) }}>
        <div style={{ fontSize: vt ? 84 : 96, fontStyle: "italic", fontWeight: 600, textAlign: "center", lineHeight: 1.1, textShadow: "0 0 30px rgba(0,0,0,0.9)" }}>{vt ? <>Остался<br />Младший…</> : "Остался Младший…"}</div>
        <svg width={520} height={40} style={{ margin: "26px 0 16px" }}>
          <path d="M20,20 L500,20" stroke="#d8c690" strokeWidth={1.6} opacity={0.8} />
          <path d="M260,7 L273,20 L260,33 L247,20Z" fill="#d8c690" />
        </svg>
        <div style={{ fontSize: vt ? 28 : 34, letterSpacing: vt ? "0.3em" : "0.4em", marginRight: vt ? "-0.3em" : "-0.4em", fontWeight: 600, opacity: 0.8 }}>КОНЕЦ ВТОРОЙ СКАЗКИ</div>
      </AbsoluteFill>
      <Fade frame={frame} dur={dur} i={12} o={24} color="#07060b" />
    </AbsoluteFill>
  );
};

export const SCENES2: Record<string, React.FC<SP>> = {
  bridge: BridgeScene,
  kadm: KadmScene,
  ask: AskScene,
  stone: StoneScene,
  she: SheScene,
  veil: VeilScene,
  calls: CallsScene,
  fade: RoomScene,
  end: EndScene,
};
