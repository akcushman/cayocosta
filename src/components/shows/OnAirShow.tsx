"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { EMBED_URL, PLAYLIST_URL, type Playlist } from "@/lib/spotify";
import styles from "./OnAirShow.module.css";

// CH 06: 90s music television. A logo that never sits still, music-video
// credits, heavy rotation, and the actual playlist in the player.

const LOGO_VARIANTS = 5;
const HEAVY_ROTATION = 12;

export default function OnAirShow({ playlist }: { playlist: Playlist | null }) {
  const [variant, setVariant] = useState(0);
  const [credit, setCredit] = useState(0);
  const tracks = playlist?.tracks ?? [];

  useEffect(() => {
    const id = setInterval(() => setVariant((v) => (v + 1) % LOGO_VARIANTS), 2200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!tracks.length) return;
    const id = setInterval(() => setCredit((c) => (c + 1) % tracks.length), 4500);
    return () => clearInterval(id);
  }, [tracks.length]);

  const now = tracks[credit];

  return (
    <div className={styles.show}>
      <div className={styles.shapes} aria-hidden>
        <span className={styles.squiggle} />
        <span className={styles.triangle} />
        <span className={styles.dots} />
        <span className={styles.circle} />
      </div>

      <header className={styles.header}>
        <div className={styles.logo} data-variant={variant} aria-label="AK">
          AK
        </div>
        <div>
          <p className={styles.kicker}>Music Television</p>
          <h1 className={styles.title}>On Air</h1>
        </div>
      </header>

      <section className={styles.stage}>
        <div className={styles.video}>
          {playlist?.cover && (
            <Image className={styles.cover} src={playlist.cover} alt="" fill sizes="(max-width: 700px) 100vw, 50vw" />
          )}
          <div className={styles.scan} aria-hidden />
          {now && (
            // Classic bottom-left music-video credit.
            <div className={styles.credit} key={credit}>
              <p className={styles.artist}>{now.artist}</p>
              <p className={styles.song}>&ldquo;{now.title}&rdquo;</p>
              <p className={styles.album}>{playlist?.name} · AK</p>
            </div>
          )}
        </div>

        <div className={styles.player}>
          <p className={styles.label}>
            <span className={styles.rec}>●</span> Now in rotation: <strong>{playlist?.name ?? "the playlist"}</strong>
          </p>
          <iframe
            className={styles.embed}
            src={EMBED_URL}
            title="AK's playlist on Spotify"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
      </section>

      {tracks.length > 0 && (
        <section className={styles.rotation}>
          <h2 className={styles.rotationTitle}>Heavy Rotation</h2>
          <ol className={styles.list}>
            {tracks.slice(0, HEAVY_ROTATION).map((t, i) => (
              <li key={`${t.title}-${i}`}>
                <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
                <span className={styles.trackArtist}>{t.artist}</span>
                <span className={styles.trackTitle}>&ldquo;{t.title}&rdquo;</span>
              </li>
            ))}
          </ol>
          <a className={styles.more} href={PLAYLIST_URL} target="_blank" rel="noreferrer">
            {tracks.length > HEAVY_ROTATION ? `+ ${tracks.length - HEAVY_ROTATION} more · ` : ""}Open in Spotify ↗
          </a>
        </section>
      )}
    </div>
  );
}
