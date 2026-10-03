// All TV sounds are synthesized with Web Audio — no audio files to ship.
// Browsers only allow audio after a user gesture, so `init()` must be
// called from the power-button click.

/** A zero-length WAV, used to unlock audio on iOS. */
const SILENCE = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";

export class TVAudio {
  private ctx: AudioContext | null = null;
  private hissGain: GainNode | null = null;
  private master: GainNode | null = null;
  private volume = 0.8;
  private muted = false;
  private music: HTMLAudioElement | null = null;
  private musicGain: GainNode | null = null;
  private queue: string[] = [];
  private queueKey = "";

  init() {
    if (this.ctx) {
      void this.ctx.resume();
      return;
    }
    const ctx = new AudioContext();
    this.ctx = ctx;

    // Everything routes through one master gain for the volume control.
    const master = ctx.createGain();
    master.gain.value = this.muted ? 0 : this.volume;
    master.connect(ctx.destination);
    this.master = master;

    // Two seconds of white noise, looped forever and gated by hissGain.
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Shape it so it sounds like a TV speaker rather than raw noise.
    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 350;
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 7000;

    const gain = ctx.createGain();
    gain.gain.value = 0;
    this.hissGain = gain;

    source.connect(highpass).connect(lowpass).connect(gain).connect(master);
    source.start();

    // Channel music: one <audio> element, routed through the same master.
    const music = new Audio();
    music.preload = "auto";
    music.addEventListener("ended", () => this.next());
    const musicGain = ctx.createGain();
    musicGain.gain.value = 0;
    ctx.createMediaElementSource(music).connect(musicGain).connect(master);
    this.music = music;
    this.musicGain = musicGain;
    // iOS only lets an element play later if it first played in a tap, so
    // play a blank clip now (we're inside the power-button click). Nothing
    // may pause it afterwards: that would also stop the real score.
    music.src = SILENCE;
    void music.play().catch(() => {});
  }

  /** Switch to a channel's score (list of URLs); [] fades to silence. */
  setMusic(urls: string[]) {
    const key = urls.join("|");
    if (key === this.queueKey) return;
    this.queueKey = key;
    this.queue = urls;
    this.fadeMusic(0, 150);
    if (!urls.length || !this.music) {
      this.music?.pause();
      return;
    }
    this.music.src = urls[0];
    void this.music.play().catch(() => {});
    this.fadeMusic(1, 900);
  }

  private next() {
    if (!this.music || !this.queue.length) return;
    const i = this.queue.indexOf(new URL(this.music.src).pathname);
    this.music.src = this.queue[(i + 1) % this.queue.length];
    void this.music.play().catch(() => {});
  }

  /** Music sits under everything; level is 0–1 of its normal mix. */
  fadeMusic(level: number, ms = 300) {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;
    const g = this.musicGain.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(level * 0.35, now + ms / 1000);
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    this.setVolume(this.volume);
  }

  setVolume(v: number) {
    this.volume = v;
    const level = this.muted ? 0 : v;
    if (this.ctx && this.master) this.master.gain.setTargetAtTime(level, this.ctx.currentTime, 0.03);
  }

  /** Ramp the static hiss to `level` (0–1) over `ms`. */
  hiss(level: number, ms = 60) {
    if (!this.ctx || !this.hissGain) return;
    const now = this.ctx.currentTime;
    const g = this.hissGain.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(level * 0.25, now + ms / 1000);
  }

  /** The low "thunk" + whine of a CRT powering on. */
  powerOn() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const thump = ctx.createOscillator();
    const thumpGain = ctx.createGain();
    thump.type = "sine";
    thump.frequency.setValueAtTime(90, now);
    thump.frequency.exponentialRampToValueAtTime(40, now + 0.25);
    thumpGain.gain.setValueAtTime(0.5, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    thump.connect(thumpGain).connect(this.master!);
    thump.start(now);
    thump.stop(now + 0.4);

    // The faint 15.7kHz flyback whine you could hear on old sets.
    const whine = ctx.createOscillator();
    const whineGain = ctx.createGain();
    whine.frequency.value = 15734;
    whineGain.gain.setValueAtTime(0, now);
    whineGain.gain.linearRampToValueAtTime(0.012, now + 0.3);
    whineGain.gain.linearRampToValueAtTime(0, now + 2.5);
    whine.connect(whineGain).connect(this.master!);
    whine.start(now);
    whine.stop(now + 2.6);
  }

  /** Short mechanical click for channel buttons. */
  click() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(1800, now);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    osc.connect(gain).connect(this.master!);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  powerOff() {
    this.hiss(0, 40);
    this.setMusic([]);
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.3);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain).connect(this.master!);
    osc.start(now);
    osc.stop(now + 0.4);
  }
}
