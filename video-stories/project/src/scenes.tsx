import React, { useMemo } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import vo from "./vo.json";
import cues from "./cues.json";
import { Crow, Death, Fade, VertCtx, FlyCrow, grass, House, INK, LIGHT, makeHill, makeTree, P, Puppet, ribbon, rng, Sky, Stage, walk, Wand, ez, Limb } from "./art";
import { FONT } from "./fonts";

const FPS = 30;
type SP = { dur: number };
const sc = (n: string) => vo.scenes.find((s) => s.name === n)!;
/** frame (scene-local) at which line i starts / ends */
const ls = (i: number) => (vo.lines[i].start - sc(vo.lines[i].scene).start) * FPS;
const le = (i: number) => (vo.lines[i].end - sc(vo.lines[i].scene).start) * FPS;
const cue = (abs: number, scene: string) => (abs - sc(scene).start) * FPS;
const use2 = () => {
  const frame = useCurrentFrame();
  const f = Math.floor(frame / 2) * 2;
  return { frame, f, t: f / FPS };
};
const STRIDE = (x: number, s: number) => (x * 2 * Math.PI) / (262 * s);

export const Intro: React.FC<SP> = ({ dur }) => {
  const f = useCurrentFrame();
  const vt = React.useContext(VertCtx);
  return (
    <AbsoluteFill>
      <Stage cam={{ s: 1 + f * 0.0006, x: 960, y: 540 }}>
        <Sky id="i" sun={[960, 520]} sunR={0} disc={false} />
        <rect x={-1800} y={-1800} width={5400} height={5400} fill="#1a0f04" opacity={0.55} />
      </Stage>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: FONT, color: "#1a0f05" }}>
        <div style={{ fontSize: vt ? 31 : 40, letterSpacing: vt ? "0.3em" : "0.42em", fontWeight: 600, opacity: ez(f, 8, 30) * 0.85, marginRight: vt ? "-0.3em" : "-0.42em" }}>
          СКАЗКА О ТРЁХ БРАТЬЯХ
        </div>
        <svg width={560} height={40} style={{ margin: "18px 0 6px", opacity: ez(f, 16, 40) }}>
          <path d={`M${280 - 250 * ez(f, 14, 50)},20 L${280 + 250 * ez(f, 14, 50)},20`} stroke="#1a0f05" strokeWidth={2} />
          <path d="M280,6 L294,20 L280,34 L266,20Z" fill="#1a0f05" />
        </svg>
        <div style={{ fontSize: vt ? 176 : 190, fontWeight: 700, fontStyle: "italic", lineHeight: 1.05, opacity: ez(f, 22, 50), scale: String(0.96 + 0.04 * ez(f, 22, dur)) }}>
          Старший
        </div>
      </AbsoluteFill>
      <Fade frame={f} dur={dur} i={14} o={14} />
    </AbsoluteFill>
  );
};

/* 1 — the road */
const Road: React.FC<SP> = ({ dur }) => {
  const { frame, f, t } = use2();
  const far = useMemo(() => makeHill(11, 700, 70), []);
  const mid = useMemo(() => makeHill(12, 790, 45), []);
  const gr = useMemo(() => makeHill(13, 850, 20), []);
  const fg = useMemo(() => makeHill(14, 1035, 16), []);
  const tree = useMemo(() => makeTree(5, 330, gr.y(330) + 8, 800, 0.07), [gr]);
  const perch = useMemo(() => {
    const r = rng(8);
    return tree.tips.filter((p) => p[1] < 560 && r() < 0.09).slice(0, 9);
  }, [tree]);
  const gd = useMemo(() => grass(3, gr.y, -300, 2300, 9, 26), [gr]);
  const fgd = useMemo(() => grass(4, fg.y, -400, 2400, 7, 70), [fg]);
  const push = ez(frame, ls(1) - 12, dur, 0, 1);
  const bx = 640 + f * 1.9;
  const bro = [
    { k: "eldest" as const, s: 1.02, dx: 0 },
    { k: "middle" as const, s: 0.96, dx: -165 },
    { k: "young" as const, s: 0.86, dx: -315 },
  ];
  return (
    <AbsoluteFill>
      <Stage cam={{ s: 1 + 0.2 * push, x: 960 + 190 * push, y: 540 + 95 * push }} vcam={{ s: 0.92 + 0.12 * push, x: bx - 120, y: 540 }}>
        <Sky id="r" sun={[1230, 560]} sunR={135} />
        <path d={far.d} fill="#8b6230" opacity={0.55} />
        <path d={mid.d} fill="#553616" opacity={0.85} />
        <FlyCrow x={1500 - frame * 2.2} y={300 + Math.sin(frame / 20) * 20} s={0.8} flip flap={f * 0.5} />
        <FlyCrow x={1640 - frame * 2.0} y={350 + Math.sin(frame / 17) * 16} s={0.6} flip flap={f * 0.55 + 1} />
        <path d={tree.d} fill={INK} />
        {perch.map((p, i) => (
          <Crow key={i} x={p[0]} y={p[1] + 2} s={0.95} flip={i % 3 === 0} bob={Math.sin(t * 3 + i * 2) > 0.8 ? 2 : 0} />
        ))}
        <path d={gr.d} fill={INK} />
        <path d={gd} fill={INK} />
        {bro.map((b, i) => {
          const x = bx + b.dx;
          const p = STRIDE(x, b.s) + i * 1.3;
          return (
            <Puppet key={i} kind={b.k} x={x} y={gr.y(x) + 4 - Math.abs(Math.sin(p)) * 4} s={b.s} pose={walk(p)} t={t + i} wand={i === 0} wind={0.5} />
          );
        })}
        <g transform={`translate(${-push * 160},${push * 30})`}>
          <path d={fg.d} fill={INK} />
          <path d={fgd} fill={INK} />
          {[120, 420, 1380, 1650, 1850].map((x, i) => (
            <path key={i} fill={INK} d={P([[x - 11, fg.y(x) + 20], [x - 8 + i * 3 - 6, fg.y(x) - 120 - i * 9], [x + 6 + i * 3 - 6, fg.y(x) - 128 - i * 9], [x + 12, fg.y(x) + 20]])} />
          ))}
          <Crow x={1660} y={fg.y(1650) - 162} s={1.5} flip bob={Math.sin(t * 2) > 0.7 ? 3 : 0} />
        </g>
      </Stage>
      <Fade frame={frame} dur={dur} />
    </AbsoluteFill>
  );
};

/* 2 — youth: portrait, the boy, the defeat */
const YouthA: React.FC<SP> = ({ dur }) => {
  const { frame, f, t } = use2();
  const far = useMemo(() => makeHill(21, 930, 40), []);
  return (
    <AbsoluteFill>
      <Stage cam={{ s: 1.02 + (0.1 * frame) / dur, x: 960, y: 540 }} vcam={{ s: 0.72 + (0.07 * frame) / dur, x: 830, y: 540 }}>
        <Sky id="ya" sun={[890, 300]} sunR={200} />
        <path d={far.d} fill="#553616" opacity={0.8} />
        {[0, 1, 2].map((i) => (
          <FlyCrow key={i} x={1250 + i * 130 + frame * 0.9} y={250 + i * 70 - frame * 0.25} s={0.9 - i * 0.15} flap={f * 0.45 + i * 2} />
        ))}
        <Puppet
          kind="eldest"
          x={830}
          y={1290}
          s={3.6}
          t={t}
          wind={0.95}
          wand
          wandRot={-4}
          pose={{ armF: [48 + Math.sin(t * 1.3) * 2, 96], armB: [-12, 14], head: -5 + Math.sin(t) * 1.5, lean: -2 }}
        />
      </Stage>
      <Fade frame={frame} dur={dur} i={10} o={6} />
    </AbsoluteFill>
  );
};

