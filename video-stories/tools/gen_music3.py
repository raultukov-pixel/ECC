import numpy as np, json
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile
ROOT="/tmp/claude-0/-home-user-ECC/6bbadcea-813d-586e-95cc-6d25a1e78819/scratchpad"
vo=json.load(open(f"{ROOT}/starshiy/src/vo3.json")); T=vo["total"]; sr=48000; N=int(T*sr)
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
def choir(m,d,v=1.0):
    t=np.arange(int(d*sr))/sr; f=hz(m); s=np.zeros_like(t)
    for det in (-0.12,0,0.1):
        ph=2*np.pi*f*(1+det*0.003)*t+rng.uniform(0,6); s+=np.sin(ph)+0.5*np.sin(2*ph)+0.25*np.sin(3*ph)
    s=bp(s,420,1050)*1.4+bp(s,2400,3100)*0.35
    env=np.minimum(1,t/(d*0.45))*np.minimum(1,(d-t)/(d*0.4)); return s*env*v*0.06
def glass(m,d=3.0,v=1.0):
    t=np.arange(int(d*sr))/sr; f=hz(m)
    s=sum(np.sin(2*np.pi*f*k*t+k)*np.exp(-t*(1.2+k*0.9))/k for k in (1,2.01,3.02,4.97,6.1))
    return s*v*0.25*np.minimum(1,t/0.003)
def thump(v=1.0,d=2.2,f0=48):
    t=np.arange(int(d*sr))/sr; f=f0*np.exp(-t*2.2)+22; ph=2*np.pi*np.cumsum(f)/sr
    return np.sin(ph)*np.exp(-t*2.0)*v
def air(d=4.0,v=1.0,up=True):
    n=int(d*sr); t=np.arange(n)/sr; x=rng.normal(0,1,n); out=np.zeros(n); B=2048
    for i in range(0,n,B):
        p=i/n; fc=(500+4200*p) if up else (4700-4200*p)
        seg=x[max(0,i-B):i+B]; out[i:i+B]=bp(seg,fc*0.8,fc*1.25)[-len(x[i:i+B]):]
    env=np.sin(np.pi*t/d)**2; return out*env*v*0.4

# ---- harmony: warm 3/4, 66 bpm
beat=60/66; bar=3*beat
prog=[(38,[62,66,69]),(38,[62,66,69]),(31,[55,59,62]),(31,[55,59,62]),(33,[57,61,64]),(33,[57,61,64]),(35,[59,62,66]),(35,[59,62,66])]
def Ls(i): return L[i]["start"]
def Le(i): return L[i]["end"]
def chirp(v=1.0):
    d=0.12; t=np.arange(int(d*sr))/sr; f=3200+900*np.sin(2*np.pi*14*t)*0+1100*t/d
    ph=2*np.pi*np.cumsum(f)/sr; return np.sin(ph)*np.sin(np.pi*t/d)**2*v*0.12
def birds(t0,n=5,v=1.0):
    for k in range(n):
        tt=t0+k*0.17+rng.random()*0.05
        for j in range(2): add(chirp(v),tt+j*0.1,rng.uniform(-0.7,0.7))
