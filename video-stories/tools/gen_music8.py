"""Music, sound effects and the final mix for 'Перезвоню' (CallV). Needs vo8.wav from gen_vo8.py.
Writes project/public/mix8.wav (voice + music + effects, side-chained). Point ROOT/PROJ at your folders."""
import json, numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve

ROOT = "/tmp/claude-0/-home-user-ECC/7550396c-17ce-51fa-ba40-ea754e7cc1af/scratchpad"
PROJ = "/home/user/ECC/video-stories"
vo = json.load(open(f"{PROJ}/project/src/vo8.json"))
T = vo["total"]
L = vo["lines"]
sr = 48000
N = int(T * sr)
rng = np.random.default_rng(8)
t_ax = np.arange(N) / sr
A = lambda i: L[i]["start"]
E = lambda i: L[i]["end"]


def bp(x, a, b): return sosfilt(butter(2, [a, b], "band", fs=sr, output="sos"), x)
def hp(x, f): return sosfilt(butter(2, f, "high", fs=sr, output="sos"), x)
def lp(x, f): return sosfilt(butter(2, f, "low", fs=sr, output="sos"), x)
def nz(d): return rng.normal(0, 1, int(d * sr))
def tt(d): return np.arange(int(d * sr)) / sr
def hz(m): return 440.0 * 2 ** ((m - 69) / 12)


mus = np.zeros((N, 2), np.float32)   # music bus (goes through the reverb)
dry = np.zeros((N, 2), np.float32)   # effects bus
def put(bus, sig, t0, pan=0.0, g=1.0):
    i = int(t0 * sr)
    if i < 0 or i >= N: return
    sig = sig[: N - i]
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    bus[i:i + len(sig), 0] += sig * g * l
    bus[i:i + len(sig), 1] += sig * g * r


# ------------------------------------------------------------------ instruments
def piano(m, d=3.0, v=0.5):
    f = hz(m); k = tt(d)
    s = np.zeros_like(k)
    for n in range(1, 11):
        fn = f * n * np.sqrt(1 + 0.0004 * n * n)
        if fn > 9000: break
        a = (1.0 / n ** 1.15) * (1.0 if n < 6 else 0.6)
        s += a * np.sin(2 * np.pi * fn * k + n) * np.exp(-k / (d * 0.5 / (0.7 + 0.35 * n)))
        s += 0.5 * a * np.sin(2 * np.pi * fn * 1.0016 * k) * np.exp(-k / (d * 0.62 / (0.7 + 0.3 * n)))
    click = lp(nz(d), 2400) * np.exp(-k / 0.012) * 0.25
    env = np.minimum(1, k / 0.004) * np.exp(-k / (d * 0.55))
    return (s * env + click) * v * 0.22 * (1 - 0.3 * min(1, (m - 40) / 50))


def pad(ms, d, v=0.4, bright=900, vib=0.0):
    k = tt(d); out = np.zeros_like(k)
    for m in ms:
        f = hz(m)
        for dt in (-0.07, 0.0, 0.07):
            ph = 2 * np.pi * np.cumsum(f * 2 ** (dt / 12) * (1 + vib * np.sin(2 * np.pi * 5.2 * k + m)) / sr)
            out += 2 * ((ph / (2 * np.pi)) % 1) - 1
    out = lp(out, bright)
    env = np.minimum(1, k / (d * 0.38)) * np.minimum(1, (d - k) / (d * 0.4))
    return out * env * v * 0.05 / np.sqrt(len(ms))


def cello(m, d, v=0.4):
    k = tt(d); f = hz(m)
    ph = 2 * np.pi * np.cumsum(f * (1 + 0.004 * np.sin(2 * np.pi * 5 * k)) / sr)
    s = 2 * ((ph / (2 * np.pi)) % 1) - 1
    w = np.minimum(1, k / (d * 0.5))
    s = lp(s, 700) * (1 - w) + lp(s, 1200) * w
    env = np.minimum(1, k / 0.35) * np.minimum(1, (d - k) / 0.6)
    return s * env * v * 0.12


# ------------------------------------------------------------------ harmony
CH = {  # name: (bass midi, chord tones)
    "Am": (45, [57, 60, 64]), "F": (41, [53, 57, 60]), "C": (48, [55, 60, 64]), "G": (43, [55, 59, 62]),
    "Dm": (50, [53, 57, 62]), "E": (40, [56, 59, 64]), "Em": (40, [55, 59, 64]), "Fadd": (41, [57, 60, 64]),
}
BEAT = 60 / 66.0


