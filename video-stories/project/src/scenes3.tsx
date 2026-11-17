import React, { useMemo } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import vo from "./vo3.json";
import { Death, Fade, VertCtx, grass, makeHill, makeTree, Puppet, walk } from "./art";
import { CloakSheet, Foliage, Fog, GROUND, Glow, INK2, LIGHT, Layer, Lit, P, Particles, Puppet2, Sky2, Stage2, cloth, ez, rng } from "./art2";
import { BridgeSet, STRIDE, deck, lerp } from "./scenes2";
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
const RIM = "#ffe3a6";
const WARMG = "#ffe9c4";
const blurOf = (v: number) => (v < 1 ? 0 : v < 2.5 ? 2 : v < 4 ? 3 : v < 6.5 ? 5 : v < 11 ? 8 : 14);

/* ---------------------------------------------------------------- shared bits */

const RiverW: React.FC<{ t: number; sx?: number; y0?: number; col?: string; streak?: string; op?: number }> = ({ t, sx = 980, y0 = 905, col = "#3b2f45", streak = "#ffd9a0", op = 0.5 }) => {
  const rip = useMemo(() => {
    const r = rng(19);
    return Array.from({ length: 56 }, () => ({ x: r() * 2800 - 440, y: y0 + r() * r() * 420, w: 40 + r() * 190, p: r() * 6 }));
  }, [y0]);
  return (
    <>
      <rect x={-1800} y={y0 - 20} width={5600} height={2000} fill={col} opacity={0.6} />
      <ellipse cx={sx} cy={y0 + 220} rx={120} ry={430} fill={streak} opacity={0.3} filter="url(#bl24)" />
      {rip.map((r, i) => (
        <rect key={i} x={r.x + Math.sin(t * 0.8 + r.p) * 16} y={r.y} width={r.w} height={3} fill={i % 3 ? INK2 : streak} opacity={i % 3 ? op : op * 0.7} />
      ))}
    </>
  );
};

const HouseC: React.FC<{ x: number; y: number; w?: number; h?: number; t: number; lit?: number; op?: number }> = ({ x, y, w = 150, h = 90, t, lit = 1, op = 1 }) => {
  const fk = 0.88 + 0.12 * Math.sin(t * 7) * Math.sin(t * 2.3);
  const top = y - h - w * 0.55;
  return (
    <g opacity={op}>
      <path fill={INK2} d={P([[x - w / 2, y + 6], [x - w / 2, y - h], [x - w / 2 - 12, y - h], [x, top], [x + w / 2 + 12, y - h], [x + w / 2, y - h], [x + w / 2, y + 6]])} />
      <rect fill={INK2} x={x + w * 0.18} y={top + 12} width={w * 0.1} height={w * 0.42} />
      {lit > 0 && (
        <>
          <Glow x={x - w * 0.1} y={y - h * 0.5} r={w * 0.9} color="#ffbf70" op={0.5 * lit * fk} />
          <rect x={x - w * 0.22} y={y - h * 0.72} width={w * 0.2} height={h * 0.4} fill="#ffe2a0" opacity={lit * fk} />
          <path d={`M${x - w * 0.12},${y - h * 0.72} v${h * 0.4} M${x - w * 0.22},${y - h * 0.52} h${w * 0.2}`} stroke={INK2} strokeWidth={2.4} />
          <rect x={x + w * 0.04} y={y - h * 0.6} width={w * 0.14} height={h * 0.6} fill="#2a1c12" opacity={0.85} />
        </>
      )}
      <Particles t={t} area={[x + w * 0.14, top - 130, x + w * 0.36, top + 10]} n={14} seed={5} size={6} op={0.4} rise={14} color="#d8cdb8" drift={5} />
    </g>
  );
};

const Ign: React.FC<{ x: number; gy: number; flip?: boolean; s?: number; t: number; f: number; pose?: Parameters<typeof Puppet2>[0]["pose"]; ghost?: number; wind?: number; drag?: number; rim?: string; staff?: boolean; eye?: number; silver?: number }> = ({ x, gy, flip, s = 1.15, t, f, pose, ghost = 0, wind = 0.4, drag = 0, rim = RIM, staff, eye = 0, silver = 0 }) => {
  const hi = Math.floor(f / 3) % 4;
  const body = (
    <Lit gy={gy} x={x} rimOp={0.6 + 0.3 * ghost} rim={rim} shadow={0.28} rimDx={flip ? 2.6 : -2.6} render={(fl, o) => <Puppet2 kind="young" x={x} y={gy} s={s} flip={flip} t={t} wind={wind} drag={drag} pose={pose} fill={fl} opacity={o} eye={eye} silver={silver} hand={staff ? <rect x={-2.6} y={-6} width={5.2} height={170 * (s / 1.15)} rx={2.4} fill={fl} /> : undefined} />} />
  );
  if (ghost > 0.02)
    return (
      <g filter={`url(#heat${hi})`} opacity={1 - 0.8 * ghost}>
        {body}
      </g>
    );
  return body;
};

/* ---------------------------------------------------------------- intro */

