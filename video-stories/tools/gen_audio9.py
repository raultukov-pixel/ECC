"""Sound for 'Дверь' (DoorV): no melody, only the voice and a living street (wind, crickets, steps, snow, a heavy door,
a heartbeat, a bench). Needs vo9.wav from gen_vo9.py. Writes mix9_raw.wav in ROOT. Point ROOT/PROJ at your folders."""
import json, numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

ROOT = "/tmp/claude-0/-home-user-ECC/7550396c-17ce-51fa-ba40-ea754e7cc1af/scratchpad"
PROJ = "/home/user/ECC/video-stories"
vo = json.load(open(f"{PROJ}/project/src/vo9.json"))
T = vo["total"]; sr = 48000; N = int(T * sr)
rng = np.random.default_rng(9)
t = np.arange(N) / sr
def bp(x, a, b): return sosfilt(butter(2, [a, b], "band", fs=sr, output="sos"), x)
def hp(x, f): return sosfilt(butter(2, f, "high", fs=sr, output="sos"), x)
def lp(x, f): return sosfilt(butter(2, f, "low", fs=sr, output="sos"), x)
def nz(d): return rng.normal(0, 1, int(d * sr))
def tt(d): return np.arange(int(d * sr)) / sr
def sm(a, b): return np.clip((t - a) / (b - a), 0, 1) ** 2 * (3 - 2 * np.clip((t - a) / (b - a), 0, 1))
bus = np.zeros((N, 2), np.float32)
def put(sig, t0, pan=0.0, g=1.0):
    i = int(t0 * sr)
    if i < 0 or i >= N: return
    sig = sig[: N - i]; l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    bus[i:i + len(sig), 0] += sig * g * l; bus[i:i + len(sig), 1] += sig * g * r

# ---- beds -------------------------------------------------------------------------------------------------
slow = lp(rng.normal(0, 1, N), 0.35); slow = (slow - slow.min()) / (slow.max() - slow.min() + 1e-9)
wind = bp(rng.normal(0, 1, N), 140, 900) * (0.25 + 0.75 * slow)
winter = sm(24.2, 24.8) * (1 - sm(26.6, 27.4))
wind_env = (0.05 + 0.1 * winter) * (1 - 0.6 * sm(30.0, 34.0)) * (1 - 0.5 * sm(54, 60)) * np.minimum(1, t / 2.0)
hiss = hp(rng.normal(0, 1, N), 2500) * (0.3 + 0.7 * slow) * 0.012 * winter
town = lp(rng.normal(0, 1, N), 160) * 0.05 * np.minimum(1, t / 3.0)
bus[:, 0] += (wind * wind_env + hiss + town).astype(np.float32); bus[:, 1] += (np.roll(wind, 4000) * wind_env + hiss + town).astype(np.float32)
# crickets: summer evening, absent in the snow shot, fading when the film ends
chirp = np.zeros(N)
for k in range(5):
    f = 4100 + 230 * k; ph = rng.random() * 6
    gate = (np.sin(2 * np.pi * (6.5 + 0.7 * k) * t + ph) > 0.25) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.13 * t + k))
    chirp += np.sin(2 * np.pi * f * t) * gate
crick = chirp * 0.0045 * (1 - winter) * np.minimum(1, t / 4.0) * (1 - sm(64, 70))
bus[:, 0] += crick.astype(np.float32); bus[:, 1] += np.roll(crick, 2300).astype(np.float32)

# ---- footsteps --------------------------------------------------------------------------------------------
def step(snow=False, v=1.0):
    d = 0.22; k = tt(d)
    if snow:
        return (hp(nz(d), 1800) * np.exp(-k / 0.05) * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 90 * k))) * 0.06 + lp(nz(d), 300) * np.exp(-k / 0.04) * 0.04) * v
    return (lp(nz(d), 500) * np.exp(-k / 0.035) * 0.15 + np.sin(2 * np.pi * 65 * k) * np.exp(-k / 0.05) * 0.07 + hp(nz(d), 2500) * np.exp(-k / 0.01) * 0.015) * v

def walker(pts, dist, snow=False, v=1.0, pan_x=True, xmin=-200):
    """a step every `dist` pixels of travel along the waypoint track (film seconds, world x)"""
    ts = np.arange(pts[0][0], pts[-1][0], 0.01)
    xs = np.interp(ts, [p[0] for p in pts], [p[1] for p in pts])
    nxt = xs[0] + dist
    for tm, x in zip(ts, xs):
        if x >= nxt:
            if x > xmin and x < 1250: put(step(snow, v), tm, np.clip((x - 540) / 700, -0.8, 0.8) if pan_x else 0.0)
            nxt += dist
