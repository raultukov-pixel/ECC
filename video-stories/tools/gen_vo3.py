import subprocess, json, os, sys
ROOT="/tmp/claude-0/-home-user-ECC/6bbadcea-813d-586e-95cc-6d25a1e78819/scratchpad"
OUT=f"{ROOT}/tts/lines3"; os.makedirs(OUT,exist_ok=True)
P2=f"{ROOT}/starshiy"          # same project, part-2 data lives in src/vo3.json
S=[
 ("last",[("Остался Младший.",0.55),("Самый тихий и самый мудрый из трёх.",0)]),
 ("doubt",[("Игнотус не верил Смерти.",0.5),("Он видел, как ласково она улыбалась его братьям.",0.6),("Слишком ласково.",0)]),
 ("wish",[("Ему не нужна была победа над ней. Он хотел только одного: прожить свою жизнь.",0.7),("И он попросил так:",0.3),("уйти отсюда, чтобы Смерть не пошла следом.",0)]),
 ("pause",[("Смерть помедлила.",0.6),("И ей было неприятно отдавать то, что принадлежало ей самой.",0)]),
 ("cloak",[("Но она сняла с себя плащ.",0.6),("Плащ, под которым можно скрыться даже от неё.",0)]),
 ("years",[("Игнотус накинул его и пошёл прочь.",0.6),("Он прожил долгую, тихую, счастливую жизнь.",0)]),
 ("son",[("Передал плащ сыну, и тот понял, что это дар, а не оружие.",0)]),
 ("hour",[("А когда пришёл его час, Игнотус снял плащ.",0.6),("И поприветствовал Смерть как старого друга.",0)]),
 ("end",[("Они ушли вместе.",0.6),("На равных.",1.5),("Так закончилась сказка о трёх братьях.",0)]),
]
LEAD={"last":1.6,"doubt":0.9,"wish":1.0,"pause":1.1,"cloak":1.0,"years":0.9,"son":1.4,"hour":1.0,"end":1.2}
TAIL={"last":0.9,"doubt":1.2,"wish":1.3,"pause":1.5,"cloak":1.9,"years":2.2,"son":2.4,"hour":1.8,"end":5.6}
INTRO=3.6
SEGS=json.load(open(f"{ROOT}/asr/segs_c.json"))
USER="/root/.claude/uploads/6bbadcea-813d-586e-95cc-6d25a1e78819/b8d8905f-audio_27.mp3"
CLEAN=f"{ROOT}/tts/user_clean3.wav"
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
json.dump({"total":round(total,3),"intro":INTRO,"scenes":scenes,"lines":lines},open(f"{P2}/src/vo3.json","w"),ensure_ascii=False,indent=1)
inputs=[];fl=[]
for l in lines:
    inputs+=["-i",f"{OUT}/u{l['i']:02d}.wav"]
    fl.append(f"[{l['i']}]adelay={int(l['start']*1000)}:all=1[a{l['i']}]")
mix="".join(f"[a{l['i']}]" for l in lines)+f"amix=inputs={len(lines)}:normalize=0,apad=whole_dur={total},aecho=0.85:0.5:55|110:0.12|0.07,alimiter=limit=0.9:level=disabled,volume=6dB,alimiter=limit=0.9:level=disabled[o]"
subprocess.run(["ffmpeg","-y","-v","error",*inputs,"-filter_complex",";".join(fl)+";"+mix,"-map","[o]","-ar","48000",f"{P2}/public/vo3.wav"],check=True)
print("total",round(total,2))
for s in scenes: print(s["name"],s["start"],s["end"])
