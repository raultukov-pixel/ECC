import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve
ROOT="/tmp/claude-0/-home-user-ECC/6bbadcea-813d-586e-95cc-6d25a1e78819/scratchpad"
sr,m=wavfile.read(f"{ROOT}/song2/music6_src.wav"); m=m.astype(np.float32)/32768; N=len(m); T=N/sr
rng=np.random.default_rng(6); t=np.arange(N)/sr
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
def clink(v=1,f=2600):
    k=tt(0.5); return (np.sin(2*np.pi*f*k)*np.exp(-k/0.09)+0.5*np.sin(2*np.pi*f*1.52*k)*np.exp(-k/0.05)+hp(nz(0.5),4000)*np.exp(-k/0.01)*0.4)*0.06*v
def pour(d,v=1):
    k=tt(d); x=bp(nz(d),700,3200)*(0.6+0.4*np.sin(2*np.pi*13*k+np.sin(k*7)*3)); e=np.minimum(1,k/0.15)*np.minimum(1,(d-k)/0.25)
    return x*e*0.035*v
def creak(d=0.7):
    k=tt(d); f=180+120*k/d+20*np.sin(2*np.pi*9*k); s=np.sign(np.sin(2*np.pi*np.cumsum(f)/sr)); return lp(s,1400)*np.sin(np.pi*k/d)*0.02
def thud(f0,d,v):
    k=tt(d); f=f0*np.exp(-k*4)+35; return np.sin(2*np.pi*np.cumsum(f)/sr)*np.exp(-k/0.2)*v
def tick(v=1):
    k=tt(0.05); return np.sin(2*np.pi*2100*k)*np.exp(-k/0.006)*0.07*v
def scrape(d=0.5):
    k=tt(d); return lp(nz(d),500)*np.sin(np.pi*k/d)*0.05
add(clink(1),6.45,-0.3); add(clink(1,2900),8.75,0.3); add(clink(0.7,2900),12.0,0.3); add(clink(1),51.95,-0.3)
add(pour(2.3),13.9,0.2); add(pour(1.7),24.0,0.2); add(pour(1.5),53.0,-0.2)
add(creak(),17.0,0.7); add(thud(80,0.5,0.35),20.75,0.7); add(creak(),39.25,0.7); add(thud(80,0.5,0.35),46.95,0.7)
u=0.0
while 33.6+u<39.0:
    add(tick(0.9),33.6+u,0.5 if int(u*10)%2 else -0.5); u+=max(0.12,0.5-u*0.07)
add(scrape(),61.5,-0.4); add(clink(0.6,2900),63.45,0.3)
k=tt(1.15); add(bp(nz(1.15),900,5000)*np.minimum(1,k/0.1)*np.minimum(1,(1.15-k)/0.15)*0.06,64.6,0.0)
add(clink(0.7,2400),67.1,0.2); add(thud(60,0.5,0.22),70.35,0.0)
ir=int(1.6*sr); IR=rng.normal(0,1,(2,ir))*np.exp(-np.arange(ir)/sr*4.2)
wet=np.stack([fftconvolve(sfx[:,0],IR[0])[:N],fftconvolve(sfx[:,1],IR[1])[:N]],1); sfx=sfx+wet*0.01
g=np.minimum(1,t/2.0)*(1-0.4*np.clip(1-np.abs(t-70.2)/0.5,0,1))
out=m*g[:,None]+sfx
pk=np.percentile(np.abs(out),99.97); out=np.tanh(out/pk*0.9)*0.85
wavfile.write(f"{ROOT}/starshiy/public/music6.wav",sr,(out*32767).astype(np.int16)); print("ok",T)
