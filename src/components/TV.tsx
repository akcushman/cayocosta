"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CHANNELS } from "@/lib/channels";
import HelloScreen from "./HelloScreen";
import { TVAudio } from "@/lib/tvAudio";
import StaticCanvas from "./StaticCanvas";
import styles from "./TV.module.css";

type Phase = "off" | "warming" | "on" | "switching" | "shutdown";

const WARMUP_MS = 2500;
const SWITCH_MS = 380;
const SHUTDOWN_MS = 650;
const OSD_MS = 3000;

const pad = (n: number) => String(n).padStart(2, "0");

export default function TV() {
  const [phase, setPhase] = useState<Phase>("off");
  const [index, setIndex] = useState(0);
  const [osd, setOsd] = useState(false);
  const [watching, setWatching] = useState(false);

  const audio = useRef<TVAudio | null>(null);
  const phaseTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const osdTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const touchY = useRef<number | null>(null);

  const channel = CHANNELS[index];
  const isOn = phase === "warming" || phase === "on" || phase === "switching";

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
    audio.current.powerOn();
    audio.current.hiss(1, 300);
    setPhase("warming");
    after(WARMUP_MS, tuneIn);
  }, [tuneIn]);

  const powerOff = useCallback(() => {
    audio.current?.powerOff();
    setWatching(false);
    setOsd(false);
    setPhase("shutdown");
    after(SHUTDOWN_MS, () => setPhase("off"));
  }, []);

  const tuneTo = useCallback(
    (next: number) => {
      if (phase !== "on" && phase !== "switching") return;
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
    [phase, flashOsd],
  );

  const flip = useCallback((delta: number) => tuneTo(index + delta), [index, tuneTo]);

  const skipWarmup = useCallback(() => {
    if (phase !== "warming") return;
    clearTimeout(phaseTimer.current);
    tuneIn();
  }, [phase, tuneIn]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === "warming") return skipWarmup();
      if (phase !== "on" && phase !== "switching") return;

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
        if (phase === "on" && !channel.home) setWatching(true);
      } else if (/^[0-9]$/.test(e.key)) {
        const target = CHANNELS.findIndex((c) => c.number === Number(e.key));
        if (target !== -1 && target !== index) tuneTo(target);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, watching, index, channel.home, flip, tuneTo, skipWarmup]);

  useEffect(
    () => () => {
      clearTimeout(phaseTimer.current);
      clearTimeout(osdTimer.current);
    },
    [],
  );

  const onTouchStart = (e: React.TouchEvent) => {
    touchY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchY.current === null) return;
    const dy = e.changedTouches[0].clientY - touchY.current;
    touchY.current = null;
    if (Math.abs(dy) > 40) flip(dy < 0 ? 1 : -1);
  };

  const showStatic = phase === "warming" || phase === "switching";

  return (
    <main className={styles.room}>
      <div className={styles.tv}>
        <div className={styles.cabinet}>
          <div className={styles.bezel}>
            <div
              className={styles.screen}
              data-phase={phase}
              onClick={phase === "warming" ? skipWarmup : phase === "on" && !channel.home ? () => setWatching(true) : undefined}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {phase !== "off" && (
                <div className={styles.picture}>
                  {phase !== "warming" && (
                    <div className={styles.program} style={{ background: channel.color }}>
                      <div className={styles.stationId}>AK·{pad(channel.number)}</div>
                      {channel.home ? (
                        <HelloScreen />
                      ) : (
                        <>
                          <h2 className={styles.programTitle}>{channel.title}</h2>
                          <p className={styles.programTagline}>{channel.tagline}</p>
                          <p className={styles.programPrompt}>▶ press OK to watch</p>
                        </>
                      )}
                    </div>
                  )}

                  <div className={styles.staticWrap} data-visible={showStatic}>
                    <StaticCanvas className={styles.static} />
                  </div>

                  {phase === "on" && osd && (
                    <>
                      <div className={styles.osd}>CH {pad(channel.number)}</div>
                      {!channel.home && (
                      <div className={styles.lowerThird} key={channel.slug}>
                        <span className={styles.lowerThirdNum}>{pad(channel.number)}</span>
                        <span className={styles.lowerThirdTitle}>{channel.title}</span>
                      </div>
                      )}
                    </>
                  )}
                </div>
              )}
              <div className={styles.scanlines} />
              <div className={styles.glass} />
            </div>
          </div>

          <div className={styles.chin}>
            <span className={styles.brand}>AK</span>
            <span className={styles.model}>CUSHMAN</span>
            <div className={styles.controls}>
              <button className={styles.chButton} onClick={() => flip(-1)} disabled={!isOn} aria-label="Channel down">
                CH ▼
              </button>
              <button className={styles.chButton} onClick={() => flip(1)} disabled={!isOn} aria-label="Channel up">
                CH ▲
              </button>
              <span className={styles.led} data-on={isOn} />
              <button
                className={styles.power}
                data-off={phase === "off"}
                onClick={isOn ? powerOff : phase === "off" ? powerOn : undefined}
                aria-label={isOn ? "Turn TV off" : "Turn TV on"}
              >
                ⏻
              </button>
            </div>
          </div>
        </div>
        <div className={styles.stand} />
      </div>

      <p className={styles.hint}>
        {phase === "off" && "press ⏻ to turn on"}
        {phase === "warming" && "tuning in…"}
        {(phase === "on" || phase === "switching") && (
          <>
            <span className={styles.pointerOnly}>
              ▲ ▼ change channel{!channel.home && " · enter to watch"}
            </span>
            <span className={styles.touchOnly}>swipe to flip{!channel.home && " · tap to watch"}</span>
          </>
        )}
      </p>

      {watching && (
        <section className={styles.watch} style={{ background: channel.color }}>
          <button className={styles.back} onClick={() => setWatching(false)}>
            ← back to TV <kbd>esc</kbd>
          </button>
          <div className={styles.watchBody}>
            <div className={styles.watchChannel}>CH {pad(channel.number)}</div>
            <h1>{channel.title}</h1>
            <p>{channel.tagline}</p>
            <p className={styles.comingSoon}>Programming coming soon.</p>
          </div>
          <div className={styles.scanlines} />
        </section>
      )}
    </main>
  );
}
