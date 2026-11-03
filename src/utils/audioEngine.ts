import { AmbienceChannelId, AmbienceChannelState } from '../types';

class PixelCafeAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;

  private channelGains: Partial<Record<AmbienceChannelId, GainNode>> = {};
  private intervals: number[] = [];
  private activeNodes: AudioNode[] = [];

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.85;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private createPinkNoiseBuffer(ctx: AudioContext, seconds = 4): AudioBuffer {
    const bufferSize = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  public syncAmbience(masterActive: boolean, channels: AmbienceChannelState[]): void {
    if (!masterActive) {
      this.stopAmbience();
      return;
    }

    const ctx = this.ensureContext();
    if (!this.isPlaying) {
      this.startGenerators(ctx);
      this.isPlaying = true;
    }

    channels.forEach((ch) => {
      const gainNode = this.channelGains[ch.id];
      if (gainNode && this.ctx) {
        const target = ch.enabled ? (ch.volume / 100) * 0.45 : 0;
        gainNode.gain.setTargetAtTime(target, this.ctx.currentTime, 0.08);
      }
    });
  }

  private startGenerators(ctx: AudioContext): void {
    this.stopAmbience();
    if (!this.masterGain) return;

    const pinkBuffer = this.createPinkNoiseBuffer(ctx, 5);

    // 1. Rain on window: bandpass + lowpass pink noise
    const rainGain = ctx.createGain();
    rainGain.gain.value = 0;
    rainGain.connect(this.masterGain);
    this.channelGains.rain = rainGain;

    const rainSource = ctx.createBufferSource();
    rainSource.buffer = pinkBuffer;
    rainSource.loop = true;
    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.value = 1350;
    rainSource.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainSource.start();
    this.activeNodes.push(rainSource, rainFilter, rainGain);

    // 2. Cafe room murmur + occasional soft cup clink
    const cafeGain = ctx.createGain();
    cafeGain.gain.value = 0;
    cafeGain.connect(this.masterGain);
    this.channelGains.cafe = cafeGain;

    const cafeSource = ctx.createBufferSource();
    cafeSource.buffer = pinkBuffer;
    cafeSource.loop = true;
    cafeSource.playbackRate.value = 0.68;
    const cafeFilter = ctx.createBiquadFilter();
    cafeFilter.type = 'bandpass';
    cafeFilter.frequency.value = 420;
    cafeFilter.Q.value = 0.9;
    cafeSource.connect(cafeFilter);
    cafeFilter.connect(cafeGain);
    cafeSource.start();
    this.activeNodes.push(cafeSource, cafeFilter, cafeGain);

    const clinkTimer = window.setInterval(() => {
      if (!this.ctx || !this.channelGains.cafe || this.channelGains.cafe.gain.value < 0.01) return;
      if (Math.random() > 0.45) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1950 + Math.random() * 650, now);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.06, now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
      osc.connect(g);
      g.connect(this.channelGains.cafe);
      osc.start(now);
      osc.stop(now + 0.25);
    }, 3400);
    this.intervals.push(clinkTimer);

    // 3. Cozy 8-Bit Lo-Fi Chords (Pentatonic Maj7 progression)
    const lofiGain = ctx.createGain();
    lofiGain.gain.value = 0;
    lofiGain.connect(this.masterGain);
    this.channelGains.lofi = lofiGain;

    const chords = [
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [220.0, 261.63, 329.63, 392.0],  // Am7
      [174.61, 220.0, 261.63, 329.63], // Fmaj7
      [196.0, 246.94, 293.66, 392.0],  // G6
    ];
    let chordIdx = 0;

    const playChord = () => {
      if (!this.ctx || !this.channelGains.lofi || this.channelGains.lofi.gain.value < 0.005) return;
      const now = this.ctx.currentTime;
      const freqs = chords[chordIdx % chords.length];
      chordIdx++;

      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(780, now);
      lp.connect(this.channelGains.lofi);

      freqs.forEach((f, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.07);
        noteGain.gain.setValueAtTime(0.0001, now + idx * 0.07);
        noteGain.gain.linearRampToValueAtTime(0.075, now + idx * 0.07 + 0.35);
        noteGain.gain.exponentialRampToValueAtTime(0.0008, now + 3.7);
        osc.connect(noteGain);
        noteGain.connect(lp);
        osc.start(now + idx * 0.07);
        osc.stop(now + 3.8);
      });
    };

    playChord();
    const lofiTimer = window.setInterval(playChord, 3800);
    this.intervals.push(lofiTimer);

    // 4. Crackling Fireplace: deep low rumble + soft warm crackles
    const fireGain = ctx.createGain();
    fireGain.gain.value = 0;
    fireGain.connect(this.masterGain);
    this.channelGains.fire = fireGain;

    const fireSource = ctx.createBufferSource();
    fireSource.buffer = pinkBuffer;
    fireSource.loop = true;
    const fireFilter = ctx.createBiquadFilter();
    fireFilter.type = 'lowpass';
    fireFilter.frequency.value = 210;
    fireSource.connect(fireFilter);
    fireFilter.connect(fireGain);
    fireSource.start();
    this.activeNodes.push(fireSource, fireFilter, fireGain);

    const crackleTimer = window.setInterval(() => {
      if (!this.ctx || !this.channelGains.fire || this.channelGains.fire.gain.value < 0.01) return;
      if (Math.random() > 0.65) return;
      const now = this.ctx.currentTime;
      const noiseBuf = this.ctx.createBuffer(1, 512, this.ctx.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < 512; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 110);
      }
      const crackle = this.ctx.createBufferSource();
      crackle.buffer = noiseBuf;
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 1600 + Math.random() * 1100;
      const cg = this.ctx.createGain();
      cg.gain.value = 0.22;
      crackle.connect(bp);
      bp.connect(cg);
      cg.connect(this.channelGains.fire);
      crackle.start(now);
    }, 320);
    this.intervals.push(crackleTimer);

    // 5. Mechanical Study Keys: gentle rhythmic key thocks
    const kbGain = ctx.createGain();
    kbGain.gain.value = 0;
    kbGain.connect(this.masterGain);
    this.channelGains.keyboard = kbGain;

    const kbTimer = window.setInterval(() => {
      if (!this.ctx || !this.channelGains.keyboard || this.channelGains.keyboard.gain.value < 0.01) return;
      if (Math.random() > 0.58) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(190 + Math.random() * 80, now);
      osc.frequency.exponentialRampToValueAtTime(65, now + 0.045);
      g.gain.setValueAtTime(0.18, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(g);
      g.connect(this.channelGains.keyboard);
      osc.start(now);
      osc.stop(now + 0.055);
    }, 240);
    this.intervals.push(kbTimer);
  }

  public stopAmbience(): void {
    this.intervals.forEach((id) => window.clearInterval(id));
    this.intervals = [];
    this.activeNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof (node as AudioBufferSourceNode).stop === 'function') {
          (node as AudioBufferSourceNode).stop();
        }
        node.disconnect();
      } catch {
        // Safe cleanup
      }
    });
    this.activeNodes = [];
    this.channelGains = {};
    this.isPlaying = false;
  }

  public playCoinChime(): void {
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    const notes = [987.77, 1318.51]; // B5 -> E6 classic 16-bit coin chime
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + idx * 0.075);
      g.gain.setValueAtTime(0.06, now + idx * 0.075);
      g.gain.exponentialRampToValueAtTime(0.0008, now + idx * 0.075 + 0.24);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now + idx * 0.075);
      osc.stop(now + idx * 0.075 + 0.25);
    });
  }

  public playTimerCompleteBell(): void {
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    const melody = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    melody.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.14);
      g.gain.setValueAtTime(0.14, now + idx * 0.14);
      g.gain.exponentialRampToValueAtTime(0.0008, now + idx * 0.14 + 0.55);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now + idx * 0.14);
      osc.stop(now + idx * 0.14 + 0.56);
    });
  }
}

export const cafeAudio = new PixelCafeAudioEngine();
