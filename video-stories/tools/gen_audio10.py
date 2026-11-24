"""Sound for 'Дом, который ждал' (HouseV): no melody, only the voice and a living night street (wind, crickets, steps, creaking house,
a cane, a hammer, a match, a clock). Needs vo10.wav from gen_vo9.py. Writes mix10_raw.wav in ROOT. Point ROOT/PROJ at your folders."""
import json, numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

ROOT = "/tmp/claude-0/-home-user-ECC/7550396c-17ce-51fa-ba40-ea754e7cc1af/scratchpad"
PROJ = "/home/user/ECC/video-stories"
vo = json.load(open(f"{PROJ}/project/src/vo10.json"))
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
wind = bp(rng.normal(0, 1, N), 130, 850) * (0.25 + 0.75 * slow)
dayt = sm(22.0, 22.6) * (1 - sm(34.2, 35.2))                      # the flashback: warm day
cold = sm(34.2, 35.2) * (1 - sm(41.0, 42.0))
indoors = sm(41.0, 41.8) * (1 - sm(51.0, 52.0))
wind_env = (0.07 + 0.05 * cold) * (1 - 0.6 * dayt) * (1 - 0.7 * indoors) * (1 - 0.5 * sm(56, 62)) * np.minimum(1, t / 2.0)
town = lp(rng.normal(0, 1, N), 160) * 0.04 * np.minimum(1, t / 3.0)
bus[:, 0] += (wind * wind_env + town).astype(np.float32); bus[:, 1] += (np.roll(wind, 4000) * wind_env + town).astype(np.float32)
chirp = np.zeros(N)
for k in range(5):
    f = 4100 + 230 * k; ph = rng.random() * 6
    gate = (np.sin(2 * np.pi * (6.5 + 0.7 * k) * t + ph) > 0.25) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.13 * t + k))
    chirp += np.sin(2 * np.pi * f * t) * gate
night_f = (1 - sm(21.5, 22.2)) + sm(51.0, 52.0)
crick = chirp * 0.004 * np.clip(night_f, 0, 1) * (1 - 0.8 * indoors) * (1 - sm(70, 73))
bus[:, 0] += crick.astype(np.float32); bus[:, 1] += np.roll(crick, 2300).astype(np.float32)

def bird(v=1.0):
    d = 0.35; k = tt(d); f = 3000 + 900 * np.sin(2 * np.pi * (9 + 5 * rng.random()) * k) + 700 * k / d
    return np.sin(2 * np.pi * np.cumsum(f) / sr) * np.sin(np.pi * k / d) ** 2 * 0.01 * v
for tm in np.arange(22.4, 34.0, 1.3): put(bird(0.8 + 0.4 * rng.random()), tm + rng.random() * 0.5, rng.uniform(-0.7, 0.7)); put(bird(0.6), tm + 0.45 + rng.random() * 0.2, rng.uniform(-0.7, 0.7))
for tm in [38.0, 40.2, 43.9]: put(bird(0.4), tm, -0.5)

# ---- steps ---------------------------------------------------------------------------------------------------
def step(v=1.0):
    d = 0.22; k = tt(d)
    return (lp(nz(d), 500) * np.exp(-k / 0.035) * 0.15 + np.sin(2 * np.pi * 65 * k) * np.exp(-k / 0.05) * 0.07 + hp(nz(d), 2500) * np.exp(-k / 0.01) * 0.015) * v
def walker(pts, dist, v=1.0, xmin=-200):
    ts = np.arange(pts[0][0], pts[-1][0], 0.01)
    xs = np.interp(ts, [p[0] for p in pts], [p[1] for p in pts]); nxt = xs[0] + dist
    for tm, x in zip(ts, xs):
        if x >= nxt:
            if x > xmin and x < 1250: put(step(v), tm, np.clip((x - 540) / 700, -0.8, 0.8))
            nxt += dist
for t0, x0, x1, s in [(1.6, -120, 560, 0.55), (1.9, -200, 500, 0.5), (2.3, -260, 440, 0.6)]:
    walker([[t0, x0], [t0 + 3.2, x1]], 262 * s / (2 * 2.2), v=0.55)            # children running past
walker([[12.7, 40], [14.4, 330]], 262 * 0.7 / (2 * 1.2), v=0.6)
walker([[17.6, 340], [18.6, -200]], 262 * 0.7 / (2 * 2.2), v=0.6)
walker([[22.2, 120], [24.0, 300]], 144, v=0.6)
walker([[51.6, -100], [54.6, 500]], 262 * 0.55 / (2 * 2.2), v=0.4)
walker([[56.7, -120], [59.4, 520]], 160, v=0.7)

# ---- the haunted house: creaks, a thin wail ---------------------------------------------------------------------
def creak(d, v=1.0, f0=140, df=110):
    k = tt(d); f = f0 + df * k / d + 16 * np.sin(2 * np.pi * 7 * k); s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / sr))
    return (lp(s, 900) * np.sin(np.pi * k / d) * 0.03 + lp(nz(d), 300) * np.sin(np.pi * k / d) * 0.025) * v
