// Reads posts from the Substack RSS feed. Cached for an hour, so new
// posts show up on the site without a redeploy.

export const SUBSTACK_URL = "https://autumnkyoko.substack.com";
const FEED = `${SUBSTACK_URL}/feed`;

export type Post = {
  title: string;
  subtitle: string;
  url: string;
  date: string; // ISO
  /** The opening paragraphs, as plain text. */
  excerpt: string[];
};

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

const decode = (s: string) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&(\w+);/g, (m, name) => ENTITIES[name] ?? m);

const field = (item: string, tag: string) => {
  const m = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  if (!m) return "";
  return m[1].replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, "$1").trim();
};

const toText = (html: string) => decode(html.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();

const EXCERPT_CHARS = 700;

function excerptOf(html: string) {
  const paragraphs = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => toText(m[1])).filter(Boolean);
  const out: string[] = [];
  let length = 0;
  for (const p of paragraphs) {
    if (length > 0 && length + p.length > EXCERPT_CHARS) break;
    out.push(p);
    length += p.length;
  }
  return out;
}

export function parseFeed(xml: string): Post[] {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, item]) => ({
    title: toText(field(item, "title")),
    subtitle: toText(field(item, "description")),
    url: field(item, "link"),
    date: new Date(field(item, "pubDate")).toISOString(),
    excerpt: excerptOf(field(item, "content:encoded")),
  }));
}

export async function getPosts(): Promise<Post[]> {
  try {
    const res = await fetch(FEED, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return parseFeed(await res.text());
  } catch {
    // The TV still works if Substack is down; Writing just shows no posts.
    return [];
  }
}
