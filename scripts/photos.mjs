// Turns original photos into web copies for CH 05 · Photography.
//
//   node scripts/photos.mjs
//
// Reads scripts/photos.config.json ({ slug: original filename }), writes
// public/photos/<slug>.jpg (2000px) and <slug>-thumb.jpg (480px), and
// records size, year and camera in src/content/photos.generated.json.
// All metadata (GPS included) is stripped from the web copies; the
// originals are never modified. Captions live in src/content/photos.ts.

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";

const root = new URL("..", import.meta.url).pathname;
const config = JSON.parse(readFileSync(join(root, "scripts/photos.config.json"), "utf8"));
const source = config.source.replace(/^~/, homedir());
const out = join(root, "public/photos");
const tmp = mkdtempSync(join(tmpdir(), "photos-"));

const manifest = {};
try {
  for (const [slug, file] of Object.entries(config.photos)) {
    let input = join(source, file);

    // sharp can't read HEIC; macOS sips can convert it.
    if (/\.heic$/i.test(file)) {
      const converted = join(tmp, `${slug}.jpg`);
      execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "100", input, "--out", converted], {
        stdio: "ignore",
      });
      input = converted;
    }

    const { exif } = await sharp(input).metadata();
    const exifText = exif ? exif.toString("latin1") : "";
    // EXIF holds several dates (taken, edited…); the earliest is when it was shot.
    const years = [...exifText.matchAll(/(\d{4}):\d{2}:\d{2} \d{2}:\d{2}:\d{2}/g)].map((m) => Number(m[1]));
    const year = years.length ? String(Math.min(...years)) : null;
    const camera = exifText.match(/(Canon [\w ]+?|iPhone [\w ]+?)\0/)?.[1]?.trim() ?? null;

    // .rotate() applies the EXIF orientation before metadata is dropped.
    const full = await sharp(input)
      .rotate()
      .resize(2000, 2000, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 78, mozjpeg: true })
      .toFile(join(out, `${slug}.jpg`));
    await sharp(input)
      .rotate()
      .resize(480, 480, { fit: "inside" })
      .jpeg({ quality: 70, mozjpeg: true })
      .toFile(join(out, `${slug}-thumb.jpg`));

    manifest[slug] = { width: full.width, height: full.height, year, camera };
    console.log(`${slug}: ${full.width}×${full.height} ${(full.size / 1024).toFixed(0)}KB ${year ?? ""} ${camera ?? ""}`);
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

writeFileSync(join(root, "src/content/photos.generated.json"), JSON.stringify(manifest, null, 2) + "\n");