const Burst: React.FC<{ x: number; y: number; r: number; seed?: number; rays?: number }> = ({ x, y, r, seed = 1, rays = 9 }) => {
  if (r <= 0) return null;
  const g = rng(seed);
  const pts: number[][] = [];
  for (let i = 0; i < rays * 2; i++) {
    const a = (i / (rays * 2)) * Math.PI * 2 + g() * 0.2;
    const rr = i % 2 ? r * (0.18 + g() * 0.12) : r * (0.6 + g() * 0.5);
    pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
  }
  return <path d={P(pts)} fill={LIGHT} />;
};

const YouthB: React.FC<SP> = ({ dur }) => {
  const { frame, f, t } = use2();
  const far = useMemo(() => makeHill(22, 720, 50), []);
  const gr = useMemo(() => makeHill(23, 850, 12), []);
  const gd = useMemo(() => grass(6, gr.y, -300, 2300, 8, 30), [gr]);
  const tree = useMemo(() => makeTree(15, 250, gr.y(250) + 6, 520, -0.05, 5), [gr]);
  const u = (f % 38) / 38;
  const th = ez(u, 0.12, 0.3) * (1 - ez(u, 0.5, 0.85));
  const hit = u > 0.28 && u < 0.5 ? 1 - (u - 0.28) / 0.22 : 0;
  const jolt = u > 0.28 ? Math.exp(-(u - 0.28) * 7) * Math.sin((u - 0.28) * 40) * 9 : 0;
  const sx = 1290;
  const sy = gr.y(sx);
  return (
    <AbsoluteFill>
      <Stage cam={{ s: 1.12 + (0.06 * frame) / dur, x: 1010, y: 620 }} vcam={{ s: 0.95 + (0.06 * frame) / dur, x: 1040, y: 600 }}>
        <Sky id="yb" sun={[1050, 500]} sunR={125} />
        <path d={far.d} fill="#8b6230" opacity={0.55} />
        <path d={tree.d} fill={INK} />
        <path d={gr.d} fill={INK} />
        <path d={gd} fill={INK} />
        <g transform={`rotate(${jolt} ${sx} ${sy})`} fill={INK}>
          <path d={P([[sx - 7, sy + 10], [sx - 5, sy - 300], [sx + 5, sy - 300], [sx + 8, sy + 10]])} />
          <path d={P([[sx - 115, sy - 236], [sx + 112, sy - 246], [sx + 112, sy - 236], [sx - 115, sy - 226]])} />
          <circle cx={sx} cy={sy - 290} r={27} />
          <path d={P([[sx - 34, sy - 306], [sx + 34, sy - 310], [sx + 6, sy - 368], [sx - 14, sy - 356]])} />
          <path d={P([[sx - 30, sy - 240], [sx + 30, sy - 244], [sx + 40, sy - 120], [sx + 18, sy - 138], [sx, sy - 112], [sx - 20, sy - 136], [sx - 38, sy - 118]])} />
          {[-108, -84, 88, 108].map((dx, i) => (
            <path key={i} d={ribbon(sx + dx, sy - 234, Math.PI / 2 + 0.15, 80 + i * 14, 16, t * 1.5, 90 + i, 0.2)} />
          ))}
        </g>
        <Burst x={sx - 30} y={sy - 205} r={hit * 85} seed={Math.floor(f / 2)} />
        {hit > 0.45 && <path d={`M${905},${sy - 150} L${sx - 40},${sy - 205}`} stroke={LIGHT} strokeWidth={5} opacity={0.9} />}
        <Puppet
          kind="boy"
          x={800 + th * 22}
          y={gr.y(800) + 4}
          s={0.72}
          t={t}
          wand
          wandRot={-6}
          wind={0.3}
          pose={{ armF: [34 + 62 * th, 70 - 64 * th], armB: [-30 - 20 * th, 30], lean: 5 + 16 * th, legF: [12 + 26 * th, -6 - 16 * th], legB: [-12 - 22 * th, -3], head: -4 }}
        />
      </Stage>
      <Fade frame={frame} dur={dur} i={6} o={6} />
    </AbsoluteFill>
  );
};

const YouthC: React.FC<SP & { turn: number }> = ({ dur, turn }) => {
  const { frame, f, t } = use2();
  const far = useMemo(() => makeHill(24, 730, 45), []);
  const gr = useMemo(() => makeHill(25, 865, 8), []);
  const gd = useMemo(() => grass(7, gr.y, -300, 2300, 8, 26), [gr]);
  const tree = useMemo(() => makeTree(18, 1700, gr.y(1700) + 6, 560, 0.08, 5), [gr]);
  const push = ez(frame, turn, dur, 0, 1);
  const away = Math.max(0, f - turn - 14);
  const ex = 1230 + away * 2.3;
  const es = 1.35;
  const rise = ez(f, turn + 20, dur - 10);
  const ky = gr.y(690) + 76 * 1.18;
  return (
    <AbsoluteFill>
      <Stage cam={{ s: 1 + 0.42 * push, x: 960 - 180 * push, y: 540 + 110 * push }} vcam={{ s: 0.9 + 0.5 * push, x: 960 - 200 * push, y: 540 + 110 * push }}>
        <Sky id="yc" sun={[1290, 450]} sunR={150} />
        <path d={far.d} fill="#8b6230" opacity={0.55} />
        <path d={tree.d} fill={INK} />
        <Crow x={1700 + 60} y={gr.y(1700) - 300} s={0.9} flip />
        <path d={gr.d} fill={INK} />
        <path d={gd} fill={INK} />
        <g fill={INK}>
          <path d={P([[905, 858], [950, 850], [951, 854], [906, 862]])} />
          <path d={P([[962, 857], [1004, 866], [1003, 870], [961, 861]])} />
        </g>
        {away > 0 ? (
          <Puppet kind="enemy" x={ex} y={gr.y(ex) + 4} s={es} t={t} wand wind={0.6} pose={walk(STRIDE(ex, es))} />
        ) : (
          <Puppet
            kind="enemy"
            x={1230}
            y={gr.y(1230) + 4}
            s={es}
            flip={f < turn + 6}
            t={t}
            wand
            wind={0.5}
            pose={{ armF: [58 - ez(f, turn - 10, turn + 4) * 50, 6], armB: [-8, 12], head: 12, legF: [8, -2], legB: [-8, -2] }}
          />
        )}
        <Puppet
          kind="eldest"
          x={690}
          y={ky}
          s={1.18}
          t={t}
          wind={0.35}
          pose={{
            legB: [-10, -100],
            legF: [60, -120],
            lean: 46 - rise * 26,
            head: 30 - rise * 44,
            armF: [-34 + rise * 18, 12 + rise * 70],
            armB: [-20, 10],
          }}
        />
      </Stage>
      <Fade frame={frame} dur={dur} i={6} o={10} />
    </AbsoluteFill>
  );
};

