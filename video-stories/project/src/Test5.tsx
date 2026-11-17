import React from "react";
import { AbsoluteFill } from "remotion";
import { VertCtx, walk } from "./art";
import { Fog, Layer, Particles, Stage2 } from "./art2";
import { Blizzard, Flakes, cam } from "./art4";
import { Backlit, FlowerS, KnightS, LadyS, SetBack, SetFg, SetFront, SetLight } from "./art5";

const Shot: React.FC<{ k: number }> = ({ k }) => {
  const t = 2.4;
  const mode = k === 2 ? "w" : "s";
  const c = k === 0 ? cam(1.02, 540, 990) : k === 1 ? cam(1.5, 540, 1230) : cam(1.05, 540, 1010);
  return (
    <AbsoluteFill>
      <Stage2 cam={{ s: 1, x: 540, y: 960 }} vcam={c} ref0={{ x: 540, y: 850 }}>
        <Layer k={0.4}>
          <SetBack mode={mode} t={t} />
        </Layer>
        <Layer k={0.8}>
          <SetFront mode={mode} t={t} />
        </Layer>
        <Fog y={1180} h={130} t={t} op={0.3} seed={3} n={4} color={mode === "s" ? "#ffe9b0" : "#cfe2f6"} x0={-300} x1={1400} />
        {k === 0 && (
          <>
            <Backlit x={500} gy={1420} mode="s" render={(f) => <KnightS x={500} y={1420} s={0.74} t={t} fill={f} pose={{ ...walk(1.0, 0.4), armF: [16, 50] }} />} />
            <Backlit x={556} gy={1424} mode="s" render={(f) => <LadyS x={556} y={1424} s={0.74} t={t} fill={f} pose={{ armF: [-30, 60], armB: [-6, 14] }} />} />
          </>
        )}
        {k === 1 && (
          <>
            <Backlit x={420} gy={1500} mode="s" shadow={0.35} render={(f) => <KnightS x={420} y={1500} s={1.15} t={t} fill={f} pose={{ armF: [80, 10], armB: [-6, 12], legF: [6, -2], legB: [-6, -2], head: 4 }} hand={<g transform="translate(0,22) rotate(-170)"><FlowerS s={1.0} stem={f} col={f === "#150c05" ? "#ff9db8" : f} /></g>} />} />
            <Backlit x={650} gy={1504} mode="s" flip shadow={0.35} render={(f) => <LadyS x={650} y={1504} s={1.15} flip t={t} fill={f} pose={{ armF: [74, 16], armB: [-6, 14], head: -4 }} />} />
          </>
        )}
        {k === 2 && <Backlit x={540} gy={1500} mode="w" shadow={0.4} render={(f) => <KnightS x={540} y={1500} s={0.95} t={t} fill={f} sword="hand" snow={1} wind={0.7} pose={{ ...walk(0.9, 0.4), armF: [10, 6], head: 10, lean: 5 }} />} />}
        <SetLight mode={mode} t={t} />
        {mode === "s" ? <Particles t={t} area={[0, 300, 1080, 1900]} n={60} seed={5} color="#fff1b8" size={3} rise={10} op={0.8} /> : <><Blizzard t={t} amount={0.6} /><Flakes t={t} n={80} /></>}
        <Layer k={1.5} blur={8}>
          <SetFg mode={mode} t={t} />
        </Layer>
      </Stage2>
    </AbsoluteFill>
  );
};
const W = (k: number) => () => (
  <VertCtx.Provider value={true}>
    <Shot k={k} />
  </VertCtx.Provider>
);
export const T5a = W(0);
export const T5b = W(1);
export const T5c = W(2);
