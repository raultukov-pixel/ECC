"""Story 'Дом, который ждал' (HouseV): clean the recording, cut it into subtitle lines, write the timeline vo10.json
and the narration track vo10.wav. Point ROOT at your working folder."""
import subprocess, json, os, numpy as np
from scipy.io import wavfile

ROOT = "/tmp/claude-0/-home-user-ECC/7550396c-17ce-51fa-ba40-ea754e7cc1af/scratchpad"
PROJ = "/home/user/ECC/video-stories"
USER = "/root/.claude/uploads/7550396c-17ce-51fa-ba40-ea754e7cc1af/73f7d24f-audio_33.mp3"
OUT = f"{ROOT}/lines10"
os.makedirs(OUT, exist_ok=True)
SEGS = json.load(open(f"{PROJ}/asr/segs_i.json"))  # 23 phrases found by asr/asr_i.py
V0 = 0.9      # silence before the first word
TAIL = 5.0    # music outro after the last word

SUB = [
    ("Все дети в нашем районе обходили этот дом стороной.", [0]),
    ("Говорили, что он живой.", [1]),
    ("Что смотрит из окон.", [2]),
    ("Что по ночам в нём кто-то плачет.", [3]),
    ("Хозяин, старик, никого не пускал к забору.", [4]),
    ("Кричал на каждого, кто подходил близко.", [5]),
    ("Мы думали, что он злой.", [6]),
    ("Никто не знал, что этот дом он построил сам.", [7]),
    ("Своими руками.", [8]),
    ("Каждое окно он ставил так, как она любила, чтобы утром в кухню падало солнце.", [9]),
    ("Она так и не успела в нём пожить.", [10]),
    ("Он остался.", [11]),
    ("Не потому что не мог уйти.", [12]),
    ("А потому что в этом доме всё ещё стояла её чашка.", [13]),
    ("Висел её платок.", [14]),
    ("Каждый вечер он зажигал свет в её любимом окне.", [15]),
    ("Мы думали, что дом смотрит на нас.", [16]),
    ("А он просто ждал её.", [17]),
    ("Теперь я иногда прохожу мимо.", [18]),
    ("Останавливаюсь у забора.", [19]),
    ("И тихо говорю: «Простите нас».", [20]),
    ("Злым был не дом.", [21]),
    ("Злыми были мы.", [22]),
]

CLEAN = f"{ROOT}/user_clean10.wav"
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", USER, "-af",
                "pan=mono|c0=0.5*c0+0.5*c1,alimiter=limit=0.8:level=disabled,highpass=f=75,equalizer=f=250:t=q:w=1.2:g=-1.5,"
                "acompressor=threshold=-24dB:ratio=2.5:attack=15:release=160:makeup=2,loudnorm=I=-21:TP=-3:LRA=9",
                "-ar", "48000", CLEAN], check=True)


def dur(p):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]).decode())


lines = []
for n, (txt, idx) in enumerate(SUB):
    a = max(0, SEGS[idx[0]][0] - 0.09)
    b = SEGS[idx[-1]][1] + 0.14
    d0 = b - a
    fin = f"{OUT}/u{n:02d}.wav"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{a:.3f}", "-t", f"{d0:.3f}", "-i", CLEAN, "-af",
                    f"afade=t=in:d=0.012,afade=t=out:st={d0 - 0.05:.3f}:d=0.05", "-ar", "48000", "-ac", "1", fin], check=True)
    lines.append({"i": n, "text": txt, "start": round(V0 + a, 3), "end": round(V0 + a + dur(fin), 3)})

total = round(lines[-1]["end"] + TAIL, 3)
json.dump({"total": total, "scenes": [{"name": "all", "start": 0, "end": total, "lines": []}], "lines": lines},
          open(f"{PROJ}/project/src/vo10.json", "w"), ensure_ascii=False, indent=1)

inputs, fl = [], []
for l in lines:
    inputs += ["-i", f"{OUT}/u{l['i']:02d}.wav"]
    fl.append(f"[{l['i']}]adelay={int(l['start'] * 1000)}:all=1[a{l['i']}]")
mix = "".join(f"[a{l['i']}]" for l in lines) + (
    f"amix=inputs={len(lines)}:normalize=0,apad=whole_dur={total},aecho=0.85:0.5:55|110:0.12|0.07,"
    "alimiter=limit=0.9:level=disabled,volume=6dB,alimiter=limit=0.9:level=disabled[o]")
subprocess.run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", ";".join(fl) + ";" + mix, "-map", "[o]", "-ar", "48000",
                f"{ROOT}/vo10.wav"], check=True)
print("total", total)
for l in lines:
    print(l["i"], l["start"], l["end"], l["text"][:34])