const Youth: React.FC<SP> = ({ dur }) => {
  const a = Math.round(ls(3) - 8);
  const b = Math.round(ls(4) - 10);
  return (
    <>
      <Sequence durationInFrames={a}>
        <YouthA dur={a} />
      </Sequence>
      <Sequence from={a} durationInFrames={b - a}>
        <YouthB dur={b - a} />
      </Sequence>
      <Sequence from={b} durationInFrames={dur - b}>
        <YouthC dur={dur - b} turn={Math.round(ls(5) - b - 6)} />
      </Sequence>
    </>
  );
};

/* 3 — the bridge */
const deckY = (x: number) => 690 - 52 * Math.sin(Math.PI * Math.max(0, Math.min(1, (x - 180) / 1560)));
const Bridge: React.FC<SP> = ({ dur }) => {
  const { frame, f, t } = use2();
  const far = useMemo(() => makeHill(31, 760, 50), []);
  const tl = useMemo(() => makeTree(33, 60, 640, 560, 0.1, 5), []);
  const tr = useMemo(() => makeTree(34, 1860, 650, 640, -0.08, 5), []);
  const ripples = useMemo(() => {
    const r = rng(35);
    return Array.from({ length: 46 }, () => ({ x: r() * 2200 - 140, y: 915 + r() * r() * 200, w: 30 + r() * 150, p: r() * 6 }));
  }, []);
  const bridge = useMemo(() => {
    const top: number[][] = [];
    const bot: number[][] = [];
    for (let x = 140; x <= 1780; x += 40) {
      top.push([x, deckY(x)]);
      bot.push([x, deckY(x) + 30]);
    }
    let d = P([...top, ...bot.reverse()]);
    const piers = [330, 750, 1170, 1590];
    for (const px of piers) d += P([[px - 30, deckY(px) + 20], [px + 30, deckY(px) + 20], [px + 40, 1300], [px - 40, 1300]]);
    for (let i = 0; i < piers.length - 1; i++) {
      const x0 = piers[i] + 28;
      const x1 = piers[i + 1] - 28;
      const m = (x0 + x1) / 2;
      d += `M${x0},${deckY(x0) + 26}L${x1},${deckY(x1) + 26}L${x1},${deckY(x1) + 230}Q${m},${deckY(m) - 60} ${x0},${deckY(x0) + 230}Z`;
    }
    for (let x = 180; x <= 1740; x += 60) d += P([[x - 3, deckY(x) + 4], [x - 3, deckY(x) - 34], [x + 3, deckY(x) - 34], [x + 3, deckY(x) + 4]]);
    return d;
  }, []);
  const rail = useMemo(() => {
    let d = "M";
    for (let x = 170; x <= 1750; x += 20) d += `${x},${deckY(x) - 34}L`;
    return d.slice(0, -1);
  }, []);
  const rise = ez(frame, 8, 62, 560, 0, (n) => 1 - Math.pow(1 - n, 3));
  const step = ez(f, le(6) - 24, le(6) + 10);
  const ex = 1250 - step * 150;
  const point = ez(f, ls(7) + 4, ls(7) + 26);
  const push = ez(frame, 0, dur);
  return (
    <AbsoluteFill>
      <Stage cam={{ s: 1 + 0.13 * push, x: 960 - 30 * push, y: 540 + 20 * push }} vcam={{ s: 0.8 + 0.1 * push, x: 1000 - 20 * push, y: 540 + 20 * push }}>
        <defs>
          <clipPath id="bdeck">
            <path d={`M-600,-900 L2600,-900 L2600,${deckY(1780) + 4} ${Array.from({ length: 42 }, (_, i) => `L${1780 - i * 40},${deckY(1780 - i * 40) + 4}`).join(" ")} L-600,${deckY(140) + 4}Z`} />
          </clipPath>
          <filter id="bmist" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="30" />
          </filter>
        </defs>
        <Sky id="b" sun={[760, 430]} sunR={150} />
        <path d={far.d} fill="#8b6230" opacity={0.5} />
        <rect x={-1200} y={900} width={4400} height={2600} fill="#f0d79c" opacity={0.28} />
        {ripples.map((r, i) => (
          <rect key={i} x={r.x + Math.sin(t * 0.8 + r.p) * 14} y={r.y} width={r.w} height={3} fill={INK} opacity={0.45} />
        ))}
        <path d={tl.d} fill={INK} />
        <path d={tr.d} fill={INK} />
        <path fill={INK} d={P([[-700, 1300], [-700, 560], [-60, 600], [150, 660], [260, 760], [330, 1300]])} />
        <path fill={INK} d={P([[2600, 1300], [2600, 580], [1960, 610], [1760, 660], [1650, 760], [1590, 1300]])} />
        <g clipPath="url(#bdeck)">
          <ellipse cx={700} cy={deckY(700) - 30} rx={260} ry={70} fill={LIGHT} opacity={0.28 * ez(frame, 0, 40) * (1 - 0.5 * ez(frame, 60, 140))} filter="url(#bmist)" />
          <Death x={690} y={deckY(690) + 6 + rise} s={1.08} t={t} wind={0.4} lean={-2 + Math.sin(t * 0.8) * 1.5} armF={[22 + 50 * ez(f, 70, 130), 28]} armB={[-10 - 22 * ez(f, 80, 140), 30]} />
        </g>
        <path d={bridge} fill={INK} />
        <path d={rail} stroke={INK} strokeWidth={6} fill="none" />
        <Puppet kind="young" flip x={1500 + ez(f, 30, 60) * 26} y={deckY(1510) + 4} s={0.9} t={t + 2} wind={-0.3} pose={{ armF: [20, 50], lean: -6 * ez(f, 30, 60), legF: [-8, -3], legB: [10, -3] }} />
        <Puppet kind="middle" flip x={1385} y={deckY(1385) + 4} s={1.0} t={t + 1} wind={-0.3} pose={{ armF: [10, 20], armB: [-6, 12], legF: [6, -2], legB: [-6, -2], head: Math.sin(t) * 2 }} />
        <Puppet
          kind="eldest"
          flip
          x={ex}
          y={deckY(ex) + 4 - (step > 0 && step < 1 ? Math.abs(Math.sin(STRIDE(1250 - ex, 1.06))) * 4 : 0)}
          s={1.06}
          t={t}
          wind={-0.5}
          pose={
            step > 0 && step < 1
              ? walk(STRIDE(1250 - ex, 1.06))
              : { armF: [8 + 88 * point, 14 - 8 * point], armB: [-8, 12], legF: [10, -3], legB: [-10, -3], head: -6 * point, lean: 3 * point }
          }
        />
      </Stage>
      <Fade frame={frame} dur={dur} />
    </AbsoluteFill>
  );
};

/* 4 — the elder branch */
const ik = (S: number[], T: number[], l1: number, l2: number, bend = 1) => {
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
const bone = (A: number[], B: number[], w0: number, w1: number) => {
  const a = Math.atan2(B[1] - A[1], B[0] - A[0]);
  const nx = -Math.sin(a);
  const ny = Math.cos(a);
  return P([[A[0] + (nx * w0) / 2, A[1] + (ny * w0) / 2], [B[0] + (nx * w1) / 2, B[1] + (ny * w1) / 2], [B[0] - (nx * w1) / 2, B[1] - (ny * w1) / 2], [A[0] - (nx * w0) / 2, A[1] - (ny * w0) / 2]]);
};
const lerp = (a: number[], b: number[], k: number) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];