def bars(prog, t0, nbar=1, step=2, vel=0.5, up=0, bass=True, spread=1.0):
    """slow arpeggio: one chord per bar, notes every `step` eighths"""
    t = t0
    eighth = BEAT / 2
    for b in range(nbar):
        name = prog[b % len(prog)]
        bm, tones = CH[name]
        if bass:
            put(mus, piano(bm, 4.2, vel * 0.9), t, -0.2)
            put(mus, piano(bm + 12, 3.4, vel * 0.5), t + eighth * 0.0, -0.1)
        seq = [tones[0], tones[1], tones[2], tones[1] + 12, tones[2], tones[1], tones[0] + 12, tones[1]]
        for i in range(0, 8, step):
            put(mus, piano(seq[i] + up, 2.6, vel * (0.8 + 0.2 * ((i % 4) == 0))), t + i * eighth, 0.1 + 0.2 * np.sin(i), spread)
        t += BEAT * 4


def mel(notes, t0, vel=0.6, d=3.2):
    for off, m, ln in notes:
        put(mus, piano(m, ln if ln else d, vel), t0 + off, 0.15)


# ------------------------------------------------------------------ the score (film seconds)
# 3.9  sparse piano over a low drone: the unanswered call
put(mus, pad([33, 40], A(2) + 3.0 - 3.9, 0.55), 3.9, 0, 0.7)
for i, (tm, m) in enumerate([(4.6, 57), (6.4, 64), (8.2, 60), (9.6, 57)]):
    put(mus, piano(m, 3.5, 0.45), tm, -0.1 + 0.1 * i)
