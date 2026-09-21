// Renders the PROTOTYPE PRODUCT ART for DESERT EYE — LOVE from vector geometry, locally.
//   npm run assets:render
//
// It uses no generation service and spends no credits. The symbol is drawn from the glyph outline
// already in the repository (lib/studio/love-glyph.ts), so its geometry is not redrawn or guessed.
// Output:
//   art/product-masters/desert-eye-love/<piece>.svg           vector source
//   art/product-masters/desert-eye-love/<piece>.png           lossless master, tight crop, alpha
//   public/products/desert-eye-love/<form>/<piece>.webp       web asset, alpha
//
// This is prototype art for the website, Face Studio, placement and reveal prototypes. It is not
// manufacturing geometry, and the stone is only ever "deep-red faceted gemstone".
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium } from "@playwright/test";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const SLUG = "desert-eye-love";
const MASTERS = path.join(ROOT, "art", "product-masters", SLUG);
const PUBLIC = path.join(ROOT, "public", "products", SLUG);

const glyph = readFileSync(path.join(ROOT, "lib", "studio", "love-glyph.ts"), "utf8").match(/LOVE_GLYPH_PATH\s*=\s*"([^"]+)"/)?.[1];
if (!glyph) throw new Error("glyph outline not found in lib/studio/love-glyph.ts");

const METAL = `
  <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#ffffff"/><stop offset="0.22" stop-color="#aab0b9"/>
    <stop offset="0.46" stop-color="#f2f4f6"/><stop offset="0.7" stop-color="#6a7079"/>
    <stop offset="1" stop-color="#d3d7dd"/>
  </linearGradient>
  <linearGradient id="metal-side" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#8d939c"/><stop offset="0.5" stop-color="#4a4f57"/><stop offset="1" stop-color="#23262b"/>
  </linearGradient>`;