export const Intro3: React.FC<SP> = ({ dur }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const vt = React.useContext(VertCtx);
  const rise = ez(f, 0, dur, 0, 1, (n) => n);
  return (
    <AbsoluteFill>
      <Stage2 cam={{ s: 1 + f * 0.0004, x: 960, y: 540 }}>
        <Sky2 id="i3" pal="dawn" sun={[960, 700 - 120 * rise]} sunR={230} glow={1.3} t={t} />
        <Fog y={830} h={220} t={t} op={0.32} seed={7} n={6} color="#fff0d0" />
        <Particles t={t} area={[0, 100, 1920, 1000]} n={50} seed={9} op={0.7} color="#fff4d0" rise={-4} />
      </Stage2>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: FONT, color: "#2a1812" }}>
        <div style={{ fontSize: vt ? 31 : 40, letterSpacing: vt ? "0.3em" : "0.42em", fontWeight: 700, opacity: ez(f, 8, 30) * 0.9, marginRight: vt ? "-0.3em" : "-0.42em", textShadow: "0 0 18px rgba(255,236,190,0.9)" }}>СКАЗКА О ТРЁХ БРАТЬЯХ</div>
        <svg width={560} height={40} style={{ margin: "18px 0 6px", opacity: ez(f, 16, 40) }}>
          <path d={`M${280 - 250 * ez(f, 14, 50)},20 L${280 + 250 * ez(f, 14, 50)},20`} stroke="#2a1812" strokeWidth={2} />
          <path d="M280,6 L294,20 L280,34 L266,20Z" fill="#2a1812" />
        </svg>
        <div style={{ fontSize: vt ? 168 : 190, fontWeight: 700, fontStyle: "italic", lineHeight: 1.05, opacity: ez(f, 22, 50), scale: String(0.96 + 0.04 * ez(f, 22, dur)), textShadow: "0 0 40px rgba(255,236,190,0.95)" }}>Младший</div>
      </AbsoluteFill>
      <Fade frame={f} dur={dur} i={14} o={14} color="#07060b" />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- 1: the one who remained */

