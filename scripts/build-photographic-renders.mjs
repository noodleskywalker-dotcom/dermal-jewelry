// Delivery resizing for the Skywork photographic set. Keep the photographed lighting, highlights
// and background opaque. This script never removes a background or rebuilds product geometry.
//
// Sources: references/skywork-output/2026-10-05-hyperreal/<slot>.png
// Optional dedicated close view: <slot>-detail.png
// Run all downloaded slots: node scripts/build-photographic-renders.mjs
// Run selected slots:       node scripts/build-photographic-renders.mjs blade-trace crossline
// List the source contract: node scripts/build-photographic-renders.mjs --list
//
// Prefer square source images, 2048px or larger, with the entire piece inside the frame.
// Non-square sources retain their whole composition; only the square thumbnail gains a paper margin.
// Missing sources leave existing catalog images in place. The manifest contains completed files only.

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(ROOT, "references/skywork-output/2026-10-05-hyperreal");
const OUTPUT = path.join(ROOT, "public/products/photographic");
const MANIFEST = path.join(ROOT, "lib/catalog/photographic-manifest.json");
const PAPER = "#f1ede7";
const SLOTS = [
  "desert-eye-love",
  "horus-trace",
  "blade-trace",
  "crossline",
  "ankh-trace",
  "japanese-angel",
  "ankh-eye",
  "crimson-orbit",
  "sand-vortex",
  "void-stud",
  "desert-eye-symbol",
  "desert-eye-gem",
];

async function exists(file) {
  try {
    const stat = await fs.stat(file);
    return stat.isFile() && stat.size > 0;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function delivered(slot) {
  const entry = {};
  for (const [key, name] of [["hero", "hero"], ["catalogue", "thumb"], ["detail", "detail"]]) {
    const file = path.join(OUTPUT, slot, `${name}.webp`);
    if (!await exists(file)) return undefined;
    const meta = await sharp(file).metadata();
    if (meta.format !== "webp" || meta.hasAlpha || !meta.width || !meta.height) {
      throw new Error(`${slot}/${name}.webp must be a valid opaque WebP.`);
    }
    entry[key] = { src: `/products/photographic/${slot}/${name}.webp`, width: meta.width, height: meta.height };
  }
  if (entry.catalogue.width !== entry.catalogue.height) throw new Error(`${slot}/thumb.webp must be square.`);
  return entry;
}

async function build(slot) {
  const source = path.join(SOURCE, `${slot}.png`);
  if (!await exists(source)) {
    console.log(`${slot}: no source yet; keeping the current image.`);
    return;
  }
  const detailSource = path.join(SOURCE, `${slot}-detail.png`);
  const closeView = await exists(detailSource) ? detailSource : source;
  const output = path.join(OUTPUT, slot);
  await fs.mkdir(output, { recursive: true });
  for (const name of ["hero", "detail", "thumb"]) {
    const image = sharp(name === "detail" ? closeView : source)
      .rotate()
      .flatten({ background: PAPER })
      .toColourspace("srgb");
    if (name === "thumb") {
      image.resize(840, 840, { fit: "contain", background: PAPER });
    } else {
      const edge = name === "hero" ? 1800 : 1600;
      image.resize(edge, edge, { fit: "inside", withoutEnlargement: true });
    }
    const target = path.join(output, `${name}.webp`);
    const temporary = `${target}.tmp`;
    const result = await image.webp({ quality: 92, effort: 6 }).toFile(temporary);
    await fs.rename(temporary, target);
    console.log(`${slot}/${name}: ${result.width}×${result.height}, ${result.size} bytes`);
  }
}

const args = process.argv.slice(2);
if (args.includes("--list")) {
  console.log(SLOTS.map((slot) => `${slot}.png (optional: ${slot}-detail.png)`).join("\n"));
} else {
  const selected = args.length ? [...new Set(args)] : SLOTS;
  for (const slot of selected) {
    if (!SLOTS.includes(slot)) throw new Error(`Unknown source slot: ${slot}. Use --list to see the supported slots.`);
  }
  for (const slot of selected) await build(slot);
  // Re-read delivery files, including earlier successful runs. Only complete sets become visible.
  const manifest = {};
  for (const slot of SLOTS) {
    const entry = await delivered(slot);
    if (entry) manifest[slot] = entry;
  }
  const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
  let previous;
  try {
    previous = await fs.readFile(MANIFEST, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (previous !== serialized) {
    await fs.writeFile(`${MANIFEST}.tmp`, serialized);
    await fs.rename(`${MANIFEST}.tmp`, MANIFEST);
  }
  console.log(`Photographic catalog: ${Object.keys(manifest).length}/${SLOTS.length} complete image sets.`);
}
