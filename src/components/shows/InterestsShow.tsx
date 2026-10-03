"use client";

import { useEffect, useRef, useState } from "react";
import { EMAIL } from "@/content/contact";
import { INTERESTS, type Interest } from "@/content/interests";
import MusicCredit from "../MusicCredit";
import styles from "./InterestsShow.module.css";

// CH 04: a game-show board. Every interest on one board, and a spin
// that lands on today's topic.

const BYO: Interest = { name: "& yours?" };
const TILES: Interest[] = [...INTERESTS, BYO];

export default function InterestsShow() {
  const [lit, setLit] = useState<number | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const spin = () => {
    clearTimeout(timer.current);
    setPicked(null);
    const target = Math.floor(Math.random() * TILES.length);
    const steps = 18;
    let step = 0;
    let at = -1;

    // Hop around the board, slowing down, then land on the target.
    const hop = () => {
      step++;
      if (step >= steps) {
        setLit(target);
        setPicked(target);
        return;
      }
      do at = Math.floor(Math.random() * TILES.length);
      while (at === target && step < steps - 1);
      setLit(at);
      timer.current = setTimeout(hop, 50 + step * step * 1.1);
    };
    hop();
  };

  const pick = (i: number) => {
    clearTimeout(timer.current);
    setLit(i);
    setPicked(i);
  };

  const topic = picked === null ? null : TILES[picked];

  return (
    <div className={styles.show}>
      <header className={styles.header}>
        <p className={styles.kicker}>★ The Big Board ★</p>
        <h1 className={styles.title}>
          Talk to me
          <br />
          about…
        </h1>
      </header>

      <div className={styles.marquee}>
        <ul className={styles.board}>
          {TILES.map((t, i) => (
            <li key={t.name}>
              <button
                className={styles.tile}
                data-lit={lit === i}
                data-picked={picked === i}
                data-byo={t === BYO}
                onClick={() => pick(i)}
              >
                <span>{t.name}</span>
                {t.watch && <span className={styles.tv} aria-label="has a show to watch">📺</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.footer}>
        <button className={styles.spin} onClick={spin}>
          Spin the board
        </button>
        <p className={styles.result} aria-live="polite">
          {topic === null && "Things I love — and love to talk about."}
          {topic === BYO && "Bring your own topic. I'm all ears."}
          {topic !== null && topic !== BYO && (
            <>
              Today&rsquo;s topic: <strong>{topic.name}</strong>. Let&rsquo;s talk.
            </>
          )}
        </p>
        {topic?.watch && (
          <a className={styles.watch} href={topic.watch.href} target="_blank" rel="noreferrer">
            📺 {topic.watch.label} ↗
          </a>
        )}
        <a className={styles.mail} href={`mailto:${EMAIL}${topic && topic !== BYO ? `?subject=${encodeURIComponent(topic.name)}` : ""}`}>
          {EMAIL}
        </a>
        <MusicCredit channel="interests" className={styles.music} />
      </div>
    </div>
  );
}
