// CH 02 · Building — told as a TV series, one episode per chapter.

export type Episode = {
  title: string;
  years: string;
  place: string;
  role: string;
  synopsis: string;
  link?: { href: string; label: string };
  /** The episode airing right now. */
  current?: boolean;
};

export const SERIES_TITLE = "The Story So Far";

export const EPISODES: Episode[] = [
  {
    title: "Pilot",
    years: "The early years",
    place: "Detroit, MI → Florida",
    role: "Kid of two U.S. Marines",
    synopsis:
      "Grew up outside Detroit, Michigan, with two Marines for parents. High school in Michigan and Florida.",
  },
  {
    title: "Corpsman",
    years: "2016 – 2020",
    place: "Washington, DC",
    role: "U.S. Navy Hospital Corpsman",
    synopsis:
      "Stationed at Walter Reed National Military Medical Center. Meritoriously selected for the Executive Medicine team, with time in Hematology & Oncology.",
  },
  {
    title: "Moonshot",
    years: "2020 – 2022",
    place: "Washington, DC",
    role: "Special Projects, NCI / NIH",
    synopsis:
      "Worked for the Associate Director of the National Cancer Institute on precision medicine — NCI-MATCH, ComboMATCH and the Cancer Moonshot — side by side with the engineering and bioinformatics teams.",
  },
  {
    title: "Watson",
    years: "2022 – 2023",
    place: "Austin, TX",
    role: "IBM Watson Health",
    synopsis:
      "Worked on Watson Health models and data, including the MarketScan databases and their delivery. Watson Health is now Merative.",
  },
  {
    title: "ShiftOS",
    years: "2023 – 2026",
    place: "San Francisco, CA",
    role: "Co-Founder & CEO",
    synopsis:
      "Started as ShiftRx, a marketplace staffing pharmacies on demand, and grew into ShiftOS: an AI-native workforce platform for healthcare, led by Holly, an AI scheduling agent. Raised $6.8M, scaled to thousands of providers and facilities across the US over three years, and was acquired by Trusted Health.",
  },
  {
    title: "The Human Internet",
    years: "2026 –",
    place: "San Francisco, CA",
    role: "Founder & CEO",
    synopsis: "Building something new, for the human internet. Stay tuned.",
    link: { href: "https://maketheinternethumanagain.com", label: "Make the internet human again" },
    current: true,
  },
];

export const CREDITS = [
  { label: "Education", value: "B.S. Information Technology, American University" },
  { label: "Also", value: "Advisor, Trusted Health" },
];
