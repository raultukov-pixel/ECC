import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { Death, makeHill, makeTree, grass } from "./art";
import { Stage2, Layer, Sky2, Fog, Particles, Puppet2, Lit, GROUND, INK2 } from "./art2";

export const Test2: React.FC = () => {
  const t = 3.2;
  const gr = useMemo(() => makeHill(5, 860, 14), []);
  const far = useMemo(() => makeHill(6, 700, 60), []);
  const gd = useMemo(() => grass(8, gr.y, -300, 2300, 9, 30), [gr]);
  const tree = useMemo(() => makeTree(9, 1620, 880, 700, -0.08, 6), []);
  return (
    <AbsoluteFill>
      <Stage2 cam={{ s: 1, x: 960, y: 540 }}>
        <Sky2 id="t" pal="dusk" sun={[1000, 470]} sunR={150} t={t} />
        <Layer k={0.4}>
          <path d={far.d} fill="#464b6e" opacity={0.7} />
          <Fog y={760} t={t} op={0.3} seed={2} />
        </Layer>
        <Layer k={0.8}>
          <path d={tree.d} fill={INK2} opacity={0.9} />
        </Layer>
        <path d={gr.d} fill={GROUND} />
        <Fog y={870} h={120} t={t} op={0.25} seed={5} n={4} />
        <path d={gd} fill={GROUND} />
        <Lit gy={860} x={700} render={(f, o) => <Puppet2 kind="kadm" x={700} y={860} s={1.3} t={t} wind={0.5} fill={f} opacity={o} pose={{ armF: [70, 14], armB: [-10, 12], legF: [8, -3], legB: [-8, -3], head: -4 }} />} />
        <Lit gy={860} x={1200} render={(f, o) => <Puppet2 kind="girl" flip x={1200} y={860} s={1.3} t={t} wind={0.6} fill={f} opacity={o} pose={{ armF: [30, 30], armB: [-14, 20] }} />} />
        <Lit gy={860} x={420} render={(f, o) => <Puppet2 kind="young" x={420} y={860} s={1.1} t={t} wind={0.5} fill={f} opacity={o} />} />
        <Death x={1600} y={880} s={0.9} flip t={t} wind={0.2} eye={0.9} fill={INK2} armF={[40, 28]} armB={[-12, 22]} />
        <Particles t={t} area={[0, 300, 1920, 900]} n={50} seed={4} />
        <Layer k={1.35} blur={5}>
          <path d={grass(11, gr.y, -300, 2300, 22, 120).replace(/M/g, "M")} fill={INK2} transform="translate(0 150)" />
        </Layer>
      </Stage2>
    </AbsoluteFill>
  );
};
