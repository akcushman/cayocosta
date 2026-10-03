import { ROLES } from "@/lib/channels";
import styles from "./HelloScreen.module.css";

// Channel 01: the sign-on screen you land on after the static clears.
export default function HelloScreen() {
  // Rendered twice so the crawl loops without a gap.
  const crawl = [0, 1].map((copy) => (
    <span key={copy} className={styles.crawlRun} aria-hidden={copy === 1}>
      {ROLES.map((role) => (
        <span key={role} className={styles.crawlItem}>
          {role}
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

      <div className={styles.crawl}>
        <span className={styles.crawlLabel}>AK</span>
        <div className={styles.crawlTrack}>{crawl}</div>
      </div>
    </div>
  );
}
