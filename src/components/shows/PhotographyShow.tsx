"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { PHOTOS } from "@/content/photos";
import MusicCredit from "../MusicCredit";
import styles from "./PhotographyShow.module.css";

// CH 05: a 90s nature documentary. A title card, then letterboxed shots
// that dissolve into each other with slow pans, a camera readout in the
// corner and a film strip. The controls get out of the way while you watch.

const HOLD_MS = 7000;
const INTRO_MS = 3200;
const IDLE_MS = 2500;

const wrap = (i: number) => (i + PHOTOS.length) % PHOTOS.length;

export default function PhotographyShow() {
  const [shot, setShot] = useState<{ index: number; prev: number | null }>({ index: 0, prev: null });
  const [playing, setPlaying] = useState(true);
  const [intro, setIntro] = useState(true);
  const [idle, setIdle] = useState(false);
  const touchX = useRef<number | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const { index, prev } = shot;
  const photo = PHOTOS[index];
  const go = (i: number) => setShot((s) => ({ index: wrap(i), prev: s.index }));

  useEffect(() => {
    const id = setTimeout(() => setIntro(false), INTRO_MS);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!playing || intro) return;
    const id = setTimeout(() => setShot((s) => ({ index: wrap(s.index + 1), prev: s.index })), HOLD_MS);
    return () => clearTimeout(id);
  }, [playing, intro, index]);

  // Cinema mode: controls fade out until you move.
  const wake = () => {
    setIdle(false);
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIdle(true), IDLE_MS);
  };
  useEffect(() => {
    idleTimer.current = setTimeout(() => setIdle(true), IDLE_MS);
    return () => clearTimeout(idleTimer.current);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      wake();
      if (intro) return setIntro(false);
      if (e.key === "ArrowRight") go(index + 1);
      else if (e.key === "ArrowLeft") go(index - 1);
      else if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className={styles.show} data-idle={idle && !intro} onPointerMove={wake} onTouchStart={wake}>
      <div
        className={styles.frame}
        onClick={() => intro && setIntro(false)}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        }}
      >
        {/* The outgoing shot stays underneath while the new one dissolves in. */}
        {prev !== null && (
          <div className={styles.shot} data-under key={`under-${PHOTOS[prev].slug}`}>
            <Image className={styles.backdrop} src={PHOTOS[prev].thumb} alt="" fill sizes="10vw" aria-hidden />
            <Image className={styles.photo} src={PHOTOS[prev].src} alt="" fill sizes="100vw" />
          </div>
        )}
        <div className={styles.shot} key={photo.slug} data-pan={index % 2 ? "right" : "left"}>
          <Image className={styles.backdrop} src={photo.thumb} alt="" fill sizes="10vw" aria-hidden />
          <Image className={styles.photo} src={photo.src} alt="Photograph by AK Cushman" fill sizes="100vw" priority />
        </div>

        <div className={styles.vignette} aria-hidden />
        <div className={styles.bug}>AK · NATURE</div>
        {(photo.camera || photo.exposure) && (
          <div className={styles.readout} key={`r-${photo.slug}`}>
            {photo.camera && <p className={styles.camera}>{photo.camera}</p>}
            {photo.exposure && <p className={styles.exposure}>{photo.exposure}</p>}
          </div>
        )}
        {playing && !intro && <div className={styles.progress} key={`p-${photo.slug}`} />}

        {intro && (
          <div className={styles.titleCard}>
            <p className={styles.presents}>AK Nature presents</p>
            <h1 className={styles.filmTitle}>Through My Lens</h1>
          </div>
        )}
      </div>

      <div className={styles.chrome}>
        <div className={styles.controls}>
          <button onClick={() => go(index - 1)} aria-label="Previous photo">
            ◀
          </button>
          <button onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause" : "Play"}>
            {playing ? "❚❚" : "▶"}
          </button>
          <button onClick={() => go(index + 1)} aria-label="Next photo">
            ▶▶
          </button>
          <span className={styles.counter}>
            {String(index + 1).padStart(2, "0")} / {String(PHOTOS.length).padStart(2, "0")}
          </span>
        </div>

        <ul className={styles.strip}>
          {PHOTOS.map((p, i) => (
            <li key={p.slug}>
              <button
                className={styles.frameThumb}
                data-active={i === index}
                onClick={() => go(i)}
                aria-label={`Photo ${i + 1}`}
              >
                <Image src={p.thumb} alt="" width={160} height={107} />
              </button>
            </li>
          ))}
        </ul>

        <MusicCredit channel="photography" className={styles.music} />
      </div>
    </div>
  );
}
