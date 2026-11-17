import React, { useMemo } from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { FONT } from "./fonts";
import { rng } from "./art";

const RED = "#b3261e";

const Ash: React.FC = () => {
  const p = useMemo(() => {
    const r = rng(9);
    return Array.from({ length: 70 }, () => ({ x: r() * 1080, y: 300 + r() * 1500, s: 2 + r() * 5, o: 0.2 + r() * 0.6 }));
  }, []);
  return (
    <svg viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%" }}>
      {p.map((q, i) => (
        <ellipse key={i} cx={q.x} cy={q.y} rx={q.s} ry={q.s * 0.6} fill="#d8d4cc" opacity={q.o} />
      ))}
    </svg>
  );
};

export const CoverF: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#0b0604" }}>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 82% 10%, rgba(255,170,80,0.7) 0%, rgba(120,60,20,0.38) 34%, rgba(10,6,3,0) 72%)" }} />
    <AbsoluteFill style={{ background: "repeating-linear-gradient(94deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 46px, rgba(0,0,0,0.16) 48px, rgba(0,0,0,0) 52px)", opacity: 0.7 }} />
    <div style={{ position: "absolute", right: -100, top: -120, width: 560, height: 560, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,214,140,0.95) 0%, rgba(255,160,70,0.5) 30%, rgba(255,140,50,0) 68%)", filter: "blur(22px)" }} />
    <Ash />
    {/* the returned envelope */}
    <div style={{ position: "absolute", left: 540, top: 1180, rotate: "-6deg" }}>
      <div style={{ position: "absolute", left: -430, top: -275, width: 860, height: 550, background: "linear-gradient(170deg,#f1e3c0 0%,#d9c193 60%,#b09164 100%)", boxShadow: "0 50px 110px rgba(0,0,0,0.8)" }}>
        <svg viewBox="0 0 860 550" style={{ position: "absolute", width: 860, height: 550 }}>
          <rect x={688} y={36} width={130} height={150} fill="none" stroke="#6a4c2c" strokeWidth={4} strokeDasharray="8 6" />
          <path d="M708,160 q20,-70 40,-20 t40,-30" fill="none" stroke="#6a4c2c" strokeWidth={4} />
          {[270, 345, 420].map((y, i) => (
            <path key={i} d={`M160,${y} q30,-22 60,0 t60,0 t60,-4 t60,6 t60,-4 ${i < 2 ? "t60,2 t50,-4" : ""}`} fill="none" stroke="#2a170c" strokeWidth={5} strokeLinecap="round" opacity={0.85} />
          ))}
        </svg>
        <div style={{ position: "absolute", left: 66, top: 188, border: `10px solid ${RED}`, color: RED, fontFamily: FONT, fontWeight: 700, fontSize: 72, letterSpacing: "0.06em", padding: "4px 26px", whiteSpace: "nowrap", rotate: "-9deg", opacity: 0.92, mixBlendMode: "multiply" }}>АДРЕСАТ ВЫБЫЛ</div>
      </div>
    </div>
    <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.25 }}>
      <Img src={staticFile("grain5.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </AbsoluteFill>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 38%, rgba(4,2,1,0.75) 100%)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(6,3,2,0.65) 0%, rgba(6,3,2,0) 34%)" }} />
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 250, fontFamily: FONT, color: "#f6e8cc" }}>
      <div style={{ fontSize: 34, letterSpacing: "0.42em", marginRight: "-0.42em", fontWeight: 600, opacity: 0.92, textShadow: "0 2px 4px rgba(0,0,0,0.95), 0 0 26px rgba(0,0,0,0.9)" }}>«ЗДРАВСТВУЙ»</div>
      <div style={{ fontSize: 118, fontWeight: 700, fontStyle: "italic", marginTop: 20, lineHeight: 1.02, textAlign: "center", textShadow: "0 4px 8px rgba(0,0,0,0.95), 0 0 44px rgba(0,0,0,0.9), 0 0 100px rgba(0,0,0,0.8)" }}>Письмо,<br />которое<br />не отправили</div>
    </AbsoluteFill>
  </AbsoluteFill>
);
