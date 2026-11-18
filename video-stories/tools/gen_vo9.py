"""Story 'Дверь' (DoorV): clean the recording, cut it into subtitle lines, write the timeline vo9.json
and the narration track vo9.wav. Point ROOT at your working folder."""
import subprocess, json, os, numpy as np
from scipy.io import wavfile

ROOT = "/tmp/claude-0/-home-user-ECC/7550396c-17ce-51fa-ba40-ea754e7cc1af/scratchpad"
PROJ = "/home/user/ECC/video-stories"
USER = "/root/.claude/uploads/7550396c-17ce-51fa-ba40-ea754e7cc1af/72b69f04-audio_32.mp3"
OUT = f"{ROOT}/lines9"
os.makedirs(OUT, exist_ok=True)
SEGS = json.load(open(f"{PROJ}/asr/segs_h.json"))  # 27 phrases found by asr/asr_h.py
V0 = 0.9      # silence before the first word
TAIL = 5.0    # music outro after the last word

SUB = [
    ("Он проходил мимо этой двери каждый вечер.", [0]),
    ("Уже много лет.", [1]),
    ("Замедлял шаг.", [2]),
    ("Смотрел на свет в окнах.", [3]),
    ("И шёл дальше.", [4]),
    ("Он говорил себе:", [5]),
    ("«Мне туда нельзя.", [6]),
    ("Не после всего, что я наделал».", [7]),
    ("Он помнил каждый свой грех.", [8]),
    ("И думал, что для таких, как он, эта дверь давно закрыта.", [9]),
    ("Зимой он проходил быстрее.", [10]),
    ("Летом — медленнее.", [11]),
    ("А дверь все эти годы была открыта.", [12]),
    ("Каждый вечер.", [13]),
    ("Для всех.", [14]),
    ("Свет в окнах горел и для него тоже.", [15]),
    ("Однажды он остановился.", [16]),
    ("Долго стоял на пороге.", [17]),
    ("Руки дрожали.", [18]),
    ("И кто-то рядом молча подвинулся, освобождая ему место.", [19]),
    ("Ничего не спросил.", [20]),
    ("Не упрекнул.", [21]),
    ("Он опустил голову.", [22]),
    ("И впервые за много лет не стал уходить.", [23]),
    ("Сказано: «Не отчаивайтесь в милости Аллаха».", [24]),
    ("Дверь никогда не была закрыта.", [25]),
    ("Закрытой её считал только он.", [26]),
]

CLEAN = f"{ROOT}/user_clean9.wav"
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
          open(f"{PROJ}/project/src/vo9.json", "w"), ensure_ascii=False, indent=1)

inputs, fl = [], []
for l in lines:
    inputs += ["-i", f"{OUT}/u{l['i']:02d}.wav"]
    fl.append(f"[{l['i']}]adelay={int(l['start'] * 1000)}:all=1[a{l['i']}]")
mix = "".join(f"[a{l['i']}]" for l in lines) + (
    f"amix=inputs={len(lines)}:normalize=0,apad=whole_dur={total},aecho=0.85:0.5:55|110:0.12|0.07,"
    "alimiter=limit=0.9:level=disabled,volume=6dB,alimiter=limit=0.9:level=disabled[o]")
subprocess.run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", ";".join(fl) + ";" + mix, "-map", "[o]", "-ar", "48000",
                f"{ROOT}/vo9.wav"], check=True)
print("total", total)
for l in lines:
    print(l["i"], l["start"], l["end"], l["text"][:34])
