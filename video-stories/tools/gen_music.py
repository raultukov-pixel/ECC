import numpy as np, json
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile
ROOT="/tmp/claude-0/-home-user-ECC/6bbadcea-813d-586e-95cc-6d25a1e78819/scratchpad"
vo=json.load(open(f"{ROOT}/starshiy/src/vo.json")); T=vo["total"]; sr=48000; N=int(T*sr)
rng=np.random.default_rng(7)
sc={s["name"]:s for s in vo["scenes"]}; L=vo["lines"]
L_=np.zeros(N); R_=np.zeros(N)
def add(sig,t,pan=0.0,g=1.0):
    i=int(t*sr); 
    if i>=N or i<0: return
    sig=sig[:N-i]; l=np.cos((pan+1)*np.pi/4); r=np.sin((pan+1)*np.pi/4)
    L_[i:i+len(sig)]+=sig*g*l; R_[i:i+len(sig)]+=sig*g*r
def hz(m): return 440*2**((m-69)/12)
def lp(x,f,o=2): return sosfilt(butter(o,f,'low',fs=sr,output='sos'),x)
def hp(x,f,o=2): return sosfilt(butter(o,f,'high',fs=sr,output='sos'),x)
def bp(x,a,b,o=2): return sosfilt(butter(o,[a,b],'band',fs=sr,output='sos'),x)
def box(m,d=2.6,v=1.0):
    t=np.arange(int(d*sr))/sr; f=hz(m)
    s=np.sin(2*np.pi*f*t)*np.exp(-t*2.2)+0.45*np.sin(2*np.pi*f*2.76*t)*np.exp(-t*5)+0.25*np.sin(2*np.pi*f*5.4*t)*np.exp(-t*9)+0.3*np.sin(2*np.pi*f*2*t)*np.exp(-t*3)
    s*=np.minimum(1,t/0.002); return s*v*0.5
def bow(m,d,v=1.0,vib=5.0):
    t=np.arange(int(d*sr))/sr; f=hz(m)*(1+0.004*np.sin(2*np.pi*vib*t)*np.minimum(1,t/1.0))
    ph=2*np.pi*np.cumsum(f)/sr; s=sum(np.sin(k*ph)/k for k in range(1,14))
    s=lp(s,min(2400,hz(m)*7)); a=min(0.9,d*0.3); r=min(1.4,d*0.35)
    env=np.minimum(1,t/a)*np.minimum(1,(d-t)/r); return s*env*v*0.22
def pad(m,d,v=1.0):
    t=np.arange(int(d*sr))/sr; s=np.zeros_like(t)
    for det in (-0.09,0,0.08):
        f=hz(m+det); ph=2*np.pi*f*t+rng.uniform(0,6); s+=sum(np.sin(k*ph)/k for k in range(1,9))
    s=bp(s,450,1100)*1.6+bp(s,2300,3000)*0.3
    env=np.minimum(1,t/(d*0.35))*np.minimum(1,(d-t)/(d*0.4)); return s*env*v*0.07
def pizz(m,v=1.0):
    d=0.7;t=np.arange(int(d*sr))/sr; ph=2*np.pi*hz(m)*t
    s=sum(np.sin(k*ph)/k**1.3*np.exp(-t*(4+2*k)) for k in range(1,8)); return s*v*0.35
def boom(v=1.0,d=4.0,f0=62):
    t=np.arange(int(d*sr))/sr; f=f0*np.exp(-t*0.9)+28; ph=2*np.pi*np.cumsum(f)/sr
    return (np.sin(ph)*np.exp(-t*1.3)+lp(rng.normal(0,1,len(t)),180)*np.exp(-t*6)*0.6)*v
def whoosh(d=1.2,v=1.0,up=True):
    n=int(d*sr); t=np.arange(n)/sr; x=rng.normal(0,1,n); out=np.zeros(n); B=2048
    for i in range(0,n,B):
        p=i/n; fc=(400+5000*p**2) if up else (5400-5000*p)
        out[i:i+B]=bp(x[max(0,i-B):i+B],fc*0.7,fc*1.4)[-len(x[i:i+B]):]
    env=(t/d)**2 if up else (1-t/d)**1.5
    return out*env*v*0.5
def crack(v=1.0):
    n=int(0.35*sr); t=np.arange(n)/sr; s=np.zeros(n)
    for k,off in enumerate((0,0.035,0.09)):
        j=int(off*sr); m=n-j; s[j:]+=hp(rng.normal(0,1,m),1200)*np.exp(-np.arange(m)/sr*(55-k*12))*(1-0.25*k)
    s+=np.sin(2*np.pi*180*t)*np.exp(-t*40)*0.8; return s*v*0.6
def caw(v=1.0):
    d=0.32; t=np.arange(int(d*sr))/sr; f=620-260*t/d+40*np.sin(2*np.pi*38*t); ph=2*np.pi*np.cumsum(f)/sr
    s=sum(np.sin(k*ph)/k for k in range(1,10))*(0.6+0.4*np.sign(np.sin(2*np.pi*75*t)))
    s=bp(s+rng.normal(0,0.6,len(t)),900,3200); env=np.minimum(1,t/0.03)*np.minimum(1,(d-t)/0.1); return s*env*v*0.12
