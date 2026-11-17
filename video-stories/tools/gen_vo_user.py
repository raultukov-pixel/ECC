import subprocess, json, os, sys
ROOT="/tmp/claude-0/-home-user-ECC/6bbadcea-813d-586e-95cc-6d25a1e78819/scratchpad"
M=f"{ROOT}/tts/v_ruslan/ru_RU-ruslan-medium.onnx"
OUT=f"{ROOT}/tts/lines"; os.makedirs(OUT,exist_ok=True)
# scene -> list of (subtitle text, spoken text, gap_after)
S=[
 ("road",[("Сказку о трёх братьях знают все.",None,0.45),("Но о старшем в ней — всего несколько строк.","Но о старшем в ней всего несколько строк.",0)]),
 ("youth",[("Его звали Антиох.",None,0.6),("С детства он знал один язык — язык поединка.","С детства он знал один язык, язык поединка.",0.55),("И лишь однажды был побеждён.",None,0.5),("Это поражение он носил в себе долгие годы, как занозу.",None,0)]),
 ("bridge",[("Когда на мосту Смерть предложила братьям награду, он не колебался.",None,0.5),("Он попросил палочку, достойную того, кто одолел саму Смерть.",None,0)]),
 ("elder",[("И Смерть сломала ветвь бузины, что росла у воды.",None,0)]),
 ("journey",[("С этой палочкой он пришёл в далёкую деревню — туда, где жил его давний враг.","С этой палочкой он пришёл в далёкую деревню, туда, где жил его давний враг.",0)]),
 ("duel",[("Поединок был коротким.",None,1.6),("Враг пал.",None,1.1),("А заноза… осталась.","А заноза... осталась.",0)]),
 ("inn",[("В ту ночь на постоялом дворе он пил вино и кричал каждому, кто слушал:","В ту ночь на постоялом дворе он пил вино и кричал каждому, кто слушал.",0.4),("«Меня не победить!","Меня не победить!",0.3),("Палочку мне дала сама Смерть!»","Палочку мне дала сама Смерть!",1.2),("И его услышали.",None,0)]),
 ("thief",[("Когда он уснул, к постели подкрался вор.",None,0.9),("Он забрал палочку.",None,0.8),("А заодно — перерезал старшему брату горло.","А заодно перерезал старшему брату горло.",0)]),
 ("end",[("Так Смерть получила первого из братьев.",None,0)]),
]
LEAD={"road":1.2,"youth":0.9,"bridge":0.9,"elder":1.6,"journey":1.0,"duel":1.3,"inn":0.9,"thief":1.2,"end":1.8}
TAIL={"road":0.9,"youth":1.0,"bridge":0.9,"elder":1.4,"journey":1.2,"duel":1.3,"inn":1.4,"thief":1.6,"end":5.0}
INTRO=3.4
def dur(p): return float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",p]).decode())
SEGS=json.load(open(f"{ROOT}/asr/segs.json"))
USER="/root/.claude/uploads/6bbadcea-813d-586e-95cc-6d25a1e78819/e302c047-audio_25.mp3"
CLEAN=f"{ROOT}/tts/user_clean.wav"
subprocess.run(["ffmpeg","-y","-v","error","-i",USER,"-af","pan=mono|c0=0.5*c0+0.5*c1,highpass=f=75,equalizer=f=250:t=q:w=1.2:g=-1.5,acompressor=threshold=-24dB:ratio=2.5:attack=15:release=160:makeup=2,loudnorm=I=-21:TP=-3:LRA=9","-ar","48000",CLEAN],check=True)
# which ASR fragments make up each of the 21 lines
GROUPS=[[0],[1],[2],[3],[4],[5],[6],[7],[8],[9],[10],[11],[12,13],[14,15],[16],[17],[18],[19],[20],[21],[22]]
t=INTRO; scenes=[]; lines=[]; n=0
for name,ls in S:
    s0=t; t+=LEAD[name]
    for sub,spoken,gap in ls:
        g=GROUPS[n]; a=max(0,SEGS[g[0]][0]-0.09); b=SEGS[g[-1]][1]+0.14
        fin=f"{OUT}/u{n:02d}.wav"
        d0=b-a
        subprocess.run(["ffmpeg","-y","-v","error","-ss",f"{a:.3f}","-t",f"{d0:.3f}","-i",CLEAN,"-af",f"afade=t=in:d=0.012,afade=t=out:st={d0-0.05:.3f}:d=0.05","-ar","48000","-ac","1",fin],check=True)
        d=dur(fin)
        lines.append({"i":n,"scene":name,"text":sub,"start":round(t,3),"end":round(t+d,3)})
        t+=d+gap; n+=1
    t+=TAIL[name]
    scenes.append({"name":name,"start":round(s0,3),"end":round(t,3)})
total=t
json.dump({"total":round(total,3),"intro":INTRO,"scenes":scenes,"lines":lines},open(f"{ROOT}/starshiy/src/vo.json","w"),ensure_ascii=False,indent=1)
inputs=[];fl=[]
for l in lines:
    inputs+=["-i",f"{OUT}/u{l['i']:02d}.wav"]
    fl.append(f"[{l['i']}]adelay={int(l['start']*1000)}:all=1[a{l['i']}]")
mix="".join(f"[a{l['i']}]" for l in lines)+f"amix=inputs={len(lines)}:normalize=0,apad=whole_dur={total},aecho=0.85:0.5:55|110:0.12|0.07,alimiter=limit=0.9[o]"
subprocess.run(["ffmpeg","-y","-v","error",*inputs,"-filter_complex",";".join(fl)+";"+mix,"-map","[o]","-ar","48000",f"{ROOT}/starshiy/public/vo.wav"],check=True)
print("total",total)
for s in scenes: print(s)
for l in lines: print(l["i"],l["start"],l["end"],l["text"][:40])