# 10.3 office, messages: Am F
bars(["Am", "F"], 10.25, 2, step=4, vel=0.42)
mel([(0.0, 76, 3.0), (1.8, 74, 2.4), (3.6, 72, 3.0)], 10.25 + BEAT * 4, 0.34)
put(mus, pad([45, 52, 57, 60], 8.0, 0.5), 12.5, 0, 0.7)
# 20.0 mum alone: warmer, C G Am F
put(mus, pad([48, 55, 60, 64], 9.8, 0.6), 19.8, 0, 0.8)
bars(["C", "G", "Am", "F"], 20.0, 3, step=2, vel=0.4)
mel([(0.0, 79, 3.2), (1.6, 76, 2.4), (2.6, 72, 2.4), (3.6, 74, 3.4), (5.5, 71, 2.5), (7.3, 72, 3.2)], 20.4, 0.4)
# 29.8 unanswered ring: bare bass and one high note
put(mus, cello(33, 5.2, 0.5), 29.8, -0.2)
put(mus, piano(81, 4.0, 0.3), 31.4, 0.3)
put(mus, piano(76, 4.0, 0.3), 33.6, -0.3)
# 35.9 montage: ostinato that speeds up and swells
t = A(16); gap = 0.32; k = 0
prog = ["Am", "F", "Am", "E"]
while t < A(19) + 2.2:
    name = prog[(k // 8) % 4]; bm, tones = CH[name]
    n = [tones[0], tones[1], tones[2], tones[1] + 12][k % 4] + 12
    sw = np.clip((t - A(16)) / (A(19) - A(16)), 0, 1)
    put(mus, piano(n, 1.4, 0.28 + 0.4 * sw), t, 0.25 * np.sin(k))
    if k % 8 == 0: put(mus, cello(bm, 2.8, 0.35 + 0.3 * sw), t, -0.2)
    t += gap * (1 - 0.35 * np.clip((t - A(16)) / 8.0, 0, 1)); k += 1
put(mus, pad([45, 52, 57, 64], 8.5, 0.5, 1400, 0.002), A(16), 0, 0.5)
# 44.5 the postcard: tender, C G Am F, a little melody
put(mus, pad([48, 55, 60, 64], 13.0, 0.7), 44.2, 0, 0.9)
bars(["C", "G", "Am", "F"], 44.6, 4, step=2, vel=0.42)
mel([(0.0, 72, 3.0), (1.5, 76, 3.0), (3.0, 79, 3.0), (5.2, 77, 2.6), (6.7, 76, 3.0), (9.0, 74, 3.0), (10.4, 72, 3.4), (12.6, 71, 3.0)], 44.9, 0.42)
# 57.1 he smiles, spring: brighter, F C G C with high sparkle
put(mus, pad([53, 60, 65, 69], 6.5, 0.7, 1800), 56.9, 0, 0.8)
bars(["F", "C", "G", "C"], 57.1, 2, step=2, vel=0.44, up=0)
for tm, m in [(58.2, 84), (59.1, 88), (60.2, 86), (61.2, 84), (62.3, 91)]:
    put(mus, piano(m, 2.5, 0.22), tm, 0.5)
# 63.5 the last call: the music hollows out into a low hum, then a heartbeat
put(mus, pad([33, 40, 45], 70.9 - 63.5, 0.9, 500), 63.5, 0, 0.9)
put(mus, pad([69, 70], 70.9 - 66.0, 0.5, 2500, 0.004), 66.0, 0, 0.35)
put(mus, piano(57, 5.0, 0.3), 63.6, -0.2)
for i in range(11):
    tb = 67.0 + i * (0.95 - i * 0.045)
    k = tt(0.5); beat = np.sin(2 * np.pi * (60 * np.exp(-k * 7) + 32) * k) * np.exp(-k / 0.1)
    put(mus, beat, tb, 0, 0.35 + 0.07 * i)
    put(mus, beat, tb + 0.24, 0, 0.18 + 0.04 * i)
# 71.6 neighbour calls (no music, just the buzz below) / 74.5 the empty flat
put(mus, pad([33, 40], 9.5, 0.7, 380), 74.6, 0, 0.6)
put(mus, piano(45, 6.0, 0.4), 76.9, -0.1)
put(mus, piano(52, 6.0, 0.28), 79.1, 0.1)
put(mus, piano(48, 6.0, 0.28), 81.3, 0.0)
put(mus, cello(40, 3.5, 0.5), 82.8, -0.1)
# 84.2 the build: Am F C G, then Am F Dm E, strings swell, climax at "единственный"
put(mus, pad([45, 52, 57, 60], 14.8, 1.0, 1300, 0.003), 83.9, 0, 0.9)
put(mus, pad([57, 64, 69, 72], 11.0, 0.8, 1700, 0.004), 87.8, 0, 0.7)
bars(["Am", "F", "C", "G", "Am", "F", "Dm", "E"], 84.2, 4, step=2, vel=0.48)
bars(["Am", "F", "Dm", "E"], 84.2 + BEAT * 16, 3, step=1, vel=0.5, up=12, bass=False)
for tm, m, ln in [(87.2, 76, 3), (89.0, 79, 3), (90.4, 81, 3.4), (92.7, 84, 3.2), (94.7, 83, 2.0), (95.8, 81, 3.5), (97.2, 79, 3.0), (98.0, 76, 3.0)]:
    put(mus, piano(m, ln, 0.55), tm, 0.2)
put(mus, cello(45, 3.4, 0.9), 95.7, -0.2); put(mus, cello(40, 3.4, 0.7), 98.0, -0.2)
# 99.1 quiet end: bare piano, then a held chord that opens to C major
put(mus, pad([48, 55, 60, 64], 10.0, 0.9, 1500), 99.8, 0, 0.8)
for tm, m in [(99.2, 72), (100.1, 76), (101.0, 79), (102.3, 76), (103.6, 79), (105.2, 84)]:
    put(mus, piano(m, 4.5, 0.4), tm, 0.1)
put(mus, piano(36, 9.0, 0.7), 102.2, -0.1); put(mus, piano(48, 8.0, 0.4), 102.3, 0.0)

# cut the music dead on the decline tap and let the room go silent
cut = A(31) + 0.62
g_cut = 1 - np.clip((t_ax - cut) / 0.07, 0, 1) * (t_ax < 74.3) - (t_ax >= 74.3) * 0.0
g_cut = np.where(t_ax < cut, 1.0, np.where(t_ax < 73.8, 0.0, np.clip((t_ax - 73.8) / 1.5, 0, 1)))
# bring back only the hum after the neighbour's call; keep the heartbeat out of the silence
mus *= g_cut[:, None]

# ------------------------------------------------------------------ reverb for the music bus
ir = int(3.0 * sr)
IR = rng.normal(0, 1, (2, ir)) * np.exp(-np.arange(ir) / sr * 2.3) * (1 - np.exp(-np.arange(ir) / sr * 60))
IR = np.stack([lp(IR[0], 5200), lp(IR[1], 5200)])
wet = np.stack([fftconvolve(mus[:, 0], IR[0])[:N], fftconvolve(mus[:, 1], IR[1])[:N]], 1)
wet *= np.where(t_ax < cut, 1.0, np.where(t_ax < 73.8, 0.0, np.clip((t_ax - 73.8) / 1.5, 0, 1)))[:, None]
music = mus + wet * 0.014
music *= np.minimum(1, t_ax / 1.5)[:, None] * np.minimum(1, (T - t_ax) / 3.0)[:, None]

# ------------------------------------------------------------------ sound effects
def buzz(d=0.5, v=1.0):   # phone vibrating on a table
    k = tt(d); body = np.sin(2 * np.pi * 168 * k) * (0.6 + 0.4 * np.sin(2 * np.pi * 24 * k))
    return (body + 0.5 * bp(nz(d), 300, 2200) * (0.5 + 0.5 * np.sin(2 * np.pi * 24 * k))) * np.minimum(1, k / 0.01) * np.minimum(1, (d - k) / 0.03) * 0.09 * v
def ping(v=1.0, f=1480):
    k = tt(0.9); return (np.sin(2 * np.pi * f * k) * np.exp(-k / 0.22) + 0.5 * np.sin(2 * np.pi * f * 1.5 * k) * np.exp(-k / 0.14)) * 0.07 * v
def swoosh(v=1.0):
    k = tt(0.28); return bp(nz(0.28), 800, 4200) * np.sin(np.pi * k / 0.28) ** 2 * 0.05 * v
def tap(v=1.0):
    k = tt(0.12); return (np.sin(2 * np.pi * 220 * k) * np.exp(-k / 0.02) + lp(nz(0.12), 1800) * np.exp(-k / 0.006)) * 0.12 * v
def key(v=1.0):
    k = tt(0.04); return hp(nz(0.04), 2000) * np.exp(-k / 0.005) * 0.05 * v
def tick(v=1.0, f=2100):
    k = tt(0.05); return np.sin(2 * np.pi * f * k) * np.exp(-k / 0.006) * 0.07 * v
def clink(v=1.0, f=2900):
    k = tt(0.6); return (np.sin(2 * np.pi * f * k) * np.exp(-k / 0.11) + 0.5 * np.sin(2 * np.pi * f * 1.52 * k) * np.exp(-k / 0.06) + hp(nz(0.6), 4000) * np.exp(-k / 0.01) * 0.4) * 0.06 * v
def thud(f0, d, v):
    k = tt(d); f = f0 * np.exp(-k * 4) + 35; return np.sin(2 * np.pi * np.cumsum(f) / sr) * np.exp(-k / 0.2) * v
def scratch(d=0.3, v=1.0):
    k = tt(d); return hp(nz(d), 3000) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 11 * k))) * np.sin(np.pi * k / d) * 0.03 * v
