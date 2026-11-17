import subprocess, json, os, sys
ROOT="/tmp/claude-0/-home-user-ECC/6bbadcea-813d-586e-95cc-6d25a1e78819/scratchpad"
OUT=f"{ROOT}/tts/lines2"; os.makedirs(OUT,exist_ok=True)
P2=f"{ROOT}/starshiy"          # same project, part-2 data lives in src/vo2.json
S=[
 ("bridge",[("Старший пал первым.",0.55),("Но Смерть всё ещё стояла на мосту.",0)]),
 ("kadm",[("Средний брат, Кадм, был горд и жесток.",0.5),("Он видел, как Смерть можно перехитрить, и захотел унизить её ещё раз.",0)]),
 ("ask",[("Он попросил то, чего не давал никто:",0.35),("вернуть тех, кого она уже забрала.",0)]),
 ("stone",[("Смерть подняла с берега камень.",0.5),("Повернула его в руке трижды.",0)]),
 ("she",[("И перед ним появилась она.",0.6),("Девушка, которую он любил и которую потерял слишком рано.",0)]),
 ("veil",[("Но она была тихой и холодной.",0.5),("Она была не здесь и не там.",0.5),("Между ними осталась стена, которую нельзя пройти.",0)]),
 ("calls",[("Он звал её каждую ночь.",0.6),("Она отвечала взглядом, и это было страшнее молчания.",0)]),
 ("fade",[("Он перестал есть.",0.55),("Перестал спать.",0.55),("Перестал отличать день от ночи.",0.6),("И однажды понял: чтобы быть рядом с ней, нужно уйти туда, где она.",0)]),
 ("end",[("Так Смерть получила второго из братьев.",0)]),
]
LEAD={"bridge":1.6,"kadm":0.9,"ask":0.9,"stone":1.2,"she":1.1,"veil":0.9,"calls":1.0,"fade":0.9,"end":1.8}
TAIL={"bridge":1.0,"kadm":1.0,"ask":1.1,"stone":1.5,"she":1.6,"veil":1.4,"calls":1.4,"fade":1.6,"end":5.5}
INTRO=3.6
SEGS=json.load(open(f"{ROOT}/asr/segs_b.json"))
USER="/root/.claude/uploads/6bbadcea-813d-586e-95cc-6d25a1e78819/d3ac5eff-audio_26.mp3"
CLEAN=f"{ROOT}/tts/user_clean2.wav"
subprocess.run(["ffmpeg","-y","-v","error","-i",USER,"-af","pan=mono|c0=0.5*c0+0.5*c1,highpass=f=75,equalizer=f=250:t=q:w=1.2:g=-1.5,alimiter=limit=0.8:level=disabled,acompressor=threshold=-24dB:ratio=2.5:attack=15:release=160:makeup=2,loudnorm=I=-21:TP=-3:LRA=9","-ar","48000",CLEAN],check=True)
def dur(p): return float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",p]).decode())
t=INTRO; scenes=[]; lines=[]; n=0
for name,ls in S:
    s0=t; t+=LEAD[name]
    for sub,gap in ls:
        a=max(0,SEGS[n][0]-0.09); b=SEGS[n][1]+0.14; d0=b-a
        fin=f"{OUT}/u{n:02d}.wav"
        subprocess.run(["ffmpeg","-y","-v","error","-ss",f"{a:.3f}","-t",f"{d0:.3f}","-i",CLEAN,"-af",f"afade=t=in:d=0.012,afade=t=out:st={d0-0.05:.3f}:d=0.05","-ar","48000","-ac","1",fin],check=True)
        d=dur(fin)
        lines.append({"i":n,"scene":name,"text":sub,"start":round(t,3),"end":round(t+d,3)})
        t+=d+gap; n+=1
    t+=TAIL[name]
    scenes.append({"name":name,"start":round(s0,3),"end":round(t,3)})
total=t
json.dump({"total":round(total,3),"intro":INTRO,"scenes":scenes,"lines":lines},open(f"{P2}/src/vo2.json","w"),ensure_ascii=False,indent=1)
inputs=[];fl=[]
for l in lines:
    inputs+=["-i",f"{OUT}/u{l['i']:02d}.wav"]
    fl.append(f"[{l['i']}]adelay={int(l['start']*1000)}:all=1[a{l['i']}]")
mix="".join(f"[a{l['i']}]" for l in lines)+f"amix=inputs={len(lines)}:normalize=0,apad=whole_dur={total},aecho=0.85:0.5:55|110:0.12|0.07,alimiter=limit=0.9:level=disabled,volume=6dB,alimiter=limit=0.9:level=disabled[o]"
subprocess.run(["ffmpeg","-y","-v","error",*inputs,"-filter_complex",";".join(fl)+";"+mix,"-map","[o]","-ar","48000",f"{P2}/public/vo2.wav"],check=True)
print("total",round(total,2))
for s in scenes: print(s["name"],s["start"],s["end"])
