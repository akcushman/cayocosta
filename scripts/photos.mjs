// Turns original photos into web copies.
//
//   node scripts/photos.mjs            # every set
//   node scripts/photos.mjs host       # just one set
//
// File names carry a content hash (headshot-3f9a2c.jpg), so an edited photo
// gets a new URL and no browser or CDN can serve the old one.
//
// Sets live in scripts/photos.config.json; a photo is "file" or
// { file, focus: [x, y] } to centre a crop on a point (fractions of the
// width and height). Each becomes <out>/<slug>.jpg (2000px, or a fixed
// `crop` framed on the subject; crop sets also get an uncropped
// <slug>-full.jpg) plus <slug>-thumb.jpg (480px), and size, camera and
// exposure are written to the set's manifest. (No dates: camera clocks
// and edit histories make them unreliable.) All metadata, GPS included, is stripped from the web
// copies; the originals are never modified.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import exifReader from "exif-reader";
import sharp from "sharp";

const root = new URL("..", import.meta.url).pathname;
const config = JSON.parse(readFileSync(join(root, "scripts/photos.config.json"), "utf8"));
const only = process.argv[2];
const tmp = mkdtempSync(join(tmpdir(), "photos-"));

async function processSet(name, set) {
  const source = set.source.replace(/^~/, homedir());
  const out = join(root, set.out);
  mkdirSync(out, { recursive: true });
  for (const f of readdirSync(out)) rmSync(join(out, f));
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
    const { Image: image = {}, Photo: photo = {} } = exif ? exifReader(exif) : {};
    const camera = image.Model ? String(image.Model).trim() : null;
    // e.g. "218mm · f/6.3 · 1/320s · ISO 200"
    const shutter = photo.ExposureTime
      ? photo.ExposureTime >= 1
        ? `${photo.ExposureTime}s`
        : `1/${Math.round(1 / photo.ExposureTime)}s`
      : null;
    const exposure =
      [
        photo.FocalLength && `${Math.round(photo.FocalLength)}mm`,
        photo.FNumber && `f/${Number(photo.FNumber.toFixed(1))}`,
        shutter,
        photo.ISOSpeedRatings && `ISO ${photo.ISOSpeedRatings}`,
      ]
        .filter(Boolean)
        .join(" · ") || null;

    // Apply the EXIF orientation first; metadata is dropped on output.
    const { data: upright, info } = await sharp(input).rotate().toBuffer({ resolveWithObject: true });
    const files = {};
    // Encode, then save as <slug><suffix>-<hash>.jpg.
    const save = async (img, quality, suffix = "") => {
      const { data, info } = await img.jpeg({ quality, mozjpeg: true }).toBuffer({ resolveWithObject: true });
      const name = `${slug}${suffix}-${createHash("sha1").update(data).digest("hex").slice(0, 8)}.jpg`;
      writeFileSync(join(out, name), data);
      files[suffix || "main"] = `/${set.out.replace(/^public\//, "")}/${name}`;
      return { ...info, size: data.length };
    };

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
      full = await save(img.resize({ width: w, height: h, fit: "cover", position: sharp.strategy.attention }), 78);
      await save(sharp(upright).resize(1600, 1600, { fit: "inside", withoutEnlargement: true }), 80, "-full");
    } else {
      full = await save(sharp(upright).resize(2000, 2000, { fit: "inside", withoutEnlargement: true }), 78);
      await save(sharp(upright).resize(480, 480, { fit: "inside" }), 70, "-thumb");
    }

    manifest[slug] = { files, width: full.width, height: full.height, camera, exposure };
    console.log(`${name}/${slug}: ${full.width}×${full.height} ${(full.size / 1024).toFixed(0)}KB ${camera ?? ""} ${exposure ?? ""}`);
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
