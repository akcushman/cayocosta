import type { ComponentType } from "react";
import type { Channel } from "@/lib/channels";
import type { Playlist } from "@/lib/spotify";
import type { Post } from "@/lib/substack";
import { pad } from "./Picture";
import BuildingShow from "./shows/BuildingShow";
import HomeVideoShow from "./shows/HomeVideoShow";
import InterestsShow from "./shows/InterestsShow";
import OnAirShow from "./shows/OnAirShow";
import PhotographyShow from "./shows/PhotographyShow";
import WritingShow from "./shows/WritingShow";
import styles from "./WatchView.module.css";

/** Data fetched on the server for shows that need it. */
export type Programming = { posts: Post[]; playlist: Playlist | null };

// Each channel airs its own kind of show. Channels without one yet fall
// back to a "coming soon" card.
const SHOWS: Record<string, ComponentType<Programming>> = {
  hello: HomeVideoShow,
  building: BuildingShow,
  writing: WritingShow,
  interests: InterestsShow,
  photography: PhotographyShow,
  "on-air": OnAirShow,
};

// A channel opened full screen.
type Props = { channel: Channel; programming: Programming; onClose: () => void };

export default function WatchView({ channel, programming, onClose }: Props) {
  const Show = SHOWS[channel.slug];

  return (
    <section className={styles.watch} style={{ background: channel.color }}>
      <button className={styles.back} onClick={onClose}>
        ← back to TV <kbd>esc</kbd>
      </button>
      {Show ? (
        <Show {...programming} />
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