// ── Symbol: red-faced openwork metal, polished edges, open negative space ──
// Every layer is the same outline. Nothing connects strokes that the outline leaves apart, there is
// no backing plate, and no shadow is drawn: the only depth is the piece's own polished side.
function symbolSvg() {
  const DEPTH = 9;
  const sides = Array.from({ length: DEPTH }, (_, i) => {
    const n = DEPTH - i;
    return `<path d="${glyph}" transform="translate(${(n * 1.5).toFixed(1)} ${(n * 2.1).toFixed(1)})" fill="url(#metal-side)" stroke="url(#metal-side)" stroke-width="22" stroke-linejoin="round"/>`;
  }).join("\n    ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-60 -60 1140 1150">
  <defs>${METAL}
    <linearGradient id="face" x1="0.15" y1="0" x2="0.85" y2="1">
      <stop offset="0" stop-color="#b3243c"/><stop offset="0.45" stop-color="#7d1428"/><stop offset="1" stop-color="#3a0813"/>
    </linearGradient>
    <filter id="polish" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation="7" result="dome"/>
      <feSpecularLighting in="dome" surfaceScale="8" specularConstant="0.9" specularExponent="44" lighting-color="#ffd9df" result="shine">
        <feDistantLight azimuth="232" elevation="52"/>
      </feSpecularLighting>
      <feComposite in="shine" in2="SourceAlpha" operator="in" result="shine-in"/>
      <feComposite in="SourceGraphic" in2="shine-in" operator="arithmetic" k1="0" k2="1" k3="0.55" k4="0"/>
    </filter>
  </defs>
  <g>
    ${sides}
    <path d="${glyph}" fill="url(#metal)" stroke="url(#metal)" stroke-width="22" stroke-linejoin="round"/>
    <path d="${glyph}" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2.5" stroke-linejoin="round" transform="translate(-3 -4)"/>
    <g filter="url(#polish)"><path d="${glyph}" fill="url(#face)"/></g>
    <path d="${glyph}" fill="none" stroke="rgba(36,2,9,0.6)" stroke-width="5" stroke-linejoin="round"/>
  </g>
</svg>`;
}

// ── Gemstone: small, deep red, faceted, polished, front-facing, in a slight four-claw setting ──
function gemstoneSvg() {
  const C = 500;
  const R = 410;
  const pt = (deg, r) => [C + Math.cos((deg * Math.PI) / 180) * r, C + Math.sin((deg * Math.PI) / 180) * r];
  const poly = (points) => points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  // Light comes from the upper left. A facet is brighter the more it faces it.
  const shade = (deg, lift = 0) => {
    const facing = 0.5 + 0.5 * Math.cos(((deg - 225) * Math.PI) / 180);
    const t = Math.min(1, Math.max(0, 0.12 + facing * 0.78 + lift));
    const mix = (a, b) => Math.round(a + (b - a) * t);
    return `rgb(${mix(30, 198)},${mix(3, 36)},${mix(9, 60)})`;
  };
  const facets = [];
  for (let k = 0; k < 8; k++) {
    const a = k * 45;
    const T0 = pt(a, R * 0.5);
    const T1 = pt(a + 45, R * 0.5);
    const S = pt(a + 22.5, R * 0.74);
    const Sprev = pt(a - 22.5, R * 0.74);
    const G = pt(a, R);
    const Gmid = pt(a + 22.5, R);
    const Gnext = pt(a + 45, R);
    facets.push(`<polygon points="${poly([T0, T1, S])}" fill="${shade(a + 22.5, 0.12)}"/>`); // star
    facets.push(`<polygon points="${poly([T0, Sprev, G, S])}" fill="${shade(a, -0.06)}"/>`); // bezel kite
    facets.push(`<polygon points="${poly([S, G, Gmid])}" fill="${shade(a + 11, k % 2 ? 0.1 : -0.12)}"/>`); // upper girdle
    facets.push(`<polygon points="${poly([S, Gmid, Gnext])}" fill="${shade(a + 34, k % 2 ? -0.14 : 0.08)}"/>`);
  }
  const table = poly(Array.from({ length: 8 }, (_, k) => pt(k * 45, R * 0.5)));
  const culet = poly(Array.from({ length: 8 }, (_, k) => pt(k * 45 + 22.5, R * 0.27)));
  const claws = [45, 135, 225, 315]
    .map((deg) => {
      const [x, y] = pt(deg, R + 8);
      return `<g transform="rotate(${deg + 90} ${x.toFixed(1)} ${y.toFixed(1)})">
      <ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="46" ry="38" fill="url(#metal)" stroke="rgba(20,22,26,0.5)" stroke-width="4"/>
      <ellipse cx="${(x - 10).toFixed(1)}" cy="${(y - 10).toFixed(1)}" rx="16" ry="9" fill="rgba(255,255,255,0.75)"/>
    </g>`;
    })
    .join("\n    ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
  <defs>${METAL}
    <radialGradient id="depth" cx="0.42" cy="0.38" r="0.75">
      <stop offset="0" stop-color="#c3263f" stop-opacity="0"/><stop offset="0.7" stop-color="#2a040c" stop-opacity="0.35"/><stop offset="1" stop-color="#140206" stop-opacity="0.7"/>
    </radialGradient>
    <linearGradient id="table" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0" stop-color="#c9304b"/><stop offset="0.5" stop-color="#84162b"/><stop offset="1" stop-color="#3c0813"/>
    </linearGradient>
    <clipPath id="stone"><circle cx="${C}" cy="${C}" r="${R}"/></clipPath>
  </defs>
  <circle cx="${C}" cy="${C}" r="${R + 14}" fill="none" stroke="url(#metal)" stroke-width="30"/>
  <g clip-path="url(#stone)">
    <circle cx="${C}" cy="${C}" r="${R}" fill="#4a0b18"/>
    ${facets.join("\n    ")}
    <polygon points="${table}" fill="url(#table)"/>
    <polygon points="${culet}" fill="rgba(24,2,8,0.26)"/>
    <g stroke="rgba(20,2,7,0.22)" stroke-width="3">
      ${Array.from({ length: 8 }, (_, k) => {
        const [x1, y1] = pt(k * 45 + 22.5, R * 0.27);
        const [x2, y2] = pt(k * 45 + 22.5, R * 0.48);
        return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
      }).join("")}
    </g>
    <g stroke="rgba(255,190,200,0.28)" stroke-width="3" fill="none">
      <polygon points="${table}"/>
      ${Array.from({ length: 8 }, (_, k) => {
        const [x1, y1] = pt(k * 45, R * 0.5);
        const [x2, y2] = pt(k * 45, R);
        return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
      }).join("")}
    </g>
    <circle cx="${C}" cy="${C}" r="${R}" fill="url(#depth)"/>
    <circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="rgba(14,2,5,0.55)" stroke-width="7"/>
    <ellipse cx="392" cy="352" rx="104" ry="40" fill="rgba(255,255,255,0.42)" transform="rotate(-38 392 352)"/>
    <ellipse cx="640" cy="668" rx="70" ry="22" fill="rgba(255,200,210,0.22)" transform="rotate(-38 640 668)"/>
  </g>
  ${claws}
</svg>`;
}

const PIECES = [
  { id: "symbol", svg: symbolSvg(), width: 1600, forms: ["anti-eyebrow", "micro-dermal"] },
  { id: "gemstone", svg: gemstoneSvg(), width: 800, forms: ["anti-eyebrow", "nose"] },
];

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent("<!doctype html><body></body>");

const report = [];
for (const piece of PIECES) {
  const out = await page.evaluate(
    async ({ svg, width }) => {
      const img = new Image();
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
      await img.decode();
      // Supersampled draw, then the tight alpha box, then one high-quality resample to the final width.
      const big = document.createElement("canvas");
      const ratio = img.naturalHeight / img.naturalWidth;
      big.width = 4000;
      big.height = Math.round(4000 * ratio);
      const bctx = big.getContext("2d");
      bctx.drawImage(img, 0, 0, big.width, big.height);
      const data = bctx.getImageData(0, 0, big.width, big.height).data;
      let x0 = big.width, y0 = big.height, x1 = 0, y1 = 0;
      for (let y = 0; y < big.height; y++) {
        for (let x = 0; x < big.width; x++) {
          if (data[(y * big.width + x) * 4 + 3] > 2) {
            if (x < x0) x0 = x;
            if (x > x1) x1 = x;
            if (y < y0) y0 = y;
            if (y > y1) y1 = y;
          }
        }
      }
      const margin = Math.round((x1 - x0) * 0.02);
      x0 -= margin; y0 -= margin; x1 += margin; y1 += margin;
      const w = x1 - x0 + 1;
      const h = y1 - y0 + 1;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = Math.round((width * h) / w);
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(big, x0, y0, w, h, 0, 0, canvas.width, canvas.height);
      // How much of the picture is truly see-through: proof that the openings are open.
      const final = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let clear = 0;
      for (let i = 3; i < final.length; i += 4) if (final[i] === 0) clear++;
      return {
        png: canvas.toDataURL("image/png").split(",")[1],
        webp: canvas.toDataURL("image/webp", 0.92).split(",")[1],
        width: canvas.width,
        height: canvas.height,
        clearShare: clear / (final.length / 4),
        // Where the piece sat in the 1000-unit drawing, for keeping the approved composition in place.
        box: { x0: x0 / big.width, x1: x1 / big.width, y0: y0 / big.height, y1: y1 / big.height },
      };
    },
    { svg: piece.svg, width: piece.width },
  );

  mkdirSync(MASTERS, { recursive: true });
  writeFileSync(path.join(MASTERS, `${piece.id}.svg`), piece.svg);
  const png = Buffer.from(out.png, "base64");
  writeFileSync(path.join(MASTERS, `${piece.id}.png`), png);
  const webp = Buffer.from(out.webp, "base64");
  for (const form of piece.forms) {
    mkdirSync(path.join(PUBLIC, form), { recursive: true });
    writeFileSync(path.join(PUBLIC, form, `${piece.id}.webp`), webp);
  }
  report.push({ piece: piece.id, width: out.width, height: out.height, masterKB: Math.round(png.length / 1024), webpKB: Math.round(webp.length / 1024), transparentShare: Number(out.clearShare.toFixed(3)), forms: piece.forms.join(", "), box: out.box });
}
await browser.close();
console.table(report.map((row) => ({ ...row, box: undefined })));
console.log(JSON.stringify(report.map((r) => ({ piece: r.piece, box: r.box }))));
