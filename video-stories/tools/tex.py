import numpy as np
from PIL import Image, ImageFilter
P="/tmp/claude-0/-home-user-ECC/6bbadcea-813d-586e-95cc-6d25a1e78819/scratchpad/starshiy/public/"
r=np.random.default_rng(3); W,H=1920,1080
from scipy.ndimage import gaussian_filter
def blur(a,s): return gaussian_filter(a.astype(np.float32),s)
def norm(a): return (a-a.mean())/a.std()
n=sum(norm(blur(r.normal(0,1,(H,W)),s))*w for s,w in ((120,1.0),(40,0.7),(12,0.45),(3,0.3),(0.7,0.22)))
# fibers / scratches
fib=np.zeros((H,W),np.float32)
for _ in range(900):
    x,y=r.integers(0,W),r.integers(0,H); L=r.integers(20,140); a=r.normal(0,0.25)+(np.pi/2 if r.random()<0.3 else 0)
    xs=(x+np.cos(a)*np.arange(L)).astype(int)%W; ys=(y+np.sin(a)*np.arange(L)).astype(int)%H; fib[ys,xs]+=r.choice([-1,1])*r.random()
n=n+blur(fib,0.8)*2.2
v=np.clip(214+n*17,120,255)
rgb=np.stack([v,v*0.965,v*0.9],2).astype(np.uint8)
Image.fromarray(rgb).save(P+"paper.jpg",quality=90)
for i in range(8):
    g=r.normal(128,26,(540,960)); g=blur(g,0.6)*1.0
    g=128+(g-128)*1.7
    Image.fromarray(np.clip(g,0,255).astype(np.uint8),'L').save(P+f"grain{i}.png")
print("ok")
