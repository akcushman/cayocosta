import { CHANNEL_MUSIC } from "@/content/music";
import styles from "./MusicCredit.module.css";

// Credits for a channel's score. CC BY-SA recordings require this.
export default function MusicCredit({ channel, className }: { channel: string; className?: string }) {
  const tracks = CHANNEL_MUSIC[channel];
  if (!tracks?.length) return null;
  return (
    <p className={`${styles.credit} ${className ?? ""}`}>
      <span className={styles.note}>♪ Music</span>
      {tracks.map((t) => (
        <a key={t.src} href={t.source} target="_blank" rel="noreferrer">
          {t.piece} · {t.performer} ({t.license})
        </a>
      ))}
    </p>
  );
}
