"use client";

import { useState } from "react";
import { EMAIL, LINKEDIN } from "@/content/contact";
import { EDUCATION, LISTINGS } from "@/content/story";
import MusicCredit from "../MusicCredit";
import styles from "./BuildingShow.module.css";

// CH 02: a 90s cable channel guide. One row per channel (chapter) with its
// airtime and program; the box up top describes the highlighted listing.

export default function BuildingShow() {
  const [selected, setSelected] = useState(LISTINGS.length - 1);
  const show = LISTINGS[selected];

  return (
    <div className={styles.show}>
      <div className={styles.guide}>
        <section className={styles.info} aria-live="polite">
          <div className={styles.infoMain}>
            <p className={styles.infoMeta}>
              <span className={styles.infoCall}>{show.callsign}</span>
              {show.years} · {show.place}
            </p>
            <h1 className={styles.infoTitle}>{show.title}</h1>
            <p className={styles.infoRole}>{show.role}</p>
            <p className={styles.infoSynopsis}>{show.synopsis}</p>
            {show.link && (
              <a className={styles.infoLink} href={show.link.href} target="_blank" rel="noreferrer">
                {show.link.label} ↗
              </a>
            )}
          </div>
          <div className={styles.brand}>
            <p className={styles.brandName}>AK Guide</p>
            <p className={styles.brandSub}>The story so far</p>
          </div>
        </section>

        <div className={styles.grid} role="list">
          <div className={styles.head}>Ch</div>
          <div className={styles.head}>Airtime</div>
          <div className={styles.head}>Program</div>

          {LISTINGS.map((l, i) => (
            <button
              key={l.callsign}
              role="listitem"
              className={styles.row}
              data-selected={i === selected}
              onClick={() => setSelected(i)}
              onMouseEnter={() => setSelected(i)}
              onFocus={() => setSelected(i)}
            >
              <span className={styles.call}>
                <span className={styles.callNum}>{String(i + 1).padStart(2, "0")}</span>
                {l.callsign}
              </span>
              <span className={styles.airtime}>{l.airtime}</span>
              <span className={styles.program}>
                <span className={styles.programTitle}>{l.title}</span>
                <span className={styles.programRole}>{l.role}</span>
                {l.live && <span className={styles.live}>Live</span>}
              </span>
            </button>
          ))}
        </div>

        <footer className={styles.footer}>
          <span>
            <b>Education</b> {EDUCATION}
          </span>
          <a href={`mailto:${EMAIL}`}>
            <b>Contact</b> {EMAIL}
          </a>
          <a href={LINKEDIN} target="_blank" rel="noreferrer">
            <b>Full credits</b> LinkedIn ↗
          </a>
        </footer>
        <MusicCredit channel="building" className={styles.music} />
      </div>
    </div>
  );
}
