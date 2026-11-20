import wave
import math
import struct
import random
import os

SAMPLE_RATE = 44100

def clamp(v, min_v=-1.0, max_v=1.0):
    return max(min_v, min(max_v, v))

def write_wav(filename, samples):
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1) # mono
        wav_file.setsampwidth(2) # 16-bit
        wav_file.setframerate(SAMPLE_RATE)
        # Normalize and convert to 16-bit integers
        max_val = max(max(abs(s) for s in samples), 0.001)
        scaling = 0.92 / max_val
        raw_bytes = bytearray()
        for s in samples:
            val = int(clamp(s * scaling) * 32767)
            raw_bytes.extend(struct.pack('<h', val))
        wav_file.writeframes(raw_bytes)
    print(f"Generated {filename}: {len(samples)/SAMPLE_RATE:.2f}s ({len(raw_bytes)} bytes)")

def create_elephant_sound():
    duration = 1.65
    num_samples = int(duration * SAMPLE_RATE)
    samples = [0.0] * num_samples

    # 1. Throat Rumble & Trumpet Roar (0.0 to 0.8s)
    for i in range(int(0.85 * SAMPLE_RATE)):
        t = i / SAMPLE_RATE
        # Envelope
        if t < 0.08:
            env = t / 0.08
        elif t < 0.65:
            env = 1.0
        else:
            env = max(0.0, (0.85 - t) / 0.20)

        # Deep infrasound guttural rumble (45Hz with 22Hz flutter)
        rumble = math.sin(2 * math.pi * 48 * t) * (0.6 + 0.4 * math.sin(2 * math.pi * 22 * t))

        # Trumpet pitch trajectory: 290Hz rising to 540Hz then tapering to 390Hz
        if t < 0.35:
            p = t / 0.35
            pitch = 290 + 250 * math.sin(p * math.pi * 0.5)
        else:
            p = (t - 0.35) / 0.50
            pitch = 540 - 150 * p

        # 6.5Hz trumpet vocal vibrato
        vibrato = 1.0 + 0.08 * math.sin(2 * math.pi * 6.5 * t)
        f = pitch * vibrato

        # Brass harmonics traveling through curved trunk
        h1 = math.sin(2 * math.pi * f * t)
        h2 = 0.65 * math.sin(2 * math.pi * 2 * f * t + 0.4)
        h3 = 0.45 * math.sin(2 * math.pi * 3 * f * t + 0.9)
        h4 = 0.25 * math.sin(2 * math.pi * 4 * f * t + 1.2)
        h5 = 0.15 * math.sin(2 * math.pi * 5 * f * t + 1.6)

        raw_trumpet = (h1 + h2 + h3 + h4 + h5)
        # Nonlinear brass overdrive saturation
        trumpet = math.tanh(2.8 * raw_trumpet)

        # Breath turbulence noise through trunk
        noise = (random.random() * 2 - 1) * 0.18

        samples[i] += (trumpet * 0.75 + rumble * 0.45 + noise) * env

    # 2. Thunderous Colossal Elephant Foot Stomp & Crush (0.72s to 1.65s)
    stomp_start = int(0.72 * SAMPLE_RATE)
    for i in range(stomp_start, num_samples):
        t = (i - stomp_start) / SAMPLE_RATE

        # Seismic Sub-bass drop: 85Hz dropping to 24Hz
        sub_pitch = 85 * math.exp(-t * 4.2) + 24
        sub_env = math.exp(-t * 3.5)
        sub_boom = math.sin(2 * math.pi * sub_pitch * t) * sub_env * 1.3

        # Ground crack / impact transient
        crack_env = math.exp(-t * 45)
        crack = (random.random() * 2 - 1) * crack_env * 1.5

        # Stone & bone crush crunch
        crunch_env = math.exp(-t * 9.0)
        crunch = (math.sin(2 * math.pi * 420 * t) + math.sin(2 * math.pi * 840 * t) * 0.6) * crunch_env * 0.8
        crunch_noise = (random.random() * 2 - 1) * math.exp(-t * 12.0) * 0.5

        samples[i] += sub_boom + crack + crunch + crunch_noise

    return samples

