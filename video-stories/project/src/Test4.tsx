import React from "react";
import { AbsoluteFill } from "remotion";
import { VertCtx } from "./art";
import { INK2, Lit, Puppet2, Stage2, Layer } from "./art2";
import { Blizzard, Bouquet, Canopy, Dapple, Flakes, Foreground, Knight, Rays, WorldBack, WorldGround, WorldWall, cam, sc } from "./art4";

const Dress = () => (
  <defs>
    <linearGradient id="dress" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#fff6e2" />
      <stop offset="0.6" stopColor="#e9cfa0" />
      <stop offset="1" stopColor="#b98c58" />
    </linearGradient>
  </defs>
);

const Inner: React.FC<{ mode: "s" | "w" }> = ({ mode }) => {
  const t = 2.4;
  const c = cam(1, 540, 960);
  const y1 = 1650;
  return (
    <AbsoluteFill>
      <Stage2 cam={{ s: 1, x: 540, y: 960 }} vcam={c} ref0={{ x: 540, y: 850 }}>
        <Dress />
        <Layer k={0.3}>
          <WorldBack mode={mode} t={t} />
        </Layer>
        <Layer k={0.7}>
          <WorldWall mode={mode} t={t} />
          <Canopy mode={mode} t={t} />
        </Layer>
        <Layer k={0.9}>
          <WorldGround mode={mode} t={t} />
        </Layer>
        <Rays t={t} mode={mode} op={mode === "s" ? 1 : 0.5} />
        <Dapple t={t} mode={mode} />
        {mode === "s" && (
          <>
            <Lit gy={y1} x={430} rimOp={0.7} rim="#fff0b8" shadow={0.2} render={(f) => <Knight x={430} y={y1} s={sc(y1)} t={t} mode="s" id="kt" tint={f === INK2 ? undefined : f} pose={{ armF: [20, 60], armB: [-8, 14], legF: [8, -3], legB: [-8, -3], head: -3 }} />} />
            <Lit gy={y1} x={600} rimOp={0.7} rim="#fff0b8" shadow={0.2} render={(f) => <Puppet2 kind="girl" x={600} y={y1} s={sc(y1) * 1.05} t={t} wind={0.35} fill={f === INK2 ? "url(#dress)" : f} skin={f === INK2 ? "#eab88f" : undefined} hairc={f === INK2 ? "#5a3420" : undefined} face={1} orn={0} pose={{ armF: [20, 60], armB: [-8, 14] }} />} />
          </>
        )}
        {mode === "w" && <Knight x={540} y={1700} s={sc(1700)} t={t} mode="w" id="kw" frost={1} breath={1} sword={1} wind={0.5} pose={{ armF: [14, 14], armB: [-8, 14], legF: [10, -3], legB: [-10, -3], head: 8, lean: 6 }} />}
        {mode === "w" && <Blizzard t={t} amount={0.6} />}
        {mode === "w" && <Flakes t={t} />}
        <Layer k={1.5} blur={8}>
          <Foreground mode={mode} t={t} />
        </Layer>
        <Bouquet x={900} y={1300} s={0.8} frozen={mode === "w" ? 1 : 0} t={t} />
      </Stage2>
    </AbsoluteFill>
  );
};
export const TestS: React.FC = () => (
  <VertCtx.Provider value={true}>
    <Inner mode="s" />
  </VertCtx.Provider>
);
export const TestW: React.FC = () => (
  <VertCtx.Provider value={true}>
    <Inner mode="w" />
  </VertCtx.Provider>
);
