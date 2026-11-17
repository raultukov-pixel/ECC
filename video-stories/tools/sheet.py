import sys,glob,os
from PIL import Image
d=sys.argv[1]; fs=sorted(glob.glob(d+"/*.jpeg")+glob.glob(d+"/*.png")); 
per=6
for k in range(0,len(fs),per):
    ims=[Image.open(f).convert("RGB").resize((800,450)) for f in fs[k:k+per]]
    sh=Image.new("RGB",(1600,450*((len(ims)+1)//2)))
    for i,im in enumerate(ims): sh.paste(im,((i%2)*800,(i//2)*450))
    sh.save(f"{d}/../sheet_{sys.argv[2]}_{k//per}.jpg",quality=85)
print(len(fs))
