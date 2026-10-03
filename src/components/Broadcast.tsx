"use client";

import { useSyncExternalStore } from "react";
import { useTV } from "@/lib/useTV";
import PocketTV from "./PocketTV";
import TV from "./TV";
import WatchView from "./WatchView";
import styles from "./Broadcast.module.css";

const POCKET_QUERY = "(max-width: 700px)";

const subscribe = (onChange: () => void) => {
  const mq = window.matchMedia(POCKET_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

// One TV brain, two bodies: the living-room set on desktop and the pocket
// TV on phones. Before hydration we don't know the viewport, so both render
// (powered off) and CSS shows the right one.
export default function Broadcast() {
  const tv = useTV();
  const pocket = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(POCKET_QUERY).matches,
    () => null,
  );

  return (
    <>
      {pocket !== true && (
        <div className={pocket === null ? styles.desktopOnly : undefined}>
          <TV tv={tv} />
        </div>
      )}
      {pocket !== false && (
        <div className={pocket === null ? styles.pocketOnly : undefined}>
          <PocketTV tv={tv} />
        </div>
      )}
      {tv.watching && <WatchView channel={tv.channel} onClose={tv.closeWatch} />}
    </>
  );
}
