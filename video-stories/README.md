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
| Две чашки | `CupsV` | cinematic silhouettes, morning kitchen |
| Перезвоню | `CallV` | cinematic silhouettes, phone screens, cold blue and warm kitchen |
| Дверь | `DoorV` | cinematic silhouettes, dusk street, a lit doorway; no music, only voice and street sounds |

Covers: `Cover`, `CoverB`, `CoverC`, `CoverD`, `CoverE`, `CoverF`, `CoverG`, `CoverH`, `CoverI` (stills, 1080x1920).

## Layout

- `project/` is the Remotion project (`src/` holds the art modules, scenes and film shells).
- `project/src/art*.tsx` are the drawing kits, one per visual generation: `art` (puppets), `art2` (light and cloth), `art4` (painted set), `art5` (cinematic silhouettes), `art6` (the candlelit room), `art7` (the kitchen), `art9` (the dusk street with a mosque, a door that is open or only looks shut, bench, hands), `art8` (phone and its screens, office, meeting room, flat, bar, calendar, clock, postcard, pie).
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

## Preview stills

`node tools/stills.mjs <outDir> CallV 3,12.5,40` (run it from `project/`, copy it there first) bundles once and renders half-size stills at the given seconds. It is much faster than `remotion still` for checking many shots.

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

### Две чашки

Каждое утро он ставил на стол две чашки. Одну для себя. Другую для неё. Она любила чай слишком крепкий. Он ворчал, но всегда заваривал так, как она хотела. Потом она уехала. «Ненадолго», сказала она. Он не стал убирать вторую чашку. Прошла неделя. Потом месяц. Потом он перестал считать. А в один из дней он проснулся и впервые не вспомнил про вторую. Он долго сидел. Потом встал. Взял её чашку. Вымыл. И убрал в шкаф. Тихо. Не хлопнув дверцей.

### Перезвоню

Последний звонок от мамы он сбросил. Просто был занят. «Перезвоню», — подумал он. Она звонила ему в обед. Он был на совещании. Вечером написала: «Как ты?» Он ответил одним словом: «Занят». И добавил: «Потом». Она не обиделась. Она вообще никогда не обижалась. Просто стала писать короче. «Поел?» «Не замёрз?» В субботу она позвонила снова. Он не взял. Подумал: «Завтра». Завтра были друзья. Потом отчёт. Потом дедлайн. «Потом» у него всегда было впереди. На Новый год она прислала открытку. Обычную, с ёлкой. И подписала от руки, неровным почерком: «Приезжай, сынок. Я пирог испеку». Он улыбнулся. Положил открытку на стол. «Приеду. Весной». Весной она позвонила в последний раз. Он увидел её имя на экране. И нажал «отклонить». Через два часа позвонила соседка. Он приехал в тот же вечер. В квартире было тихо. На плите стоял пирог. Остывший. Для него. Теперь он часто достаёт телефон. Находит в истории вызовов её имя и рядом красную стрелку. Пропущенный. Один. Единственный, который уже не перезвонить. Позвони маме. Прямо сейчас. Пока она ещё может взять трубку.

Pipeline for `CallV`: `asr/asr_g.py` (phrases, `segs_g.json`), `tools/gen_vo8.py` (clean voice, `vo8.json`, `vo8.wav`), `tools/gen_music8.py` (synthesised piano and strings score, effects, side-chained mix, writes `mix8_raw.wav`), then `ffmpeg -i mix8_raw.wav -af loudnorm=I=-16:TP=-1.5:LRA=11 project/public/mix8.wav`. The film plays `mix8.wav` as its only audio track. The shots are in `scenes8.tsx` (`SHOTS` list of start times), the shell in `Film8.tsx`.

### Дверь

Он проходил мимо этой двери каждый вечер. Уже много лет. Замедлял шаг. Смотрел на свет в окнах. И шёл дальше. Он говорил себе: «Мне туда нельзя. Не после всего, что я наделал». Он помнил каждый свой грех. И думал, что для таких, как он, эта дверь давно закрыта. Зимой он проходил быстрее. Летом — медленнее. А дверь все эти годы была открыта. Каждый вечер. Для всех. Свет в окнах горел и для него тоже. Однажды он остановился. Долго стоял на пороге. Руки дрожали. И кто-то рядом молча подвинулся, освобождая ему место. Ничего не спросил. Не упрекнул. Он опустил голову. И впервые за много лет не стал уходить. Сказано: «Не отчаивайтесь в милости Аллаха». Дверь никогда не была закрыта. Закрытой её считал только он.

Pipeline for `DoorV`: `asr/asr_h.py` (`segs_h.json`), `tools/gen_vo9.py` (voice, `vo9.json`, `vo9.wav`), `tools/gen_audio9.py` (sound only, no melody; writes `mix9_raw.wav`), then `ffmpeg -i mix9_raw.wav -af loudnorm=I=-16:TP=-1.5:LRA=11 project/public/mix9.wav`. Shots are in `scenes9.tsx` (`SHOTS`), the set in `art9.tsx`. The Quran quote (39:53) should be checked against a trusted translation before publishing.

## Continuing

Per story the scripts are `tools/gen_vo{N}.py` (timeline and narration track), `tools/gen_music*.py` and `tools/gen_sfx*.py` (music and effects), and `project/src/scenes{N}.tsx` (the shots).
Work was done in Russian with a friendly tone. Pending ideas: re-render `StarshiyYV` (part 3) with the silver cloak that is now a real garment (`silver` prop of `Puppet2` in `art2.tsx`), horizontal versions of the trilogy, and the other sad stories (lighthouse, last waltz, broken mirror, bird in a cage, "are you still here?").
