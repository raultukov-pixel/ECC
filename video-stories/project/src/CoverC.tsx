import React, { useMemo } from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { VertCtx, grass, makeHill } from "./art";
import { FONT } from "./fonts";
import { Fog, GROUND, INK2, Particles, Puppet2, Sky2, Stage2, Layer, Lit } from "./art2";

const GY = 1600;

const CoverInner: React.FC = () => {
  const gr = useMemo(() => makeHill(91, GY, 22), []);
  const far = useMemo(() => makeHill(92, GY - 130, 70), []);
  const gd = useMemo(() => grass(93, gr.y, -80, 1160, 9, 40), [gr]);
  const t = 2.6;
  const pts: number[][] = [];
  const pts2: number[][] = [];
  for (let y = 560; y <= 1660; y += 25) {
    const w = Math.sin(y * 0.016 + t * 1.5) * 9 + Math.sin(y * 0.041 - t * 2.3) * 4;
    pts.push([560 + w, y]);
    pts2.push([612 + w * 0.8, y]);
  }
  const edge = "M" + pts.map((q) => q.join(",")).join("L");
  const poly = "M" + [...pts, ...pts2.slice().reverse()].map((q) => q.join(",")).join("L") + "Z";
  return (
    <AbsoluteFill style={{ backgroundColor: "#06070d" }}>
      <Stage2 cam={{ s: 1, x: 540, y: 960 }} vcam={{ s: 1 / 1.15, x: 540, y: 850 }} ref0={{ x: 540, y: 850 }}>
        <Sky2 id="cc" pal="dusk" sun={[600, 930]} sunR={310} glow={1.2} t={t} stars={0.6} />
        <rect x={-1800} y={-1800} width={5400} height={5400} fill="#0a0c18" opacity={0.28} />
        <Layer k={0.4}>
          <path d={far.d} fill="#3b4366" opacity={0.85} />
          <Fog y={GY - 90} h={200} t={t} op={0.32} seed={4} n={5} x0={-300} x1={1400} />
        </Layer>
        <path d={gr.d} fill={GROUND} />
        <Fog y={GY + 10} h={100} t={t} op={0.2} seed={8} n={4} x0={-300} x1={1400} />
        <path d={gd} fill={GROUND} />
        <g>
          <path d={poly} fill="#dff0ff" opacity={0.34} filter="url(#bl5)" />
          <path d={poly} fill="#eaf6ff" opacity={0.22} />
          <path d={edge} fill="none" stroke="#f2faff" strokeWidth={3} opacity={0.8} />
        </g>
        <circle cx={600} cy={1060} r={470} fill="#cfe6ff" opacity={0.18} filter="url(#glowb)" />
        <Lit gy={GY + 20} x={380} rimOp={0.85} rim="#d6ecff" shadow={0.2} rimDx={4} render={(f, o) => <Puppet2 kind="kadm" x={380} y={GY + 20} s={2.1} t={t} wind={0.5} fill={f} opacity={o} orn={0.4} pose={{ armF: [96, 6], armB: [-10, 16], legF: [8, -3], legB: [-8, -3], head: -3, lean: 2 }} curlF={0.0} />} />
        <g filter="url(#bl14)" opacity={0.55}>
          <Puppet2 kind="girl" flip x={830} y={GY + 20} s={2.1} t={t * 0.5} wind={0.12} fill="#9fd0ff" orn={0} pose={{ armF: [96, 6], armB: [-10, 16] }} />
        </g>
        <Puppet2 kind="girl" flip x={830} y={GY + 20} s={2.1} t={t * 0.5} wind={0.12} fill="#e6f0ff" opacity={0.92} orn={0.25} pose={{ armF: [96, 6], armB: [-10, 16], head: -3 }} curlF={0.0} />
        <Particles t={t} area={[0, 500, 1080, 1700]} n={70} seed={41} op={0.8} color="#e6f4ff" size={3} rise={22} />
        <Layer k={1.4} blur={5}>
          <path d={grass(94, () => 1760, -100, 1200, 22, 130)} fill={INK2} />
        </Layer>
      </Stage2>
      <AbsoluteFill style={{ mixBlendMode: "multiply", opacity: 0.7 }}>
        <Img src={staticFile("paper.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.3 }}>
        <Img src={staticFile("grain2.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 55% 50%, rgba(0,0,0,0) 34%, rgba(5,6,12,0.6) 74%, rgba(4,4,9,0.96) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(5,6,12,0.7) 0%, rgba(5,6,12,0) 34%)" }} />
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 300, fontFamily: FONT, color: "#eee8d6" }}>
        <div style={{ fontSize: 36, letterSpacing: "0.4em", marginRight: "-0.4em", fontWeight: 600, opacity: 0.9, textShadow: "0 2px 4px rgba(0,0,0,0.95), 0 0 26px rgba(0,0,0,0.9)" }}>СКАЗКА О ТРЁХ БРАТЬЯХ</div>
        <div style={{ fontSize: 168, fontWeight: 700, letterSpacing: "0.04em", marginRight: "-0.04em", marginTop: 26, lineHeight: 1, textShadow: "0 4px 6px rgba(0,0,0,0.95), 0 0 44px rgba(0,0,0,0.9), 0 0 100px rgba(0,0,0,0.8)" }}>СРЕДНИЙ</div>
        <div style={{ marginTop: 20, fontSize: 56, fontStyle: "italic", fontWeight: 600, opacity: 0.96, textShadow: "0 2px 4px rgba(0,0,0,0.95), 0 0 28px rgba(0,0,0,0.9)" }}>Он выбрал любовь</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const CoverC: React.FC = () => (
  <VertCtx.Provider value={true}>
    <CoverInner />
  </VertCtx.Provider>
);
