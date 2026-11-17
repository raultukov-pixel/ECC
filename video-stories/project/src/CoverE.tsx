import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { VertCtx, walk } from "./art";
import { Fog, Layer, Particles, Stage2 } from "./art2";
import { Blizzard, Flakes, cam } from "./art4";
import { Backlit, CX, FlowerS, KnightS, LadyS, SetBack, SetFg, SetFront, SetLight } from "./art5";
import type { Mode } from "./art5";
import { FONT } from "./fonts";

const ps = (y: number) => 0.42 + ((y - 1200) / 270) * 0.38;
const T = 2.2;

// the crack: a jagged line from top to bottom
const CRACK: number[][] = [[540, -20], [572, 210], [520, 420], [566, 640], [512, 860], [560, 1080], [508, 1290], [556, 1510], [514, 1720], [548, 1940]];
const LEFT = `polygon(0px -20px, ${CRACK.map((p) => `${p[0]}px ${p[1]}px`).join(",")}, 0px 1940px)`;
const RIGHT = `polygon(${CRACK.map((p) => `${p[0]}px ${p[1]}px`).join(",")}, 1080px 1940px, 1080px -20px)`;

const Half: React.FC<{ mode: Mode }> = ({ mode }) => (
  <Stage2 cam={{ s: 1, x: 540, y: 960 }} vcam={cam(1.0, 540, 1000)} ref0={{ x: 540, y: 850 }}>
    <Layer k={0.4}>
      <SetBack mode={mode} t={T} />
    </Layer>
    <Layer k={0.8}>
      <SetFront mode={mode} t={T} />
    </Layer>
    <Fog y={1180} h={130} t={T} op={0.3} seed={3} n={4} color={mode === "s" ? "#ffe9b0" : "#cfe2f6"} x0={-300} x1={1400} />
    {mode === "s" ? (
      <>
        <Backlit x={430} gy={1500} mode="s" render={(f) => <KnightS x={430} y={1500} s={ps(1500) * 1.5} t={T} fill={f} pose={{ ...walk(1.0, 0.3), armF: [16, 56] }} />} />
        <Backlit x={510} gy={1504} mode="s" render={(f) => <LadyS x={510} y={1504} s={ps(1504) * 1.5} t={T} fill={f} pose={{ armF: [-26, 56], armB: [-6, 14] }} hand={undefined} />} />
        <g transform="translate(468 1180)">
          <FlowerS s={1.5} col="#ff9db8" stem="#150c05" />
        </g>
      </>
    ) : (
      <Backlit x={650} gy={1500} mode="w" shadow={0.5} render={(f) => <KnightS x={650} y={1500} s={ps(1500) * 1.5} t={T} fill={f} sword="hand" snow={1} wind={0.7} pose={{ ...walk(0.8, 0.3), armF: [8, 6], head: 12, lean: 5 }} />} />
    )}
    <SetLight mode={mode} t={T} op={1} />
    {mode === "s" ? <Particles t={T} area={[0, 300, 1080, 1900]} n={60} seed={5} color="#fff1b8" size={3} rise={10} op={0.8} /> : <><Blizzard t={T} amount={0.6} /><Flakes t={T} n={80} /></>}
    <Layer k={1.5} blur={8}>
      <SetFg mode={mode} t={T} />
    </Layer>
  </Stage2>
);

const Inner: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#06070d" }}>
    <AbsoluteFill style={{ clipPath: RIGHT }}>
      <Half mode="w" />
    </AbsoluteFill>
    <AbsoluteFill style={{ clipPath: LEFT }}>
      <Half mode="s" />
    </AbsoluteFill>
    <svg viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%" }}>
      <defs>
        <filter id="cg" x="-50%" y="-5%" width="200%" height="110%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>
      <path d={"M" + CRACK.map((p) => p.join(",")).join(" L")} stroke="#ffffff" strokeWidth={26} fill="none" opacity={0.6} filter="url(#cg)" />
      <path d={"M" + CRACK.map((p) => p.join(",")).join(" L")} stroke="#ffffff" strokeWidth={5} fill="none" strokeLinejoin="miter" />
      {[[572, 210, 640, 150], [566, 640, 640, 590], [512, 860, 440, 800], [556, 1510, 620, 1580], [508, 1290, 430, 1340]].map((c, i) => (
        <path key={i} d={`M${c[0]},${c[1]} L${(c[0] + c[2]) / 2 + 12},${(c[1] + c[3]) / 2 - 10} L${c[2]},${c[3]}`} stroke="#ffffff" strokeWidth={2.6} fill="none" opacity={0.85} />
      ))}
    </svg>
    <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.25 }}>
      <Img src={staticFile("grain3.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </AbsoluteFill>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 44%, rgba(6,8,18,0.5) 82%, rgba(3,5,12,0.85) 100%)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(4,6,14,0.72) 0%, rgba(4,6,14,0) 30%)" }} />
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 270, fontFamily: FONT, color: "#f6efdc" }}>
      <div style={{ fontSize: 34, letterSpacing: "0.42em", marginRight: "-0.42em", fontWeight: 600, opacity: 0.92, textShadow: "0 2px 4px rgba(0,0,0,0.95), 0 0 26px rgba(0,0,0,0.9)" }}>ОН ОБЕЩАЛ</div>
      <div style={{ fontSize: 118, fontWeight: 700, fontStyle: "italic", marginTop: 18, lineHeight: 1.0, textAlign: "center", textShadow: "0 4px 8px rgba(0,0,0,0.95), 0 0 44px rgba(0,0,0,0.9), 0 0 100px rgba(0,0,0,0.8)" }}>До первого<br />снега</div>
      <div style={{ marginTop: 24, fontSize: 50, fontStyle: "italic", fontWeight: 600, opacity: 0.96, textShadow: "0 2px 4px rgba(0,0,0,0.95), 0 0 28px rgba(0,0,0,0.9)" }}>Он успел. Но слишком поздно</div>
    </AbsoluteFill>
  </AbsoluteFill>
);

export const CoverE: React.FC = () => (
  <VertCtx.Provider value={true}>
    <Inner />
  </VertCtx.Provider>
);
void CX;
