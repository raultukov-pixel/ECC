"""Story 'Перезвоню' (CallV): clean the recording, cut it into subtitle lines, write the timeline vo8.json
and the narration track vo8.wav. Point ROOT at your working folder."""
import subprocess, json, os, numpy as np
from scipy.io import wavfile

ROOT = "/tmp/claude-0/-home-user-ECC/7550396c-17ce-51fa-ba40-ea754e7cc1af/scratchpad"
PROJ = "/home/user/ECC/video-stories"
USER = "/root/.claude/uploads/7550396c-17ce-51fa-ba40-ea754e7cc1af/bc37e7ba-audio_31.mp3"
OUT = f"{ROOT}/lines8"
os.makedirs(OUT, exist_ok=True)
SEGS = json.load(open(f"{PROJ}/asr/segs_g.json"))  # 50 phrases found by asr/asr_g.py
V0 = 0.7      # silence before the first word
TAIL = 6.0    # music outro after the last word

SUB = [
    ("Последний звонок от мамы он сбросил.", [0]),
    ("Просто был занят.", [1]),
    ("«Перезвоню», — подумал он.", [2, 3]),
    ("Она звонила ему в обед.", [4]),
    ("Он был на совещании.", [5]),
    ("Вечером написала: «Как ты?»", [6]),
    ("Он ответил одним словом: «Занят».", [7]),
    ("И добавил: «Потом».", [8, 9]),
    ("Она не обиделась.", [10]),
    ("Она вообще никогда не обижалась.", [11]),
    ("Просто стала писать короче.", [12]),
    ("«Поел?»", [13]),
    ("«Не замёрз?»", [14]),
    ("В субботу она позвонила снова.", [15]),
    ("Он не взял.", [16]),
    ("Подумал: «Завтра».", [17]),
    ("Завтра были друзья.", [18]),
    ("Потом отчёт.", [19]),
    ("Потом дедлайн.", [20]),
    ("«Потом» у него всегда было впереди.", [21]),
    ("На Новый год она прислала открытку.", [22]),
    ("Обычную, с ёлкой.", [23]),
    ("И подписала от руки,", [24]),
    ("неровным почерком:", [25]),
    ("«Приезжай, сынок.", [26]),
    ("Я пирог испеку».", [27]),
    ("Он улыбнулся.", [28]),
    ("Положил открытку на стол.", [29]),
    ("«Приеду. Весной».", [30, 31]),
    ("Весной она позвонила в последний раз.", [32]),
    ("Он увидел её имя на экране.", [33]),
    ("И нажал «отклонить».", [34]),
    ("Через два часа позвонила соседка.", [35]),
    ("Он приехал в тот же вечер.", [36]),
    ("В квартире было тихо.", [37]),
    ("На плите стоял пирог.", [38]),
    ("Остывший.", [39]),
    ("Для него.", [40]),
    ("Теперь он часто достаёт телефон.", [41]),
    ("Находит в истории вызовов её имя", [42]),
    ("и рядом красную стрелку.", [43]),
    ("Пропущенный.", [44]),
    ("Один.", [45]),
    ("Единственный, который уже не перезвонить.", [46]),
    ("Позвони маме.", [47]),
    ("Прямо сейчас.", [48]),
    ("Пока она ещё может взять трубку.", [49]),
]

CLEAN = f"{ROOT}/user_clean8.wav"
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
          open(f"{PROJ}/project/src/vo8.json", "w"), ensure_ascii=False, indent=1)

inputs, fl = [], []
for l in lines:
    inputs += ["-i", f"{OUT}/u{l['i']:02d}.wav"]
    fl.append(f"[{l['i']}]adelay={int(l['start'] * 1000)}:all=1[a{l['i']}]")
mix = "".join(f"[a{l['i']}]" for l in lines) + (
    f"amix=inputs={len(lines)}:normalize=0,apad=whole_dur={total},aecho=0.85:0.5:55|110:0.12|0.07,"
    "alimiter=limit=0.9:level=disabled,volume=6dB,alimiter=limit=0.9:level=disabled[o]")
subprocess.run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", ";".join(fl) + ";" + mix, "-map", "[o]", "-ar", "48000",
                f"{ROOT}/vo8.wav"], check=True)
print("total", total)
for l in lines:
    print(l["i"], l["start"], l["end"], l["text"][:34])
