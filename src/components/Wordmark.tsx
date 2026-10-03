import styles from "./Wordmark.module.css";

// CUSHMAN in the wide silver italic of a 90s Japanese set, with the
// katakana reading printed underneath.
export default function Wordmark({ className, kana = true }: { className?: string; kana?: boolean }) {
  return (
    <span className={`${styles.wordmark} ${className ?? ""}`}>
      <span className={styles.latin}>CUSHMAN</span>
      {kana && (
        <span className={styles.kana} lang="ja">
          カッシュマン
        </span>
      )}
    </span>
  );
}
