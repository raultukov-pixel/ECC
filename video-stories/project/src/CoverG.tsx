import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { VertCtx } from "./art";
import { Stage2, Particles } from "./art2";
import { cam } from "./art4";
import { drape } from "./art5";
import { Cup, Steam } from "./art7";
import { FONT } from "./fonts";

const T = 3.1;

const Inner: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#0b0604" }}>
    <Stage2 cam={{ s: 1, x: 540, y: 960 }} vcam={cam(1.0, 540, 960)} ref0={{ x: 540, y: 960 }}>
      <defs>
        <radialGradient id="cgw" gradientUnits="userSpaceOnUse" cx={520} cy={900} r={1100}>
          <stop offset="0" stopColor="#d89a58" />
          <stop offset="0.42" stopColor="#5a3418" />
          <stop offset="1" stopColor="#0a0604" />
        </radialGradient>
        <linearGradient id="cgs" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2b477" />
          <stop offset="1" stopColor="#fff0c8" />
        </linearGradient>
      </defs>
      <rect x={-900} y={-900} width={2900} height={3900} fill="url(#cgw)" />
      {/* the window */}
      <rect x={170} y={380} width={540} height={760} fill="url(#cgs)" />
      <circle cx={470} cy={900} r={150} fill="#fffbe6" opacity={0.85} filter="url(#bl14)" />
      <path d="M170,1060 Q330,980 470,1040 T710,1010 V1140 H170Z" fill="#8a6a3a" opacity={0.6} />
      <rect x={170} y={380} width={540} height={760} fill="none" stroke="#070403" strokeWidth={20} />
      <path d="M440,380 V1140 M170,640 H710" stroke="#070403" strokeWidth={11} />
      <g fill="#0a0604">
        <path d={drape(160, 330, Math.PI / 2 + 0.02, 840, 120, 160, T * 0.5, 11, 0.02)} />
        <path d={drape(722, 330, Math.PI / 2 - 0.02, 840, 120, 160, T * 0.5, 12, 0.02)} />
        <rect x={70} y={304} width={740} height={28} rx={9} />
      </g>
      <rect x={140} y={1140} width={600} height={26} fill="#070403" />
      <rect x={140} y={1140} width={600} height={5} fill="#fff0c8" opacity={0.5} />
      <path d="M170,1166 L710,1166 L1000,1920 L-120,1920Z" fill="#fff0c8" opacity={0.08} filter="url(#bl24)" />
      {/* the table */}
      <rect x={-120} y={1480} width={1300} height={30} fill="#070403" />
      <rect x={-120} y={1480} width={1300} height={5} fill="#ffdca0" opacity={0.55} />
      <rect x={-120} y={1510} width={1300} height={500} fill="#050302" />
      <ellipse cx={520} cy={1488} rx={420} ry={26} fill="#ffdca0" opacity={0.2} filter="url(#bl8)" />
      <Cup x={330} y={1478} s={3.2} flip />
      <Cup x={750} y={1478} s={3.2} />
      <ellipse cx={750} cy={1476} rx={78} ry={9} fill="none" stroke="#ffdca0" strokeWidth={3} opacity={0.5} />
      <Steam x={330} y={1320} t={T} s={1} h={520} seed={1} />
      {/* her scarf, the only colour */}
      <g>
        <rect x={900} y={380} width={150} height={12} rx={4} fill="#030201" />
        <circle cx={986} cy={386} r={8} fill="#030201" />
        <g fill="#a8322a">
          <path d={drape(970, 392, Math.PI / 2 + 0.04, 560, 56, 74, T * 0.4, 21, 0.02)} />
          <path d={drape(1010, 394, Math.PI / 2 - 0.05, 430, 46, 62, T * 0.4, 23, 0.02)} />
        </g>
      </g>
      <Particles t={T} area={[100, 700, 1000, 1500]} n={40} seed={3} color="#ffe9c0" size={2.4} rise={6} op={0.7} />
    </Stage2>
    <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.25 }}>
      <Img src={staticFile("grain4.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </AbsoluteFill>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 40%, rgba(4,2,1,0.78) 100%)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(6,3,2,0.72) 0%, rgba(6,3,2,0) 30%)" }} />
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 250, fontFamily: FONT, color: "#f6e8cc" }}>
      <div style={{ fontSize: 34, letterSpacing: "0.42em", marginRight: "-0.42em", fontWeight: 600, opacity: 0.92, textShadow: "0 2px 4px rgba(0,0,0,0.95), 0 0 26px rgba(0,0,0,0.9)" }}>КАЖДОЕ УТРО</div>
      <div style={{ fontSize: 150, fontWeight: 700, fontStyle: "italic", marginTop: 14, lineHeight: 1.0, textShadow: "0 4px 8px rgba(0,0,0,0.95), 0 0 44px rgba(0,0,0,0.9), 0 0 100px rgba(0,0,0,0.8)" }}>Две чашки</div>
      <div style={{ marginTop: 20, fontSize: 48, fontStyle: "italic", fontWeight: 600, opacity: 0.96, textShadow: "0 2px 4px rgba(0,0,0,0.95), 0 0 28px rgba(0,0,0,0.9)" }}>Одна остывала нетронутой</div>
    </AbsoluteFill>
  </AbsoluteFill>
);

export const CoverG: React.FC = () => (
  <VertCtx.Provider value={true}>
    <Inner />
  </VertCtx.Provider>
);
