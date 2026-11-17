import React from "react";
import { AbsoluteFill, Html5Audio, Img, Sequence, staticFile, useCurrentFrame } from "remotion";
import vo from "./vo2.json";
import { ez, rng, VertCtx } from "./art";
import { FONT } from "./fonts";
import { SCENES2, Intro2 } from "./scenes2";

const FPS = 30;
export const TOTAL2 = Math.ceil(vo.total * FPS);
const fr = (s: number) => Math.round(s * FPS);

const Overlay: React.FC = () => {
  const f = useCurrentFrame();
  const g = Math.floor(f / 2) % 8;
  const r = rng(Math.floor(f / 2) * 7 + 1);
  const fl = r() * 0.06;
  const jx = (r() - 0.5) * 3;
  const jy = (r() - 0.5) * 3;
  return (
    <>
      <AbsoluteFill style={{ mixBlendMode: "multiply", opacity: 0.8 }}>
        <Img src={staticFile("paper.jpg")} style={{ width: "104%", height: "104%", objectFit: "cover", translate: `${jx - 14}px ${jy - 10}px` }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.3 }}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Img
            key={i}
            src={staticFile(`grain${i}.png`)}
            style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", display: i === g ? "block" : "none" }}
          />
        ))}
      </AbsoluteFill>
      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 42%, rgba(12,6,0,0.55) 78%, rgba(8,4,0,0.92) 100%)" }}
      />
      <AbsoluteFill style={{ backgroundColor: "#1a0f04", opacity: fl }} />
    </>
  );
};

const Line: React.FC<{ text: string; dur: number; hold: number }> = ({ text, dur, hold }) => {
  const f = useCurrentFrame();
  const vt = React.useContext(VertCtx);
  const words = text.split(" ");
  const total = words.reduce((a, w) => a + w.length + 1, 0);
  let acc = 0;
  const out = ez(f, hold - 8, hold, 1, 0);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", opacity: out }}>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: vt ? 760 : 300,
          background: "linear-gradient(to top, rgba(8,4,0,0.78), rgba(8,4,0,0))",
          opacity: ez(f, 0, 8),
        }}
      />
      <div style={{ position: "relative", marginBottom: vt ? 330 : 82, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: vt ? 58 : 54,
            lineHeight: 1.18,
            letterSpacing: "0.012em",
            color: "#f1ebd9",
            textAlign: "center",
            maxWidth: vt ? 900 : 1380,
            textWrap: "balance",
            textShadow: "0 2px 3px rgba(0,0,0,0.95), 0 0 18px rgba(0,0,0,0.9), 0 0 42px rgba(20,10,0,0.8)",
          }}
        >
          {words.map((w, i) => {
            const st = (acc / total) * dur * 0.82;
            acc += w.length + 1;
            const p = ez(f, st, st + 9);
            return (
              <span key={i} style={{ display: "inline-block", opacity: p, translate: `0px ${(1 - p) * 10}px`, filter: `blur(${(1 - p) * 4}px)`, marginRight: "0.26em" }}>
                {w}
              </span>
            );
          })}
        </div>
        <svg width={420} height={22} style={{ marginTop: 14, opacity: 0.85 * ez(f, 2, 14) }}>
          <path
            d={`M${210 - 190 * ez(f, 0, Math.max(12, dur))},11 L${210 + 190 * ez(f, 0, Math.max(12, dur))},11`}
            stroke="#e2c27c"
            strokeWidth={1.4}
            opacity={0.75}
          />
          <path d="M210,3 L218,11 L210,19 L202,11Z" fill="#e2c27c" />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

const Subtitles: React.FC = () => (
  <>
    {vo.lines.map((l, i) => {
      const next = vo.lines[i + 1];
      const from = fr(l.start) - 2;
      const end = Math.min(fr(l.end) + 16, next ? fr(next.start) - 3 : 1e9);
      return (
        <Sequence key={i} from={from} durationInFrames={end - from} layout="none">
          <Line text={l.text} dur={fr(l.end - l.start)} hold={end - from} />
        </Sequence>
      );
    })}
  </>
);

export const Film2: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#0c0703" }}>
    <Sequence durationInFrames={fr(vo.intro)}>
      <Intro2 dur={fr(vo.intro)} />
    </Sequence>
    {vo.scenes.map((s) => {
      const C = SCENES2[s.name];
      if (!C) return null;
      const from = fr(s.start);
      const dur = fr(s.end) - from;
      return (
        <Sequence key={s.name} from={from} durationInFrames={dur}>
          <C dur={dur} />
        </Sequence>
      );
    })}
    <Overlay />
    <Subtitles />
    <Html5Audio src={staticFile("vo2.wav")} volume={1} />
    <Html5Audio src={staticFile("music2.wav")} volume={0.62} />
  </AbsoluteFill>
);

export const FilmV2: React.FC = () => (
  <VertCtx.Provider value={true}>
    <Film2 />
  </VertCtx.Provider>
);
