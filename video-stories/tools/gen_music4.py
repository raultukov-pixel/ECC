import numpy as np, json
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly
ROOT="/tmp/claude-0/-home-user-ECC/6bbadcea-813d-586e-95cc-6d25a1e78819/scratchpad"
vo=json.load(open(f"{ROOT}/starshiy/src/vo4.json")); T=vo["total"]; L=vo["lines"]
sr=48000; N=int(T*sr)
rng=np.random.default_rng(11)
sr0,x=wavfile.read(f"{ROOT}/song/song.wav"); x=x.astype(np.float32)/32768
x=resample_poly(x,160,147,axis=0)  # 44.1k -> 48k
print("song",x.shape,x.shape[0]/sr)
# ---- find the exact repeat period
def lowm(v): return sosfilt(butter(2,420,'low',fs=sr,output='sos'),v.mean(1))
xa=lowm(x[:int(7*sr)]); xb=lowm(x)
best=None
for lag in range(int(10.2*sr),int(10.8*sr),12):
    a_=xa[:int(5*sr)]; b_=xb[lag:lag+int(5*sr)]
    if len(b_)<len(a_): continue
    c=float(np.dot(a_,b_)/np.sqrt(np.dot(a_,a_)*np.dot(b_,b_)+1e-9))
    if best is None or c>best[0]: best=(c,lag)
print("period",best[1]/sr,"corr",round(best[0],3))
P=best[1]; OV=int(0.45*sr)
seg=x[:P+OV].copy()
fi=np.sin(np.linspace(0,np.pi/2,OV))[:,None]; fo=np.cos(np.linspace(0,np.pi/2,OV))[:,None]
seg_f=seg.copy(); seg_f[:OV]*=fi; seg_f[-OV:]*=fo
reps=int(np.ceil((T+8)*sr/P))+1
bed=np.zeros((reps*P+OV,2),np.float32)
for i in range(reps):
    s=seg_f if i>0 else seg.copy()
    if i==0: s[-OV:]*=fo
    bed[i*P:i*P+len(s)]+=s
bed=bed[:N+8*sr]
# ---- beat alignment: shift so a beat lands on the shatter
Ts=L[6]["end"]
beat=(P/sr)/18.0         # 3 bars of 3/4 twice = 18 beats per period
off=(Ts-0.09)%beat
trim=int(((beat-off) if off>beat/2 else -off)*sr)
print("beat",round(beat,4),"shift s",round(trim/sr,3))
if trim>0: bed=bed[trim:]
elif trim<0: bed=np.vstack([np.zeros((-trim,2),np.float32),bed])
bed=bed[:N]
if len(bed)<N: bed=np.vstack([bed,np.zeros((N-len(bed),2),np.float32)])
t=np.arange(N)/sr
def sm(a,b): return np.clip((t-a)/(b-a),0,1)**2*(3-2*np.clip((t-a)/(b-a),0,1))
def hs(sig,f,o=2): return sosfilt(butter(o,f,'high',fs=sr,output='sos'),sig,axis=0)
def lp(sig,f,o=2): return sosfilt(butter(o,f,'low',fs=sr,output='sos'),sig,axis=0)
def bp(sig,a,b,o=2): return sosfilt(butter(o,[a,b],'band',fs=sr,output='sos'),sig,axis=0)
# ---- summer = bright, winter = dark and wide
w=sm(Ts-0.05,Ts+1.2)[:,None]
summer=bed+0.22*hs(bed,3500)
winter=lp(bed,2600)*1.05+0.25*lp(bed,160)
mus=summer*(1-w)+winter*w
# the held breath before the break: music drops for a moment
g=np.ones(N); g*=1-0.82*np.clip(1-np.abs(t-(Ts-0.12))/0.22,0,1)
g*=np.minimum(1,t/2.2)                       # fade in
g*=1-0.0*t
mus*=g[:,None]
# slow swell in the last third
mus*=(1+0.15*sm(44,58)[:,None])
mus*=np.clip((T-t)/6.0,0,1)[:,None]**1.2     # long fade out
mus*=2.5*(1-0.62*w)
# ---- sfx
sfx=np.zeros((N,2),np.float32)
def add(sig,t0,pan=0.0,gn=1.0):
    i=int(t0*sr)
    if i>=N or i<0: return
    sig=np.atleast_1d(sig)[:N-i]
    l=np.cos((pan+1)*np.pi/4); r=np.sin((pan+1)*np.pi/4)
    sfx[i:i+len(sig),0]+=sig*gn*l; sfx[i:i+len(sig),1]+=sig*gn*r
def noise(d): return rng.normal(0,1,int(d*sr))
def env(d,att,dec): 
    tt=np.arange(int(d*sr))/sr; return np.minimum(1,tt/att)*np.exp(-tt/dec)
def chirp(v=1.0):
    d=0.12; tt=np.arange(int(d*sr))/sr; f=3200+1100*tt/d
    return np.sin(2*np.pi*np.cumsum(f)/sr)*np.sin(np.pi*tt/d)**2*v*0.1
def birds(t0,n,v):
    for k in range(n):
        for j in range(2): add(chirp(v),t0+k*0.2+j*0.1+rng.random()*0.05,rng.uniform(-0.7,0.7))