const Elder: React.FC<SP> = ({ dur }) => {
  const { frame, f, t } = use2();
  const sn = Math.round(cue(cues.snap, "elder"));
  const gr = useMemo(() => makeHill(41, 930, 14), []);
  const tree = useMemo(() => makeTree(42, 210, 960, 1500, 0.2, 6), []);
  const berries = useMemo(() => {
    const r = rng(43);
    return tree.tips
      .filter((p) => p[0] > 150 && p[0] < 900 && p[1] > 60 && r() < 0.22)
      .map((p) => ({ p, n: Array.from({ length: 9 }, () => [(r() - 0.5) * 34, r() * 26 + 6, 3 + r() * 3]) }));
  }, [tree]);
  const ripples = useMemo(() => {
    const r = rng(45);
    return Array.from({ length: 30 }, () => ({ x: r() * 2200 - 140, y: 975 + r() * 120, w: 40 + r() * 160, p: r() * 6 }));
  }, []);
  const B0 = [470, 500];
  const BR = [770, 372];
  const TIP = [930, 332];
  const G = [850, 352];
  const S = [1262, 640];
  const rest = [930, 760];
  const give = [720, 650];
  const k1 = ez(f, 14, sn - 6);
  const k2 = ez(f, sn, sn + 5, 0, 1, (n) => n);
  const k3 = ez(f, sn + 16, dur - 34);
  let Hn = lerp(rest, G, k1);
  if (f >= sn) Hn = lerp(lerp(G, [880, 470], k2), give, k3);
  const arm = ik(S, Hn, 300, 290, 1);
  const fa = Math.atan2(arm.H[1] - arm.E[1], arm.H[0] - arm.E[0]);
  const snapped = f >= sn;
  const wa = snapped ? (-14 + (200 + 14) * ez(f, sn, sn + 40)) * (Math.PI / 180) : Math.atan2(TIP[1] - BR[1], TIP[0] - BR[0]);
  const twig = snapped ? 1 - ez(f, sn + 4, sn + 30) : 1;
  const recoil = snapped ? Math.exp(-(f - sn) / 9) * Math.sin((f - sn) / 2.4) * 5 : -k1 * 2.5;
  const wl = 170;
  const wc = snapped ? arm.H : G;
  const wA = snapped ? [wc[0] - Math.cos(wa) * wl * 0.35, wc[1] - Math.sin(wa) * wl * 0.35] : BR;
  const wB = snapped ? [wc[0] + Math.cos(wa) * wl * 0.65, wc[1] + Math.sin(wa) * wl * 0.65] : TIP;
  const reach = ez(f, sn + 30, dur - 26);
  const tw = (u: number, ang: number, len: number) => {
    const o = lerp(wA, wB, u);
    const a = wa + ang;
    return bone(o, [o[0] + Math.cos(a) * len * twig, o[1] + Math.sin(a) * len * twig], 4.5, 1);
  };
  return (
    <AbsoluteFill>
      <Stage cam={{ s: 1.02 + (0.08 * frame) / dur, x: 960, y: 540 }} vcam={{ s: 0.72 + (0.06 * frame) / dur, x: 980, y: 540 }}>
        <Sky id="e" sun={[1150, 430]} sunR={175} />
        <rect x={-1200} y={960} width={4400} height={2600} fill="#f0d79c" opacity={0.3} />
        {ripples.map((r, i) => (
          <rect key={i} x={r.x + Math.sin(t * 0.8 + r.p) * 14} y={r.y} width={r.w} height={3} fill={INK} opacity={0.4} />
        ))}
        <path d={tree.d} fill={INK} />
        {berries.map((b, i) => (
          <g key={i} fill={INK}>
            {b.n.map((c, j) => (
              <circle key={j} cx={b.p[0] + c[0]} cy={b.p[1] + c[1]} r={c[2]} />
            ))}
          </g>
        ))}
        <path d={gr.d} fill={INK} />
        <rect x={-1200} y={1004} width={4400} height={2600} fill="#caa860" opacity={0.42} />
        {ripples.map((r, i) => (
          <rect key={"w" + i} x={r.x + Math.sin(t * 0.8 + r.p) * 14} y={r.y + 36} width={r.w} height={3} fill={INK} opacity={0.55} />
        ))}
        <g transform={`rotate(${recoil} ${B0[0]} ${B0[1]})`} fill={INK}>
          <path d={bone([330, 590], B0, 40, 26)} />
          <path d={bone(B0, BR, 26, 11)} />
          <path d={bone(lerp(B0, BR, 0.45), [650, 345], 9, 2)} />
          <path d={bone(lerp(B0, BR, 0.75), [730, 440], 8, 2)} />
          {[[650, 345], [730, 440]].map((p, i) => (
            <g key={i}>
              {[0, 1, 2, 3, 4, 5, 6].map((j) => (
                <circle key={j} cx={p[0] + Math.cos(j * 1.9) * 14} cy={p[1] + 10 + Math.sin(j * 2.3) * 10} r={4.5} />
              ))}
            </g>
          ))}
        </g>
        <g fill={INK}>
          <path d={bone(wA, wB, 11, 3)} />
          {twig > 0.02 && (
            <>
              <path d={tw(0.35, -0.9, 46)} />
              <path d={tw(0.6, 0.8, 40)} />
              <path d={tw(0.8, -0.7, 30)} />
            </>
          )}
        </g>
        {snapped && f < sn + 5 && <Burst x={BR[0]} y={BR[1]} r={46 - (f - sn) * 8} seed={f} rays={7} />}
        {snapped &&
          [0, 1, 2, 3, 4, 5].map((i) => {
            const u = (f - sn) / 30;
            return <rect key={i} x={BR[0] + (i - 2.5) * 16 * u * 3} y={BR[1] + u * u * 420 + i * 6 - u * 60} width={7} height={3} fill={INK} transform={`rotate(${f * 20 + i * 50} ${BR[0] + (i - 2.5) * 16 * u * 3} ${BR[1] + u * u * 420})`} />;
          })}
        <Death x={1280} y={1330} s={1.6} flip t={t} armF={null} armB={[-14, 26]} wind={-0.2} lean={-2 - k1 * 3 + k3 * 5} />
        <g fill={INK}>
          <path d={bone(S, arm.E, 34, 17)} />
          <circle cx={arm.E[0]} cy={arm.E[1]} r={9} />
          <path d={bone(arm.E, arm.H, 17, 9)} />
          {[0, 1, 2].map((i) => (
            <path key={i} d={ribbon(lerp(S, arm.E, 0.25 + i * 0.25)[0], lerp(S, arm.E, 0.25 + i * 0.25)[1], Math.PI * 0.42 - i * 0.05, 170 + i * 30, 34, t * 1.3, 60 + i, 0.2)} />
          ))}
          {[-0.5, -0.2, 0.1, 0.4].map((da, i) => (
            <path key={i} d={bone(arm.H, [arm.H[0] + Math.cos(fa + da) * 46, arm.H[1] + Math.sin(fa + da) * 46], 5, 2)} />
          ))}
        </g>
        <Puppet
          kind="eldest"
          x={420}
          y={1380}
          s={2.4}
          t={t}
          wind={0.3}
          pose={{ armF: [70 + reach * 46, 30 - reach * 18], armB: [-10, 10], head: -14, lean: 2 + reach * 4 }}
        />
        {[0, 1].map((i) => (
          <FlyCrow key={i} x={380 + i * 90 + Math.max(0, frame - sn) * (5 + i)} y={200 - i * 60 - Math.max(0, frame - sn) * (2.2 + i * 0.6)} s={snapped ? 1 : 0} flap={f * 0.6 + i} />
        ))}
      </Stage>
      <Fade frame={frame} dur={dur} />
    </AbsoluteFill>
  );
};

