/**
 * Premium Web Audio API Sound Engine
 * Synthesizes organic wooden taps, heavy piece capture impacts, 
 * alert pings, castling clatter, and celebratory victory chords.
 * Zero external sound file network latency or 404 risks.
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.7;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Crisp wooden move sound
   */
  public playMove() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.05);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(this.volume * 0.45, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.08);

    // Subtle felt cushion thud
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(90, t);
    subOsc.frequency.linearRampToValueAtTime(45, t + 0.04);
    subGain.gain.setValueAtTime(this.volume * 0.35, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(t);
    subOsc.stop(t + 0.06);
  }

  /**
   * Satisfying, deep capture impact
   */
  public playCapture() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Primary impact transient
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(340, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.1);

    gain.gain.setValueAtTime(this.volume * 0.65, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.13);

    // Crack/friction noise burst
    const bufferSize = this.ctx.sampleRate * 0.05;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1200, t);
    noiseFilter.Q.setValueAtTime(3, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(this.volume * 0.4, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    whiteNoise.start(t);
    whiteNoise.stop(t + 0.05);
  }

  /**
   * Crisp metal parry clash sound when combatants exchange blows across the two boxes
   */
  public playCombatParry() {
    if (this.isMuted) return;

    if (typeof window !== 'undefined') {
      try {
        const audio = new Audio('/sounds/sword_parry_clash.wav');
        audio.volume = Math.max(0, Math.min(1, this.volume * 0.92));
        audio.play().catch(() => {});
      } catch {
        // Fallback to synthesis below
      }
    }

    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [2200, 3400, 4800].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.55, t + 0.14);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq, t);
      filter.Q.setValueAtTime(7, t);

      gain.gain.setValueAtTime(this.volume * (0.4 / (idx + 1)), t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.17);
    });
  }

  /**
   * Visceral battlefield weapon clash audio (finishing kill)
   * Plays high-fidelity studio WAV combat recordings for each historic creature:
   * Elephant trumpet roar & colossal stomp, Soldier war cry & blade slash,
   * Desert Camel guttural bellow & scimitar cleave, Warhorse neigh & hoof trample,
   * Imperial King celestial judgment thunder slam, and Valkyrie Queen blade cyclone.
   */
  public playCombatClash(attackerType: string = 'p', victimType: string = 'p') {
    this.playCombatFinisher(attackerType, victimType);
  }

  /**
   * Visceral lethal finisher audio with real animal/human recordings
   */
  public playCombatFinisher(attackerType: string = 'p', victimType: string = 'p') {
    if (this.isMuted) return;

    // 1. Play Studio-Mastered Acoustic Audio Sample
    if (typeof window !== 'undefined') {
      const soundMap: Record<string, string> = {
        r: '/sounds/elephant_roar_crush.wav',
        p: '/sounds/soldier_slash.wav',
        b: '/sounds/camel_scimitar.wav',
        n: '/sounds/horse_trample.wav',
        k: '/sounds/king_judgment.wav',
        q: '/sounds/queen_cyclone.wav',
      };
      const soundUrl = soundMap[attackerType] || '/sounds/soldier_slash.wav';
      try {
        const audio = new Audio(soundUrl);
        audio.volume = Math.max(0, Math.min(1, this.volume * 0.95));
        audio.play().catch(() => {});
      } catch {
        // Fallback to synthesized audio below
      }
    }

    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 1. Steel Sword / Weapon Harmonics
    const metalFreqs = attackerType === 'r' 
      ? [850, 1350] 
      : attackerType === 'q' 
      ? [2400, 3600, 4800] 
      : [1950, 2900];

    // Special: War Elephant Trumpet Roar (Rook / Gaja)
    if (attackerType === 'r') {
      const trumpetOsc = this.ctx.createOscillator();
      const trumpetGain = this.ctx.createGain();
      const trumpetFilter = this.ctx.createBiquadFilter();

      trumpetOsc.type = 'sawtooth';
      trumpetOsc.frequency.setValueAtTime(260, t);
      trumpetOsc.frequency.linearRampToValueAtTime(460, t + 0.14);
      trumpetOsc.frequency.linearRampToValueAtTime(360, t + 0.35);

      trumpetFilter.type = 'bandpass';
      trumpetFilter.frequency.setValueAtTime(950, t);
      trumpetFilter.Q.setValueAtTime(4, t);

      trumpetGain.gain.setValueAtTime(0.001, t);
      trumpetGain.gain.linearRampToValueAtTime(this.volume * 0.55, t + 0.04);
      trumpetGain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

      trumpetOsc.connect(trumpetFilter);
      trumpetFilter.connect(trumpetGain);
      trumpetGain.connect(this.ctx.destination);

      trumpetOsc.start(t);
      trumpetOsc.stop(t + 0.4);
    }

    // Special: Desert War Camel Scimitar Cleave (Bishop / Ushtra)
    if (attackerType === 'b') {
      const camelOsc = this.ctx.createOscillator();
      const camelGain = this.ctx.createGain();
      const camelFilter = this.ctx.createBiquadFilter();

      camelOsc.type = 'sawtooth';
      camelOsc.frequency.setValueAtTime(340, t);
      camelOsc.frequency.linearRampToValueAtTime(620, t + 0.12);
      camelOsc.frequency.exponentialRampToValueAtTime(200, t + 0.28);

      camelFilter.type = 'bandpass';
      camelFilter.frequency.setValueAtTime(1400, t);
      camelFilter.Q.setValueAtTime(3.8, t);

      camelGain.gain.setValueAtTime(0.001, t);
      camelGain.gain.linearRampToValueAtTime(this.volume * 0.48, t + 0.02);
      camelGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      camelOsc.connect(camelFilter);
      camelFilter.connect(camelGain);
      camelGain.connect(this.ctx.destination);

      camelOsc.start(t);
      camelOsc.stop(t + 0.32);
    }

    // Special: Cavalry Hooves Stomp (Knight / Warhorse)
    if (attackerType === 'n') {
      [0, 0.06, 0.12].forEach((offset) => {
        if (!this.ctx) return;
        const hoofOsc = this.ctx.createOscillator();
        const hoofGain = this.ctx.createGain();
        hoofOsc.type = 'triangle';
        hoofOsc.frequency.setValueAtTime(120, t + offset);
        hoofOsc.frequency.exponentialRampToValueAtTime(40, t + offset + 0.04);
        hoofGain.gain.setValueAtTime(this.volume * 0.4, t + offset);
        hoofGain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.05);
        hoofOsc.connect(hoofGain);
        hoofGain.connect(this.ctx.destination);
        hoofOsc.start(t + offset);
        hoofOsc.stop(t + offset + 0.05);
      });
    }

    // Special: Imperial King Sovereign Judgment Thunder Slam
    if (attackerType === 'k') {
      const kingSub = this.ctx.createOscillator();
      const kingSubGain = this.ctx.createGain();
      kingSub.type = 'sine';
      kingSub.frequency.setValueAtTime(80, t);
      kingSub.frequency.exponentialRampToValueAtTime(22, t + 0.45);
      kingSubGain.gain.setValueAtTime(this.volume * 0.7, t);
      kingSubGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      kingSub.connect(kingSubGain);
      kingSubGain.connect(this.ctx.destination);
      kingSub.start(t);
      kingSub.stop(t + 0.55);
    }

    metalFreqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, t + 0.18);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq, t);
      filter.Q.setValueAtTime(6, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(this.volume * (0.45 / (idx + 1)), t + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.25);
    });

    // 2. High-speed blade cutting whoosh / friction noise
    const bufferSize = this.ctx.sampleRate * 0.08;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(2200, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(this.volume * 0.35, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(t);
    noise.stop(t + 0.08);

    // 3. Heavy armored soldier / shield impact thud (defeat of fallen piece)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(150, t + 0.04);
    subOsc.frequency.exponentialRampToValueAtTime(35, t + 0.22);

    subGain.gain.setValueAtTime(0.001, t);
    subGain.gain.setValueAtTime(this.volume * 0.55, t + 0.04);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(t + 0.04);
    subOsc.stop(t + 0.26);
  }

  /**
   * Castling double-slide
   */
  public playCastle() {
    if (this.isMuted) return;
    this.playMove();
    setTimeout(() => {
      this.playMove();
    }, 110);
  }

  /**
   * Check harmonic alert chime
   */
  public playCheck() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [440, 659.25]; // A4 and E5 harmonic interval

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.03);

      gain.gain.setValueAtTime(0.001, t + idx * 0.03);
      gain.gain.linearRampToValueAtTime(this.volume * 0.45, t + idx * 0.03 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.03 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.03);
      osc.stop(t + idx * 0.03 + 0.36);
    });
  }

  /**
   * Checkmate celebratory victory chime
   */
  public playCheckmate() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Grand arpeggio: C4, E4, G4, C5, E5
    const chord = [261.63, 329.63, 392.00, 523.25, 659.25];

    chord.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      gain.gain.setValueAtTime(0.001, t + idx * 0.08);
      gain.gain.linearRampToValueAtTime(this.volume * 0.35, t + idx * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.7);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.75);
    });
  }

  /**
   * Tactile button / UI click
   */
  public playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.03);

    gain.gain.setValueAtTime(this.volume * 0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.035);
  }
}

export const sound = new SoundEngine();
