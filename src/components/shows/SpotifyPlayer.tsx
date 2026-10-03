"use client";

import { useEffect, useRef, useState } from "react";
import { EMBED_URL, PLAYLIST_ID } from "@/lib/spotify";

// The Spotify player. A plain embed shows instantly; once Spotify's iFrame
// API is ready (it's slow to boot, so preloadSpotify() starts it early) it
// takes over the player and starts the playlist. Browsers may still hold
// sound until the visitor touches the player; then it's one tap on ▶.

type Controller = {
  play: () => void;
  destroy: () => void;
  addListener: (event: string, cb: (e: { data: { isPaused?: boolean } }) => void) => void;
};
type IFrameAPI = {
  createController: (
    el: HTMLElement,
    options: { uri: string; width: string; height: number },
    cb: (controller: Controller) => void,
  ) => void;
};

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: IFrameAPI) => void;
    __spotifyIframeApi?: IFrameAPI;
  }
}

const SCRIPT = "https://open.spotify.com/embed/iframe-api/v1";

let apiPromise: Promise<IFrameAPI> | null = null;

/** Start loading the API now so it's ready by the time CH 06 opens. */
export function preloadSpotify() {
  void loadApi();
}

function loadApi(): Promise<IFrameAPI> {
  if (apiPromise) return apiPromise;
  if (window.__spotifyIframeApi) return (apiPromise = Promise.resolve(window.__spotifyIframeApi));
  return (apiPromise = new Promise((resolve) => {
    window.onSpotifyIframeApiReady = (api) => {
      window.__spotifyIframeApi = api;
      resolve(api);
    };
    if (!document.querySelector(`script[src="${SCRIPT}"]`)) {
      const s = document.createElement("script");
      s.src = SCRIPT;
      s.async = true;
      document.body.appendChild(s);
    }
  }));
}

export default function SpotifyPlayer({ className, height }: { className?: string; height: number }) {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"embed" | "playing" | "paused">("embed");

  useEffect(() => {
    let controller: Controller | null = null;
    let cancelled = false;
    loadApi().then((api) => {
      if (cancelled || !host.current) return;
      // The API replaces `target` with its own iframe. `host` holds no React
      // children, so React and the API never touch the same nodes.
      const target = document.createElement("div");
      host.current.appendChild(target);
      api.createController(target, { uri: `spotify:playlist:${PLAYLIST_ID}`, width: "100%", height }, (c) => {
        controller = c;
        setState("paused"); // hides the plain embed
        c.addListener("ready", () => c.play());
        c.addListener("playback_update", (e) => setState(e.data.isPaused ? "paused" : "playing"));
      });
    });
    return () => {
      cancelled = true;
      controller?.destroy();
    };
  }, [height]);

  return (
    <div className={className} data-state={state}>
      {state === "embed" && (
        <iframe
          src={EMBED_URL}
          title="AK's playlist on Spotify"
          width="100%"
          height={height}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        />
      )}
      <div ref={host} />
    </div>
  );
}
