import type { Channel } from "@/lib/channels";
import { pad } from "./Picture";
import styles from "./WatchView.module.css";

// A channel opened full screen.
export default function WatchView({ channel, onClose }: { channel: Channel; onClose: () => void }) {
  return (
    <section className={styles.watch} style={{ background: channel.color }}>
      <button className={styles.back} onClick={onClose}>
        ← back to TV <kbd>esc</kbd>
      </button>
      <div className={styles.body}>
        <div className={styles.channel}>CH {pad(channel.number)}</div>
        <h1>{channel.title}</h1>
        <p>{channel.tagline}</p>
        <p className={styles.comingSoon}>Programming coming soon.</p>
      </div>
      <div className={styles.scanlines} />
    </section>
  );
}