for tb in (0.8,3.2,5.9,9.4,12.7,16.3,19.8): birds(tb,4,0.9)
# distant horn on "Потом пришла война"
def horn(f0,d,v):
    tt=np.arange(int(d*sr))/sr; f=f0*(1+0.004*np.sin(2*np.pi*5.2*tt))
    ph=2*np.pi*np.cumsum(f)/sr; s=sum(np.sin(k*ph)/k**1.2 for k in range(1,11))
    s=lp(s[:,None],1800)[:,0]; e=np.minimum(1,tt/0.35)*np.minimum(1,(d-tt)/0.9)
    return s*e*v*0.2
add(horn(130.8,3.4,1.0),L[5]["start"]-0.1,-0.3); add(horn(196.0,3.2,0.8),L[5]["start"]+0.55,0.3)
# the break: swell, crack, glass, boom
def air(d,v,up=True):
    n=int(d*sr); tt=np.arange(n)/sr; xx=rng.normal(0,1,n); out=np.zeros(n); B=2048
    for i in range(0,n,B):
        p=i/n; fc=(500+5000*p**2) if up else (5500-5000*p)
        seg=xx[max(0,i-B):i+B]; out[i:i+B]=bp(seg[:,None],fc*0.8,fc*1.3)[:,0][-len(xx[i:i+B]):]
    return out*(tt/d)**2*v*0.5 if up else out*(1-tt/d)*v*0.4
add(air(1.9,0.9,True),Ts-1.85)
def glass(d,v):
    n=int(d*sr); tt=np.arange(n)/sr; s=np.zeros(n)
    for k in range(70):
        t0=rng.random()*0.35*d; f=rng.uniform(2200,9500); a=np.exp(-(tt-t0)/rng.uniform(0.05,0.35))*(tt>t0)
        s+=np.sin(2*np.pi*f*tt+rng.random()*6)*a*rng.uniform(0.15,1)/6
    s+=hs(noise(d)[:,None],3000)[:,0]*np.exp(-tt/0.12)*0.6
    return s*v
add(glass(2.4,0.9),Ts-0.02,0.0)
def thump(d,f0,v):
    tt=np.arange(int(d*sr))/sr; f=f0*np.exp(-tt*1.6)+24; return np.sin(2*np.pi*np.cumsum(f)/sr)*np.exp(-tt*1.4)*v
add(thump(3.2,60,0.7),Ts); add(thump(2.0,95,0.4),Ts+0.02)
# armor clinks while he tiptoes, soft
def clink(v):
    d=0.25; tt=np.arange(int(d*sr))/sr
    return sum(np.sin(2*np.pi*f*tt)*np.exp(-tt/0.04) for f in (2400,3600,5200))*v*0.04
for k in range(10): add(clink(0.8+0.4*rng.random()),L[2]["start"]+0.5+k*0.9,rng.uniform(-0.3,0.3))
# snow crunches while he walks in
def crunch(v):
    d=0.22; tt=np.arange(int(d*sr))/sr
    return bp(noise(d)[:,None],700,4200)[:,0]*np.exp(-tt/0.07)*v*0.35
for k in range(9): add(crunch(1.0),L[7]["start"]-0.2+k*0.64,-0.1+0.2*(k%2))
for k in range(3): add(crunch(0.7),L[11]["start"]-0.5+k*0.7,0.3)
# ice crackle at the frozen flowers
for k in range(14): add(clink(1.6),L[12]["start"]+rng.random()*1.6,rng.uniform(-0.6,0.6))
# wind bed, grows with the blizzard
wn=bp(noise(T)[:,None],150,900)[:,0]
wind=wn*(0.5+0.5*np.sin(2*np.pi*0.07*t+1))*(0.010+0.035*sm(Ts,Ts+8)+0.045*sm(44,52))
add(wind,0.0,0.0)
add(bp(noise(T)[:,None],900,3000)[:,0]*0.012*sm(Ts,Ts+6),0.0,0.4)
# the last spark: one small glass note
def note(f,d,v):
    tt=np.arange(int(d*sr))/sr; return (np.sin(2*np.pi*f*tt)+0.4*np.sin(2*np.pi*f*2.01*tt))*np.exp(-tt/1.6)*v*0.12
add(note(1568,5,1.0),L[20]["end"]+0.7,0.2); add(note(2093,6,0.7),L[20]["end"]+1.5,-0.2)
# ---- reverb on everything (wetter in winter)
ir=int(3.4*sr); IR=rng.normal(0,1,(2,ir))*np.exp(-np.arange(ir)/sr*2.2)
IR=np.stack([lp(IR[0][:,None],5200)[:,0],lp(IR[1][:,None],5200)[:,0]])
mix=mus+sfx
wet=np.stack([fftconvolve(mix[:,0],IR[0])[:N],fftconvolve(mix[:,1],IR[1])[:N]],1)
mix=mix+wet*(0.018+0.028*w)
mix*=np.minimum(1,(T-t)/3.0)[:,None]
pk=np.percentile(np.abs(mix),99.95); mix=np.tanh(mix/pk*0.9)*0.85
wavfile.write(f"{ROOT}/starshiy/public/music4.wav",sr,(mix*32767).astype(np.int16))
print("ok",T)
