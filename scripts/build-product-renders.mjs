// Builds the web delivery images for the owner's product renders of 26 September 2026.
//
// The sources are the owner's design renders, kept local and gitignored in
// references/renders/2026-09-26/. They are never copied to public/ as they are: each one is
// cropped, its paper background is lifted out so the piece stands directly on DERMAL's paper with
// no image box, and it is written as WebP.
//
// The DESERT EYE sheet has words laid into the image ("TITANIUM", "HAND POLISHED", a franchise name,
// a "T1" mark). They are unverified material claims, so they are cropped away or painted out and
// never reach the site.
//
// Run: node scripts/build-product-renders.mjs

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = "references/renders/2026-09-26";
const OUT = "public/products";

/** Crop rectangles are in source pixels: [left, top, width, height]. */
const RENDERS = [
  {
    family: "desert-eye",
    source: "desert-eye-source.png",
    // The "FRONT VIEW" caption sits inside the front-view crop, so it is painted out.
    blank: [[40, 495, 190, 45]],
    hero: [60, 70, 1070, 510],
    catalogue: [100, 90, 980, 485],
    // The angled view from the lower-left panel. The side and back views carry a "T1" mark and hardware
    // detail that nobody has confirmed, so they are not used.
    detail: [20, 625, 455, 350],
  },
  {
    family: "horus-trace",
    source: "horus-trace-source.png",
    hero: [0, 0, 1448, 1086],
    catalogue: [255, 180, 1010, 800],
    detail: [560, 250, 520, 390],
  },
  {
    family: "japanese-angel",
    source: "japanese-angel-source.png",
    hero: [0, 0, 1448, 1086],
    catalogue: [110, 80, 1150, 900],
    detail: [590, 250, 590, 470],
  },
  {
    family: "ankh-eye",
    source: "ankh-eye-source.png",
    hero: [0, 0, 1448, 1086],
    catalogue: [150, 50, 1160, 990],
    detail: [175, 330, 560, 480],
  },
];

/** Solves a small dense linear system by Gaussian elimination with partial pivoting. */
function solve(A, b) {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let pivot = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[pivot][c])) pivot = r;
    [M[c], M[pivot]] = [M[pivot], M[c]];
    for (let r = c + 1; r < n; r++) {
      const f = M[r][c] / (M[c][c] || 1e-12);
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let v = M[r][n];
    for (let k = r + 1; k < n; k++) v -= M[r][k] * x[k];
    x[r] = v / (M[r][r] || 1e-12);
  }
  return x;
}

const terms = (u, v) => [1, u, v, u * u, u * v, v * v, u * u * u, u * u * v, u * v * v, v * v * v];

/**
 * The paper's lighting across one crop, as a smooth cubic surface per channel, evaluated into a flat
 * map. The crop is cut into small cells; a busy cell (an edge of the piece) or one far from the
 * surface (the piece itself) is dropped and the surface refitted, until only paper describes the paper.
 */
function fitPaper(data, width, height) {
  const CELL = 16;
  const cells = [];
  for (let cy = 0; cy + CELL <= height; cy += CELL) {
    for (let cx = 0; cx + CELL <= width; cx += CELL) {
      const vals = [[], [], []];
      for (let y = cy; y < cy + CELL; y += 2)
        for (let x = cx; x < cx + CELL; x += 2) for (let c = 0; c < 3; c++) vals[c].push(data[(y * width + x) * 3 + c]);
      const med = vals.map((v) => v.sort((a, b) => a - b)[v.length >> 1]);
      const lum = vals[1];
      const spread = lum[Math.floor(lum.length * 0.9)] - lum[Math.floor(lum.length * 0.1)];
      cells.push({ t: terms((cx + CELL / 2) / width - 0.5, (cy + CELL / 2) / height - 0.5), med, spread });
    }
  }
  const evaluate = (k, t) => k.reduce((s, ki, i) => s + ki * t[i], 0);
  let keep = cells.filter((c) => c.spread <= 6);
  let coef = [];
  for (let pass = 0; pass < 6; pass++) {
    coef = [0, 1, 2].map((ch) => {
      const n = 10;
      const A = Array.from({ length: n }, () => new Array(n).fill(0));
      const b = new Array(n).fill(0);
      for (const cell of keep) {
        for (let i = 0; i < n; i++) {
          b[i] += cell.t[i] * cell.med[ch];
          for (let j = 0; j < n; j++) A[i][j] += cell.t[i] * cell.t[j];
        }
      }
      return solve(A, b);
    });
    const tol = pass < 2 ? 14 : 5;
    const next = keep.filter((cell) => [0, 1, 2].every((ch) => Math.abs(cell.med[ch] - evaluate(coef[ch], cell.t)) <= tol));
    if (next.length < 30) break;
    keep = next;
  }
  const map = new Float32Array(width * height * 3);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const t = terms(x / width - 0.5, y / height - 0.5);
      for (let ch = 0; ch < 3; ch++) {
        const k = coef[ch];
        map[(y * width + x) * 3 + ch] =
          k[0] + k[1] * t[1] + k[2] * t[2] + k[3] * t[3] + k[4] * t[4] + k[5] * t[5] + k[6] * t[6] + k[7] * t[7] + k[8] * t[8] + k[9] * t[9];
      }
    }
  }
  return map;
}

