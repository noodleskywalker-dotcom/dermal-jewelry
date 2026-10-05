// Optimized delivery only. The unmodified Skywork PNG masters remain in gitignored references/.
// Geometry is never generated or changed here, and these images never drive Face Studio.
import fs from "node:fs/promises";
import sharp from "sharp";
import { liftPaper } from "./build-product-renders.mjs";

const renders = [
  { family: "blade-trace", hero: [120, 650, 1850, 700], detail: [900, 750, 1050, 580] },
  { family: "crossline", hero: [200, 700, 1700, 600], detail: [1420, 750, 430, 450] },
  { family: "ankh-trace", hero: [560, 260, 950, 1600], detail: [650, 350, 800, 780] },
];
for (const { family, hero, detail } of renders) {
  const source = `references/skywork-output/2026-10-05/${family}.png`;
  const { data, info } = await sharp(source).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const transparent = await sharp(liftPaper(data, info.width, info.height), {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png().toBuffer();
  await fs.mkdir(`public/products/${family}`, { recursive: true });
  for (const [name, crop] of [["hero", hero], ["catalogue", hero], ["detail", detail]]) {
    const [left, top, width, height] = crop;
    let image = sharp(transparent).extract({ left, top, width, height });
    image = name === "catalogue"
      ? image.resize(840, 840, { fit: "contain", background: "transparent" })
      : image.resize({ width: Math.min(width, 1600), withoutEnlargement: true });
    const result = await image.webp({ quality: 85, alphaQuality: 90, effort: 5 }).toFile(`public/products/${family}/${name}.webp`);
    console.log(`${family}/${name}: ${result.width}x${result.height}, ${result.size} bytes`);
  }
}
