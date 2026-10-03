"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { TAPES } from "@/content/host";
import { CURRENTLY } from "@/content/now";
import { ROLES } from "@/lib/channels";
import styles from "./HelloScreen.module.css";

const HOST_MS = 3500;

// Channel 01: the sign-on screen you land on after the static clears.
export default function HelloScreen() {
  const [host, setHost] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setHost((h) => (h + 1) % TAPES.length), HOST_MS);
    return () => clearInterval(id);
  }, []);

  // Who I am, then a NOW segment. Rendered twice so the crawl loops
  // without a gap.
  const crawl = [0, 1].map((copy) => (
    <span key={copy} className={styles.crawlRun} aria-hidden={copy === 1}>
      {ROLES.map((role) => (
        <span key={role} className={styles.crawlItem}>
          {role}
          <span className={styles.crawlSep}>◆</span>
        </span>
      ))}
      <span className={styles.crawlNow}>Now</span>
      {CURRENTLY.map((item) => (
        <span key={item} className={styles.crawlItem}>
          {item}
          <span className={styles.crawlSep}>◆</span>
        </span>
      ))}
    </span>
  ));

  return (
    <div className={styles.hello}>
      <p className={styles.onAir}>
        <span className={styles.dot} /> Now broadcasting
      </p>
      <h1 className={styles.headline}>
        hello, i&rsquo;m <span className={styles.name}>autumnkyoko</span>.
      </h1>
      <p className={styles.thanks}>thanks for tuning in.</p>
      <p className={styles.analog}>this is an analog of my life.</p>

      {/* Picture-in-picture of the host, flipping through home video. */}
      <figure className={styles.host}>
        <figcaption className={styles.hostTag}>Your host ▶</figcaption>
        <div className={styles.hostFrame}>
          <Image
            key={host}
            className={styles.hostPhoto}
            src={TAPES[host].crop}
            alt={host === 0 ? "AK Cushman" : ""}
            fill
            sizes="200px"
            priority={host === 0}
          />
        </div>
      </figure>

      <div className={styles.crawl}>
        <span className={styles.crawlLabel}>AK</span>
        <div className={styles.crawlTrack}>{crawl}</div>
      </div>
    </div>
  );
}