put(creak(1.6), 5.5, -0.2); put(creak(1.2, 0.8, 190, -60), 6.8, 0.2); put(creak(1.4, 1.0, 120, 80), 8.0, 0.1); put(creak(1.0, 0.7, 210, -90), 9.0, -0.1)
def wail(d, v=1.0):
    k = tt(d); f = 520 + 90 * np.sin(2 * np.pi * 0.7 * k) + 30 * np.sin(2 * np.pi * 5.5 * k)
    return (np.sin(2 * np.pi * np.cumsum(f) / sr) * 0.5 + bp(nz(d), 400, 1500) * 0.5) * np.sin(np.pi * k / d) ** 2 * 0.012 * v
put(wail(2.4), 10.0, 0.3); put(wail(1.8, 0.7), 11.6, -0.3)
def tap(v=1.0):
    k = tt(0.1); return (np.sin(2 * np.pi * 180 * k) * np.exp(-k / 0.02) + lp(nz(0.1), 1500) * np.exp(-k / 0.006)) * 0.1 * v
for tm in [14.2, 14.8]: put(tap(), tm, 0.3)
for tm in [16.9, 17.3, 17.8, 18.4]: put(tap(1.2), tm, 0.3)

# ---- the flashback: hammer, plane, the window going in ----------------------------------------------------------
def hammer(v=1.0):
    d = 0.3; k = tt(d); return (np.sin(2 * np.pi * 420 * k) * np.exp(-k / 0.025) * 0.6 + lp(nz(d), 3000) * np.exp(-k / 0.01) * 0.5 + np.sin(2 * np.pi * 120 * k) * np.exp(-k / 0.06)) * 0.09 * v
tm = 24.2
while tm < 27.3: put(hammer(0.8 + 0.3 * rng.random()), tm, -0.3); tm += 0.55 + 0.08 * rng.random()
def scrape(d, v=1.0):
    k = tt(d); return lp(nz(d), 900) * np.sin(np.pi * k / d) * 0.05 * v
put(scrape(2.2), 29.4, -0.3); put(scrape(1.4, 0.8), 31.0, -0.3)
put(lp(nz(0.5), 250) * np.exp(-tt(0.5) / 0.12) * 0.18, 32.4, 0.0)       # the frame sits in the opening

# ---- afterwards: a sigh, the bag, the clock, a match, the lamp ----------------------------------------------------
d = 1.8; k = tt(d); put(bp(nz(d), 300, 2200) * np.sin(np.pi * k / d) ** 2 * 0.03, 36.0, 0.0)
put(lp(nz(0.4), 300) * np.exp(-tt(0.4) / 0.08) * 0.16, 40.3, -0.2)      # the bag goes down
def tick(v=1.0):
    k = tt(0.05); return np.sin(2 * np.pi * 1700 * k) * np.exp(-k / 0.006) * 0.07 * v
for i in range(int(47.7 - 41.4)): put(tick(0.9 if i % 2 else 0.7), 41.4 + i * 1.0, 0.5)
hum = lp(nz(T), 120) * 0.02 * indoors * (0.7 + 0.3 * slow)
bus[:, 0] += hum.astype(np.float32); bus[:, 1] += hum.astype(np.float32)
put(hp(nz(0.5), 1500) * np.sin(np.pi * tt(0.5) / 0.5) * 0.04, 46.0, 0.6)        # cloth, the scarf stirs
put(hp(nz(0.4), 2500) * np.sin(np.pi * tt(0.4) / 0.4) ** 2 * 0.07, 48.9, 0.0)  # the match
k = tt(0.8); put(lp(nz(0.8), 900) * np.exp(-k / 0.3) * 0.05 + hp(nz(0.8), 3000) * np.exp(-k / 0.2) * 0.012, 49.3, 0.0)
fl = hp(nz(T), 2000) * (np.abs(np.sin(t * 17)) ** 8) * 0.004 * sm(49.5, 50.5) * (1 - sm(51.5, 52.5))
bus[:, 0] += fl.astype(np.float32); bus[:, 1] += fl.astype(np.float32)

# ---- the end: the fence creaks, the warm room tone, the night -------------------------------------------------------
put(creak(0.9, 0.7, 150, 40), 60.2, 0.0)
glow = lp(nz(T), 220) * (0.6 + 0.4 * slow) * 0.015 * sm(56.0, 60.0) * (1 - sm(70, 73))
bus[:, 0] += glow.astype(np.float32); bus[:, 1] += glow.astype(np.float32)

# ---- mix: voice + beds, ducking the bed under the voice -----------------------------------------------------------
sv, v = wavfile.read(f"{ROOT}/vo10.wav"); v = v.astype(np.float32) / 32768
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
wavfile.write(f"{ROOT}/mix10_raw.wav", sr, (mix * 32767).astype(np.int16)); print("ok", T)
