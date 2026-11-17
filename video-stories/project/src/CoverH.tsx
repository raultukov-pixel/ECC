import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { VertCtx } from "./art";
import { Stage2 } from "./art2";
import { cam } from "./art4";
import { mixc } from "./art6";
import { Bokeh, HistoryScreen, Phone } from "./art8";
import { FONT } from "./fonts";

const T = 2.2;

const Inner: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#06080c" }}>
    <Stage2 cam={{ s: 1, x: 540, y: 960 }} vcam={cam(1.0, 540, 960)} ref0={{ x: 540, y: 960 }}>
      <Bokeh t={T} a="#2a0f12" b="#06080c" seed={31} n={30} op={0.42} hot="#ff9a8a" />
      <circle cx={540} cy={1060} r={620} fill="#ff4d42" opacity={0.16} filter="url(#fogb)" style={{ mixBlendMode: "screen" }} />
      <Phone x={540} y={1070} s={1.32} glow={mixc("#8fc4ff", "#ff5a4d", 0.85)}>
        <HistoryScreen T={T} focus={0.75} pulse={0.6} />
      </Phone>
    </Stage2>
    <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.25 }}>
      <Img src={staticFile("grain4.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </AbsoluteFill>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 58%, rgba(0,0,0,0) 40%, rgba(4,2,2,0.8) 100%)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(6,3,4,0.82) 0%, rgba(6,3,4,0) 30%)" }} />
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 240, fontFamily: FONT, color: "#f6e8cc" }}>
      <div style={{ fontSize: 34, letterSpacing: "0.42em", marginRight: "-0.42em", fontWeight: 600, opacity: 0.92, textShadow: "0 2px 4px rgba(0,0,0,0.95), 0 0 26px rgba(0,0,0,0.9)" }}>ПОСЛЕДНИЙ ЗВОНОК</div>
      <div style={{ fontSize: 158, fontWeight: 700, fontStyle: "italic", marginTop: 14, lineHeight: 1.0, textShadow: "0 4px 8px rgba(0,0,0,0.95), 0 0 44px rgba(0,0,0,0.9), 0 0 100px rgba(0,0,0,0.8)" }}>Перезвоню</div>
    </AbsoluteFill>
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 250, fontFamily: FONT, color: "#f6e8cc" }}>
      <div style={{ fontSize: 50, fontStyle: "italic", fontWeight: 600, textShadow: "0 2px 4px rgba(0,0,0,0.95), 0 0 28px rgba(0,0,0,0.95)" }}>Позвони маме. Прямо сейчас.</div>
    </AbsoluteFill>
  </AbsoluteFill>
);

export const CoverH: React.FC = () => (
  <VertCtx.Provider value={true}>
    <Inner />
  </VertCtx.Provider>
);
