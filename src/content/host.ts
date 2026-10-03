// The "your host" inset on CH 01 · Hello cycles through these, in order.
// Crops come from scripts/photos.mjs (the "host" set).

export const HOST_PHOTOS = [
  "headshot",
  "corgi",
  "doorway",
  "japan",
  "harbor",
  "aquarium",
  "leaves",
  "red-robe",
].map((slug) => `/host/${slug}.jpg`);
