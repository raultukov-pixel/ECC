import { continueRender, delayRender, staticFile } from "remotion";

export const FONT = "Cormorant";
const ranges: Record<string, string> = {
  cyrillic: "U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116",
  latin: "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
};
if (typeof document !== "undefined") {
  const h = delayRender("fonts");
  const jobs: Promise<unknown>[] = [];
  for (const sub of ["cyrillic", "latin"])
    for (const w of ["500", "600", "700"])
      for (const st of ["normal", "italic"]) {
        const ff = new FontFace(FONT, `url(${staticFile(`cormorant-garamond-${sub}-${w}-${st}.woff2`)}) format("woff2")`, {
          weight: w,
          style: st,
          unicodeRange: ranges[sub],
        });
        jobs.push(ff.load().then((f) => document.fonts.add(f)));
      }
  Promise.all(jobs).then(() => continueRender(h), () => continueRender(h));
}
