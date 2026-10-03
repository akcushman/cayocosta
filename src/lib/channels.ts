// The channel lineup. Order here is the order you flip through them.
// Keep numbers consecutive — skipped numbers read as a glitch.

export type Channel = {
  number: number;
  slug: string;
  title: string;
  tagline: string;
  /** Background for the channel's broadcast screen. */
  color: string;
  /** The sign-on screen: first thing you see, nothing to open. */
  home?: boolean;
};

export const ROLES = [
  "Founder",
  "Technology lover",
  "Optimist",
  "Pro-humanist",
  "U.S. Navy veteran",
  "& many more things",
];

export const CHANNELS: Channel[] = [
  {
    number: 1,
    slug: "hello",
    title: "Hello",
    tagline: "Thanks for tuning in",
    color: "linear-gradient(160deg, #1d3557 0%, #0b1320 100%)",
    home: true,
  },
  {
    number: 2,
    slug: "building",
    title: "Building",
    tagline: "The story so far, in six episodes",
    color: "linear-gradient(160deg, #6a1b1b 0%, #1a0707 100%)",
  },
  {
    number: 3,
    slug: "writing",
    title: "Writing",
    tagline: "Writings about life, technology & business",
    color: "linear-gradient(160deg, #4a3b12 0%, #140f03 100%)",
  },
  {
    number: 4,
    slug: "interests",
    title: "Interests",
    tagline: "Things I love to talk about",
    color: "linear-gradient(160deg, #134a5c 0%, #04131a 100%)",
  },
  {
    number: 5,
    slug: "photography",
    title: "Photography",
    tagline: "Through my lens",
    color: "linear-gradient(160deg, #3b1f5c 0%, #0f0719 100%)",
  },
  {
    number: 6,
    slug: "on-air",
    title: "On Air",
    tagline: "What's playing on my Spotify",
    color: "linear-gradient(160deg, #0f5132 0%, #04140c 100%)",
  },
];
