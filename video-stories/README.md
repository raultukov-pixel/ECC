# Video stories

Animated stories built with Remotion (React + SVG), vertical 9:16 for Reels.
Everything is drawn in code, with no stock footage and no image generators.

## Stories

| Story | Composition id | Style |
| --- | --- | --- |
| Старший (part 1 of 3) | `Starshiy`, `StarshiyV` | shadow theatre, sepia |
| Средний (part 2 of 3) | `StarshiyM`, `StarshiyMV` | shadow theatre, dusk blue |
| Младший (part 3 of 3) | `StarshiyYV` | shadow theatre, dawn gold |
| Рыцарь («До первого снега») | `Knight2V` (silhouettes), `KnightV` (first, puppet version) | cinematic silhouettes, gold and blue |
| Письмо, которое не отправили | `LetterV` | cinematic silhouettes, candlelight |

Covers: `Cover`, `CoverB`, `CoverC`, `CoverD`, `CoverE`, `CoverF` (stills, 1080x1920).

## Layout

- `project/` is the Remotion project (`src/` holds the art modules, scenes and film shells).
- `project/src/art*.tsx` are the drawing kits, one per visual generation: `art` (puppets), `art2` (light and cloth), `art4` (painted set), `art5` (cinematic silhouettes), `art6` (the room).
- `project/src/scenes*.tsx` are the stories. `vo*.json` are the narration timelines the scenes are synced to.
- `tools/` has Python scripts that cut the narration, build the timeline and synthesise or edit the music.
- `asr/` has the recogniser script used to match the recording to the text, plus the resulting segment times.

## Not in the repository

- Voice recordings and songs (they belong to their authors).
- Generated audio (`vo*.wav`, `music*.wav`), textures and the font files in `project/public`.
- Speech models, rendered videos, `node_modules`.

## Rebuild

```bash
cd project
npm install
cp node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-{cyrillic,latin}-{500,600,700}-{normal,italic}.woff2 public/
python3 ../tools/tex.py          # writes public/paper.jpg and grain0-7.png
npx remotion studio              # preview
npx remotion render LetterV out/letter.mp4
```

The scripts in `tools/` have an absolute `ROOT` path at the top: point it at your working folder.
They need `numpy`, `scipy`, `pillow`, `librosa`, `sherpa-onnx` and `ffmpeg`.

Pipeline for a story with a spoken narration:

1. Put the recording in place, then run `asr/asr.py` to split it into phrases and read them back.
2. Run the matching `tools/gen_vo*.py`: it clips each phrase, writes the timeline `vo*.json` and the narration track.
3. Run the music script, or let `gen_vo5.py` edit the song to the film length.
4. Render the composition, then mix voice and music with a side-chain and mux:

```bash
ffmpeg -i vo.wav -i music.wav -filter_complex \
  "[0]pan=stereo|c0=c0|c1=c0,volume=6dB,asplit=2[v][vk];[1]volume=1[m];[m][vk]sidechaincompress=threshold=0.08:ratio=2.2[md];[v][md]amix=inputs=2:normalize=0" \
  mix.wav
```

## Narration texts

### Старший

Сказку о трёх братьях знают все. Но о старшем в ней всего несколько строк. Его звали Антиох. С детства он знал один язык, язык поединка. И лишь однажды был побеждён. Это поражение он носил в себе долгие годы, как занозу.

### Средний

Старший пал первым. Но Смерть всё ещё стояла на мосту. Средний брат, Кадм, был горд и жесток. Он попросил то, чего не давал никто: вернуть тех, кого она уже забрала.

### Младший

Остался Младший. Самый тихий и самый мудрый из трёх. Игнотус не верил Смерти. Они ушли вместе. На равных.

### Рыцарь

Летом они проходили под этой аркой каждый день. Она держала его под руку. А он обещал ей одно: вернуться до первого снега. Он вернулся, когда снег уже лёг. Вернулся один. Он выполнил обещание. Вернулся до первого снега. Просто слишком поздно.

### Письмо, которое не отправили

Он писал ей каждый вечер. Садился за стол, зажигал свечу и начинал: «Здравствуй». Потом вспоминал, как они расстались. Скомкивал лист. И бросал в огонь. Через месяц конверт вернулся. Нетронутый. На нём была одна строчка: «Адресат выбыл».