/* 5 — the journey */
const Journey: React.FC<SP> = ({ dur }) => {
  const { frame, f, t } = use2();
  const far = useMemo(() => makeHill(51, 650, 70), []);
  const mid = useMemo(() => makeHill(52, 810, 40), []);
  const fg = useMemo(() => makeHill(53, 1040, 20), []);
  const gd = useMemo(() => grass(8, mid.y, -300, 2500, 9, 24), [mid]);
  const fgd = useMemo(() => grass(9, fg.y, -600, 3200, 7, 80), [fg]);
  const houses = [
    { x: 1330, w: 70, h: 44, r: 0.9 },
    { x: 1420, w: 90, h: 60, r: 0.8, c: true, l: true },
    { x: 1520, w: 60, h: 120, r: 1.9 },
    { x: 1600, w: 100, h: 56, r: 0.75, l: true },
    { x: 1700, w: 76, h: 48, r: 0.9, c: true },
    { x: 1790, w: 96, h: 64, r: 0.8, l: true },
    { x: 1890, w: 70, h: 40, r: 0.9 },
  ];
  const x = 330 + f * 2.05;
  const s = 0.82;
  const p = STRIDE(x, s);
  return (
    <AbsoluteFill>
      <Stage cam={{ s: 1.06, x: 930 + (130 * frame) / dur, y: 540 }} vcam={{ s: 0.95, x: 640 + (330 * frame) / dur, y: 540 }}>
        <Sky id="j" sun={[1590, 450]} sunR={125} />
        <g opacity={0.6} fill="#6f4a20">
          {[1420, 1700].map((hx, i) => (
            <path key={i} d={ribbon(hx + 20, far.y(hx) - 130, -Math.PI / 2 + 0.5, 300, 40, t * 0.6, 120 + i, 0.2)} opacity={0.6} />
          ))}
        </g>
        <path d={far.d} fill="#7a5426" opacity={0.75} />
        <g opacity={0.92}>
          {houses.map((h, i) => (
            <House key={i} x={h.x} y={far.y(h.x) + 6} w={h.w} h={h.h} roof={h.r} chimney={h.c} lit={h.l} />
          ))}
        </g>
        {[0, 1, 2].map((i) => (
          <FlyCrow key={i} x={500 + i * 120 + frame * (2.4 + i * 0.3)} y={260 + i * 50 + Math.sin(frame / 18 + i) * 18} s={0.8 - i * 0.12} flap={f * 0.5 + i * 2} />
        ))}
        <path d={mid.d} fill={INK} />
        <path d={gd} fill={INK} />
        <Puppet kind="eldest" x={x} y={mid.y(x) + 4 - Math.abs(Math.sin(p)) * 3} s={s} pose={walk(p)} t={t} wand wind={0.75} />
        <g transform={`translate(${-frame * 2.2},0)`}>
          <path d={fg.d} fill={INK} />
          <path d={fgd} fill={INK} />
          <g fill={INK}>
            <path d={P([[1690, 1060], [1694, 800], [1706, 800], [1712, 1060]])} />
            <path d={P([[1700, 820], [1820, 826], [1850, 842], [1820, 858], [1700, 852]])} />
          </g>
        </g>
      </Stage>
      <Fade frame={frame} dur={dur} />
    </AbsoluteFill>
  );
};

/* 6 — the duel */
const Duel: React.FC<SP> = ({ dur }) => {
  const { frame, f, t } = use2();
  const fl = Math.round(cue(cues.flash, "duel"));
  const gr = useMemo(() => makeHill(61, 872, 6), []);
  const far = useMemo(() => makeHill(62, 760, 30), []);
  const gy = gr.y(960);
  const ready = ez(f, 8, 40);
  const lunge = ez(f, fl - 9, fl - 1, 0, 1, (n) => n * n);
  const relax = ez(f, fl + 24, fl + 70);
  const bow = ez(f, ls(12) - 6, ls(12) + 30);
  const eRaise = ez(f, fl - 26, fl - 10);
  const fall = ez(frame, fl, fl + 17, 0, 1, (n) => n);
  const after = frame >= fl;
  const push = ez(frame, ls(11) + 24, dur, 0, 1);
  const sh = rng(frame * 3 + 2);
  const shake = after && frame < fl + 12 ? (1 - (frame - fl) / 12) * 16 : 0;
  const bolt = useMemo(() => {
    const r = rng(Math.floor(frame / 2) + 5);
    const A = [752, gy - 268];
    const B = [1350, gy - 235];
    const L: number[][] = [];
    const R: number[][] = [];
    const n = 9;
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const o = i === 0 || i === n ? 0 : (r() - 0.5) * 90;
      const w = 5 + 16 * Math.sin(u * Math.PI);
      const p = [A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u + o];
      L.push([p[0], p[1] - w]);
      R.push([p[0], p[1] + w]);
    }
    return P([...L, ...R.reverse()]);
  }, [Math.floor(frame / 2), gy]);
  const ww = Math.min(1, Math.max(0, (frame - fl) / 26));
  return (
    <AbsoluteFill>
      <Stage cam={{ s: 1 + 0.5 * push, x: 960 - 330 * push + (sh() - 0.5) * shake, y: 540 + 90 * push + (sh() - 0.5) * shake }} vcam={{ s: 0.8 + 0.6 * push, x: 960 - 330 * push + (sh() - 0.5) * shake, y: 540 + 90 * push }}>
        <defs>
          <filter id="dglow" x="-50%" y="-200%" width="200%" height="500%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>
        <Sky id="d" sun={[960, 470]} sunR={150} />
        <path d={far.d} fill="#8b6230" opacity={0.5} />
        <g opacity={0.75}>
          <House x={760} y={790} w={90} h={60} />
          <House x={1130} y={790} w={110} h={70} chimney />
          <House x={945} y={790} w={56} h={130} roof={2.2} />
        </g>
        <House x={90} y={gy} w={380} h={330} roof={0.7} chimney lit />
        <House x={-190} y={gy} w={300} h={470} roof={0.8} />
        <House x={2010} y={gy} w={400} h={350} roof={0.7} chimney />
        <House x={2300} y={gy} w={300} h={500} roof={0.8} lit />
        <path d={gr.d} fill={INK} />
        {after && frame < fl + 6 && (
          <>
            <path d={bolt} fill={LIGHT} filter="url(#dglow)" />
            <path d={bolt} fill="#fffbe8" />
            <Burst x={1350} y={gy - 235} r={170 - (frame - fl) * 22} seed={frame} rays={11} />
            <Burst x={752} y={gy - 268} r={80} seed={frame + 3} rays={8} />
          </>
        )}
        <Puppet
          kind="eldest"
          x={560 + lunge * 46 - relax * 20}
          y={gy + 4}
          s={1.15}
          t={t}
          wand
          wind={0.5 + lunge * 0.6 - relax * 0.4}
          pose={{
            armF: [10 + 34 * ready + 54 * lunge - 80 * relax, 14 + 40 * ready - 50 * lunge + 6 * relax],
            armB: [-10 - 30 * lunge + 30 * relax, 14],
            lean: 2 * ready + 14 * lunge - 16 * relax,
            legF: [8 + 6 * ready + 24 * lunge - 28 * relax, -4 - 6 * ready - 14 * lunge + 20 * relax],
            legB: [-8 - 6 * ready - 20 * lunge + 24 * relax, -3],
            head: 20 * bow,
          }}
        />
        <Puppet
          kind="enemy"
          flip
          x={1360 + fall * 170}
          y={gy + 4 - Math.sin(fall * Math.PI) * 70 - fall * 12}
          rot={fall * 90}
          s={1.15}
          t={t}
          wand={!after}
          wind={after ? 0.1 : -0.4}
          pose={
            after
              ? { armF: [30 + 130 * fall, 10], armB: [-20 - 60 * fall, 10], legF: [10 + 30 * fall * (1 - fall) * 4, -10], legB: [-12, -18 * fall], head: -16 * fall }
              : { armF: [10 + 30 * ready + 60 * eRaise, 14 + 30 * ready - 38 * eRaise], armB: [-10, 14], legF: [10 + 6 * ready, -6 * ready - 3], legB: [-10 - 6 * ready, -3], lean: 3 * ready }
          }
        />
        {after && (
          <g transform={`translate(${1250 + ww * 420},${gy - 250 - Math.sin(ww * Math.PI) * 240 + ww * 246}) rotate(${ww * 620 + 80})`} fill={INK}>
            <Wand len={66} />
          </g>
        )}
        {fall >= 1 && frame < fl + 60 &&
          [0, 1, 2, 3].map((i) => (
            <circle key={i} cx={1520 + i * 70} cy={gy - 10 - (frame - fl - 17) * 0.8} r={30 + (frame - fl - 17) * 1.6 + i * 6} fill="#3a2610" opacity={0.35 * (1 - (frame - fl - 17) / 43)} filter="url(#dglow)" />
          ))}
      </Stage>
      {after && <AbsoluteFill style={{ backgroundColor: "#fff6d6", opacity: ez(frame, fl, fl + 12, 0.62, 0, (n) => n) }} />}
      <Fade frame={frame} dur={dur} />
    </AbsoluteFill>
  );
};

