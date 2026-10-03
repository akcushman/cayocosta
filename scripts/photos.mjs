// Turns original photos into web copies.
//
//   node scripts/photos.mjs            # every set
//   node scripts/photos.mjs host       # just one set
//
// Sets live in scripts/photos.config.json; a photo is "file" or
// { file, position } to frame a crop by hand ("right", "top"…). Each becomes
// <out>/<slug>.jpg (2000px, or a fixed `crop` framed on the subject) plus
// <slug>-thumb.jpg (480px), and size, year and camera are written to the
// set's manifest. All metadata, GPS included, is stripped from the web
// copies; the originals are never modified.

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";

const root = new URL("..", import.meta.url).pathname;
const config = JSON.parse(readFileSync(join(root, "scripts/photos.config.json"), "utf8"));
const only = process.argv[2];
const tmp = mkdtempSync(join(tmpdir(), "photos-"));

async function processSet(name, set) {
  const source = set.source.replace(/^~/, homedir());
  const out = join(root, set.out);
  mkdirSync(out, { recursive: true });
  const manifest = {};

  for (const [slug, entry] of Object.entries(set.photos)) {
    const { file, position } = typeof entry === "string" ? { file: entry } : entry;
    let input = join(source, file);

    // sharp can't read HEIC; macOS sips can convert it.
    if (/\.heic$/i.test(file)) {
      const converted = join(tmp, `${name}-${slug}.jpg`);
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
    const resize = set.crop
      ? { width: set.crop[0], height: set.crop[1], fit: "cover", position: position ?? sharp.strategy.attention }
      : { width: 2000, height: 2000, fit: "inside", withoutEnlargement: true };
    const full = await sharp(input)
      .rotate()
      .resize(resize)
      .jpeg({ quality: 78, mozjpeg: true })
      .toFile(join(out, `${slug}.jpg`));
    if (!set.crop) {
      await sharp(input)
        .rotate()
        .resize(480, 480, { fit: "inside" })
        .jpeg({ quality: 70, mozjpeg: true })
        .toFile(join(out, `${slug}-thumb.jpg`));
    }

    manifest[slug] = { width: full.width, height: full.height, year, camera };
    console.log(`${name}/${slug}: ${full.width}×${full.height} ${(full.size / 1024).toFixed(0)}KB ${year ?? ""} ${camera ?? ""}`);
  }

  writeFileSync(join(root, set.manifest), JSON.stringify(manifest, null, 2) + "\n");
}

try {
  for (const [name, set] of Object.entries(config)) {
    if (!only || only === name) await processSet(name, set);
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
