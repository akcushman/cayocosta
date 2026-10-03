"use client";

import { useRef, useState } from "react";
import { CHANNELS } from "@/lib/channels";
import type { TVState } from "@/lib/useTV";
import Picture from "./Picture";
import styles from "./PocketTV.module.css";

// Mobile: a 90s handheld TV. Drag the tuning dial and the picture comes
// in and out of the static between stations.

// Dial positions are in channel-number units, half a step past each end.
const DIAL_MIN = CHANNELS[0].number - 0.5;
const DIAL_MAX = CHANNELS[CHANNELS.length - 1].number + 0.5;
/** Within this distance of a station the picture is perfectly clear… */
const LOCK = 0.12;
/** …and fully lost to static beyond this. */
const FADE = 0.45;

const toPercent = (pos: number) => ((pos - DIAL_MIN) / (DIAL_MAX - DIAL_MIN)) * 100;

export default function PocketTV({ tv }: { tv: TVState }) {
  const { phase, channel, isOn, isTuned } = tv;
  const [dragPos, setDragPos] = useState<number | null>(null);
  const lastNearest = useRef<number | null>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const tuneAt = (clientX: number, track: HTMLElement) => {
    const rect = track.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const pos = DIAL_MIN + t * (DIAL_MAX - DIAL_MIN);

    let nearest = 0;
    CHANNELS.forEach((c, i) => {
      if (Math.abs(c.number - pos) < Math.abs(CHANNELS[nearest].number - pos)) nearest = i;
    });
    const distance = Math.abs(CHANNELS[nearest].number - pos);
    const noise = Math.min(1, Math.max(0, (distance - LOCK) / (FADE - LOCK)));

    if (noise < 1 && lastNearest.current !== nearest) {
      lastNearest.current = nearest;
      navigator.vibrate?.(8);
    }
    setDragPos(pos);
    tv.scrub(nearest, noise);
  };

  const onDialDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isTuned) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    lastNearest.current = null;
    tuneAt(e.clientX, e.currentTarget);
  };
  const onDialMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragPos !== null) tuneAt(e.clientX, e.currentTarget);
  };
  const onDialUp = () => {
    if (dragPos === null) return;
    setDragPos(null);
    tv.endScrub();
  };

  // Swipe the screen to flip, tap to open the channel.
  const onScreenTouchStart = (e: React.TouchEvent) => {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onScreenTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = e.changedTouches[0].clientY - touch.current.y;
    touch.current = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 40) return;
    tv.flip(Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : -1) : dy < 0 ? 1 : -1);
  };

  const needle = dragPos ?? channel.number;

  return (
    <main className={styles.room}>
      <div className={styles.device}>
        <div className={styles.topRow}>
          <span className={styles.brand}>CUSHMAN</span>
          <span className={styles.model}>pocket</span>
          <span className={styles.led} data-on={isOn} />
        </div>

        <div className={styles.bezel}>
          <div
            className={styles.screen}
            onClick={phase === "warming" ? tv.skipWarmup : tv.watch}
            onTouchStart={onScreenTouchStart}
            onTouchEnd={onScreenTouchEnd}
          >
            <Picture phase={phase} channel={channel} osd={tv.osd} noise={tv.noise} quiet={dragPos !== null} />
          </div>
        </div>

        <div className={styles.badgeRow}>
          <span className={styles.badge}>AK</span>
          <span className={styles.spec}>FLAT · TUBE · COLOR</span>
        </div>

        <div className={styles.grille} aria-hidden />

        <div className={styles.tuner}>
          <div
            className={styles.dial}
            data-live={isTuned}
            data-dragging={dragPos !== null}
            onPointerDown={onDialDown}
            onPointerMove={onDialMove}
            onPointerUp={onDialUp}
            onPointerCancel={onDialUp}
            role="slider"
            aria-label="Tuning dial"
            aria-valuemin={CHANNELS[0].number}
            aria-valuemax={CHANNELS[CHANNELS.length - 1].number}
            aria-valuenow={channel.number}
            aria-valuetext={`Channel ${channel.number}, ${channel.title}`}
          >
            <div className={styles.scale}>
              {CHANNELS.map((c) => (
                <span
                  key={c.slug}
                  className={styles.mark}
                  data-active={isTuned && c.number === channel.number}
                  style={{ left: `${toPercent(c.number)}%` }}
                >
                  {c.number}
                </span>
              ))}
              <div className={styles.needle} style={{ left: `${toPercent(needle)}%` }} />
            </div>
          </div>
          <p className={styles.status}>
            {phase === "off" && "slide power on →"}
            {phase === "warming" && "tuning in…"}
            {isTuned && (dragPos !== null ? "◀ tuning ▶" : `CH ${channel.number} · ${channel.title}`)}
          </p>
        </div>

        <div className={styles.bottomRow}>
          <label className={styles.volume}>
            <span>VOL</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={tv.volume}
              onChange={(e) => tv.setVolume(Number(e.target.value))}
              aria-label="Volume"
            />
          </label>

          <button
            className={styles.power}
            role="switch"
            aria-checked={isOn}
            aria-label="Power"
            data-on={isOn}
            data-beckon={phase === "off"}
            onClick={isOn ? tv.powerOff : phase === "off" ? tv.powerOn : undefined}
          >
            <span className={styles.powerLabel}>OFF</span>
            <span className={styles.powerTrack}>
              <span className={styles.powerKnob} />
            </span>
            <span className={styles.powerLabel}>ON</span>
          </button>
        </div>
      </div>
    </main>
  );
}