def create_soldier_sound():
    duration = 1.45
    num_samples = int(duration * SAMPLE_RATE)
    samples = [0.0] * num_samples

    # 1. Human Warrior Battle Shout "HRAAAGH!" (0.0 to 0.55s)
    for i in range(int(0.60 * SAMPLE_RATE)):
        t = i / SAMPLE_RATE
        # Envelope: quick attack, sustained roar, cutoff as sword hits
        if t < 0.06:
            env = t / 0.06
        elif t < 0.40:
            env = 1.0
        else:
            env = max(0.0, (0.60 - t) / 0.20)

        # Vocal pitch surge: 160Hz -> 250Hz
        pitch = 160 + 90 * math.sin(min(1.0, t / 0.35) * math.pi * 0.5)
        # Throat growl modulation (42Hz rasp)
        rasp = 0.7 + 0.3 * math.sin(2 * math.pi * 42 * t)

        # Human vocal tract formants (chest / throat resonance: 680Hz, 1250Hz, 2600Hz)
        v1 = math.sin(2 * math.pi * pitch * t)
        v2 = 0.8 * math.sin(2 * math.pi * 2 * pitch * t + 0.3)
        v3 = 0.5 * math.sin(2 * math.pi * 3 * pitch * t + 0.7)
        v4 = 0.4 * math.sin(2 * math.pi * 4 * pitch * t + 1.1)
        raw_voice = (v1 + v2 + v3 + v4) * rasp

        # Shouting formant resonance emphasis
        f_throat = math.sin(2 * math.pi * 720 * t) * 0.35
        f_singers = math.sin(2 * math.pi * 2600 * t) * 0.2

        breath = (random.random() * 2 - 1) * 0.22

        samples[i] += (math.tanh(raw_voice * 2.2) * 0.7 + f_throat + f_singers + breath) * env * 0.9

    # 2. Blade Aerodynamic Whoosh (0.38s to 0.65s)
    whoosh_start = int(0.38 * SAMPLE_RATE)
    whoosh_len = int(0.28 * SAMPLE_RATE)
    for i in range(whoosh_len):
        idx = whoosh_start + i
        if idx >= num_samples: break
        t = i / SAMPLE_RATE
        p = t / 0.28
        env = math.sin(p * math.pi)
        # Sweeping friction whoosh
        noise = (random.random() * 2 - 1)
        sweep_f = 2200 + 3200 * math.sin(p * math.pi)
        blade_air = math.sin(2 * math.pi * sweep_f * t) * noise * 0.6
        samples[idx] += blade_air * env * 0.75

    # 3. Steel Cleave Impact & Armor Cut (0.52s to 1.45s)
    strike_start = int(0.52 * SAMPLE_RATE)
    for i in range(strike_start, num_samples):
        t = (i - strike_start) / SAMPLE_RATE

        # Metallic blade chime harmonics
        ring_env = math.exp(-t * 7.5)
        m1 = math.sin(2 * math.pi * 2150 * t) * 0.8
        m2 = math.sin(2 * math.pi * 3280 * t) * 0.5
        m3 = math.sin(2 * math.pi * 4820 * t) * 0.3
        metal_ring = (m1 + m2 + m3) * ring_env

        # Heavy armor slice impact transient
        thud_env = math.exp(-t * 22)
        thud = math.sin(2 * math.pi * 140 * math.exp(-t * 12) * t) * thud_env * 1.2
        slash_crack = (random.random() * 2 - 1) * math.exp(-t * 38) * 1.1

        samples[i] += metal_ring * 0.8 + thud + slash_crack

    return samples

def create_camel_sound():
    duration = 1.45
    num_samples = int(duration * SAMPLE_RATE)
    samples = [0.0] * num_samples

    # 1. Authentic Desert Camel Guttural Bray / Bellow (0.0 to 0.6s)
    for i in range(int(0.65 * SAMPLE_RATE)):
        t = i / SAMPLE_RATE
        if t < 0.08:
            env = t / 0.08
        elif t < 0.45:
            env = 1.0
        else:
            env = max(0.0, (0.65 - t) / 0.20)

        # Throat rattle (dulla vocalization): 75Hz with 26Hz guttural fluttering
        flutter = 0.65 + 0.35 * math.sin(2 * math.pi * 26 * t)
        pitch = 85 + 40 * math.sin(t * math.pi * 2.5)

        c1 = math.sin(2 * math.pi * pitch * t)
        c2 = 0.7 * math.sin(2 * math.pi * 2 * pitch * t + 0.4)
        c3 = 0.5 * math.sin(2 * math.pi * 3 * pitch * t + 0.8)
        # Nasal cavity resonances: 540Hz and 1450Hz
        formant = math.sin(2 * math.pi * 540 * t) * 0.4 + math.sin(2 * math.pi * 1450 * t) * 0.25
        guttural = math.tanh((c1 + c2 + c3) * flutter * 2.5)

        noise = (random.random() * 2 - 1) * 0.18
        samples[i] += (guttural * 0.75 + formant + noise) * env

    # 2. Curved Scimitar Whistle & Cross-Cleave (0.50s to 1.45s)
    strike_start = int(0.50 * SAMPLE_RATE)
    for i in range(strike_start, num_samples):
        t = (i - strike_start) / SAMPLE_RATE

        # Scimitar high singing ring
        ring_env = math.exp(-t * 6.5)
        s1 = math.sin(2 * math.pi * 1780 * t) * 0.85
        s2 = math.sin(2 * math.pi * 2680 * t) * 0.6
        s3 = math.sin(2 * math.pi * 3920 * t) * 0.35
        scimitar_ring = (s1 + s2 + s3) * ring_env

        # Sand / cloth slice friction whoosh
        friction_env = math.exp(-t * 14)
        friction = (random.random() * 2 - 1) * friction_env * 0.9

        # Impact punch
        punch_env = math.exp(-t * 20)
        punch = math.sin(2 * math.pi * 165 * math.exp(-t * 10) * t) * punch_env * 1.0

        samples[i] += scimitar_ring * 0.75 + friction + punch

    return samples