nb=int(T/bar)+1
mel_pat=[[0,None,2,None,1,None],[2,None,None,1,None,0],[1,None,2,None,None,0],[0,None,1,None,2,None]]
t_end=sc["end"]["start"]; t_fin=Ls(17)
for b in range(nb):
    t0=b*bar; root,ch=prog[b%8]
    if t0>T-3: continue
    if b%2==0:
        add(bow(root,2*bar+0.9,0.72),t0,-0.25); add(bow(root+7,2*bar+0.9,0.4,4.6),t0,0.3)
        if t0>sc["doubt"]["start"]-2: add(pad(ch[0]+12,2*bar+1,0.9),t0,-0.5); add(pad(ch[1]+12,2*bar+1,0.8),t0,0.5)
    if t0>sc["last"]["start"]-1 and not (sc["pause"]["start"]<t0<sc["cloak"]["start"]-1):
        pat=mel_pat[(b*3+b//8)%4]
        amp=0.46 if sc["son"]["start"]<t0<sc["hour"]["start"] else 0.36
        for k,idx in enumerate(pat):
            if idx is None: continue
            oc=12 if (b//4)%2==0 else 24
            add(box(ch[idx]+oc,2.8,amp+0.18*rng.random()),t0+k*beat/2+rng.normal(0,0.008),0.35*np.sin(b+k))
# ---- events
add(air(3.2,0.5,True),sc["last"]["start"]-1.0); birds(sc["last"]["start"]+0.6,6,0.9)
for k,m in enumerate([81,86,89,93]): add(glass(m,3.2,0.4),Ls(0)+0.3+k*0.3,0.3*(-1)**k)
add(thump(0.5,2.6,44),sc["doubt"]["start"]+0.4)
add(air(2.4,0.7,True),Ls(4)-1.2); add(glass(95,3.0,0.55),Ls(4)+0.1); add(thump(0.8,3.0,42),Ls(4)+0.15)
birds(sc["wish"]["start"]+0.5,5,0.8)
add(choir(74,8.0,1.1),Ls(5)+3.2,-0.4); add(choir(78,8.0,0.9),Ls(5)+3.2,0.4); add(choir(81,8.0,0.8),Ls(5)+3.6,0)
for k,m in enumerate([74,78,81,86,90]): add(glass(m,3.0,0.4),Ls(7)-0.1+k*0.3,0.3*np.sin(k))
for k in range(5): add(thump(0.45,1.2,52),sc["pause"]["start"]+1.2+k*1.45)
add(air(3.0,0.5,False),sc["pause"]["start"]+0.5)
add(air(2.6,0.8,True),Ls(10)-0.2)
for k,m in enumerate([76,81,84,88,93,96]): add(glass(m,3.4,0.45),Ls(10)+0.3+k*0.26,0.4*np.sin(k*1.9))
add(air(2.2,0.8,False),Ls(11)+0.6); add(thump(0.55,3.0,40),Ls(11)+0.7)
sy=sc["years"]["start"]
for k in range(4): add(glass([81,86,90,76][k],3.0,0.5),sy+0.4+k*(sc["years"]["end"]-sy-1.0)/4,0.3*(-1)**k)
for k in range(4): add(air(1.4,0.45,k%2==0),sy+0.8+k*2.4)
birds(sy+0.6,5,0.7)
add(choir(74,9.0,0.9),sc["son"]["start"]+0.8,-0.3); add(choir(78,9.0,0.8),sc["son"]["start"]+0.8,0.3)
add(air(2.0,0.5,True),Ls(14)-0.4)
add(choir(74,8.0,0.9),sc["hour"]["start"]+0.5,-0.3)
for k,m in enumerate([93,89,86,81]): add(glass(m,3.0,0.4),Ls(15)+2.4+k*0.3,0.3*(-1)**k)
add(choir(78,7.0,1.2),Ls(16),-0.4); add(choir(81,7.0,1.0),Ls(16),0.4); add(choir(86,7.0,0.8),Ls(16)+0.3,0)
# finale
add(choir(74,T-t_fin-1.0,1.6),t_fin,-0.5); add(choir(78,T-t_fin-1.0,1.4),t_fin,0.5); add(choir(81,T-t_fin-1.0,1.2),t_fin+0.4,0); add(choir(86,T-t_fin-2.0,0.9),t_fin+1.0,0.2)
add(box(50,5.0,0.8),Ls(18),0.0); add(box(62,5.0,0.7),Ls(18)+0.02,0.1)
for k,m in enumerate([86,81,78,74,81,86]): add(box(m,4.5,0.6),Ls(19)+k*0.9,0.3*(-1)**k)
te=Ls(19)
add(bow(26,T-te-0.3,0.8),te,-0.2); add(bow(38,T-te-0.3,0.65),te,0.2); add(pad(62,T-te-0.3,1.1),te,-0.4); add(pad(66,T-te-0.3,0.9),te,0.4); add(pad(69,T-te-0.3,0.9),te,0)
w=rng.normal(0,1,N); t=np.arange(N)/sr
wind=bp(w,160,800)*(0.5+0.5*np.sin(2*np.pi*0.06*t+1)+0.3*np.sin(2*np.pi*0.17*t))*0.03
L_+=wind; R_+=np.roll(wind,2400)
ir_n=int(3.0*sr); ir=rng.normal(0,1,(2,ir_n))*np.exp(-np.arange(ir_n)/sr*2.3); ir=np.stack([lp(ir[0],5000),lp(ir[1],5000)])
wetL=fftconvolve(L_,ir[0])[:N]; wetR=fftconvolve(R_,ir[1])[:N]
k=0.024; L2=L_+wetL*k; R2=R_+wetR*k
m=np.stack([L2,R2],1); f=np.ones(N); fi=int(2.5*sr); fo=int(3.5*sr); f[:fi]=np.linspace(0,1,fi); f[-fo:]=np.linspace(1,0,fo); m*=f[:,None]
m=np.tanh(m/np.percentile(np.abs(m),99.9)*0.9)*0.8
wavfile.write(f"{ROOT}/starshiy/public/music3.wav",sr,(m*32767).astype(np.int16))
print("ok",T)
