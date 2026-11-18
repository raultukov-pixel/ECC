import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { VertCtx } from "./art";
import { Stage2 } from "./art2";
import { cam } from "./art4";
import { INK6, ManS } from "./art6";
import { GY, Street } from "./art9";
import { FONT } from "./fonts";

const T = 2.6;

const Man: React.FC<{ fill: string }> = ({ fill }) => (
  <ManS x={560} y={GY} s={1.1} t={T} fill={fill} pose={{ armF: [6, 14], armB: [-4, 10], legF: [3, -1], legB: [-3, -1], lean: 7, head: 14 }} />
);

const Inner: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#050a18" }}>
    <Stage2 cam={{ s: 1, x: 540, y: 960 }} vcam={cam(1.22, 760, 1170)} ref0={{ x: 540, y: 960 }}>
      <Street t={T} sky={["#050a18", "#1d3052"]} lights={1} open={1} pool={1} stars={0.9} />
      <g transform="translate(-3 -1.5)" opacity={0.7}>
        <Man fill="#ffcf8a" />
      </g>
      <Man fill={INK6} />
    </Stage2>
    <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.25 }}>
      <Img src={staticFile("grain4.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </AbsoluteFill>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(0,0,0,0) 40%, rgba(2,4,10,0.78) 100%)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(3,6,14,0.78) 0%, rgba(3,6,14,0) 32%)" }} />
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 230, fontFamily: FONT, color: "#f6e8cc" }}>
      <div style={{ fontSize: 34, letterSpacing: "0.42em", marginRight: "-0.42em", fontWeight: 600, opacity: 0.92, textShadow: "0 2px 4px rgba(0,0,0,0.95), 0 0 26px rgba(0,0,0,0.9)" }}>НИКОГДА НЕ ЗАКРЫТА</div>
      <div style={{ fontSize: 150, fontWeight: 700, fontStyle: "italic", marginTop: 14, lineHeight: 1.0, textShadow: "0 4px 8px rgba(0,0,0,0.95), 0 0 44px rgba(0,0,0,0.9), 0 0 100px rgba(0,0,0,0.8)" }}>Дверь открыта</div>
    </AbsoluteFill>
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 250, fontFamily: FONT, color: "#f6e8cc" }}>
      <div style={{ fontSize: 48, fontStyle: "italic", fontWeight: 600, textShadow: "0 2px 4px rgba(0,0,0,0.95), 0 0 28px rgba(0,0,0,0.95)" }}>Закрытой её считал только он</div>
    </AbsoluteFill>
  </AbsoluteFill>
);

export const CoverI: React.FC = () => (
  <VertCtx.Provider value={true}>
    <Inner />
  </VertCtx.Provider>
);
