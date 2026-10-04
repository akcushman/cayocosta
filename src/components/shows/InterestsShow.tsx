"use client";

import { useEffect, useRef, useState } from "react";
import { INTERESTS, type Interest } from "@/content/interests";
import MusicCredit from "../MusicCredit";
import styles from "./InterestsShow.module.css";

// CH 04: a game-show board of things I love. Spin it and see where it
// lands; it's just for fun. The bonus tile fills out the 5×3 board.

const BONUS: Interest = { name: "★ Bonus ★" };
const TILES: Interest[] = [...INTERESTS, BONUS];

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
          Things
          <br />I love
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
                data-bonus={t === BONUS}
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
          {topic === null && "Spin the board and see where it lands."}
          {topic === BONUS && "Bonus round! Spin again."}
          {topic !== null && topic !== BONUS && (
            <>
              The board says: <strong>{topic.name}</strong>!
            </>
          )}
        </p>
        {topic?.watch && (
          <a className={styles.watch} href={topic.watch.href} target="_blank" rel="noreferrer">
            📺 {topic.watch.label} ↗
          </a>
        )}
        <MusicCredit channel="interests" className={styles.music} />
      </div>
    </div>
  );
}
