import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { VertCtx } from "./art";
import { Stage2 } from "./art2";
import { cam } from "./art4";
import { Fence, HouseSet } from "./art10";
import { FONT } from "./fonts";

const T = 1.7;

const Inner: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#060814" }}>
    <Stage2 cam={{ s: 1, x: 540, y: 960 }} vcam={cam(1.2, 640, 1180)} ref0={{ x: 540, y: 960 }}>
      <HouseSet t={T} warm={0.25} sky={["#060814", "#1d2646"]} eyes={0.55} kitchen={1} down={0.2} fog={1} moon={1} />
      <Fence warm={0.25} />
    </Stage2>
    <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.25 }}>
      <Img src={staticFile("grain4.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </AbsoluteFill>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 62%, rgba(0,0,0,0) 40%, rgba(2,3,10,0.78) 100%)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(3,5,14,0.8) 0%, rgba(3,5,14,0) 32%)" }} />
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 220, fontFamily: FONT, color: "#f6e8cc" }}>
      <div style={{ fontSize: 34, letterSpacing: "0.42em", marginRight: "-0.42em", fontWeight: 600, opacity: 0.92, textShadow: "0 2px 4px rgba(0,0,0,0.95), 0 0 26px rgba(0,0,0,0.9)" }}>ЗЛЫМ БЫЛ НЕ ДОМ</div>
      <div style={{ fontSize: 138, fontWeight: 700, fontStyle: "italic", marginTop: 14, lineHeight: 1.0, textAlign: "center", textShadow: "0 4px 8px rgba(0,0,0,0.95), 0 0 44px rgba(0,0,0,0.9), 0 0 100px rgba(0,0,0,0.8)" }}>Дом, который<br />ждал</div>
    </AbsoluteFill>
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 230, fontFamily: FONT, color: "#f6e8cc" }}>
      <div style={{ fontSize: 48, fontStyle: "italic", fontWeight: 600, textShadow: "0 2px 4px rgba(0,0,0,0.95), 0 0 28px rgba(0,0,0,0.95)" }}>Злыми были мы</div>
    </AbsoluteFill>
  </AbsoluteFill>
);

export const CoverJ: React.FC = () => (
  <VertCtx.Provider value={true}>
    <Inner />
  </VertCtx.Provider>
);
