import numpy as np, json
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile
ROOT="/tmp/claude-0/-home-user-ECC/6bbadcea-813d-586e-95cc-6d25a1e78819/scratchpad"
vo=json.load(open(f"{ROOT}/starshiy/src/vo2.json")); T=vo["total"]; sr=48000; N=int(T*sr)
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
# ---- harmony: slow 3/4, grief
beat=60/54; bar=3*beat
prog=[(38,[62,65,69]),(38,[62,65,69]),(34,[58,62,65]),(34,[58,62,65]),(31,[55,58,62]),(31,[55,58,62]),(33,[57,61,64]),(33,[57,61,64])]
def Ls(i): return L[i]["start"]
def Le(i): return L[i]["end"]
t_she=Ls(8)+0.2; t_stoneA=Ls(7)+0.2; t_stoneB=Le(7)-0.13
t_veil=[Ls(12)+0.2,Ls(12)+1.27,Ls(12)+2.4]
t_door=sc["fade"]["start"]+ (Ls(18)-sc["fade"]["start"]) + 70/30
t_end=sc["end"]["start"]; t_cardfade=Le(19)+56/30
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
nb=int(T/bar)+1
mel_pat=[[0,None,None,2,None,None],[2,None,1,None,None,0],[1,None,None,0,None,2],[0,None,2,None,1,None]]
t_cut=Le(19)+0.4
for b in range(nb):
    t0=b*bar; root,ch=prog[b%8]
    if t0>t_cut+6.0 and t0<t_end+99: continue
    quiet=sc["fade"]["start"]<t0<sc["end"]["start"]
    if b%2==0:
        g=0.7
        add(bow(root,2*bar+0.9,g),t0,-0.25); add(bow(root+7,2*bar+0.9,g*0.45,4.3),t0,0.3)
        if t0>sc["kadm"]["start"]-2: add(pad(ch[0]+12,2*bar+1,0.9),t0,-0.5); add(pad(ch[1]+12,2*bar+1,0.8),t0,0.5)
    if t0>sc["bridge"]["start"]-1:
        pat=mel_pat[(b*3+b//8)%4]
        for k,idx in enumerate(pat):
            if idx is None: continue
            oc=12 if (b//4)%2==0 else 24
            add(box(ch[idx]+oc,2.8,0.42+0.2*rng.random()),t0+k*beat/2+rng.normal(0,0.008),0.35*np.sin(b+k))
# ---- events
add(boom(0.8,4.2,58),sc["bridge"]["start"]+1.0)
add(air(3.0,0.5,True),sc["bridge"]["start"]-1.0)
add(glass(93,3.5,0.6),Ls(0)+0.1)
for k,m in enumerate([81,86,89,93]): add(glass(m,3.0,0.35),Ls(0)+0.6+k*0.28,0.3*(-1)**k)
add(boom(0.6,3.0,52),sc["ask"]["start"]+0.5)
add(air(2.8,0.7,True),Ls(5)-0.6); add(boom(0.9,4.0,46),Ls(5)+0.2)
add(glass(88,2.5,0.45),Ls(6)+1.1+0.8)
for k,tt in enumerate([t_stoneA+(t_stoneB-t_stoneA)*q/3 for q in (1,2,3)]):
    add(glass(76+k*5,3.5,0.9),tt,0.2*(k-1)); add(thump(0.55+0.15*k,2.4,50),tt)
    add(glass(88+k*3,2.8,0.4),tt+0.12)
add(air(3.2,0.8,True),t_she-1.4)
for k,m in enumerate([69,74,77,81,86]): add(glass(m,3.4,0.45),t_she+k*0.34,0.35*np.sin(k*1.7))
add(choir(74,9.0,1.2),t_she,-0.4); add(choir(81,9.0,1.0),t_she,0.4); add(choir(86,8.0,0.8),t_she+0.5,0)
for tt in t_veil: add(thump(0.9,2.4,44),tt); add(glass(96,2.5,0.5),tt+0.02); add(air(1.8,0.6,False),tt)
add(choir(77,10.0,0.9),sc["veil"]["start"],0.3)
# night: stars wheel
add(air(8.0,0.35,True),sc["calls"]["start"]+0.5)
for k in range(7): add(glass(81+ (k%3)*3,3.2,0.25),sc["calls"]["start"]+1.0+k*1.1,0.5*np.sin(k))
add(glass(93,4.0,0.6),Ls(14)+0.4)
# time-lapse
for k in range(5): add(air(1.2,0.55,k%2==0),Ls(17)-0.3+k*0.55)
for k in range(4): add(thump(0.4,0.9,60),sc["fade"]["start"]+1.2+k*1.9)
# door opens: light
add(air(3.2,0.7,True),t_door-1.2); add(choir(81,7.0,1.3),t_door-0.4,-0.3); add(choir(86,7.0,1.1),t_door-0.4,0.3); add(choir(93,6.0,0.8),t_door,0)
# ending
add(boom(1.0,5.0,44),t_cut)
te=t_end+0.8
add(bow(26,T-te-0.3,0.8),te,-0.2); add(bow(38,T-te-0.3,0.65),te,0.2); add(pad(62,T-te-0.3,1.1),te,-0.4); add(pad(69,T-te-0.3,0.9),te,0.4)
for k,m in enumerate([86,81,77,74,69,62]): add(box(m,4.2,0.65),te+1.6+k*beat*1.25*(1+k*0.07),0.3*(-1)**k)
# wind bed
w=rng.normal(0,1,N); t=np.arange(N)/sr
wind=bp(w,160,800)*(0.5+0.5*np.sin(2*np.pi*0.06*t+1)+0.3*np.sin(2*np.pi*0.17*t))*0.035
L_+=wind; R_+=np.roll(wind,2400)
ir_n=int(3.2*sr); ir=rng.normal(0,1,(2,ir_n))*np.exp(-np.arange(ir_n)/sr*2.2); ir=np.stack([lp(ir[0],4500),lp(ir[1],4500)])
wetL=fftconvolve(L_,ir[0])[:N]; wetR=fftconvolve(R_,ir[1])[:N]
k=0.024; L2=L_+wetL*k; R2=R_+wetR*k
m=np.stack([L2,R2],1); f=np.ones(N); fi=int(2.5*sr); fo=int(3.0*sr); f[:fi]=np.linspace(0,1,fi); f[-fo:]=np.linspace(1,0,fo); m*=f[:,None]
m=np.tanh(m/np.percentile(np.abs(m),99.9)*0.9)*0.8
wavfile.write(f"{ROOT}/starshiy/public/music2.wav",sr,(m*32767).astype(np.int16))
print("ok",T)
