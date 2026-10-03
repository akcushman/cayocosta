// Turns original photos into web copies.
//
//   node scripts/photos.mjs            # every set
//   node scripts/photos.mjs host       # just one set
//
// Sets live in scripts/photos.config.json; a photo is "file" or
// { file, focus: [x, y] } to centre a crop on a point (fractions of the
// width and height). Each becomes <out>/<slug>.jpg (2000px, or a fixed
// `crop` framed on the subject; crop sets also get an uncropped
// <slug>-full.jpg) plus <slug>-thumb.jpg (480px), and size, year and camera
// are written to the set's manifest. All metadata, GPS included, is stripped from the web
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
    const { file, focus } = typeof entry === "string" ? { file: entry } : entry;
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

    // Apply the EXIF orientation first; metadata is dropped on output.
    const { data: upright, info } = await sharp(input).rotate().toBuffer({ resolveWithObject: true });
    const jpeg = (img, quality) => img.jpeg({ quality, mozjpeg: true });

    let full;
    if (set.crop) {
      const [w, h] = set.crop;
      let img = sharp(upright);
      if (focus) {
        // Largest box of the crop's shape, centred on the focus point.
        const cw = Math.round(Math.min(info.width, (info.height * w) / h));
        const ch = Math.round((cw * h) / w);
        const clamp = (v, max) => Math.round(Math.min(Math.max(v, 0), max));
        img = img.extract({
          left: clamp(focus[0] * info.width - cw / 2, info.width - cw),
          top: clamp(focus[1] * info.height - ch / 2, info.height - ch),
          width: cw,
          height: ch,
        });
      }
      full = await jpeg(img.resize({ width: w, height: h, fit: "cover", position: sharp.strategy.attention }), 78).toFile(
        join(out, `${slug}.jpg`),
      );
      await jpeg(sharp(upright).resize(1600, 1600, { fit: "inside", withoutEnlargement: true }), 80).toFile(
        join(out, `${slug}-full.jpg`),
      );
    } else {
      full = await jpeg(sharp(upright).resize(2000, 2000, { fit: "inside", withoutEnlargement: true }), 78).toFile(
        join(out, `${slug}.jpg`),
      );
      await jpeg(sharp(upright).resize(480, 480, { fit: "inside" }), 70).toFile(join(out, `${slug}-thumb.jpg`));
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
