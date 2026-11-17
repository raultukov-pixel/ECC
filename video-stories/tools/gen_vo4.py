import subprocess, json, os
ROOT="/tmp/claude-0/-home-user-ECC/6bbadcea-813d-586e-95cc-6d25a1e78819/scratchpad"
OUT=f"{ROOT}/tts/lines4"; os.makedirs(OUT,exist_ok=True)
P2=f"{ROOT}/starshiy"
TEXT=[
 "Летом они проходили под этой аркой каждый день.",
 "Она держала его под руку.",
 "А он, железный рыцарь, шёл тише, чтобы не греметь.",
 "Она смеялась, что броня тяжелее его слов.",
 "А он обещал ей одно: вернуться до первого снега.",
 "Потом пришла война.",
 "И лето закончилось раньше срока.",
 "Он вернулся, когда снег уже лёг.",
 "Вернулся один.",
 "Арка стояла на том же месте.",
 "Но под ней никто не ждал.",
 "Он нашёл цветы, которые она держала в тот день.",
 "Замёрзшие.",
 "Тихие.",
 "Он не плакал.",
 "Рыцари не плачут.",
 "Он просто стоял, пока метель не стёрла его следы.",
 "А рядом тянулась только одна цепочка.",
 "Он выполнил обещание.",
 "Вернулся до первого снега.",
 "Просто слишком поздно.",
]
SCENES=[("arch",[0,1]),("steps",[2,3]),("promise",[4,5]),("war",[6]),("back",[7,8,9,10]),("flowers",[11,12,13]),("stand",[14,15,16,17]),("away",[18,19,20])]
V0=2.4; TAIL=6.4
SEGS=json.load(open(f"{ROOT}/asr/segs_d.json"))
USER="/root/.claude/uploads/6bbadcea-813d-586e-95cc-6d25a1e78819/c012320b-audio_28.mp3"
CLEAN=f"{ROOT}/tts/user_clean4.wav"
subprocess.run(["ffmpeg","-y","-v","error","-i",USER,"-af","pan=mono|c0=0.5*c0+0.5*c1,highpass=f=75,equalizer=f=250:t=q:w=1.2:g=-1.5,alimiter=limit=0.8:level=disabled,acompressor=threshold=-24dB:ratio=2.5:attack=15:release=160:makeup=2,loudnorm=I=-21:TP=-3:LRA=9","-ar","48000",CLEAN],check=True)
def dur(p): return float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",p]).decode())
lines=[]
for n,txt in enumerate(TEXT):
    a=max(0,SEGS[n][0]-0.09); b=SEGS[n][1]+0.14; d0=b-a
    fin=f"{OUT}/u{n:02d}.wav"
    subprocess.run(["ffmpeg","-y","-v","error","-ss",f"{a:.3f}","-t",f"{d0:.3f}","-i",CLEAN,"-af",f"afade=t=in:d=0.012,afade=t=out:st={d0-0.05:.3f}:d=0.05","-ar","48000","-ac","1",fin],check=True)
    d=dur(fin); st=V0+a
    lines.append({"i":n,"text":txt,"start":round(st,3),"end":round(st+d,3)})
total=lines[-1]["end"]+TAIL
scenes=[]
for k,(name,idx) in enumerate(SCENES):
    s=0.0 if k==0 else (lines[idx[0]-1]["end"]+lines[idx[0]]["start"])/2
    e=total if k==len(SCENES)-1 else (lines[idx[-1]]["end"]+lines[idx[-1]+1]["start"])/2
    scenes.append({"name":name,"start":round(s,3),"end":round(e,3),"lines":idx})
for s_ in scenes:
    if s_["name"]=="war": s_["end"]=28.5
    if s_["name"]=="back": s_["start"]=28.5
json.dump({"total":round(total,3),"scenes":scenes,"lines":lines},open(f"{P2}/src/vo4.json","w"),ensure_ascii=False,indent=1)
inputs=[];fl=[]
for l in lines:
    inputs+=["-i",f"{OUT}/u{l['i']:02d}.wav"]
    fl.append(f"[{l['i']}]adelay={int(l['start']*1000)}:all=1[a{l['i']}]")
mix="".join(f"[a{l['i']}]" for l in lines)+f"amix=inputs={len(lines)}:normalize=0,apad=whole_dur={total},aecho=0.85:0.5:55|110:0.12|0.07,alimiter=limit=0.9:level=disabled,volume=6dB,alimiter=limit=0.9:level=disabled[o]"
subprocess.run(["ffmpeg","-y","-v","error",*inputs,"-filter_complex",";".join(fl)+";"+mix,"-map","[o]","-ar","48000",f"{P2}/public/vo4.wav"],check=True)
print("total",round(total,2))
for s in scenes: print(s["name"],s["start"],s["end"],s["lines"])
print("shatter after line 6 end:",lines[6]["end"])