def create_horse_sound():
    duration = 1.55
    num_samples = int(duration * SAMPLE_RATE)
    samples = [0.0] * num_samples

    # 1. Rearing Warhorse Whinny / Neigh (0.0 to 0.7s)
    for i in range(int(0.72 * SAMPLE_RATE)):
        t = i / SAMPLE_RATE
        if t < 0.07:
            env = t / 0.07
        elif t < 0.48:
            env = 1.0
        else:
            env = max(0.0, (0.72 - t) / 0.24)

        # High neigh pitch: sweeps up from 780Hz to 1180Hz, vibratos at 13.5Hz, drops to 520Hz
        if t < 0.25:
            base_p = 780 + 400 * (t / 0.25)
        elif t < 0.50:
            base_p = 1180
        else:
            base_p = 1180 - 660 * ((t - 0.50) / 0.22)

        vibrato = 1.0 + 0.12 * math.sin(2 * math.pi * 13.5 * t)
        f = base_p * vibrato

        h1 = math.sin(2 * math.pi * f * t)
        h2 = 0.5 * math.sin(2 * math.pi * 2 * f * t + 0.5)
        h3 = 0.3 * math.sin(2 * math.pi * 3 * f * t + 1.0)
        neigh = math.tanh((h1 + h2 + h3) * 2.0)

        # Snort breath
        snort = (random.random() * 2 - 1) * (0.5 + 0.5 * math.sin(2 * math.pi * 28 * t)) * 0.22
        samples[i] += (neigh * 0.8 + snort) * env

    # 2. Triple Hoof Trample Impacts (0.62s, 0.76s, 0.90s)
    hoof_times = [0.62, 0.76, 0.90]
    for ht in hoof_times:
        start_idx = int(ht * SAMPLE_RATE)
        for i in range(start_idx, num_samples):
            t = (i - start_idx) / SAMPLE_RATE
            if t > 0.4: break
            # Horseshoe iron clink
            clink = math.sin(2 * math.pi * 2350 * t) * math.exp(-t * 28) * 0.7
            # Ground trample thud
            thud = math.sin(2 * math.pi * 95 * math.exp(-t * 14) * t) * math.exp(-t * 16) * 1.1
            samples[i] += clink + thud

    return samples