def paper(d=0.18, v=1.0):
    k = tt(d); return bp(nz(d), 1500, 6000) * np.sin(np.pi * k / d) * 0.05 * v
def door(v=1.0):
    k = tt(0.9); f = 170 + 110 * k / 0.9 + 14 * np.sin(2 * np.pi * 9 * k); s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / sr))
    return lp(s, 1300) * np.sin(np.pi * k / 0.9) * 0.025 * v
def step(v=1.0):
    k = tt(0.18); return lp(nz(0.18), 380) * np.exp(-k / 0.04) * 0.2 * v + np.sin(2 * np.pi * 70 * k) * np.exp(-k / 0.05) * 0.08 * v
def key_turn(v=1.0):
    k = tt(0.35); return (hp(nz(0.35), 2500) * (np.abs(np.sin(2 * np.pi * 22 * k)) > 0.5) * np.exp(-k / 0.2) * 0.04 + np.sin(2 * np.pi * 1700 * k) * np.exp(-k / 0.01) * 0.04) * v
def laugh_bar(d, v=1.0):
    return lp(nz(d), 900) * (0.6 + 0.4 * np.sin(2 * np.pi * 3 * tt(d))) * 0.02 * v

# 0.0 the call he declines
for i in range(4): put(dry, buzz(0.5), 0.1 + i * 0.85, 0.1)
put(dry, tap(), A(0) + 2.55, 0.0)
put(dry, buzz(0.28, 0.5), 7.2, 0.3)
# the meeting: low murmur of the room, a vibration under the table
put(dry, laugh_bar(2.0, 0.5), A(4) - 0.3)
put(dry, buzz(0.5), A(4) + 0.6, 0.2)
# chat
put(dry, ping(1.0), A(5) + 1.3)
for i in range(4): put(dry, key(), A(6) + 0.3 + i * 0.12, 0.2)
put(dry, swoosh(), A(6) + 1.9, 0.2)
for i in range(5): put(dry, key(), A(7) + 0.9 + i * 0.11, 0.2)
put(dry, swoosh(), A(7) + 1.5, 0.2)
# her short messages
put(dry, ping(0.9, 1560), A(11) + 0.05); put(dry, ping(0.9, 1400), A(12) + 0.05)
# saturday call ignored
for i in range(4): put(dry, buzz(0.5), A(13) + 0.3 + i * 0.85, 0.1)
put(dry, laugh_bar(2.0, 0.4), A(13), -0.3)
# montage
put(dry, clink(0.9), A(16) + 0.9, -0.2); put(dry, clink(0.7, 2500), A(16) + 1.1, 0.2)
for i in range(14): put(dry, key(1.1), A(17) + 0.06 + i * 0.085, 0.2)
tk = A(18); u = 0.0
while tk + u < A(19) + 1.6:
    put(dry, tick(0.9, 2100 if int(u * 4) % 2 else 1800), tk + u, 0.5 if int(u * 4) % 2 else -0.5); u += max(0.14, 0.5 - u * 0.06)
