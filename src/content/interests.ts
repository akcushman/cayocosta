// CH 04 · Interests — the game-show board. Things I love.
// A `watch` link shows up when the board lands on (or you pick) that tile.

export type Interest = { name: string; watch?: { label: string; href: string } };

export const INTERESTS: Interest[] = [
  {
    name: "Aliens",
    watch: { label: "Watch The X-Files", href: "https://pluto.tv/us/shows/the-x-files/" },
  },
  {
    name: "Computers",
    watch: { label: "Watch The Computer Chronicles", href: "https://www.youtube.com/@ComputerChroniclesYT" },
  },
  { name: "Consumer branding & marketing" },
  { name: "Technology acceleration" },
  { name: "Why human labor gets more valuable" },
  { name: "National defense" },
  { name: "Tinned fish" },
  { name: "Consciousness" },
  { name: "Media, as a whole" },
  { name: "Relationships & bonds" },
  { name: "Boujee specialty grocery stores" },
  { name: "Protecting the mangroves" },
  { name: "Orca whales" },
  { name: "Jazz" },
];
