"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { PHOTOS } from "@/content/photos";
import styles from "./PhotographyShow.module.css";

// CH 05: a 90s nature documentary. Letterboxed, slow Ken Burns pans,
// a year-and-camera credit, and a film strip to jump around.

const HOLD_MS = 7000;

export default function PhotographyShow() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const photo = PHOTOS[index];
  const touchX = useRef<number | null>(null);

  const go = (i: number) => setIndex((i + PHOTOS.length) % PHOTOS.length);

  useEffect(() => {
    if (!playing) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % PHOTOS.length), HOLD_MS);
    return () => clearTimeout(id);
  }, [playing, index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
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
    <div className={styles.show}>
      <div
        className={styles.frame}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        }}
      >
        {/* key remounts the shot so the fade and pan restart. */}
        <div className={styles.shot} key={photo.slug} data-pan={index % 2 ? "right" : "left"}>
          <Image className={styles.backdrop} src={photo.thumb} alt="" fill sizes="10vw" aria-hidden />
          <Image
            className={styles.photo}
            src={photo.src}
            alt={`Photograph by AK Cushman${photo.year ? `, ${photo.year}` : ""}`}
            fill
            sizes="100vw"
            priority={index === 0}
          />
        </div>

        <div className={styles.bug}>AK · NATURE</div>
        <div className={styles.caption} key={`c-${photo.slug}`}>
          <p className={styles.meta}>
            {[photo.year, photo.camera && `Shot on ${photo.camera}`].filter(Boolean).join(" · ")}
          </p>
        </div>
        {playing && <div className={styles.progress} key={`p-${photo.slug}`} />}
      </div>

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
            <button className={styles.frameThumb} data-active={i === index} onClick={() => go(i)} aria-label={`Photo ${i + 1}`}>
              <Image src={p.thumb} alt="" width={160} height={107} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