const LastScene: React.FC<SP> = ({ dur }) => {
  const { frame, f, t } = use2();
  const V = React.useContext(VertCtx);
  const far = useMemo(() => makeHill(231, 780, 45), []);
  const trL = useMemo(() => makeTree(233, 60, 660, 600, 0.1, 5), []);
  const trR = useMemo(() => makeTree(234, 1860, 670, 680, -0.08, 5), []);
  const push = ez(frame, 0, dur);
  const leave = ez(f, ls(0) - 4, ls(1) + 20);
  const dX = V ? 1130 : 1300;
  const iX = 650;
  return (
    <AbsoluteFill>
      <Stage2 cam={{ s: 1.02 + 0.08 * push, x: 930 + 40 * push, y: 545 }} vcam={{ s: 0.78 + 0.06 * push, x: 830 + 50 * push, y: 545 }} ref0={{ x: 960, y: 545 }}>
        <Layer k={0.05}>
          <Sky2 id="l" pal="dawn" sun={[980, 610 - 70 * push]} sunR={180} glow={1.3} t={t} />
        </Layer>
        <Layer k={0.35}>
          <path d={far.d} fill="#8a6679" opacity={0.75} />
          <Fog y={780} t={t} op={0.4} seed={2} color="#fff0d0" />
        </Layer>
        <Layer k={0.7}>
          <path d={trL.d} fill={INK2} opacity={0.88} />
          <path d={trR.d} fill={INK2} opacity={0.88} />
        </Layer>
        <RiverW t={t} sx={980} />
        <Fog y={900} h={120} t={t} op={0.3} seed={4} n={4} color="#ffe6c0" />
        <BridgeSet t={t} lamps={[]} />
        <g opacity={0.5 * (1 - leave)}>
          <Puppet x={340} y={deck(340) + 6} s={1.1} t={t} wind={0.3} wand fill={WARMG} pose={walk(0, 0)} />
          <Puppet2 kind="kadm" x={470} y={deck(470) + 6} s={1.15} t={t} wind={0.4} fill={WARMG} pose={{ armF: [8, 24], armB: [-6, 14] }} />
        </g>
        <Ign x={iX} gy={deck(iX) + 6} s={1.15} t={t} f={f} pose={{ armF: [8, 30], armB: [-4, 10], legF: [4, -2], legB: [-4, -2], head: 10 * (1 - ez(f, ls(1), ls(1) + 40)) - 4 }} />
        <Lit gy={deck(dX) + 6} x={dX} rimOp={0.5} rim={RIM} shadow={0.25} rimDx={2} render={(fl) => <Death x={dX} y={deck(dX) + 8} s={1.0} flip t={t} wind={0.25} eye={0.5} fill={fl} armF={[30, 26]} armB={[-12, 24]} lean={-1} />} />
        <Fog y={880} h={90} t={t + 3} op={0.2} seed={9} n={3} color="#ffe6c0" />
        <Particles t={t} area={[0, 250, 1920, 900]} n={46} seed={11} op={0.7} color="#fff1c8" />
        <Layer k={1.4} blur={5}>
          <path d={grass(21, () => 1100, -300, 2400, 24, 150)} fill={INK2} />
        </Layer>
      </Stage2>
      <Fade frame={frame} dur={dur} i={10} o={10} color="#07060b" />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- 2: distrust */

const DoubtA: React.FC<SP & { rack: number }> = ({ dur, rack }) => {
  const { frame, f, t } = use2();
  const drift = frame / dur;
  const focus = ez(f, rack - 26, rack + 6);
  const bI = blurOf(focus * 8);
  const bD = blurOf((1 - focus) * 14);
  return (
    <AbsoluteFill>
      <Stage2 cam={{ s: 1 + 0.05 * drift, x: 960, y: 540 }} vcam={{ s: 0.95 + 0.05 * drift, x: 900, y: 650 }} ref0={{ x: 960, y: 540 }}>
        <Sky2 id="da" pal="dawn" sun={[1050, 560]} sunR={230} glow={1.3} t={t} />
        <Fog y={1200} h={260} t={t} op={0.3} seed={3} color="#fff0d0" x0={-400} x1={2000} />
        <Particles t={t} area={[200, 100, 1700, 1500]} n={60} seed={6} op={0.7} color="#fff2cc" rise={-4} />
        <g filter={bD ? `url(#bl${bD})` : undefined}>
          <Death x={1320} y={1560} s={1.5} flip t={t} wind={0.25} eye={0.4} fill={INK2} armF={[40, 28]} armB={[-12, 22]} />
        </g>
        <g filter={bI ? `url(#bl${bI})` : undefined}>
          <Ign x={640} gy={1500} s={3.2} t={t} f={f} wind={0.55} rim="#fff0c0" pose={{ armF: [12, 70], armB: [-8, 14], head: -4 + Math.sin(t * 0.8) * 1.5, lean: 2 }} eye={0.95} />
        </g>
      </Stage2>
      <Fade frame={frame} dur={dur} i={8} o={6} color="#07060b" />
    </AbsoluteFill>
  );
};

const DoubtB: React.FC<SP> = ({ dur }) => {
  const { frame, t } = use2();
  const d = frame / dur;
  const sm = ez(frame, 4, 40);
  return (
    <AbsoluteFill>
      <Stage2 cam={{ s: 1, x: 960, y: 540 }} vcam={{ s: 1.0 + 0.1 * d, x: 560, y: 740 }} ref0={{ x: 560, y: 740 }}>
        <Sky2 id="db" pal="dawn" sun={[640, 800]} sunR={270} glow={1.5} t={t} />
        <rect x={-1800} y={-1800} width={5400} height={5400} fill="#2a1a2c" opacity={0.28} />
        <Particles t={t} area={[-100, 200, 1300, 1700]} n={60} seed={8} op={0.7} color="#fff2cc" rise={-4} />
        <Lit gy={2340} x={542} rimOp={0.9} rim="#ffe9b8" shadow={0} rimDx={4} render={(fl) => <Death x={542} y={2340} s={3.0} t={t} wind={0.2} eye={1} smile={sm} fill={fl} armF={[40, 28]} armB={[-12, 22]} />} />
      </Stage2>
      <Fade frame={frame} dur={dur} i={6} o={8} color="#07060b" />
    </AbsoluteFill>
  );
};

const DoubtScene: React.FC<SP> = ({ dur }) => {
  const a = Math.round(ls(4) - 10);
  return (
    <>
      <Sequence durationInFrames={a}>
        <DoubtA dur={a} rack={a - 4} />
      </Sequence>
      <Sequence from={a} durationInFrames={dur - a}>
        <DoubtB dur={dur - a} />
      </Sequence>
    </>
  );
};

/* ---------------------------------------------------------------- 3: the wish */

const WishScene: React.FC<SP> = ({ dur }) => {
  const { frame, f, t } = use2();
  const V = React.useContext(VertCtx);
  const far = useMemo(() => makeHill(251, 770, 40), []);
  const push = ez(frame, 0, dur);
  const houseOp = ez(f, ls(5) + 96, ls(5) + 150);
  const pathOp = ez(f, ls(7) - 6, ls(7) + 40);
  const dX = V ? 1120 : 1220;
  const iX = 650;
  const sunY = 560 - 70 * ez(frame, 0, dur);
  return (
    <AbsoluteFill>
      <Stage2 cam={{ s: 1.04 + 0.1 * push, x: 940, y: 545 }} vcam={{ s: 0.82 + 0.07 * push, x: 880, y: 545 }} ref0={{ x: 960, y: 545 }}>
        <Layer k={0.05}>
          <Sky2 id="w" pal="dawn" sun={[1000, sunY]} sunR={190} glow={1.3} t={t} />
        </Layer>
        <Layer k={0.35}>
          <path d={far.d} fill="#8a6679" opacity={0.75} />
          <Fog y={780} t={t} op={0.4} seed={2} color="#fff0d0" />
          <HouseC x={540} y={692} w={150} h={110} t={t} lit={houseOp} op={houseOp} />
        </Layer>
        <RiverW t={t} sx={1000} />
        <Fog y={900} h={120} t={t} op={0.3} seed={4} n={4} color="#ffe6c0" />
        <BridgeSet t={t} lamps={[]} />
        {pathOp > 0 && (
          <g opacity={pathOp}>
            <path d={`M${iX - 30},${deck(iX) - 10} Q${iX - 80},${deck(iX) - 60} 560,670`} fill="none" stroke="#ffe2a8" strokeWidth={5} strokeLinecap="round" strokeDasharray="1 16" strokeDashoffset={-t * 22} filter="url(#bl2)" />
            <path d={`M${iX - 30},${deck(iX) - 10} Q${iX - 80},${deck(iX) - 60} 560,670`} fill="none" stroke="#fff6d8" strokeWidth={2.4} strokeLinecap="round" strokeDasharray="1 16" strokeDashoffset={-t * 22} />
          </g>
        )}
        <Ign x={iX} gy={deck(iX) + 6} s={1.15} t={t} f={f} pose={{ armF: [10 + 70 * pathOp, 22], armB: [-4, 10], legF: [4, -2], legB: [-4, -2], head: -6 * ez(f, ls(5), ls(5) + 60) + 8 * pathOp }} />
        <Lit gy={deck(dX) + 6} x={dX} rimOp={0.5} rim={RIM} shadow={0.25} rimDx={2} render={(fl) => <Death x={dX} y={deck(dX) + 8} s={1.0} flip t={t} wind={0.25} eye={0.6} fill={fl} armF={[34, 26]} armB={[-12, 24]} lean={-1} />} />
        <Fog y={880} h={90} t={t + 3} op={0.2} seed={9} n={3} color="#ffe6c0" />
        <Particles t={t} area={[0, 250, 1920, 900]} n={46} seed={11} op={0.7} color="#fff1c8" />
        <Layer k={1.4} blur={5}>
          <path d={grass(23, () => 1100, -300, 2400, 24, 150)} fill={INK2} />
        </Layer>
      </Stage2>
      <Fade frame={frame} dur={dur} i={8} o={10} color="#07060b" />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- 4: she hesitates */

const PauseScene: React.FC<SP> = ({ dur }) => {
  const { frame, f, t } = use2();
  const hold = ez(f, 4, ls(8) + 30);
  const tt = t * (1 - 0.8 * hold);
  const turn = ez(f, ls(9) - 10, ls(9) + 90);
  const push = ez(frame, 0, dur);
  return (
    <AbsoluteFill>
      <Stage2 cam={{ s: 1, x: 960, y: 540 }} vcam={{ s: 0.95 + 0.1 * push, x: 720, y: 690 }} ref0={{ x: 720, y: 690 }}>
        <Sky2 id="p" pal="dawn" sun={[820, 620]} sunR={250} glow={1.4} t={t} />
        <Layer k={0.4}>
          <Fog y={1180} h={260} t={tt} op={0.35} seed={5} color="#fff0d0" x0={-400} x1={2000} />
        </Layer>
        <Particles t={tt} area={[-100, 100, 1500, 1500]} n={60} seed={12} op={0.7} color="#fff2cc" rise={-4} />
        <g filter="url(#bl8)">
          <Ign x={230} gy={1520} s={1.7} t={t} f={f} pose={{ armF: [8, 24], armB: [-4, 10], head: 14 }} wind={0.2} />
        </g>
        <Lit gy={1470} x={760} rimOp={0.9} rim="#ffe9b8" shadow={0} rimDx={-4} render={(fl) => <Death x={760} y={1470} s={1.75} t={tt} wind={0.2 * (1 - hold)} eye={0.8} fill={fl} armF={[34 + 30 * hold, 40 + 75 * hold]} armB={[-12, 22]} lean={-1 - 6 * turn} />} />
      </Stage2>
      <Fade frame={frame} dur={dur} i={8} o={10} color="#07060b" />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- 5: the cloak */

const CloakScene: React.FC<SP> = ({ dur }) => {
  const { frame, f, t } = use2();
  const far = useMemo(() => makeHill(281, 770, 40), []);
  const give = ez(f, ls(10) + 8, ls(10) + 70);
  const wrap = ez(f, ls(10) + 60, ls(11) + 10);
  const ghost = ez(f, ls(11) + 20, ls(11) + 90);
  const push = ez(frame, 0, dur);
  const dX = 600;
  const iX = 1010;
  const hx = 1006 + 4 * give;
  const hy = 122 + 8 * give;
  return (
    <AbsoluteFill>
      <Stage2 cam={{ s: 1.04 + 0.08 * push, x: 900, y: 545 }} vcam={{ s: 0.84 + 0.06 * push, x: 840, y: 545 }} ref0={{ x: 960, y: 545 }}>
        <Layer k={0.05}>
          <Sky2 id="c3" pal="dawn" sun={[1000, 480]} sunR={190} glow={1.3} t={t} />
        </Layer>
        <Layer k={0.35}>
          <path d={far.d} fill="#8a6679" opacity={0.75} />
          <Fog y={780} t={t} op={0.4} seed={2} color="#fff0d0" />
        </Layer>
        <RiverW t={t} sx={1000} />
        <BridgeSet t={t} lamps={[]} />
        <Lit gy={deck(dX) + 6} x={dX} rimOp={0.55} rim={RIM} shadow={0.25} rimDx={2} render={(fl) => <Death x={dX} y={deck(dX) + 8} s={1.35} t={t} wind={0.35} eye={0.8} fill={fl} armF={[72 - 6 * give, 28]} armB={[-12, 22]} lean={Math.sin(f * 0.07) * 3 * ghost} />} />
        <CloakSheet id="ck1" x={hx} y={hy} ang={Math.PI / 2 - 0.05 + 0.1 * Math.sin(t)} len={90 + 250 * give} w={120 - 40 * wrap} t={t} seed={7} op={Math.max(0, 1 - wrap * 0.8)} />
        <Ign x={iX} gy={deck(iX) + 6} flip s={1.15} t={t} f={f} ghost={ghost} silver={wrap} pose={{ armF: [10, 24], armB: [-4, 10], legF: [4, -2], legB: [-4, -2], head: -4 + 8 * wrap }} />
        <Particles t={t} area={[iX - 160, deck(iX) - 330, iX + 160, deck(iX)]} n={36} seed={31} op={0.9 * (0.3 + wrap)} color="#e6fff6" size={2.8} rise={30} />
        <Fog y={880} h={90} t={t + 3} op={0.2} seed={9} n={3} color="#ffe6c0" />
        <Particles t={t} area={[0, 250, 1920, 900]} n={40} seed={11} op={0.6} color="#fff1c8" />
        <Layer k={1.4} blur={5}>
          <path d={grass(24, () => 1100, -300, 2400, 24, 150)} fill={INK2} />
        </Layer>
      </Stage2>
      <Fade frame={frame} dur={dur} i={8} o={10} color="#07060b" />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- 6: the years */

const YearsScene: React.FC<SP> = ({ dur }) => {
  const { frame, f, t } = use2();
  const season = Math.min(1, (frame / (dur - 20)) * 1.0);
  const seg = Math.min(2.999, season * 3);
  const si = Math.floor(seg);
  const sk = seg - si;
  const wts = [0, 0, 0, 0];
  wts[si] = 1 - sk;
  wts[si + 1] = sk;
  const hillF = useMemo(() => makeHill(261, 760, 60), []);
  const hillM = useMemo(() => makeHill(262, 830, 35), []);
  const gr = useMemo(() => makeHill(263, 890, 10), []);
  const trees = useMemo(() => [520, 880, 1240, 1560, 1960].map((x, i) => makeTree(270 + i, x, gr.y(x) + 6, 460 + (i % 2) * 90, i % 2 ? 0.1 : -0.08, 5)), [gr]);
  const arrive = ez(frame, 0, dur - 40, 0, 1, (n) => n);
  const wx = 330 + arrive * 1260;
  const camx = wx + 280;
  const p = STRIDE(wx, 1.15);
  const snow = ez(season, 0.78, 0.95);
  const near = ez(wx, 1380, 1480);
  const hx = 1780;
  const sunPos: [number, number][] = [[900, 590], [1000, 330], [1250, 640], [800, 700]];
  const pals = ["dawn", "noon", "sunset", "winter"];
  return (
    <AbsoluteFill>
      <Stage2 cam={{ s: 1.05, x: camx, y: 565 }} vcam={{ s: 0.86, x: camx - 80, y: 575 }} ref0={{ x: 700, y: 565 }}>
        <Layer k={0.04}>
          {pals.map((pl, i) => (
            <g key={pl} opacity={i === 0 ? 1 : wts[i]}>
              <Sky2 id={"y" + i} pal={pl} sun={sunPos[i]} sunR={170} glow={1.2} t={t} stars={i === 3 ? 0.5 : 0} />
            </g>
          ))}
        </Layer>
        <Layer k={0.3}>
          <path d={hillF.d} fill="#7a6a8a" opacity={0.7} />
          <Fog y={770} t={t} op={0.32} seed={3} color="#fff0d0" x0={-500} x1={3500} />
        </Layer>
        <Layer k={0.6}>
          <path d={hillM.d} fill="#3a3346" opacity={0.92} />
          <path d={hillM.d} fill="#e6edf6" opacity={0.5 * snow} />
        </Layer>
        <path d={gr.d} fill={GROUND} />
        <path d={gr.d} fill="#dfe7f2" opacity={0.7 * snow} />
        {trees.map((tr, i) => (
          <g key={i}>
            <path d={tr.d} fill={INK2} />
            <Foliage tips={tr.tips} season={season} t={t} seed={i + 1} />
          </g>
        ))}
        <HouseC x={hx} y={gr.y(hx) + 4} w={190} h={110} t={t} lit={0.35 + 0.65 * ez(season, 0.4, 0.9) * (season < 0.78 ? 1 : 1)} />
        <Particles t={t} area={[camx - 700, 100, camx + 700, 900]} n={50} seed={41} op={0.9 * (season < 0.22 ? 1 : 0)} color="#f6b9c9" size={3.2} rise={-26} drift={14} />
        <Particles t={t} area={[camx - 700, 100, camx + 700, 900]} n={50} seed={42} op={0.9 * (season > 0.5 && season < 0.8 ? 1 : 0)} color="#d9822b" size={4} rise={-24} drift={16} />
        <Particles t={t} area={[camx - 700, 80, camx + 700, 900]} n={120} seed={43} op={0.95 * ez(season, 0.78, 0.9)} color="#ffffff" size={2.6} rise={-34} drift={10} />
        {near > 0.02 && (
          <>
            <Puppet2 kind="girl" flip x={hx - 130} y={gr.y(hx - 130) + 4} s={1.1} t={t} wind={0.2} fill={INK2} orn={0.4} pose={{ armF: [20, 30], armB: [-8, 16] }} />
            <Puppet2 kind="young" flip x={hx - 210 + 40 * (1 - near)} y={gr.y(hx - 210) + 4} s={0.6} t={t * 1.3} wind={0.3} fill={INK2} pose={{ ...walk(p * 1.6, 0.8) }} hat={false} />
          </>
        )}
        <Ign x={wx} gy={gr.y(wx) + 6 - Math.abs(Math.sin(p)) * 3} s={1.15} t={t} f={f} ghost={0.7 * (1 - near)} silver={1} wind={0.5} drag={0.5} pose={{ ...walk(p, 0.85), head: 0 }} />
        <Layer k={1.5} blur={5}>
          <path d={grass(25, () => 1180, -400, 3600, 26, 160)} fill={INK2} />
        </Layer>
      </Stage2>
      <Fade frame={frame} dur={dur} i={8} o={10} color="#07060b" />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- 7: the gift */

const SonScene: React.FC<SP> = ({ dur }) => {
  const { frame, f, t } = use2();
  const floor = 905;
  const fk = 0.85 + 0.15 * Math.sin(t * 9) * Math.sin(t * 3.7);
  const give = ez(f, ls(14) - 6, ls(14) + 50);
  const play = ez(f, ls(14) + 56, ls(14) + 110);
  const peek = 0.5 + 0.5 * Math.sin(t * 3.2);
  const push = ez(frame, 0, dur);
  const iHand = [770, 690];
  const sHand = [1060, 700];
  const pos = lerp(iHand, sHand, give);
  const childX = 930;
  return (
    <AbsoluteFill>
      <Stage2 cam={{ s: 1.05 + 0.08 * push, x: 960, y: 560 }} vcam={{ s: 0.86 + 0.06 * push, x: 930, y: 580 }} ref0={{ x: 960, y: 560 }}>
        <rect x={-1800} y={-1800} width={5400} height={5400} fill="#0e0806" />
        <rect x={-300} y={60} width={2500} height={floor - 60} fill="#33200f" />
        <rect x={-300} y={60} width={2500} height={floor - 60} fill="#8a5a2c" opacity={0.2} />
        <g>
          <rect x={1290} y={380} width={330} height={floor - 380} fill="#120a06" />
          <path d={`M1330,${floor} v-250 a125,125 0 0 1 250,0 v250Z`} fill="#050302" />
          <Glow x={1455} y={floor - 90} r={340 + 20 * fk} color="#ff9b45" op={0.75 * fk} />
          <path d={`M1390,${floor} q20,-90 40,-20 q10,-80 40,0 q20,-60 40,20 q20,-40 30,20Z`} fill="#ffd27a" opacity={fk} />
          <Particles t={t} area={[1360, floor - 360, 1560, floor - 40]} n={24} seed={5} size={3} op={0.9} rise={40} color="#ffcf80" drift={6} />
        </g>
        <g>
          <rect x={280} y={210} width={230} height={290} fill="#0a0806" />
          <rect x={296} y={226} width={198} height={258} fill="#1f2c4c" />
          <circle cx={430} cy={290} r={24} fill="#e6edf7" />
          <path d="M395,210 v290 M280,356 h230" stroke="#0a0806" strokeWidth={10} />
        </g>
        <rect x={-300} y={floor} width={2800} height={2000} fill="#0a0503" />
        <rect x={-300} y={floor} width={2800} height={14} fill="#ff9b45" opacity={0.22} />
        <ellipse cx={1200} cy={floor + 40} rx={540} ry={60} fill="#ff9b45" opacity={0.16} filter="url(#bl14)" />
        {/* old Ignotus with a staff */}
        <Ign x={640} gy={floor + 4} s={1.15} t={t * 0.6} f={f} wind={0.1} rim="#ffb36a" staff pose={{ armF: [26 + 40 * give, -22 + 40 * give], armB: [-6, 12], legF: [4, -2], legB: [-4, -2], lean: 14, head: 14 - 8 * play }} />
        {/* the son, bareheaded, takes it gently */}
        <Lit gy={floor + 4} x={1090} rimOp={0.7} rim="#ffb36a" shadow={0.2} rimDx={3} render={(fc, op) => <Puppet2 kind="kadm" flip x={1090} y={floor + 4} s={1.2} t={t * 0.7} wind={0.15} fill={fc} opacity={op} hat={false} orn={0.35} pose={{ armF: [40 + 30 * give, 34 + 10 * give - 30 * play], armB: [-6, 14], legF: [4, -2], legB: [-4, -2], head: 8 - 6 * play, lean: 3 + 4 * play }} />} />
        {/* the silver cloak: handed over, then used for play */}
        <CloakSheet id="ck3" x={pos[0]} y={pos[1]} ang={Math.PI / 2 + 0.25 - 0.9 * play + (give > 0.95 ? 0 : 0.4 * (1 - give))} len={150 - 20 * play} w={90} t={t * 0.8} seed={13} op={1} amp={0.18} />
        {/* the child hides in the cloak */}
        <g opacity={1}>
          <Ign x={childX} gy={floor + 4} s={0.62} t={t} f={f} ghost={play * (0.6 + 0.3 * peek)} wind={0.2} pose={{ armF: [30, 40], armB: [-10, 20], head: 6 }} rim="#ffb36a" />
        </g>
        <Particles t={t} area={[200, 200, 1900, 900]} n={40} seed={33} op={0.55} color="#ffd9a0" rise={6} />
      </Stage2>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 38%, rgba(8,4,2,0.6) 100%)" }} />
      <Fade frame={frame} dur={dur} i={10} o={10} color="#07060b" />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- 8: the hour */

const HourScene: React.FC<SP> = ({ dur }) => {
  const { frame, f, t } = use2();
  const V = React.useContext(VertCtx);
  const far = useMemo(() => makeHill(291, 790, 40), []);
  const gr = useMemo(() => makeHill(292, 880, 10), []);
  const tree = useMemo(() => makeTree(295, 140, gr.y(140) + 8, 560, 0.12, 5), [gr]);
  const arriveD = ez(f, 0, ls(16) + 20, 0, 1, (n) => n * (2 - n));
  const dX = (V ? 1300 : 1500) - arriveD * (V ? 470 : 560);
  const strip = ez(f, ls(15) + 70, le(15) + 10);
  const greet = ez(f, ls(16) - 4, ls(16) + 60);
  const smile = ez(f, ls(16) + 10, ls(16) + 80);
  const push = ez(frame, 0, dur);
  const iX = V ? 560 : 520;
  const shade = ez(f, ls(15), ls(15) + 60);
  return (
    <AbsoluteFill>
      <Stage2 cam={{ s: 1.04 + 0.1 * push, x: 960, y: 560 }} vcam={{ s: 0.84 + 0.08 * push, x: 880, y: 560 }} ref0={{ x: 960, y: 560 }}>
        <Layer k={0.05}>
          <Sky2 id="h" pal="sunset" sun={[1180, 650]} sunR={200} glow={1.4} t={t} stars={0.15 * shade} />
        </Layer>
        <Layer k={0.35}>
          <path d={far.d} fill="#6b4a6a" opacity={0.8} />
          <Fog y={790} t={t} op={0.36} seed={2} color="#ffc9a0" />
        </Layer>
        <path d={gr.d} fill={GROUND} />
        <path d={tree.d} fill={INK2} />
        <Foliage tips={tree.tips} season={0.6} t={t} seed={4} />
        <HouseC x={300} y={gr.y(300) + 4} w={190} h={110} t={t} lit={1} />
        <Fog y={880} h={110} t={t} op={0.22} seed={6} n={4} color="#ffc9a0" />
        <Lit gy={gr.y(dX) + 8} x={dX} rimOp={0.6} rim="#ffd29a" shadow={0.3} rimDx={-2} render={(fl) => <Death x={dX} y={gr.y(dX) + 8} s={1.05} flip t={t} wind={0.3} eye={0.7} smile={smile} fill={fl} armF={[34 + 18 * greet, 26]} armB={[-12, 24]} lean={-1} />} />
        <Ign x={iX} gy={gr.y(iX) + 6} s={1.15} t={t * 0.6} f={f} wind={0.1} rim="#ffd29a" staff ghost={0.55 * (1 - strip)} silver={1 - strip} pose={{ armF: [24 + 14 * greet, -24 + 30 * greet], armB: [-6, 12], legF: [4, -2], legB: [-4, -2], lean: 14 - 6 * greet, head: 12 + 10 * greet }} />
        {strip > 0.02 && strip < 0.99 && <CloakSheet id="ck4" x={iX - 8 - 40 * strip} y={gr.y(iX) - 180 + 100 * strip} ang={Math.PI / 2 + 0.5 * strip} len={170} w={74} t={t} seed={9} op={1 - strip} />}
        <Particles t={t} area={[iX - 200, gr.y(iX) - 360, iX + 200, gr.y(iX)]} n={30} seed={51} op={0.9 * Math.sin(Math.PI * strip)} color="#e6fff6" size={2.8} rise={26} />
        <Particles t={t} area={[0, 250, 1920, 900]} n={44} seed={11} op={0.7} color="#ffd9a0" />
        <Layer k={1.4} blur={5}>
          <path d={grass(26, () => 1100, -300, 2400, 24, 150)} fill={INK2} />
        </Layer>
      </Stage2>
      <Fade frame={frame} dur={dur} i={8} o={10} color="#07060b" />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- 9: together */

const EndScene3: React.FC<SP> = ({ dur }) => {
  const { frame, f, t } = use2();
  const V = React.useContext(VertCtx);
  const gr = useMemo(() => makeHill(301, 880, 12), []);
  const far = useMemo(() => makeHill(302, 790, 45), []);
  const gd = useMemo(() => grass(8, gr.y, -300, 2300, 9, 30), [gr]);
  const go = ez(f, ls(17) - 10, le(19) + 20, 0, 1, (n) => n);
  const px = (V ? 570 : 420) + go * (V ? 470 : 760);
  const p = STRIDE(px, 1.1);
  
  const join = ez(f, ls(18) - 10, ls(18) + 70);
  const melt = ez(f, le(19) - 10, le(19) + 70);
  const card = le(19) + 56;
  const cardIn = ez(frame, card, card + 34);
  const vt = V;
  const gy = (x: number) => gr.y(x) + 6;
  const fade = (1 - melt) * 1;
  return (
    <AbsoluteFill>
      <Stage2 cam={{ s: 1.04 + 0.05 * (frame / dur), x: 1000 + 40 * go, y: 560 }} vcam={{ s: 0.84 + 0.03 * (frame / dur), x: 800 + 130 * go, y: 570 }} ref0={{ x: 1000, y: 560 }}>
        <Layer k={0.05}>
          <Sky2 id="e3" pal="sunset" sun={[1480, 600]} sunR={230 + 40 * melt} glow={1.5} t={t} stars={0.2} />
        </Layer>
        <Layer k={0.35}>
          <path d={far.d} fill="#6b4a6a" opacity={0.8} />
          <Fog y={790} t={t} op={0.36} seed={2} color="#ffc9a0" />
        </Layer>
        <path d={gr.d} fill={GROUND} />
        <Fog y={885} h={110} t={t} op={0.25} seed={6} n={4} color="#ffc9a0" />
        <path d={gd} fill={GROUND} />
        {/* the three brothers walk after them */}
        <g opacity={0.55 * join * fade}>
          <Puppet x={px - 210} y={gy(px - 210)} s={1.05} t={t} wind={0.2} wand fill={WARMG} pose={walk(p + 1, 0.7)} />
          <Puppet2 kind="kadm" x={px - 330} y={gy(px - 330)} s={1.05} t={t} wind={0.2} fill={WARMG} pose={{ ...walk(p + 2, 0.7) }} />
          <Puppet2 kind="girl" x={px - 410} y={gy(px - 410)} s={1.05} t={t * 0.6} wind={0.1} fill={WARMG} orn={0} float={3} pose={{ armF: [16, 26], armB: [-8, 18] }} />
        </g>
        <g opacity={fade}>
          <Lit gy={gy(px)} x={px} rimOp={0.7} rim="#ffd29a" shadow={0.3} rimDx={3} render={(fl) => <Death x={px - 40} y={gy(px) + 4} s={1.0} t={t} wind={-0.35} eye={0.6} smile={0.9} fill={fl} armF={[10, 20]} armB={[-10, 20]} lean={1} />} />
          <Ign x={px + 150} gy={gy(px + 150)} s={1.05} t={t} f={f} wind={-0.2} rim="#ffd29a" staff pose={{ ...walk(p, 0.5), lean: 8, armF: [20, -18], head: -2 }} />
        </g>
        <Particles t={t} area={[px - 500, 300, px + 500, 900]} n={50} seed={37} op={0.85 * (0.3 + melt)} color="#ffe9b8" size={2.8} rise={30} />
        <Particles t={t} area={[0, 250, 2000, 900]} n={46} seed={11} op={0.6} color="#ffd9a0" />
        <Layer k={1.4} blur={5}>
          <path d={grass(27, () => 1100, -300, 2600, 24, 150)} fill={INK2} />
        </Layer>
      </Stage2>
      <AbsoluteFill style={{ backgroundColor: "#fff1d0", opacity: 0.55 * melt * (1 - cardIn) }} />
      <AbsoluteFill style={{ backgroundColor: "#07060b", opacity: cardIn * 0.95 }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: FONT, color: "#f3e8cf", opacity: ez(frame, card + 16, card + 50) }}>
        <div style={{ fontSize: vt ? 120 : 130, fontStyle: "italic", fontWeight: 600, textAlign: "center", lineHeight: 1.1, textShadow: "0 0 30px rgba(0,0,0,0.9)" }}>Конец</div>
        <svg width={520} height={40} style={{ margin: "26px 0 16px" }}>
          <path d="M20,20 L500,20" stroke="#e2c27c" strokeWidth={1.6} opacity={0.8} />
          <path d="M260,7 L273,20 L260,33 L247,20Z" fill="#e2c27c" />
        </svg>
        <div style={{ fontSize: vt ? 28 : 34, letterSpacing: vt ? "0.3em" : "0.4em", marginRight: vt ? "-0.3em" : "-0.4em", fontWeight: 600, opacity: 0.85 }}>СКАЗКА О ТРЁХ БРАТЬЯХ</div>
      </AbsoluteFill>
      <Fade frame={frame} dur={dur} i={12} o={30} color="#07060b" />
    </AbsoluteFill>
  );
};

export const SCENES3: Record<string, React.FC<SP>> = {
  last: LastScene,
  doubt: DoubtScene,
  wish: WishScene,
  pause: PauseScene,
  cloak: CloakScene,
  years: YearsScene,
  son: SonScene,
  hour: HourScene,
  end: EndScene3,
};
void [cloth, LIGHT, Sky2];
