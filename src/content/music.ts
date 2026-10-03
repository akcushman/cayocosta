// Background scores, by channel. Every recording here is public domain,
// CC0 or CC BY-SA, sourced from Wikimedia Commons; never add a recording
// without checking its licence. CC BY-SA ones must keep their credit.

export type Track = {
  src: string;
  /** Playback boost so every track lands near the same loudness (~-18 dB
   *  RMS), capped so peaks stay under full scale. Measured, not guessed. */
  gain: number;
  piece: string;
  performer: string;
  license: string;
  source: string;
};

const TRACKS = {
  bachPrelude: {
    src: "/music/bach-cello-prelude.mp3",
    gain: 2.12,
    piece: "Bach — Cello Suite No. 1, Prelude",
    performer: "John Michel, cello",
    license: "CC BY-SA 3.0",
    source: "https://commons.wikimedia.org/wiki/File:JOHN_MICHEL_CELLO-J_S_BACH_CELLO_SUITE_1_in_G_Prelude.ogg",
  },
  vivaldiWinter: {
    src: "/music/vivaldi-winter-largo.mp3",
    gain: 4.28,
    piece: "Vivaldi — The Four Seasons, Winter: Largo",
    performer: "The Modena Chamber Orchestra (Musopen)",
    license: "Public domain",
    source: "https://commons.wikimedia.org/wiki/File:The_Modena_Chamber_Orchestra_-_Vivaldi%27s_Winter,_RV_297_-_II._Largo.ogg",
  },
  bachSarabande: {
    src: "/music/bach-cello-sarabande.mp3",
    gain: 2.35,
    piece: "Bach — Cello Suite No. 1, Sarabande",
    performer: "John Michel, cello",
    license: "CC BY-SA 3.0",
    source: "https://commons.wikimedia.org/wiki/File:JOHN_MICHEL_CELLO-J_S_BACH_CELLO_SUITE_1_in_G_Sarabande.ogg",
  },
  vivaldiSpring: {
    src: "/music/vivaldi-spring-largo.mp3",
    gain: 3.25,
    piece: "Vivaldi — The Four Seasons, Spring: Largo",
    performer: "The Modena Chamber Orchestra (Musopen)",
    license: "Public domain",
    source: "https://commons.wikimedia.org/wiki/File:The_Modena_Chamber_Orchestra_-_Vivaldi%27s_Spring,_RV_269_-_II._Largo.ogg",
  },
  satie: {
    src: "/music/satie-gymnopedie-1.mp3",
    gain: 1.16,
    piece: "Satie — Gymnopédie No. 1",
    performer: "Teknopazzo",
    license: "CC0",
    source: "https://commons.wikimedia.org/wiki/File:Gymnopedie_No._1..ogg",
  },
  chopin: {
    src: "/music/chopin-nocturne-op9-2.mp3",
    gain: 1.0,
    piece: "Chopin — Nocturne in E-flat major, Op. 9 No. 2",
    performer: "Peter Johnston (Musopen)",
    license: "CC0",
    source: "https://commons.wikimedia.org/wiki/File:Chopin_Nocturne_No._2_in_E_Flat_Major,_Op._9.ogg",
  },
} satisfies Record<string, Track>;

/** Plays in order, then loops. Channels not listed are silent. */
export const CHANNEL_MUSIC: Record<string, Track[]> = {
  building: [TRACKS.bachPrelude, TRACKS.vivaldiWinter, TRACKS.bachSarabande, TRACKS.vivaldiSpring],
  photography: [TRACKS.satie, TRACKS.chopin],
};
