import React, { useMemo } from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Crow, Death, FlyCrow, INK, LIGHT, makeTree, P, Puppet, rng } from "./art";
import { FONT } from "./fonts";

const CW = 1080;
const CH = 1920;
const DECK = 1470;

export const Cover: React.FC = () => {
  const tl = useMemo(() => makeTree(73, 1010, DECK - 8, 430, 0.22, 5), []);
  const ripples = useMemo(() => {
    const r = rng(5);
    return Array.from({ length: 34 }, () => ({ x: r() * 1200 - 60, y: DECK + 150 + r() * r() * 280, w: 40 + r() * 170 }));
  }, []);
  const arches = useMemo(() => {
    let d = P([[-40, DECK], [CW + 40, DECK], [CW + 40, DECK + 34], [-40, DECK + 34]]);
    for (const px of [-20, 300, 660, 1020]) d += P([[px - 34, DECK + 20], [px + 34, DECK + 20], [px + 44, DECK + 520], [px - 44, DECK + 520]]);
    for (const [x0, x1] of [[16, 266], [334, 626], [694, 986]]) {
      const m = (x0 + x1) / 2;
      d += `M${x0},${DECK + 30}L${x1},${DECK + 30}L${x1},${DECK + 250}Q${m},${DECK - 60} ${x0},${DECK + 250}Z`;
    }
    return d;
  }, []);
  const rail = useMemo(() => {
    let d = "";
    for (let x = 0; x <= CW; x += 54) d += P([[x - 3, DECK + 4], [x - 3, DECK - 40], [x + 3, DECK - 40], [x + 3, DECK + 4]]);
    return d;
  }, []);
  const crows = [
    [760, 800, 0.9, 0.6], [850, 860, 0.7, 2], [930, 770, 0.8, 1], [990, 840, 0.55, 3.2], [690, 880, 0.6, 4.1],
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: "#0c0703" }}>
      <svg viewBox={`0 0 ${CW} ${CH}`} style={{ width: "100%", height: "100%" }}>
        <defs>
          <radialGradient id="csky" gradientUnits="userSpaceOnUse" cx={600} cy={980} r={1700}>
            <stop offset="0" stopColor="#f3dca6" />
            <stop offset="0.2" stopColor="#dbb068" />
            <stop offset="0.52" stopColor="#a6783a" />
            <stop offset="1" stopColor="#2c1b09" />
          </radialGradient>
          <filter id="cb1" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="46" /></filter>
          <filter id="cb2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" /></filter>
          <filter id="cmist" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="34" /></filter>
        </defs>
        <rect x={-100} y={-100} width={CW + 200} height={CH + 200} fill="url(#csky)" />
        <circle cx={620} cy={960} r={420} fill={LIGHT} opacity={0.5} filter="url(#cb1)" />
        <circle cx={620} cy={960} r={250} fill="#fdf1c9" opacity={0.97} filter="url(#cb2)" />
        <path d="M-60,1330 Q200,1250 440,1300 T1140,1280 L1140,1600 L-60,1600Z" fill="#7a5426" opacity={0.55} />
        {crows.map((c, i) => (
          <FlyCrow key={i} x={c[0]} y={c[1]} s={c[2]} flip flap={c[3] + 0.4} />
        ))}
        <path d={tl.d} fill={INK} opacity={0.9} />
        <Crow x={tl.tips[2]?.[0] ?? 1000} y={(tl.tips[2]?.[1] ?? 1100) + 2} s={1.0} flip />
        <rect x={-100} y={DECK + 120} width={CW + 200} height={CH} fill="#f0d79c" opacity={0.2} />
        {ripples.map((r, i) => (
          <rect key={i} x={r.x} y={r.y} width={r.w} height={4} fill={INK} opacity={0.5} />
        ))}
        <ellipse cx={330} cy={DECK - 40} rx={330} ry={90} fill={LIGHT} opacity={0.22} filter="url(#cmist)" />
        <Death x={250} y={DECK + 4} s={1.36} t={2.2} wind={0.55} lean={-2} armF={[34, 30]} armB={[-14, 30]} />
        <path d={arches} fill={INK} />
        <path d={rail} fill={INK} />
        <path d={`M-10,${DECK - 40}L${CW + 10},${DECK - 40}`} stroke={INK} strokeWidth={7} />
        <Puppet kind="young" flip x={950} y={DECK + 6} s={1.2} t={1} wind={-0.3} pose={{ armF: [14, 40], legF: [-6, -3], legB: [8, -3], lean: -3 }} />
        <Puppet kind="middle" flip x={840} y={DECK + 6} s={1.28} t={2} wind={-0.3} pose={{ armF: [8, 20], armB: [-6, 12], legF: [5, -2], legB: [-5, -2] }} />
        <Puppet kind="eldest" flip x={705} y={DECK + 6} s={1.36} t={3} wind={-0.5} pose={{ armF: [96, 8], armB: [-8, 12], legF: [8, -3], legB: [-8, -3], head: -5 }} />
      </svg>
      <AbsoluteFill style={{ mixBlendMode: "multiply", opacity: 0.8 }}>
        <Img src={staticFile("paper.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.3 }}>
        <Img src={staticFile("grain3.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 52% 52%, rgba(0,0,0,0) 38%, rgba(12,6,0,0.55) 76%, rgba(8,4,0,0.94) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(8,4,0,0.55) 0%, rgba(8,4,0,0) 30%)" }} />
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 330, fontFamily: FONT, color: "#f6e6bf" }}>
        <div style={{ fontSize: 40, letterSpacing: "0.38em", marginRight: "-0.38em", fontWeight: 600, opacity: 0.92, textShadow: "0 2px 4px rgba(0,0,0,0.9), 0 0 24px rgba(0,0,0,0.8)" }}>
          СКАЗКА О ТРЁХ БРАТЬЯХ
        </div>
        <svg width={600} height={44} style={{ margin: "20px 0 4px" }}>
          <path d="M30,22 L570,22" stroke="#e2c27c" strokeWidth={2} opacity={0.85} />
          <path d="M300,8 L316,22 L300,36 L284,22Z" fill="#e2c27c" />
        </svg>
        <div style={{ fontSize: 224, fontWeight: 700, fontStyle: "italic", lineHeight: 1.0, textShadow: "0 4px 6px rgba(0,0,0,0.95), 0 0 40px rgba(0,0,0,0.85), 0 0 90px rgba(20,10,0,0.8)" }}>
          Старший
        </div>
        <div style={{ marginTop: 18, fontSize: 50, fontStyle: "italic", fontWeight: 600, opacity: 1, letterSpacing: "0.04em", textShadow: "0 2px 4px rgba(0,0,0,0.95), 0 0 24px rgba(0,0,0,0.85)" }}>
          часть первая
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
