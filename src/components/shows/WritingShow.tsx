"use client";

import { useEffect, useState } from "react";
import { SUBSTACK_URL, type Post } from "@/lib/substack";
import styles from "./WritingShow.module.css";

// CH 03: Teletext. The index is page 100 and each post gets its own page
// from 101. Type a page number, or use the four Fastext buttons.

const INDEX = 100;

const pageDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
    timeZone: "America/Los_Angeles", // as published, in SF
  });

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

// Mosaic blocks for the banner, in the teletext palette.
const MOSAIC = "rryyggccbbmmrryyggccbbmmrryyggccbbmmrryy";

export default function WritingShow({ posts }: { posts: Post[] }) {
  const [page, setPage] = useState(INDEX);
  const [typed, setTyped] = useState("");
  const now = useClock();

  const last = INDEX + posts.length;
  const post = page > INDEX ? posts[page - INDEX - 1] : null;
  const go = (p: number) => setPage(p > last ? INDEX : p < INDEX ? last : p);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        const next = (typed + e.key).slice(-3);
        if (next.length === 3) {
          const n = Number(next);
          if (n >= INDEX && n <= last) setPage(n);
          setTyped("");
        } else setTyped(next);
      } else if (e.key === "ArrowRight") go(page + 1);
      else if (e.key === "ArrowLeft") go(page - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const shown = typed ? `P${typed.padEnd(3, "-")}` : `P${page}`;

  return (
    <div className={styles.show}>
      <div className={styles.screen}>
        <p className={styles.header}>
          <span className={styles.white}>{shown}</span>
          <span className={styles.yellow}>AK-TEXT</span>
          <span className={styles.white}>{page}</span>
          <span className={styles.cyan}>
            {now?.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })}
          </span>
          <span className={styles.yellow}>{now?.toLocaleTimeString("en-GB")}</span>
        </p>

        <div className={styles.mosaic} aria-hidden>
          {MOSAIC.split("").map((c, i) => (
            <span key={i} className={styles[c]} />
          ))}
        </div>

        {post ? (
          <article className={styles.page} key={page}>
            <div className={styles.banner} data-color="red">
              <h1 className={styles.double}>{post.title}</h1>
            </div>
            <p className={styles.yellow}>{post.subtitle}</p>
            <p className={styles.green}>Published {pageDate(post.date)}</p>
            <div className={styles.body}>
              {post.excerpt.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <a className={styles.continue} href={post.url} target="_blank" rel="noreferrer">
              ▶ Continued on Substack
            </a>
          </article>
        ) : (
          <section className={styles.page} key={page}>
            <div className={styles.banner} data-color="blue">
              <h1 className={styles.double}>WRITING</h1>
            </div>
            <p className={styles.cyan}>Writings about life, technology & business</p>
            {posts.length === 0 ? (
              <p className={styles.red}>Pages not in transmission. Try again later.</p>
            ) : (
              <ul className={styles.index}>
                {posts.map((p, i) => (
                  <li key={p.url}>
                    <button onClick={() => setPage(INDEX + 1 + i)}>
                      <span className={i % 2 ? styles.cyan : styles.white}>{p.title}</span>
                      <span className={styles.leader} />
                      <span className={styles.yellow}>{INDEX + 1 + i}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className={styles.green}>Type a page number, or use the coloured keys</p>
          </section>
        )}
      </div>

      <nav className={styles.fastext}>
        <button data-color="red" onClick={() => go(page - 1)}>
          ◀ Prev
        </button>
        <button data-color="green" onClick={() => go(page + 1)}>
          Next ▶
        </button>
        <button data-color="yellow" onClick={() => setPage(INDEX)}>
          Index
        </button>
        <a data-color="cyan" href={post?.url ?? SUBSTACK_URL} target="_blank" rel="noreferrer">
          Substack
        </a>
      </nav>
    </div>
  );
}