/* 7 — the inn */
const Mug: React.FC = () => (
  <g transform="translate(0,4) rotate(180)">
    <path d="M-9,-4 L9,-4 L8,20 L-8,20Z" />
    <path d="M9,2 Q20,8 9,15" stroke={INK} strokeWidth={3} fill="none" />
  </g>
);
const Inn: React.FC<SP> = ({ dur }) => {
  const { frame, f, t } = use2();
  const heard = ls(16);
  const push = ez(frame, heard - 26, heard + 26);
  const shout = ez(f, ls(14) - 6, ls(14) + 8);
  const shout2 = ez(f, ls(15) - 4, ls(15) + 10);
  const hush = ez(f, heard - 30, heard);
  const tableY = 770;
  const floor = 925;
  const sit = [
    { x: 470, k: "middle" as const, fl: false },
    { x: 620, k: "boy" as const, fl: false },
    { x: 760, k: "young" as const, fl: false },
    { x: 1170, k: "young" as const, fl: true },
    { x: 1310, k: "middle" as const, fl: true },
    { x: 1450, k: "boy" as const, fl: true },
  ];
  const sway = Math.sin(t * 1.7) * (1 - hush * 0.6);
  return (
    <AbsoluteFill>
      <Stage cam={{ s: 1.03 + 0.95 * push, x: 960 - 560 * push, y: 540 + 70 * push }} vcam={{ s: 0.9 + 0.85 * push, x: 960 - 560 * push, y: 600 + 40 * push }}>
        <defs>
          <filter id="iglow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="50" />
          </filter>
        </defs>
        <Sky id="n" sun={[900, 420]} sunR={0} disc={false} />
        {[[620, 300], [1330, 310]].map((p, i) => {
          const fk = 0.85 + 0.15 * Math.sin(t * 9 + i * 2) * Math.sin(t * 3.3 + i);
          const sw = Math.sin(t * 1.1 + i) * 2.5;
          return (
            <g key={i} transform={`rotate(${sw} ${p[0]} 60)`}>
              <circle cx={p[0]} cy={p[1]} r={170} fill={LIGHT} opacity={0.6 * fk} filter="url(#iglow)" />
              <path d={`M${p[0]},60 L${p[0]},${p[1] - 44}`} stroke={INK} strokeWidth={4} />
              <path fill={INK} d={P([[p[0] - 30, p[1] - 44], [p[0] + 30, p[1] - 44], [p[0] + 22, p[1] - 32], [p[0] - 22, p[1] - 32]])} />
              <path d={`M${p[0] - 22},${p[1] - 32} L${p[0] - 26},${p[1] + 32} M${p[0] + 22},${p[1] - 32} L${p[0] + 26},${p[1] + 32} M${p[0]},${p[1] - 32} L${p[0]},${p[1] + 32}`} stroke={INK} strokeWidth={4} />
              <path fill={INK} d={P([[p[0] - 32, p[1] + 30], [p[0] + 32, p[1] + 30], [p[0] + 24, p[1] + 44], [p[0] - 24, p[1] + 44]])} />
              <ellipse cx={p[0]} cy={p[1] + 4} rx={11} ry={20 * fk} fill="#fffbe6" />
            </g>
          );
        })}
        <g fill={INK}>
          <rect x={-600} y={-1800} width={3200} height={1890} />
          <rect x={90} y={0} width={74} height={1100} />
          <rect x={1756} y={0} width={74} height={1100} />
          <path d={P([[164, 90], [330, 90], [164, 260]])} />
          <path d={P([[1756, 90], [1590, 90], [1756, 260]])} />
          <rect x={-1200} y={-1800} width={1290} height={4800} opacity={0.82} />
          <rect x={1830} y={-1800} width={1300} height={4800} opacity={0.82} />
          <rect x={1420} y={236} width={300} height={10} />
          {[1440, 1480, 1530, 1580, 1630, 1680].map((bx, i) => (
            <path key={i} d={i % 2 ? P([[bx - 12, 236], [bx - 12, 200], [bx - 5, 190], [bx - 5, 172], [bx + 5, 172], [bx + 5, 190], [bx + 12, 200], [bx + 12, 236]]) : P([[bx - 15, 236], [bx - 17, 206], [bx - 8, 196], [bx + 8, 196], [bx + 17, 206], [bx + 15, 236]])} />
          ))}
          {[300, 1000, 1150].map((hx, i) => (
            <g key={i} transform={`rotate(${Math.sin(t * 1.3 + i * 2) * 4} ${hx} 90)`}>
              <rect x={hx - 1.5} y={88} width={3} height={50 + i * 12} />
              <ellipse cx={hx} cy={166 + i * 12} rx={17} ry={30} />
            </g>
          ))}
        </g>
        {sit.map((p, i) => {
          const cheer = (0.5 + 0.5 * Math.sin(t * 3 + i * 1.7)) * (1 - hush);
          return (
            <Puppet
              key={i}
              kind={p.k}
              flip={p.fl}
              x={p.x}
              y={850 + 150 * 0.95}
              s={p.k === "boy" ? 0.9 : 0.95}
              t={t + i}
              wind={0.1}
              cape={false}
              hand={<Mug />}
              pose={{ legF: [88, -88], legB: [84, -84], lean: 6 + 3 * Math.sin(t * 2 + i), armF: [62 + 40 * cheer, 84 + 20 * cheer], armB: [40, 70], head: -10 * cheer - 4 }}
            />
          );
        })}
        <g fill={INK}>
          <rect x={400} y={tableY} width={1120} height={26} />
          <path d={P([[520, 796], [560, 796], [500, floor], [460, floor]])} />
          <path d={P([[520, 796], [480, 796], [560, floor], [600, floor]])} />
          <path d={P([[1400, 796], [1440, 796], [1380, floor], [1340, floor]])} />
          <path d={P([[1400, 796], [1360, 796], [1440, floor], [1480, floor]])} />
          <rect x={410} y={850} width={1100} height={12} />
          <rect x={-600} y={floor} width={3200} height={2400} />
          {[820, 1060, 1110].map((mx, i) => (
            <path key={i} d={P([[mx - 10, tableY], [mx - 9, tableY - 24], [mx + 9, tableY - 24], [mx + 10, tableY]])} />
          ))}
          <path d={P([[880, tableY], [884, tableY - 46], [878, tableY - 60], [890, tableY - 60], [886, tableY - 46], [892, tableY]])} />
        </g>
        <Puppet
          kind="eldest"
          x={965 + sway * 12}
          y={tableY + 2}
          s={1.2}
          t={t}
          wand
          wandRot={-6}
          wind={0.3}
          hand={shout2 > 0.5 ? <Burst x={0} y={62} r={16 + 8 * Math.sin(t * 20)} seed={f} rays={6} /> : null}
          handB={<Mug />}
          pose={{
            lean: sway * 7,
            legF: [15 + sway * 4, -5],
            legB: [-15 + sway * 4, -5],
            armB: [-70 - 50 * (0.5 + 0.5 * Math.sin(t * 2.2)) * (1 - shout2), -30],
            armF: [50 + 20 * Math.sin(t * 2.6) + 60 * shout + 40 * shout2, 50 - 30 * shout - 16 * shout2],
            head: -10 - 12 * shout2,
          }}
        />
        <Puppet
          kind="thief"
          x={236}
          y={floor + 2}
          s={1.12}
          t={t}
          wind={0.05}
          eye={push}
          pose={{ armF: [26, 112], armB: [22, 100], legF: [10, -2], legB: [-4, -2], lean: -5, head: 18 - 20 * ez(f, heard - 14, heard + 8) }}
        />
      </Stage>
      <Fade frame={frame} dur={dur} />
    </AbsoluteFill>
  );
};

