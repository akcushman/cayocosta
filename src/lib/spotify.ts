// Reads the On Air playlist from Spotify's public embed page (the same
// data the embedded player uses). Cached for an hour. If Spotify changes
// the page, this returns null and the show still airs the player itself.

export const PLAYLIST_ID = "3OW6jB78GIZSLQfc31IAY3";
export const PLAYLIST_URL = `https://open.spotify.com/playlist/${PLAYLIST_ID}`;
export const EMBED_URL = `https://open.spotify.com/embed/playlist/${PLAYLIST_ID}?utm_source=generator&theme=0`;

export type Track = { title: string; artist: string };
export type Playlist = { name: string; cover: string | null; tracks: Track[] };

type EmbedEntity = {
  name?: string;
  coverArt?: { sources?: { url: string }[] };
  trackList?: { title?: string; subtitle?: string }[];
};

export async function getPlaylist(): Promise<Playlist | null> {
  try {
    const res = await fetch(`https://open.spotify.com/embed/playlist/${PLAYLIST_ID}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const json = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/)?.[1];
    if (!json) return null;

    const entity: EmbedEntity | undefined = JSON.parse(json)?.props?.pageProps?.state?.data?.entity;
    if (!entity?.name) return null;

    return {
      name: entity.name,
      cover: entity.coverArt?.sources?.[0]?.url ?? null,
      tracks: (entity.trackList ?? [])
        .filter((t) => t.title)
        .map((t) => ({ title: t.title!, artist: t.subtitle ?? "" })),
    };
  } catch {
    return null;
  }
}
