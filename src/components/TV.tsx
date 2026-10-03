"use client";

import { useRef } from "react";
import type { TVState } from "@/lib/useTV";
import AKLogo from "./AKLogo";
import Picture from "./Picture";
import Wordmark from "./Wordmark";
import styles from "./TV.module.css";

// Desktop: the living-room 90s set.
export default function TV({ tv }: { tv: TVState }) {
  const { phase, channel, isOn, isTuned } = tv;
  const touchY = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    touchY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchY.current === null) return;
    const dy = e.changedTouches[0].clientY - touchY.current;
    touchY.current = null;
    if (Math.abs(dy) > 40) tv.flip(dy < 0 ? 1 : -1);
  };

  return (
    <main className={styles.room}>
      <div className={styles.tv}>
        <div className={styles.cabinet}>
          <div className={styles.bezel}>
            <div
              className={styles.screen}
              data-clickable={phase === "warming" || phase === "on"}
              onClick={phase === "warming" ? tv.skipWarmup : tv.watch}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <Picture phase={phase} channel={channel} osd={tv.osd} />
            </div>
          </div>

          <div className={styles.chin}>
            <AKLogo className={styles.brand} />
            <Wordmark className={styles.model} />
            <div className={styles.controls}>
              <button className={styles.chButton} onClick={() => tv.flip(-1)} disabled={!isOn} aria-label="Channel down">
                CH ▼
              </button>
              <button className={styles.chButton} onClick={() => tv.flip(1)} disabled={!isOn} aria-label="Channel up">
                CH ▲
              </button>
              <button
                className={styles.chButton}
                data-active={tv.muted}
                onClick={tv.toggleMute}
                disabled={!isOn}
                aria-pressed={tv.muted}
                aria-label="Mute"
              >
                MUTE
              </button>
              <span className={styles.led} data-on={isOn} />
              <button
                className={styles.power}
                data-off={phase === "off"}
                onClick={isOn ? tv.powerOff : phase === "off" ? tv.powerOn : undefined}
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
        {isTuned && (
          <>
            <span className={styles.pointerOnly}>
              ▲ ▼ change channel · enter {channel.home ? "for home videos" : "to watch"}
            </span>
            <span className={styles.touchOnly}>
              swipe to flip · tap {channel.home ? "for home videos" : "to watch"}
            </span>
          </>
        )}
      </p>
    </main>
  );
}
