"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { TAPES } from "@/content/host";
import styles from "./HomeVideoShow.module.css";

// Opened from CH 01 · Hello: photos of AK as a shelf of home-video tapes.
// Pick one and it plays back like a camcorder tape.

const pad = (n: number) => String(n).padStart(2, "0");

export default function HomeVideoShow() {
  const [playing, setPlaying] = useState<number | null>(null);

  return (
    <div className={styles.show}>
      <header className={styles.header}>
        <p className={styles.brand}>
          AK <span>Home Video</span>
        </p>
        <p className={styles.spec}>VHS · SP · T-120 · {TAPES.length} tapes</p>
      </header>

      <ul className={styles.shelf}>
        {TAPES.map((t, i) => (
          <li key={t.slug} style={{ "--tilt": `${((i * 37) % 7) - 3}deg` } as React.CSSProperties}>
            <button className={styles.sleeve} onClick={() => setPlaying(i)} aria-label={`Play tape ${i + 1}`}>
              <span className={styles.cover}>
                <Image src={t.crop} alt="" fill sizes="(max-width: 700px) 45vw, 220px" />
              </span>
              <span className={styles.stripes} aria-hidden />
              <span className={styles.label}>
                <span className={styles.labelTitle}>AK · tape {pad(i + 1)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {/* Keyed by tape, so a new tape starts fresh: counter at zero. */}
      {playing !== null && (
        <Player key={playing} index={playing} onChange={setPlaying} onStop={() => setPlaying(null)} />
      )}
    </div>
  );
}

function Player({ index, onChange, onStop }: { index: number; onChange: (i: number) => void; onStop: () => void }) {
  const tape = TAPES[index];
  const [seconds, setSeconds] = useState(0);

  // The tape counter runs while it plays.
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const go = (delta: number) => onChange((index + delta + TAPES.length) % TAPES.length);

  useEffect(() => {
    // Capture phase, so Esc stops the tape instead of leaving the channel.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onStop();
      } else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  });

  const counter = `0:${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;

  return (
    <div className={styles.player} role="dialog" aria-label={`Tape ${index + 1}`}>
      <div className={styles.screen}>
        <Image
          className={styles.footage}
          src={tape.full}
          alt="Photo of AK Cushman"
          fill
          sizes="100vw"
          priority
        />
        <div className={styles.tracking} aria-hidden />
        <div className={styles.lines} aria-hidden />

        <p className={`${styles.osd} ${styles.osdPlay}`}>PLAY ▶</p>
        <p className={`${styles.osd} ${styles.osdSp}`}>SP</p>
        <p className={`${styles.osd} ${styles.osdCounter}`}>{counter}</p>
        <p className={`${styles.osd} ${styles.osdDate}`}>AK</p>
      </div>

      <div className={styles.deck}>
        <button onClick={() => go(-1)}>◀◀ REW</button>
        <button onClick={onStop}>■ STOP</button>
        <button onClick={() => go(1)}>FF ▶▶</button>
        <span className={styles.deckCount}>
          TAPE {pad(index + 1)} / {pad(TAPES.length)}
        </span>
      </div>
    </div>
  );
}
