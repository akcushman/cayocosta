// CH 02 · Building — laid out as a cable channel guide. Each chapter is a
// "channel" row with its airtime and program.

export type Listing = {
  callsign: string;
  title: string;
  /** Short airtime for the guide row, e.g. "'16 – '20". */
  airtime: string;
  /** Still airing. */
  live?: boolean;
  years: string;
  place: string;
  role: string;
  synopsis: string;
  link?: { href: string; label: string };
};

export const LISTINGS: Listing[] = [
  {
    callsign: "HOME",
    title: "Pilot",
    airtime: "Earlier",
    years: "The early years",
    place: "Detroit, MI → Florida",
    role: "Kid of two U.S. Marines",
    synopsis: "Grew up outside Detroit, Michigan, with two Marines for parents. High school in Michigan and Florida.",
  },
  {
    callsign: "NAVY",
    title: "Corpsman",
    airtime: "’16 – ’20",
    years: "2016 – 2020",
    place: "Washington, DC",
    role: "U.S. Navy Hospital Corpsman",
    synopsis:
      "Stationed at Walter Reed National Military Medical Center. Meritoriously selected for the Executive Medicine team, with time in Hematology & Oncology.",
  },
  {
    callsign: "NCI",
    title: "Moonshot",
    airtime: "’20 – ’22",
    years: "2020 – 2022",
    place: "Washington, DC",
    role: "Special Projects, NCI / NIH",
    synopsis:
      "Worked for the Associate Director of the National Cancer Institute on precision medicine — NCI-MATCH, ComboMATCH and the Cancer Moonshot — alongside the engineering and bioinformatics teams.",
  },
  {
    callsign: "IBM",
    title: "Watson",
    airtime: "’22 – ’23",
    years: "2022 – 2023",
    place: "Austin, TX",
    role: "IBM Watson Health",
    synopsis: "Watson Health models and data, including the MarketScan databases and their delivery. Now Merative.",
  },
  {
    callsign: "SHIFT",
    title: "ShiftOS",
    airtime: "’23 – ’26",
    years: "2023 – 2026",
    place: "San Francisco, CA",
    role: "Co-Founder & CEO",
    synopsis:
      "Started as ShiftRx, on-demand pharmacy staffing, and became ShiftOS: an AI-native workforce platform for healthcare, led by Holly, an AI scheduling agent. Raised $6.8M, scaled to thousands of providers and facilities, acquired by Trusted Health.",
  },
  {
    callsign: "TRST",
    title: "Trusted Health",
    airtime: "’26 – Now",
    live: true,
    years: "2026 – Now",
    place: "San Francisco, CA",
    role: "Advisor",
    synopsis: "Advising Trusted Health after the ShiftOS acquisition.",
  },
  {
    callsign: "AK",
    title: "The Human Internet",
    airtime: "’26 – Now",
    live: true,
    years: "2026 – Now",
    place: "San Francisco, CA",
    role: "Founder & CEO",
    synopsis: "Building something new, for the human internet. Stay tuned.",
    link: { href: "https://maketheinternethumanagain.com", label: "Make the internet human again" },
  },
];

export const EDUCATION = "B.S. Information Technology, American University";
