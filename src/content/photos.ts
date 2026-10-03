// CH 05 · Photography. Order here is the order they air.
// Sizes, cameras and exposures come from scripts/photos.mjs. No captions:
// the photos speak for themselves.

import generated from "./photos.generated.json";

const ORDER = [
  "pelicans-at-dusk",
  "brown-pelican",
  "great-blue-heron",
  "sailboat-sunset",
  "gulls-shoreline",
  "golden-gate",
  "japanese-garden",
  "lake-and-mountains",
  "snowy-peaks",
  "peacock",
  "grey-parrot",
  "bee-on-goldenrod",
] as const;

export type Photo = {
  slug: string;
  src: string;
  thumb: string;
  width: number;
  height: number;
  camera: string | null;
  /** e.g. "218mm · f/6.3 · 1/320s · ISO 200" */
  exposure: string | null;
};

export const PHOTOS: Photo[] = ORDER.map((slug) => ({
  slug,
  src: `/photos/${slug}.jpg`,
  thumb: `/photos/${slug}-thumb.jpg`,
  ...generated[slug],
}));