# ---- harmony: 3/4 at 66bpm
beat=60/66; bar=3*beat
prog=[(38,[62,65,69]),(38,[62,65,69]),(34,[58,62,65]),(34,[58,62,65]),(31,[55,58,62]),(31,[55,58,62]),(33,[57,61,64]),(33,[57,61,64])]
t_th=sc["thief"]["start"]; t_cut=L[19]["end"]+0.35; t_end=sc["end"]["start"]
t_inn=sc["inn"]["start"]; t_duel=sc["duel"]["start"]; t_flash=L[10]["end"]+0.75
nb=int(T/bar)+1
mel_pat=[[0,None,2,1,None,2],[2,None,1,0,None,None],[0,1,2,None,1,None],[1,None,None,2,None,0]]
for b in range(nb):
    t0=b*bar; root,ch=prog[b%8]
    if t0>t_cut-0.2 and t0<t_end+1.5: continue
    quiet = t0>t_th
    # drone
    if b%2==0:
        g=0.75 if not quiet else 0.55
        add(bow(root,2*bar+0.8,g),t0,-0.25); add(bow(root+7,2*bar+0.8,g*0.5,4.3),t0,0.3)
        if t0>sc["youth"]["start"]: add(pad(ch[0]+12,2*bar+1,1.0),t0,-0.5); add(pad(ch[1]+12,2*bar+1,0.9),t0,0.5); add(pad(ch[2],2*bar+1,0.8),t0,0)
    # music box melody
    if not quiet and t0>1.0:
        pat=mel_pat[(b*3+b//8)%4]
        for k,idx in enumerate(pat):
            if idx is None: continue
            oc=12 if (b//4)%2==0 else 24
            add(box(ch[idx]+oc,2.4,0.55+0.25*rng.random()),t0+k*beat/2+rng.normal(0,0.006),0.35*np.sin(b+k))
        if b%4==3: add(box(ch[2]+24+ (1 if b%8==7 else 0),2.5,0.4),t0+2.5*beat,0.4)
    # waltz pizzicato in the inn
    if t_inn<=t0<t_th-0.5:
        add(pizz(root+12,0.9),t0,-0.2); add(pizz(ch[1],0.5),t0+beat,0.2); add(pizz(ch[2],0.5),t0+2*beat,0.2)
    # heartbeat in thief scene
    if quiet and t0<t_cut-1.0:
        for k in (0,1.5):
            add(boom(0.35,0.5,55),t0+k*beat); add(boom(0.25,0.5,50),t0+k*beat+0.28)
# ---- events
add(boom(0.9),sc["bridge"]["start"]+0.6); add(whoosh(2.0,0.5,True),sc["bridge"]["start"]-1.2)
add(crack(1.0),L[8]["start"]+1.75,0.2)
add(whoosh(0.9,0.9,True),t_flash-0.9); add(boom(1.3,4.5,70),t_flash); add(hp(rng.normal(0,1,int(0.5*sr)),3000)*np.exp(-np.arange(int(0.5*sr))/sr*9)*0.5,t_flash)
add(boom(0.5,2.5,48),L[11]["start"]+0.1)   # враг пал
add(whoosh(0.35,1.0,False),t_cut-0.05,0.1); add(boom(1.1,5,52),t_cut+0.05)
for tc,p in ((1.4,-0.6),(2.3,-0.4),(6.5,0.6),(sc["journey"]["start"]+1.5,0.5),(t_end+2.2,0.5),(t_end+2.9,0.3),(t_end+4.4,0.7)):
    add(caw(1.0),tc,p); add(caw(0.8),tc+0.42,p)
# ending: final chord + box phrase
te=t_end+1.0
add(bow(26,T-te-0.3,0.9),te,-0.2); add(bow(38,T-te-0.3,0.7),te,0.2); add(pad(62,T-te-0.3,1.2),te,-0.4); add(pad(69,T-te-0.3,1.0),te,0.4); add(pad(77,T-te-0.3,0.7),te,0)
for k,m in enumerate([81,77,74,69,74,62]): add(box(m,3.5,0.7),te+2.2+k*beat*1.15*(1+k*0.06),0.3*(-1)**k)
# wind bed
w=rng.normal(0,1,N); t=np.arange(N)/sr
wind=bp(w,180,900)*(0.5+0.5*np.sin(2*np.pi*0.07*t+1)+0.3*np.sin(2*np.pi*0.19*t))*0.035
L_+=wind; R_+=np.roll(wind,2400)
# reverb
ir_n=int(2.6*sr); ir=rng.normal(0,1,(2,ir_n))*np.exp(-np.arange(ir_n)/sr*2.6); ir=np.stack([lp(ir[0],5000),lp(ir[1],5000)])
wetL=fftconvolve(L_,ir[0])[:N]; wetR=fftconvolve(R_,ir[1])[:N]
k=0.02; L2=L_+wetL*k; R2=R_+wetR*k
m=np.stack([L2,R2],1); f=np.ones(N); fi=int(2.5*sr); fo=int(2.5*sr); f[:fi]=np.linspace(0,1,fi); f[-fo:]=np.linspace(1,0,fo); m*=f[:,None]
m=np.tanh(m/np.percentile(np.abs(m),99.9)*0.9)*0.8
wavfile.write(f"{ROOT}/starshiy/public/music.wav",sr,(m*32767).astype(np.int16))
json.dump({"flash":t_flash,"cut":t_cut,"snap":L[8]["start"]+1.75},open(f"{ROOT}/starshiy/src/cues.json","w"))
print("ok",T,t_flash,t_cut)
