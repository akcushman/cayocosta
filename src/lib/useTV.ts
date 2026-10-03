"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CHANNELS } from "@/lib/channels";
import { TVAudio } from "@/lib/tvAudio";

// The TV's brain, shared by the desktop set and the pocket TV so both
// tune the same channels with the same static and sounds.

export type Phase = "off" | "warming" | "on" | "switching" | "shutdown";

const WARMUP_MS = 2500;
const SWITCH_MS = 380;
const SHUTDOWN_MS = 650;
const OSD_MS = 3000;

export function useTV() {
  const [phase, setPhase] = useState<Phase>("off");
  const [index, setIndex] = useState(0);
  const [osd, setOsd] = useState(false);
  const [watching, setWatching] = useState(false);
  /** Extra static from a half-tuned signal (pocket TV dial), 0–1. */
  const [noise, setNoise] = useState(0);
  const [volume, setVolumeState] = useState(0.8);

  const audio = useRef<TVAudio | null>(null);
  const phaseTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const osdTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const channel = CHANNELS[index];
  const isOn = phase === "warming" || phase === "on" || phase === "switching";
  const isTuned = phase === "on" || phase === "switching";

  const after = (ms: number, fn: () => void) => {
    clearTimeout(phaseTimer.current);
    phaseTimer.current = setTimeout(fn, ms);
  };

  const flashOsd = useCallback(() => {
    setOsd(true);
    clearTimeout(osdTimer.current);
    osdTimer.current = setTimeout(() => setOsd(false), OSD_MS);
  }, []);

  const tuneIn = useCallback(() => {
    audio.current?.hiss(0, 400);
    setPhase("on");
    flashOsd();
  }, [flashOsd]);

  const powerOn = useCallback(() => {
    audio.current ??= new TVAudio();
    audio.current.init();
    audio.current.setVolume(volume);
    audio.current.powerOn();
    audio.current.hiss(1, 300);
    setPhase("warming");
    after(WARMUP_MS, tuneIn);
  }, [tuneIn, volume]);

  const powerOff = useCallback(() => {
    audio.current?.powerOff();
    setWatching(false);
    setOsd(false);
    setNoise(0);
    setPhase("shutdown");
    after(SHUTDOWN_MS, () => setPhase("off"));
  }, []);

  const tuneTo = useCallback(
    (next: number) => {
      if (!isTuned) return;
      audio.current?.click();
      audio.current?.hiss(0.8, 20);
      setWatching(false);
      setIndex((next + CHANNELS.length) % CHANNELS.length);
      setPhase("switching");
      after(SWITCH_MS, () => {
        audio.current?.hiss(0, 120);
        setPhase("on");
        flashOsd();
      });
    },
    [isTuned, flashOsd],
  );

  const flip = useCallback((delta: number) => tuneTo(index + delta), [index, tuneTo]);

  const skipWarmup = useCallback(() => {
    if (phase !== "warming") return;
    clearTimeout(phaseTimer.current);
    tuneIn();
  }, [phase, tuneIn]);

  /** Live tuning: show channel `next` through `level` (0–1) of static. */
  const scrub = useCallback(
    (next: number, level: number) => {
      if (!isTuned) return;
      clearTimeout(phaseTimer.current);
      clearTimeout(osdTimer.current);
      if (next !== index) audio.current?.click();
      audio.current?.hiss(level * 0.9, 30);
      setIndex(next);
      setPhase("on");
      setNoise(level);
      setOsd(true);
    },
    [isTuned, index],
  );

  const endScrub = useCallback(() => {
    audio.current?.hiss(0, 150);
    setNoise(0);
    flashOsd();
  }, [flashOsd]);

  const watch = useCallback(() => {
    if (phase === "on" && !channel.home) setWatching(true);
  }, [phase, channel.home]);

  const closeWatch = useCallback(() => setWatching(false), []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    audio.current?.setVolume(v);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === "warming") return skipWarmup();
      if (!isTuned) return;

      if (watching) {
        if (e.key === "Escape" || e.key === "Backspace") setWatching(false);
        return;
      }
      if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        flip(1);
      } else if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        flip(-1);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        watch();
      } else if (/^[0-9]$/.test(e.key)) {
        const target = CHANNELS.findIndex((c) => c.number === Number(e.key));
        if (target !== -1 && target !== index) tuneTo(target);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, isTuned, watching, index, flip, tuneTo, skipWarmup, watch]);

  useEffect(
    () => () => {
      clearTimeout(phaseTimer.current);
      clearTimeout(osdTimer.current);
    },
    [],
  );

  return {
    phase,
    index,
    channel,
    osd,
    watching,
    noise,
    volume,
    isOn,
    isTuned,
    powerOn,
    powerOff,
    flip,
    tuneTo,
    skipWarmup,
    scrub,
    endScrub,
    watch,
    closeWatch,
    setVolume,
  };
}

export type TVState = ReturnType<typeof useTV>;
