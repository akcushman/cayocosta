import type { ComponentType } from "react";
import type { Channel } from "@/lib/channels";
import { pad } from "./Picture";
import BuildingShow from "./shows/BuildingShow";
import InterestsShow from "./shows/InterestsShow";
import styles from "./WatchView.module.css";

// Each channel airs its own kind of show. Channels without one yet fall
// back to a "coming soon" card.
const SHOWS: Record<string, ComponentType> = {
  building: BuildingShow,
  interests: InterestsShow,
};

// A channel opened full screen.
export default function WatchView({ channel, onClose }: { channel: Channel; onClose: () => void }) {
  const Show = SHOWS[channel.slug];

  return (
    <section className={styles.watch} style={{ background: channel.color }}>
      <button className={styles.back} onClick={onClose}>
        ← back to TV <kbd>esc</kbd>
      </button>
      {Show ? (
        <Show />
      ) : (
        <div className={styles.body}>
          <div className={styles.channel}>CH {pad(channel.number)}</div>
          <h1>{channel.title}</h1>
          <p>{channel.tagline}</p>
          <p className={styles.comingSoon}>Programming coming soon.</p>
        </div>
      )}
      <div className={styles.scanlines} />
    </section>
  );
}
