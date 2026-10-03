// Photos of AK: the "Your host" inset on CH 01 · Hello cycles through
// these, and AK Home Video plays them full size. Order is airing order.
// Crops and sizes come from scripts/photos.mjs (the "host" set).

import generated from "./host.generated.json";

const ORDER = ["headshot", "corgi", "doorway", "japan", "harbor", "aquarium", "leaves", "red-robe"] as const;

export type Tape = { slug: string; crop: string; full: string; year: string | null };

export const TAPES: Tape[] = ORDER.map((slug) => ({
  slug,
  crop: `/host/${slug}.jpg`,
  full: `/host/${slug}-full.jpg`,
  year: generated[slug].year,
}));