/**
 * The piece without its paper. Each pixel is divided by the paper's own lighting at that point, so
 * the paper becomes white everywhere; the last few levels of near-white roll to white; then white is
 * turned into transparency, keeping the render's own soft shadow as a translucent shadow. The outer
 * edge of the crop is feathered so no line can show where the crop was cut.
 */
function liftPaper(data, width, height, blanks) {
  const paper = fitPaper(data, width, height);
  const out = Buffer.alloc(width * height * 4);
  const KNEE = 238;
  const FEATHER = Math.round(Math.min(width, height) * 0.1);
  const HAZE = 0.045;
  const blanked = (x, y) => blanks.some(([l, t, w, h]) => x >= l && x < l + w && y >= t && y < t + h);
  const rgb = [0, 0, 0];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if (blanks.length && blanked(x, y)) continue;
      let alpha = 0;
      for (let c = 0; c < 3; c++) {
        let v = Math.min(255, (data[i * 3 + c] * 255) / Math.max(paper[i * 3 + c], 1));
        if (v > KNEE) v = KNEE + ((v - KNEE) / (255 - KNEE)) ** 2 * (255 - KNEE);
        rgb[c] = v;
        alpha = Math.max(alpha, (255 - v) / 255);
      }
      // The last faint haze of the paper's lighting goes entirely; a real shadow is darker than this
      // and is kept, with a soft ramp so its edge never shows.
      if (alpha < HAZE) continue;
      if (alpha < HAZE * 2.5) alpha *= (alpha - HAZE) / (HAZE * 1.5);
      const edge = Math.min(x, y, width - 1 - x, height - 1 - y);
      const t = Math.min(1, edge / FEATHER);
      const feather = t * t * (3 - 2 * t);
      if (alpha * feather <= 0.01) continue;
      const o = i * 4;
      const opacity = Math.max(...rgb.map((v) => (255 - v) / 255));
      for (let c = 0; c < 3; c++) out[o + c] = Math.round(Math.max(0, 255 - (255 - rgb[c]) / opacity));
      out[o + 3] = Math.round(alpha * feather * 255);
    }
  }
  return out;
}

async function build({ family, source, blank = [], hero, catalogue, detail }) {
  const file = path.join(SRC, source);
  if (!fs.existsSync(file)) throw new Error(`missing source ${file}`);
  fs.mkdirSync(path.join(OUT, family), { recursive: true });

  const write = async (name, [left, top, width, height], { square = false } = {}) => {
    // Each crop fits its own paper, because one sheet can hold panels lit differently.
    const data = await sharp(file).removeAlpha().extract({ left, top, width, height }).raw().toBuffer();
    const local = blank.map(([l, t, w, h]) => [l - left, t - top, w, h]);
    let img = sharp(liftPaper(data, width, height, local), { raw: { width, height, channels: 4 } });
    if (square) {
      // A square catalogue frame, padded with transparency so the piece is never cropped to fit it.
      const side = Math.max(width, height);
      const padded = await img
        .extend({
          top: Math.floor((side - height) / 2),
          bottom: Math.ceil((side - height) / 2),
          left: Math.floor((side - width) / 2),
          right: Math.ceil((side - width) / 2),
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer();
      img = sharp(padded).resize({ width: Math.min(side, 840) });
    }
    const target = path.join(OUT, family, `${name}.webp`);
    const meta = await img.webp({ quality: 80, alphaQuality: 85, effort: 5 }).toFile(target);
    console.log(`${target}  ${meta.width}x${meta.height}  ${(meta.size / 1024).toFixed(0)} KB`);
    return { width: meta.width, height: meta.height };
  };

  return {
    family,
    hero: await write("hero", hero),
    catalogue: await write("catalogue", catalogue, { square: true }),
    detail: await write("detail", detail),
  };
}

for (const r of RENDERS) await build(r);