/* 8 — the thief */
const Thief: React.FC<SP> = ({ dur }) => {
  const { frame, f, t } = use2();
  const c = Math.round(cue(cues.cut, "thief"));
  const floor = 930;
  const bedY = 770;
  const arrive = le(17) + 4;
  const creep = ez(f, 6, arrive, 0, 1, (n) => n);
  const x = -80 + creep * 1160;
  const s = 1.2;
  const moving = creep > 0 && creep < 1;
  const p = STRIDE(x, s) * 1.6;
  const take = ez(f, ls(18) - 10, ls(18) + 12) * (1 - ez(f, ls(18) + 26, ls(18) + 44));
  const has = f > ls(18) + 12;
  const knife = ez(f, ls(19) - 14, ls(19) + 26);
  const slash = ez(frame, c - 4, c, 0, 1, (n) => n * n);
  const dark = frame >= c;
  const push = ez(frame, arrive, c, 0, 1);
  const W0 = [1020, 150, 470, 470];
  return (
    <AbsoluteFill>
      <Stage cam={{ s: 1.02 + 0.2 * push, x: 960 + 150 * push, y: 540 + 20 * push }} vcam={{ s: 0.98 + 0.22 * push, x: 1060 + 70 * push, y: 560 + 20 * push }}>
        <defs>
          <clipPath id="twin">
            <rect x={W0[0]} y={W0[1]} width={W0[2]} height={W0[3]} />
          </clipPath>
          <filter id="tglow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="60" />
          </filter>
        </defs>
        <Sky id="t" night sun={[1255, 400]} sunR={0} disc={false} />
        <rect x={-1800} y={-1800} width={5400} height={5400} fill="#0b0c07" opacity={0.35} />
        <rect x={W0[0] - 60} y={W0[1] - 60} width={W0[2] + 120} height={W0[3] + 120} fill="#e3e4bd" opacity={0.35} filter="url(#tglow)" />
        <g clipPath="url(#twin)">
          <rect x={W0[0]} y={W0[1]} width={W0[2]} height={W0[3]} fill="#c9cda4" />
          <circle cx={1330} cy={300} r={78} fill="#f4f3d6" />
          <circle cx={1330} cy={300} r={130} fill="#f4f3d6" opacity={0.35} filter="url(#tglow)" />
          <path d={ribbon(1000, 420, 0.05, 520, 60, t * 0.3, 201, 0.08)} fill="#8f9475" opacity={0.7} />
          <path d={ribbon(1100, 250, 0.02, 420, 40, t * 0.25, 202, 0.08)} fill="#8f9475" opacity={0.6} />
        </g>
        <path fill="#dfe0b8" opacity={0.13} d={P([[W0[0], W0[1] + W0[3]], [W0[0] + W0[2], W0[1] + W0[3]], [1300, 1100], [420, 1100]])} />
        <g fill="none" stroke={INK}>
          <rect x={W0[0]} y={W0[1]} width={W0[2]} height={W0[3]} strokeWidth={22} />
          <path d={`M${W0[0] + W0[2] / 2},${W0[1]} v${W0[3]} M${W0[0]},${W0[1] + W0[3] * 0.42} h${W0[2]}`} strokeWidth={12} />
        </g>
        <g fill={INK}>
          <rect x={-600} y={floor} width={3200} height={2400} />
          <rect x={-600} y={-1800} width={3200} height={1840} />
          <path d={P([[-1200, -1800], [150, -1800], [150, 3000], [-1200, 3000]])} opacity={0.9} />
          <path d={P([[150, 120], [170, 120], [170, floor], [150, floor]])} />
          <rect x={870} y={bedY} width={720} height={54} />
          <path d={P([[866, 690], [892, 690], [896, floor], [870, floor]])} />
          <circle cx={879} cy={680} r={16} />
          <path d={P([[1574, 560], [1606, 560], [1610, floor], [1578, floor]])} />
          <circle cx={1590} cy={546} r={20} />
          <ellipse cx={1340} cy={bedY - 4} rx={86} ry={22} />
          <path d={P([[900, bedY + 4], [930, bedY - 34], [1010, bedY - 48], [1170, bedY - 52], [1228, bedY - 30], [1240, bedY + 4]])} />
        </g>
        <Puppet
          kind="eldest"
          flip
          rot={90}
          x={955}
          y={bedY - 22}
          s={1.15}
          t={0}
          wind={0}
          cape={false}
          pose={{ armF: [14, 10], armB: [-4, 6], legF: [3, -2], legB: [-3, -2], head: -8 }}
        />
        {!has && (
          <g transform={`translate(1180,${bedY - 56 - Math.sin(t * 1.4) * 2}) rotate(-84)`} fill={INK}>
            <Wand len={70} />
          </g>
        )}
        {!dark && (
          <Puppet
            kind="thief"
            x={x}
            y={floor + 2 - (moving ? Math.abs(Math.sin(p)) * 3 : 0)}
            s={s}
            t={t}
            wind={0.1}
            handB={has ? <Wand rot={-20} len={62} /> : null}
            hand={
              knife > 0.05 ? (
                <path d="M-3,0 L3,0 L4,10 L7,12 L3,14 L1,58 L-4,14 L-7,12 L-4,10Z" />
              ) : null
            }
            pose={
              moving
                ? { ...walk(p, 0.7), lean: 26, head: 6, armF: [44, 62], armB: [30, 70] }
                : {
                    lean: 14 + 26 * take - 20 * knife + 40 * slash,
                    head: 10 + 10 * take,
                    armB: [26 + 46 * take, 60 - 44 * take + (has ? 30 : 0) * (1 - take)],
                    armF: [30 + 132 * knife - 95 * slash, 60 - 34 * knife - 20 * slash],
                    legF: [16, -8],
                    legB: [-14, -4],
                  }
            }
          />
        )}
      </Stage>
      {dark && (
        <AbsoluteFill style={{ backgroundColor: "#070402" }}>
          <svg viewBox="0 0 1920 1080" style={{ width: "100%", height: "100%" }}>
            <defs>
              <filter id="sglow" x="-20%" y="-200%" width="140%" height="500%">
                <feGaussianBlur stdDeviation="10" />
              </filter>
            </defs>
            {(() => {
              const k = ez(frame, c, c + 5, 0, 1, (n) => n);
              const fade = 1 - ez(frame, c + 10, c + 60);
              const A = [520, 300];
              const B = [520 + 900 * k, 300 + 420 * k];
              const M = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
              const col = frame < c + 8 ? "#fff6d6" : "#8a1c0c";
              const d = `M${A[0]},${A[1]} Q${M[0] + 14},${M[1] - 14} ${B[0]},${B[1]} Q${M[0] - 14},${M[1] + 14} ${A[0]},${A[1]}Z`;
              return (
                <g opacity={fade}>
                  <path d={d} fill={col} filter="url(#sglow)" />
                  <path d={d} fill={col} />
                </g>
              );
            })()}
          </svg>
        </AbsoluteFill>
      )}
      <Fade frame={frame} dur={dur} o={0} />
    </AbsoluteFill>
  );
};

