import React, { useMemo } from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Death, VertCtx, grass, makeHill } from "./art";
import { FONT } from "./fonts";
import { Fog, GROUND, INK2, Layer, Lit, Particles, Puppet2, Sky2, Stage2 } from "./art2";

const GY = 1600;

const CoverInner: React.FC = () => {
  const gr = useMemo(() => makeHill(95, GY, 22), []);
  const far = useMemo(() => makeHill(96, GY - 130, 70), []);
  const gd = useMemo(() => grass(97, gr.y, -80, 1160, 9, 40), [gr]);
  const t = 3.1;
  return (
    <AbsoluteFill style={{ backgroundColor: "#2a1a22" }}>
      <Stage2 cam={{ s: 1, x: 540, y: 960 }} vcam={{ s: 1 / 1.15, x: 540, y: 850 }} ref0={{ x: 540, y: 850 }}>
        <Sky2 id="cd" pal="dawn" sun={[560, 1040]} sunR={340} glow={1.5} t={t} />
        <Layer k={0.4}>
          <path d={far.d} fill="#8a6679" opacity={0.8} />
          <Fog y={GY - 90} h={200} t={t} op={0.4} seed={4} n={5} x0={-300} x1={1400} color="#fff0d0" />
        </Layer>
        <path d={gr.d} fill={GROUND} />
        <Fog y={GY + 10} h={100} t={t} op={0.25} seed={8} n={4} x0={-300} x1={1400} color="#ffe6c0" />
        <path d={gd} fill={GROUND} />
        <Lit gy={GY + 20} x={310} rimOp={0.85} rim="#fff0c0" shadow={0.25} rimDx={4} render={(f, o) => <Puppet2 kind="young" x={310} y={GY + 20} s={2.2} t={t} wind={0.28} silver={f === "#000" ? 0 : 1} fill={f} opacity={o} pose={{ armF: [92, 6], armB: [-10, 16], legF: [8, -3], legB: [-8, -3], head: -6, lean: 2 }} curlF={0.0} />} />
        <Lit gy={GY + 30} x={880} rimOp={0.7} rim="#ffe6b0" shadow={0.25} rimDx={-3} render={(f) => <Death x={880} y={GY + 30} s={1.2} flip t={t} wind={0.3} eye={0.8} smile={0.9} fill={f} armF={[78, 24]} armB={[-12, 22]} lean={-1} />} />
        <Particles t={t} area={[0, 500, 1080, 1700]} n={70} seed={43} op={0.85} color="#fff1c8" size={3} rise={22} />
        <Layer k={1.4} blur={5}>
          <path d={grass(98, () => 1760, -100, 1200, 22, 130)} fill={INK2} />
        </Layer>
      </Stage2>
      <AbsoluteFill style={{ mixBlendMode: "multiply", opacity: 0.5 }}>
        <Img src={staticFile("paper.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.28 }}>
        <Img src={staticFile("grain4.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 55% 52%, rgba(0,0,0,0) 40%, rgba(40,20,10,0.35) 78%, rgba(24,10,6,0.72) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(40,22,30,0.55) 0%, rgba(40,22,30,0) 32%)" }} />
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 300, fontFamily: FONT, color: "#fff3d8" }}>
        <div style={{ fontSize: 36, letterSpacing: "0.4em", marginRight: "-0.4em", fontWeight: 600, opacity: 0.95, textShadow: "0 2px 6px rgba(40,16,10,0.95), 0 0 26px rgba(40,16,10,0.85)" }}>СКАЗКА О ТРЁХ БРАТЬЯХ</div>
        <div style={{ fontSize: 164, fontWeight: 700, letterSpacing: "0.04em", marginRight: "-0.04em", marginTop: 26, lineHeight: 1, textShadow: "0 4px 8px rgba(40,16,10,0.95), 0 0 44px rgba(40,16,10,0.85), 0 0 100px rgba(40,16,10,0.7)" }}>МЛАДШИЙ</div>
        <div style={{ marginTop: 20, fontSize: 56, fontStyle: "italic", fontWeight: 600, opacity: 0.98, textShadow: "0 2px 6px rgba(40,16,10,0.95), 0 0 28px rgba(40,16,10,0.9)" }}>Он выбрал жизнь</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const CoverD: React.FC = () => (
  <VertCtx.Provider value={true}>
    <CoverInner />
  </VertCtx.Provider>
);
