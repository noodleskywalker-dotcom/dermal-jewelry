// Scans public/products for exact product assets and writes lib/catalog/asset-manifest.json.
// Runs automatically before `npm run dev` and `npm run build`, or by hand: npm run assets:sync
//
// Slot naming (see docs/production/ASSET_SLOT.md), one source image per piece of a form:
//   public/products/<product-slug>/<form-id>/<component-id>.webp         the approved orientation
//   public/products/<product-slug>/<form-id>/<component-id>.right.webp   optional right-side image
// .png is accepted as well. When both exist, .webp wins.
import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dirs = (root) => readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();

export function scanProductAssets(root) {
  const manifest = {};
  if (!existsSync(root)) return manifest;
  for (const slug of dirs(root)) {
    for (const form of dirs(path.join(root, slug))) {
      const files = readdirSync(path.join(root, slug, form)).sort();
      for (const ext of ["png", "webp"]) {
        for (const file of files) {
          const match = file.match(new RegExp(`^([a-z-]+)(\\.right)?\\.${ext}$`));
          if (!match) continue;
          manifest[`${slug}:${form}:${match[1]}:${match[2] ? "right" : "left"}`] = `/products/${slug}/${form}/${file}`;
        }
      }
    }
  }
  return manifest;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const root = fileURLToPath(new URL("../public/products/", import.meta.url));
  const out = fileURLToPath(new URL("../lib/catalog/asset-manifest.json", import.meta.url));
  const manifest = scanProductAssets(root);
  writeFileSync(out, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`product assets: ${Object.keys(manifest).length} found`);
}