/* 9 — the end */
const End: React.FC<SP> = ({ dur }) => {
  const { frame, f, t } = use2();
  const vt = React.useContext(VertCtx);
  const far = useMemo(() => makeHill(11, 700, 70), []);
  const mid = useMemo(() => makeHill(12, 790, 45), []);
  const gr = useMemo(() => makeHill(13, 850, 20), []);
  const tree = useMemo(() => makeTree(5, 330, gr.y(330) + 8, 800, 0.07), [gr]);
  const perch = useMemo(() => {
    const r = rng(8);
    return tree.tips.filter((p) => p[1] < 560 && r() < 0.09).slice(0, 9);
  }, [tree]);
  const gd = useMemo(() => grass(3, gr.y, -300, 2300, 9, 26), [gr]);
  const go = ls(20) - 10;
  const dx = 1560 - f * 1.5;
  const ex = dx - 205;
  const es = 1.0;
  const p = STRIDE(-ex, es) * 0.9;
  const card = le(20) + 26;
  const cardIn = ez(frame, card, card + 34);
  return (
    <AbsoluteFill>
      <Stage cam={{ s: 1.04 + (0.08 * frame) / dur, x: 940, y: 520 }} vcam={{ s: 0.85 + (0.07 * frame) / dur, x: 1200, y: 520 }}>
        <Sky id="z" sun={[640, 590]} sunR={150} />
        <path d={far.d} fill="#8b6230" opacity={0.55} />
        <path d={mid.d} fill="#553616" opacity={0.85} />
        <path d={tree.d} fill={INK} />
        {perch.map((q, i) => {
          const k = Math.max(0, frame - go - i * 4);
          return k <= 0 ? (
            <Crow key={i} x={q[0]} y={q[1] + 2} s={0.95} flip={i % 3 === 0} />
          ) : (
            <FlyCrow key={i} x={q[0] + k * (3 + (i % 4)) * (i % 2 ? 1 : 0.6)} y={q[1] - 14 - k * (1.6 + (i % 3) * 0.7) + Math.sin(k / 9 + i) * 10} s={0.9} flap={f * 0.6 + i} />
          );
        })}
        <path d={gr.d} fill={INK} />
        <path d={gd} fill={INK} />
        <Puppet
          kind="eldest"
          flip
          x={ex}
          y={gr.y(ex) + 4 - Math.abs(Math.sin(p)) * 3}
          s={es}
          t={t}
          wind={-0.5}
          fill="#24160a"
          opacity={0.92}
          pose={{ ...walk(p, 0.75), head: 22, lean: 8 }}
        />
        <Death x={dx} y={gr.y(dx) + 8 + Math.sin(t * 1.5) * 3} s={0.98} flip t={t} wind={-0.5} lean={-3} armF={[58, 22]} armB={[-12, 24]} />
      </Stage>
      <AbsoluteFill style={{ backgroundColor: "#0b0603", opacity: cardIn * 0.94 }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: FONT, color: "#f1dfb4", opacity: ez(frame, card + 16, card + 50) }}>
        <div style={{ fontSize: vt ? 78 : 96, fontStyle: "italic", fontWeight: 600, textAlign: "center", lineHeight: 1.1, textShadow: "0 0 30px rgba(0,0,0,0.9)" }}>{vt ? <>Но братьев<br />было трое…</> : "Но братьев было трое…"}</div>
        <svg width={520} height={40} style={{ margin: "26px 0 16px" }}>
          <path d="M20,20 L500,20" stroke="#e2c27c" strokeWidth={1.6} opacity={0.8} />
          <path d="M260,7 L273,20 L260,33 L247,20Z" fill="#e2c27c" />
        </svg>
        <div style={{ fontSize: vt ? 28 : 34, letterSpacing: vt ? "0.3em" : "0.4em", marginRight: vt ? "-0.3em" : "-0.4em", fontWeight: 600, opacity: 0.8 }}>КОНЕЦ ПЕРВОЙ СКАЗКИ</div>
      </AbsoluteFill>
      <Fade frame={frame} dur={dur} i={12} o={24} />
    </AbsoluteFill>
  );
};

export const SCENES: Record<string, React.FC<SP>> = {
  road: Road,
  youth: Youth,
  bridge: Bridge,
  elder: Elder,
  journey: Journey,
  duel: Duel,
  inn: Inn,
  thief: Thief,
  end: End,
};
void [Limb];
