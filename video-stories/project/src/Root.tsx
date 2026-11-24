import React from "react";
import { Composition, Still } from "remotion";
import { Cover } from "./Cover";
import { CoverB } from "./CoverB";
import { CoverC } from "./CoverC";
import { CoverD } from "./CoverD";
import { CoverE } from "./CoverE";
import { CoverF } from "./CoverF";
import { CoverG } from "./CoverG";
import { CoverH } from "./CoverH";
import { CoverI } from "./CoverI";
import { CoverJ } from "./CoverJ";
import { Test2 } from "./Test2";
import { TestS, TestW } from "./Test4";
import { T5a, T5b, T5c } from "./Test5";
import { Film, FilmV, FPS, TOTAL } from "./Film";
import { Film2, FilmV2, TOTAL2 } from "./Film2";
import { FilmV3, TOTAL3 } from "./Film3";
import { FilmV4, TOTAL4 } from "./Film4";
import { FilmV5, TOTAL5 } from "./Film5";
import { FilmV6, TOTAL6 } from "./Film6";
import { FilmV7, TOTAL7 } from "./Film7";
import { FilmV8, TOTAL8 } from "./Film8";
import { FilmV9, TOTAL9 } from "./Film9";
import { FilmV10, TOTAL10 } from "./Film10";

export const RemotionRoot: React.FC = () => (
  <>
    <Still id="Cover" component={Cover} width={1080} height={1920} />
    <Still id="T5a" component={T5a} width={1080} height={1920} />
    <Still id="T5b" component={T5b} width={1080} height={1920} />
    <Still id="T5c" component={T5c} width={1080} height={1920} />
    <Still id="TestS" component={TestS} width={1080} height={1920} />
    <Still id="TestW" component={TestW} width={1080} height={1920} />
    <Still id="Test2" component={Test2} width={1920} height={1080} />
    <Still id="CoverJ" component={CoverJ} width={1080} height={1920} />
    <Still id="CoverI" component={CoverI} width={1080} height={1920} />
    <Still id="CoverH" component={CoverH} width={1080} height={1920} />
    <Still id="CoverG" component={CoverG} width={1080} height={1920} />
    <Still id="CoverF" component={CoverF} width={1080} height={1920} />
    <Still id="CoverE" component={CoverE} width={1080} height={1920} />
    <Still id="CoverD" component={CoverD} width={1080} height={1920} />
    <Still id="CoverC" component={CoverC} width={1080} height={1920} />
    <Still id="CoverB" component={CoverB} width={1080} height={1920} />
    <Composition id="Starshiy" component={Film} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
    <Composition id="StarshiyM" component={Film2} durationInFrames={TOTAL2} fps={FPS} width={1920} height={1080} />
    <Composition id="StarshiyMV" component={FilmV2} durationInFrames={TOTAL2} fps={FPS} width={1080} height={1920} />
    <Composition id="CupsV" component={FilmV7} durationInFrames={TOTAL7} fps={FPS} width={1080} height={1920} />
    <Composition id="HouseV" component={FilmV10} durationInFrames={TOTAL10} fps={FPS} width={1080} height={1920} />
    <Composition id="DoorV" component={FilmV9} durationInFrames={TOTAL9} fps={FPS} width={1080} height={1920} />
    <Composition id="CallV" component={FilmV8} durationInFrames={TOTAL8} fps={FPS} width={1080} height={1920} />
    <Composition id="LetterV" component={FilmV6} durationInFrames={TOTAL6} fps={FPS} width={1080} height={1920} />
    <Composition id="Knight2V" component={FilmV5} durationInFrames={TOTAL5} fps={FPS} width={1080} height={1920} />
    <Composition id="KnightV" component={FilmV4} durationInFrames={TOTAL4} fps={FPS} width={1080} height={1920} />
    <Composition id="StarshiyYV" component={FilmV3} durationInFrames={TOTAL3} fps={FPS} width={1080} height={1920} />
    <Composition id="StarshiyV" component={FilmV} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
  </>
);
