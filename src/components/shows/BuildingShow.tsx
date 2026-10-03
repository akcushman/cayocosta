import { EMAIL, LINKEDIN } from "@/content/contact";
import { CREDITS, EPISODES, SERIES_TITLE } from "@/content/story";
import styles from "./BuildingShow.module.css";

// CH 02: a prestige-drama episode guide.
export default function BuildingShow() {
  return (
    <div className={styles.show}>
      <header className={styles.header}>
        <p className={styles.presents}>An AK Cushman production</p>
        <h1 className={styles.title}>{SERIES_TITLE}</h1>
        <p className={styles.sub}>A series in {EPISODES.length} episodes</p>
      </header>

      <ol className={styles.episodes}>
        {EPISODES.map((ep, i) => (
          <li key={ep.title} className={styles.episode} data-current={!!ep.current}>
            <span className={styles.number}>{String(i + 1).padStart(2, "0")}</span>
            <div className={styles.body}>
              {ep.current && <span className={styles.live}>● Now airing</span>}
              <h2 className={styles.epTitle}>{ep.title}</h2>
              <p className={styles.meta}>
                {ep.years} <span>·</span> {ep.place} <span>·</span> {ep.role}
              </p>
              <p className={styles.synopsis}>{ep.synopsis}</p>
              {ep.link && (
                <a className={styles.link} href={ep.link.href} target="_blank" rel="noreferrer">
                  {ep.link.label} ↗
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>

      <footer className={styles.credits}>
        {CREDITS.map((c) => (
          <p key={c.label}>
            <span>{c.label}</span>
            {c.value}
          </p>
        ))}
        <p>
          <span>Contact</span>
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </p>
        <a className={styles.link} href={LINKEDIN} target="_blank" rel="noreferrer">
          Full credits on LinkedIn ↗
        </a>
      </footer>

      <div className={styles.grain} aria-hidden />
    </div>
  );
}
