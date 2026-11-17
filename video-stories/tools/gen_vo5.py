import subprocess, json, os, numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
ROOT="/tmp/claude-0/-home-user-ECC/6bbadcea-813d-586e-95cc-6d25a1e78819/scratchpad"
P2=f"{ROOT}/starshiy"; OUT=f"{ROOT}/tts/lines5"; os.makedirs(OUT,exist_ok=True)
SUB=[("Он писал ей каждый вечер.",[0]),("Садился за стол, зажигал свечу и начинал:",[1,2]),("«Здравствуй».",[3]),("Потом вспоминал, как они расстались.",[4]),("Скомкивал лист.",[5]),("И бросал в огонь.",[6]),("Он думал: завтра.",[7,8]),("Завтра я найду правильные слова.",[9]),("И отправлю.",[10]),("Завтра превращалось в неделю.",[11]),("Неделя — в год.",[12]),("А пепел ложился на подоконник, как первый снег.",[13]),("Много лет спустя он наконец дописал письмо до конца.",[14,15]),("Запечатал.",[16]),("И сам отнёс на почту.",[17]),("Через месяц конверт вернулся.",[18]),("Нетронутый.",[19]),("На нём была одна строчка:",[20]),("«Адресат выбыл».",[21]),("Он долго держал его в руках.",[22]),("Потом взял чистый лист.",[23]),("И снова написал:",[24]),("«Здравствуй».",[25])]
SCENES=[("evening",[0,1]),("hello",[2]),("burn",[3,4,5]),("tomorrow",[6,7,8]),("time",[9,10,11]),("sent",[12,13,14]),("returned",[15,16,17,18]),("again",[19,20,21,22])]
V0=2.4
SEGS=json.load(open(f"{ROOT}/asr/segs_e.json"))
USER="/root/.claude/uploads/6bbadcea-813d-586e-95cc-6d25a1e78819/4af90c28-audio_29.mp3"
CLEAN=f"{ROOT}/tts/user_clean5.wav"
subprocess.run(["ffmpeg","-y","-v","error","-i",USER,"-af","pan=mono|c0=0.5*c0+0.5*c1,highpass=f=75,equalizer=f=250:t=q:w=1.2:g=-1.5,acompressor=threshold=-24dB:ratio=2.5:attack=15:release=160:makeup=2,loudnorm=I=-21:TP=-3:LRA=9","-ar","48000",CLEAN],check=True)
# ---- music edit: start of the song, then jump to its ending so the climax and outro land on the finale
sr,x=wavfile.read(f"{ROOT}/song2/song.wav"); x=x.astype(np.float32)/32768; D=len(x)/sr
lo=sosfilt(butter(2,[60,900],'band',fs=sr,output='sos'),x.mean(1))
best=None
for t1 in np.arange(18,30,0.25):
    W=4*sr; a=lo[int(t1*sr):int(t1*sr)+W]
    for d in np.arange(44.5,49.5,0.002):
        k0=int((t1+d)*sr); b=lo[k0:k0+W]
        if len(b)<len(a): continue
        c=float(np.dot(a,b)/np.sqrt(np.dot(a,a)*np.dot(b,b)+1e-9))
        if best is None or c>best[0]: best=(c,t1,d)
c,t1,d=best; total=D-d
print("jump at",t1,"skip",round(d,3),"corr",round(c,3),"film length",round(total,2))
N=int(total*sr); XF=int(0.5*sr); i1=int(t1*sr); j=int((t1+d)*sr)
mus=np.zeros((N,2),np.float32)
mus[:i1]=x[:i1]
fo=np.cos(np.linspace(0,np.pi/2,XF))[:,None]; fi=np.sin(np.linspace(0,np.pi/2,XF))[:,None]
mus[i1:i1+XF]=x[i1:i1+XF]*fo+x[j:j+XF]*fi
rest=x[j+XF:]; mus[i1+XF:i1+XF+len(rest)]=rest[:N-i1-XF]
wavfile.write(f"{P2}/public/music5.wav",sr,(np.clip(mus,-1,1)*32767).astype(np.int16))
# ---- narration
def dur(p): return float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",p]).decode())
lines=[]
for n,(txt,idx) in enumerate(SUB):
    a=max(0,SEGS[idx[0]][0]-0.09); b=SEGS[idx[-1]][1]+0.14; d0=b-a
    fin=f"{OUT}/u{n:02d}.wav"
    subprocess.run(["ffmpeg","-y","-v","error","-ss",f"{a:.3f}","-t",f"{d0:.3f}","-i",CLEAN,"-af",f"afade=t=in:d=0.012,afade=t=out:st={d0-0.05:.3f}:d=0.05","-ar","48000","-ac","1",fin],check=True)
    lines.append({"i":n,"text":txt,"start":round(V0+a,3),"end":round(V0+a+dur(fin),3)})
scenes=[]
for k,(name,idx) in enumerate(SCENES):
    s=0.0 if k==0 else (lines[idx[0]-1]["end"]+lines[idx[0]]["start"])/2
    e=total if k==len(SCENES)-1 else (lines[idx[-1]]["end"]+lines[idx[-1]+1]["start"])/2
    scenes.append({"name":name,"start":round(s,3),"end":round(e,3),"lines":idx})
scenes=[{"name":"all","start":0,"end":round(total,3),"lines":[]}]
json.dump({"total":round(total,3),"scenes":scenes,"lines":lines},open(f"{P2}/src/vo5.json","w"),ensure_ascii=False,indent=1)
inputs=[];fl=[]
for l in lines:
    inputs+=["-i",f"{OUT}/u{l['i']:02d}.wav"]; fl.append(f"[{l['i']}]adelay={int(l['start']*1000)}:all=1[a{l['i']}]")
mix="".join(f"[a{l['i']}]" for l in lines)+f"amix=inputs={len(lines)}:normalize=0,apad=whole_dur={total},aecho=0.85:0.5:55|110:0.12|0.07,alimiter=limit=0.9:level=disabled,volume=6dB,alimiter=limit=0.9:level=disabled[o]"
subprocess.run(["ffmpeg","-y","-v","error",*inputs,"-filter_complex",";".join(fl)+";"+mix,"-map","[o]","-ar","48000",f"{P2}/public/vo5.wav"],check=True)
for s in scenes: print(s["name"],s["start"],s["end"])
for l in lines: print(l["i"],l["start"],l["end"],l["text"][:30])
