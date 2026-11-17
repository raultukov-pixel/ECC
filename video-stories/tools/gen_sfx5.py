import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve
ROOT="/tmp/claude-0/-home-user-ECC/6bbadcea-813d-586e-95cc-6d25a1e78819/scratchpad"
sr,m=wavfile.read(f"{ROOT}/song2/music5_src.wav"); m=m.astype(np.float32)/32768; N=len(m); T=N/sr
rng=np.random.default_rng(5); t=np.arange(N)/sr
sfx=np.zeros((N,2),np.float32)
def bp(x,a,b): return sosfilt(butter(2,[a,b],'band',fs=sr,output='sos'),x)
def hp(x,f): return sosfilt(butter(2,f,'high',fs=sr,output='sos'),x)
def lp(x,f): return sosfilt(butter(2,f,'low',fs=sr,output='sos'),x)
def add(sig,t0,pan=0.0,g=1.0):
    i=int(t0*sr)
    if i<0 or i>=N: return
    sig=sig[:N-i]; l=np.cos((pan+1)*np.pi/4); r=np.sin((pan+1)*np.pi/4)
    sfx[i:i+len(sig),0]+=sig*g*l; sfx[i:i+len(sig),1]+=sig*g*r
def nz(d): return rng.normal(0,1,int(d*sr))
def tt(d): return np.arange(int(d*sr))/sr
def scratch(d):
    x=bp(nz(d),2500,7000); e=np.zeros(len(x)); k=tt(d)
    for a in np.arange(0,d,0.13): e+=np.exp(-((k-a-0.05)/0.035)**2)*rng.uniform(0.5,1)
    return x*e*0.05
def crumple(d):
    x=hp(nz(d),1800); k=tt(d); e=np.zeros(len(x))
    for a in np.sort(rng.uniform(0,d,26)): e+=np.exp(-np.maximum(0,k-a)/0.02)*(k>a)*rng.uniform(0.3,1)
    return x*e*0.045
def whoosh(d,v=1):
    x=bp(nz(d),300,2500); k=tt(d); return x*np.sin(np.pi*k/d)**2*0.12*v
def flare(v=1):
    d=1.6; k=tt(d); return (lp(nz(d),700)*np.exp(-k/0.35)*0.5+hp(nz(d),2500)*np.exp(-k/0.12)*0.12)*v*0.5
def thud(f0,d,v):
    k=tt(d); f=f0*np.exp(-k*3)+30; return np.sin(2*np.pi*np.cumsum(f)/sr)*np.exp(-k/0.35)*v
def tick(v=1):
    k=tt(0.05); return np.sin(2*np.pi*2100*k)*np.exp(-k/0.006)*0.08*v
def click(v=1):
    k=tt(0.2); return (np.sin(2*np.pi*900*k)*np.exp(-k/0.03)+hp(nz(0.2),3000)*np.exp(-k/0.02)*0.5)*0.12*v
# fire crackle bed for the room
cr=np.zeros(N)
for a in rng.uniform(0,T,int(T*7)):
    i=int(a*sr); k=tt(0.03); cr[i:i+len(k)]+=(hp(nz(0.03),2000)*np.exp(-k/0.006))[:max(0,N-i)]*rng.uniform(0.2,1)
room=np.ones(N); room[(t>39.35)&(t<41.75)]=0.15
add((cr*0.05+lp(rng.normal(0,1,N),300)*0.012)*room,0,0.5)
add(hp(nz(0.5),3000)*np.exp(-tt(0.5)/0.1)*0.2+whoosh(0.5,0.6),7.0,0.3)   # match / candle
add(scratch(1.25),8.55,-0.1); add(scratch(1.45),56.95,-0.1)
add(crumple(1.2),13.0,-0.2)
add(whoosh(0.62),15.02,0.2); add(flare(1.2),15.64,0.6)
for k in range(8):                                  # the clock: tomorrow, tomorrow
    add(tick(0.9),16.7+k*0.95,-0.5 if k%2 else 0.5)
for i in range(8):
    l=24.15+i*0.6; add(whoosh(0.5,0.7),l,0.2); add(flare(0.8),l+0.5,0.6); add(crumple(0.25),l-0.2,-0.2,0.6)
for k in range(14): add(tick(0.6),24.0+k*0.3,-0.5 if k%2 else 0.5)
add(thud(120,0.6,0.5),38.45); add(click(1),38.45)
w=bp(rng.normal(0,1,int(2.6*sr)),200,1200); k=tt(2.6); add(w[:len(k)]*np.sin(np.pi*k/2.6)**1.2*0.1,39.3,0.0)
add(click(1.2),41.48,0.2); add(thud(90,0.4,0.3),41.5)
add(crumple(0.4),46.5,0,0.7)
add(thud(70,1.6,1.0),48.6); add(thud(140,0.5,0.6),48.6); add(click(1.6),48.6)
ir=int(2.2*sr); IR=rng.normal(0,1,(2,ir))*np.exp(-np.arange(ir)/sr*3.2)
wet=np.stack([fftconvolve(sfx[:,0],IR[0])[:N],fftconvolve(sfx[:,1],IR[1])[:N]],1)
sfx=sfx+wet*0.012
g=np.ones(N); g*=np.minimum(1,t/2.0)                # music fade-in
g*=1-0.55*np.clip(1-np.abs(t-48.45)/0.2,0,1)        # held breath before the stamp
out=m*g[:,None]*1.0+sfx
pk=np.percentile(np.abs(out),99.97); out=np.tanh(out/pk*0.9)*0.85
wavfile.write(f"{ROOT}/starshiy/public/music5.wav",sr,(out*32767).astype(np.int16)); print("ok",T)
