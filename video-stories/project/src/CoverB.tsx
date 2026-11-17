import React, { useMemo } from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Crow, FlyCrow, INK, makeHill, makeTree, grass, Puppet, Sky } from "./art";
import { FONT } from "./fonts";

const CW = 1080;
const CH = 1920;
const GY = 1600;

export const CoverB: React.FC = () => {
  const gr = useMemo(() => makeHill(81, GY, 26), []);
  const gd = useMemo(() => grass(82, gr.y, -80, 1160, 9, 40), [gr]);
  const far = useMemo(() => makeHill(83, GY - 120, 70), []);
  const tree = useMemo(() => makeTree(84, 20, gr.y(20) + 8, 640, 0.1, 6), [gr]);
  const perch = useMemo(() => tree.tips.filter((p) => p[1] < GY - 560).slice(0, 4), [tree]);
  return (
    <AbsoluteFill style={{ backgroundColor: "#070906" }}>
      <svg viewBox={`0 0 ${CW} ${CH}`} style={{ width: "100%", height: "100%" }}>
        <defs>
          <filter id="cbm" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30" /></filter>
        </defs>
        <Sky id="cn" night sun={[620, 900]} sunR={330} glow={1.15} />
        <path d={far.d} fill="#3b4230" opacity={0.75} />
        {[0, 1, 2, 3, 4].map((i) => (
          <FlyCrow key={i} x={760 + i * 70 - (i % 2) * 40} y={620 + (i % 3) * 70 - i * 18} s={0.7 + (i % 3) * 0.12} flip flap={i * 1.7 + 0.5} />
        ))}
        <path d={tree.d} fill={INK} />
        {perch.map((p, i) => (
          <Crow key={i} x={p[0]} y={p[1] + 2} s={1.1} flip={i % 2 === 0} />
        ))}
        <ellipse cx={560} cy={GY - 20} rx={560} ry={110} fill="#dfe0b8" opacity={0.2} filter="url(#cbm)" />
        <path d={gr.d} fill={INK} />
        <path d={gd} fill={INK} />
        <Puppet
          kind="eldest"
          x={640}
          y={GY + 30}
          s={2.3}
          t={2.4}
          wind={0.95}
          wand
          wandRot={0}
          pose={{ armF: [146, 8], armB: [-16, 14], legF: [10, -3], legB: [-9, -3], head: -8, lean: -2 }}
        />
      </svg>
      <AbsoluteFill style={{ mixBlendMode: "multiply", opacity: 0.72 }}>
        <Img src={staticFile("paper.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.32 }}>
        <Img src={staticFile("grain5.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 55% 46%, rgba(0,0,0,0) 34%, rgba(6,8,4,0.6) 74%, rgba(4,5,3,0.96) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(5,6,3,0.7) 0%, rgba(5,6,3,0) 34%)" }} />
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 300, fontFamily: FONT, color: "#eceed2" }}>
        <div style={{ fontSize: 36, letterSpacing: "0.4em", marginRight: "-0.4em", fontWeight: 600, opacity: 0.9, textShadow: "0 2px 4px rgba(0,0,0,0.95), 0 0 26px rgba(0,0,0,0.9)" }}>
          СКАЗКА О ТРЁХ БРАТЬЯХ
        </div>
        <div style={{ fontSize: 168, fontWeight: 700, letterSpacing: "0.04em", marginRight: "-0.04em", marginTop: 26, lineHeight: 1, textShadow: "0 4px 6px rgba(0,0,0,0.95), 0 0 44px rgba(0,0,0,0.9), 0 0 100px rgba(0,0,0,0.8)" }}>
          СТАРШИЙ
        </div>
        <div style={{ marginTop: 20, fontSize: 56, fontStyle: "italic", fontWeight: 600, opacity: 0.96, textShadow: "0 2px 4px rgba(0,0,0,0.95), 0 0 28px rgba(0,0,0,0.9)" }}>
          Он выбрал силу
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