for i in range(6): put(dry, paper(0.15, 0.7), A(19) + 0.2 + i * 0.26, 0.0)
# the card
put(dry, paper(0.3, 0.8), A(20) + 0.5)
for i in range(16): put(dry, scratch(0.12), 53.0 + i * 0.09 + (rng.random() * 0.03), -0.3)
for i in range(15): put(dry, scratch(0.12), 54.95 + i * 0.125 + (rng.random() * 0.03), -0.3)
put(dry, paper(0.3, 0.9), A(27) + 0.4); put(dry, thud(120, 0.2, 0.08), A(27) + 1.0)
# the last call: he sees the name, taps decline
for i in range(3): put(dry, buzz(0.5), A(29) + 0.25 + i * 0.85, 0.1)
put(dry, buzz(0.5), A(30) + 0.3, 0.1); put(dry, buzz(0.5), A(30) + 1.15, 0.1)
put(dry, tap(1.1), A(31) + 0.5, 0.0)
# neighbour calls in the silence
for i in range(3): put(dry, buzz(0.55, 1.3), A(32) + 0.1 + i * 0.9, 0.0)
# the flat
put(dry, key_turn(), A(33) - 0.1, 0.4); put(dry, door(), A(33) + 0.35, 0.6)
for i in range(4): put(dry, step(0.9), A(33) + 1.1 + i * 0.52, 0.0)
put(dry, tick(0.8, 1500), A(34) + 0.2, 0.5)
for i in range(4): put(dry, tick(0.5, 1500), A(34) + 0.2 + (i + 1) * 1.0, 0.5)
put(dry, clink(0.5, 2200), A(36) - 0.1, 0.0)
# call history
put(dry, ping(0.5, 880), A(38) + 0.5); put(dry, tick(0.8, 1100), A(39) + 0.8); put(dry, thud(60, 0.5, 0.18), A(41) - 0.05, 0.0)
put(dry, tap(0.7), A(44) + 0.2); put(dry, tap(0.5), A(44) + 1.0)
# the film ends with one long room-tone breath
put(dry, lp(nz(8.0), 300) * np.minimum(1, tt(8.0) / 3) * np.minimum(1, (8 - tt(8.0)) / 3) * 0.006, T - 8.5)

# ------------------------------------------------------------------ mix: voice + side-chained music + effects
sv, v = wavfile.read(f"{ROOT}/vo8.wav")
v = v.astype(np.float32) / 32768
if v.ndim == 1: v = np.stack([v, v], 1)
v = np.vstack([v, np.zeros((max(0, N - len(v)), 2), np.float32)])[:N]
env = np.abs(v).mean(1)
env = sosfilt(butter(2, 6.0, "low", fs=sr, output="sos"), env)
duck = 1 - 0.38 * np.clip(env / 0.12, 0, 1)
mix = v * 1.0 + music * 0.62 * duck[:, None] + dry * 0.9
pk = np.percentile(np.abs(mix), 99.97)
mix = np.tanh(mix / pk * 0.95) * 0.9
wavfile.write(f"{ROOT}/mix8_raw.wav", sr, (mix * 32767).astype(np.int16))
print("music+mix ok", T)