def create_king_sound():
    duration = 1.65
    num_samples = int(duration * SAMPLE_RATE)
    samples = [0.0] * num_samples

    # 1. Sovereign Command Shout & Celestial Aura (0.0 to 0.65s)
    for i in range(int(0.68 * SAMPLE_RATE)):
        t = i / SAMPLE_RATE
        if t < 0.08:
            env = t / 0.08
        elif t < 0.45:
            env = 1.0
        else:
            env = max(0.0, (0.68 - t) / 0.23)

        # Deep sovereign monarch voice (120Hz chest boom)
        pitch = 120 + 35 * math.sin(t * math.pi * 2)
        v1 = math.sin(2 * math.pi * pitch * t)
        v2 = 0.7 * math.sin(2 * math.pi * 2 * pitch * t)
        v3 = 0.4 * math.sin(2 * math.pi * 3 * pitch * t)
        voice = math.tanh((v1 + v2 + v3) * 2.2)

        # Golden royal chord shimmer (E-major celestial harmony: 330Hz, 415Hz, 494Hz, 659Hz)
        c1 = math.sin(2 * math.pi * 330 * t) * 0.3
        c2 = math.sin(2 * math.pi * 415 * t) * 0.25
        c3 = math.sin(2 * math.pi * 494 * t) * 0.2
        c4 = math.sin(2 * math.pi * 659 * t) * 0.15
        shimmer = (c1 + c2 + c3 + c4) * (0.8 + 0.2 * math.sin(2 * math.pi * 8 * t))

        samples[i] += (voice * 0.7 + shimmer * 0.5) * env

    # 2. Seismic Imperial Greatsword Judgment Slam (0.58s to 1.65s)
    strike_start = int(0.58 * SAMPLE_RATE)
    for i in range(strike_start, num_samples):
        t = (i - strike_start) / SAMPLE_RATE

        # Imperial Greatsword pure cathedral bell ring
        ring_env = math.exp(-t * 3.8)
        k1 = math.sin(2 * math.pi * 880 * t) * 0.8
        k2 = math.sin(2 * math.pi * 1320 * t) * 0.5
        k3 = math.sin(2 * math.pi * 1760 * t) * 0.35
        k4 = math.sin(2 * math.pi * 2640 * t) * 0.2
        blade_ring = (k1 + k2 + k3 + k4) * ring_env

        # Seismic judgment sub-bass earthquake boom
        sub_pitch = 68 * math.exp(-t * 3.5) + 20
        sub_boom = math.sin(2 * math.pi * sub_pitch * t) * math.exp(-t * 2.8) * 1.3

        # Shockwave crack
        shock = (random.random() * 2 - 1) * math.exp(-t * 35) * 1.2

        samples[i] += blade_ring * 0.7 + sub_boom + shock

    return samples

def create_queen_sound():
    duration = 1.55
    num_samples = int(duration * SAMPLE_RATE)
    samples = [0.0] * num_samples

    # 1. Valkyrie Empress Battle Shout (0.0 to 0.55s)
    for i in range(int(0.58 * SAMPLE_RATE)):
        t = i / SAMPLE_RATE
        if t < 0.06:
            env = t / 0.06
        elif t < 0.38:
            env = 1.0
        else:
            env = max(0.0, (0.58 - t) / 0.20)

        # High battle cry (260Hz -> 420Hz)
        pitch = 260 + 160 * math.sin(min(1.0, t / 0.35) * math.pi * 0.5)
        v1 = math.sin(2 * math.pi * pitch * t)
        v2 = 0.6 * math.sin(2 * math.pi * 2 * pitch * t)
        v3 = 0.4 * math.sin(2 * math.pi * 3 * pitch * t)
        cry = math.tanh((v1 + v2 + v3) * 2.0)
        samples[i] += cry * env * 0.7

    # 2. 360-Degree Blade Cyclone Whirlwind (0.45s to 1.55s)
    cyclone_start = int(0.45 * SAMPLE_RATE)
    for i in range(cyclone_start, num_samples):
        t = (i - cyclone_start) / SAMPLE_RATE

        # Spinning double blades sonic pulses (4 blade passes)
        spin_mod = 0.5 + 0.5 * math.sin(2 * math.pi * 7.5 * t)
        ring_env = math.exp(-t * 5.0)

        q1 = math.sin(2 * math.pi * 2400 * t) * 0.7
        q2 = math.sin(2 * math.pi * 3600 * t) * 0.5
        q3 = math.sin(2 * math.pi * 4800 * t) * 0.3
        cyclone_ring = (q1 + q2 + q3) * ring_env * spin_mod

        whoosh = (random.random() * 2 - 1) * math.sin(2 * math.pi * 4200 * t) * math.exp(-t * 9) * 0.8
        punch = math.sin(2 * math.pi * 180 * math.exp(-t * 12) * t) * math.exp(-t * 18) * 1.0

        samples[i] += cyclone_ring + whoosh + punch

    return samples

if __name__ == '__main__':
    out_dir = '/Users/sivateja/Documents/OwnOne/chess-game/public/sounds'
    os.makedirs(out_dir, exist_ok=True)

    print("Synthesizing realistic battle combat audio files...")
    write_wav(os.path.join(out_dir, 'elephant_roar_crush.wav'), create_elephant_sound())
    write_wav(os.path.join(out_dir, 'soldier_slash.wav'), create_soldier_sound())
    write_wav(os.path.join(out_dir, 'camel_scimitar.wav'), create_camel_sound())
    write_wav(os.path.join(out_dir, 'horse_trample.wav'), create_horse_sound())
    write_wav(os.path.join(out_dir, 'king_judgment.wav'), create_king_sound())
    write_wav(os.path.join(out_dir, 'queen_cyclone.wav'), create_queen_sound())
    print("All combat audio generated successfully!")
