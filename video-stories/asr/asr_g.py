import sherpa_onnx, wave, numpy as np, sys, json, subprocess
D="sherpa-onnx-nemo-transducer-giga-am-v2-russian-2025-04-19/"
r=sherpa_onnx.OfflineRecognizer.from_transducer(encoder=D+"encoder.int8.onnx",decoder=D+"decoder.onnx",joiner=D+"joiner.onnx",tokens=D+"tokens.txt",model_type="nemo_transducer",num_threads=4)
w=wave.open("user_g.wav"); x=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32)/32768
# segments from silence detection
out=subprocess.run(["ffmpeg","-hide_banner","-nostats","-i","user_g.wav","-af","silencedetect=noise=-30dB:d=0.2","-f","null","-"],capture_output=True,text=True).stderr
import re
st=[float(m) for m in re.findall(r"silence_start: ([\d.]+)",out)]; en=[float(m) for m in re.findall(r"silence_end: ([\d.]+)",out)]
segs=[]; a=0.0
for s,e in zip(st,en+[None]*(len(st)-len(en))):
    if s-a>0.15: segs.append((a,s))
    a=e if e is not None else s
for i,(a,b) in enumerate(segs):
    s=r.create_stream(); s.accept_waveform(16000,x[int(max(0,a-0.05)*16000):int((b+0.05)*16000)]); r.decode_stream(s)
    print(f"{i:02d} {a:6.2f}-{b:6.2f} ({b-a:4.1f}s) {s.result.text}")
json.dump(segs,open("segs_g.json","w"))