walker([[0.9, -130], [6.1, 590], [7.74, 650]], 144)
walker([[9.97, 650], [11.5, 1180]], 144)
walker([[24.33, 140], [26.8, 1150]], 144 / 1.7, snow=True, v=1.1)
walker([[26.83, 330], [28.95, 560]], 144 / 0.6, v=0.8)
walker([[31.9, 330], [34.5, 740]], 131 * 1.1 / 0.9, v=0.8)
walker([[32.7, 250], [35.1, 740]], 131 * 1.1 / 0.9, v=0.8)
walker([[33.4, 180], [35.7, 740]], 131 * 0.7 / 0.9, v=0.5)
walker([[38.1, 600], [40.5, 640]], 400, v=0.5)
walker([[44.5, 660], [47.3, 900]], 144 / 0.7, v=0.7)

# ---- the door, the room behind it ---------------------------------------------------------------------------
def creak(d, v=1.0):
    k = tt(d); f = 150 + 120 * k / d + 18 * np.sin(2 * np.pi * 7 * k); s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / sr))
    return (lp(s, 900) * np.sin(np.pi * k / d) * 0.035 + lp(nz(d), 300) * np.sin(np.pi * k / d) * 0.03) * v
put(creak(1.7), 29.2, 0.25)
put(lp(nz(0.6), 220) * np.exp(-tt(0.6) / 0.15) * 0.18, 30.8, 0.25)    # the leaf comes to rest
glow = lp(nz(T), 260) * (0.55 + 0.45 * slow)
bus[:, 0] += (glow * 0.03 * sm(29.3, 31.5) * (1 - sm(70, 72))).astype(np.float32)
bus[:, 1] += (glow * 0.03 * sm(29.3, 31.5) * (1 - sm(70, 72))).astype(np.float32)
air = lp(nz(T), 1200) * sm(61.5, 68.0) * (1 - sm(70.0, 72.0)) * 0.008          # the light grows, the air opens
bus[:, 0] += air.astype(np.float32); bus[:, 1] += air.astype(np.float32)

# ---- the body: a heartbeat, shaking breath, a bench, a sigh ---------------------------------------------------
def beat(v=1.0):
    k = tt(0.5); return np.sin(2 * np.pi * (58 * np.exp(-k * 8) + 30) * k) * np.exp(-k / 0.11) * v
tb = 38.1; i = 0
while tb < 44.3:
    amp = 0.16 + 0.1 * min(1, (tb - 38.1) / 4)
    put(beat(amp), tb, 0.0); put(beat(amp * 0.55), tb + 0.26, 0.0)
    tb += 0.95 - 0.06 * i; i += 1
for j in range(3):
    d = 0.9; k = tt(d)
    put(bp(nz(d), 500, 3500) * np.sin(np.pi * k / d) ** 2 * (0.7 + 0.3 * np.sin(2 * np.pi * 14 * k)) * 0.03, 42.95 + j * 0.45, 0.0)
def wood(d, v=1.0):
    k = tt(d); f = 110 + 60 * np.sin(2 * np.pi * 3 * k)
    return (lp(np.sign(np.sin(2 * np.pi * np.cumsum(f) / sr)), 700) * np.sin(np.pi * k / d) * 0.03 + lp(nz(d), 700) * np.sin(np.pi * k / d) * 0.02) * v
put(wood(0.8), 45.0, 0.6); put(wood(0.6, 0.7), 47.9, 0.35); put(lp(nz(0.4), 400) * np.exp(-tt(0.4) / 0.1) * 0.1, 48.2, 0.3)
d = 1.8; k = tt(d); put(bp(nz(d), 300, 2200) * np.sin(np.pi * k / d) ** 2 * 0.035, 52.5, 0.0)   # he lets his breath out

# ---- mix: voice + beds, ducking the bed under the voice -----------------------------------------------------------
sv, v = wavfile.read(f"{ROOT}/vo9.wav"); v = v.astype(np.float32) / 32768
if v.ndim == 1: v = np.stack([v, v], 1)
v = np.vstack([v, np.zeros((max(0, N - len(v)), 2), np.float32)])[:N]
env = sosfilt(butter(2, 6.0, "low", fs=sr, output="sos"), np.abs(v).mean(1))
duck = 1 - 0.3 * np.clip(env / 0.12, 0, 1)
ir = int(1.6 * sr); IR = rng.normal(0, 1, ir) * np.exp(-np.arange(ir) / sr * 3.0); IR = lp(IR, 4500)
from scipy.signal import fftconvolve
wet = np.stack([fftconvolve(bus[:, 0], IR)[:N], fftconvolve(bus[:, 1], IR)[:N]], 1)
amb = bus + wet * 0.01
amb *= (np.minimum(1, t / 1.0) * np.minimum(1, (T - t) / 3.0))[:, None]
mix = v + amb * 1.0 * duck[:, None]
pk = np.percentile(np.abs(mix), 99.97); mix = np.tanh(mix / pk * 0.95) * 0.9
wavfile.write(f"{ROOT}/mix9_raw.wav", sr, (mix * 32767).astype(np.int16)); print("ok", T)
