// usage: node stills.mjs <outDir> <comp> <sec,sec,...>   renders a still at each second (30 fps)
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [outDir, comp, secs] = process.argv.slice(2);
const proj = process.cwd();
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const serveUrl = await bundle({ entryPoint: path.join(proj, "src/index.ts"), publicDir: path.join(proj, "public") });
const c = await selectComposition({ serveUrl, id: comp, browserExecutable });
for (const s of secs.split(",")) {
  const frame = Math.min(c.durationInFrames - 1, Math.round(parseFloat(s) * c.fps));
  await renderStill({ composition: c, serveUrl, frame, output: path.join(outDir, `${comp}_${String(s).padStart(6, "0")}.png`), browserExecutable, scale: 0.5 });
  console.log("ok", s);
}
