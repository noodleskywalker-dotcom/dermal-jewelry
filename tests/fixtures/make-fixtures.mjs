// Generates the non-personal geometric test image used by the browser tests.
// It is an abstract grid, not a face, and it does not validate face detection.
// Run: node tests/fixtures/make-fixtures.mjs
import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { fileURLToPath } from "node:url";

function crc32(buf) {
  let c;
  let crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function png(width, height, pixel) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    const row = y * (width * 3 + 1);
    raw[row] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b] = pixel(x, y);
      raw[row + 1 + x * 3] = r;
      raw[row + 2 + x * 3] = g;
      raw[row + 3 + x * 3] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const W = 900;
const H = 1200;
const image = png(W, H, (x, y) => {
  const t = y / H;
  let r = 196 - t * 40;
  let g = 170 - t * 40;
  let b = 150 - t * 35;
  // 100px grid so drift would be visible in screenshots.
  if (x % 100 === 0 || y % 100 === 0) [r, g, b] = [120, 100, 90];
  // Centre cross.
  if (Math.abs(x - W / 2) < 2 || Math.abs(y - H / 2) < 2) [r, g, b] = [60, 50, 45];
  // One marked square near the default anti-eyebrow anchor.
  if (x > 580 && x < 640 && y > 530 && y < 590) [r, g, b] = [230, 225, 215];
  return [r, g, b];
});

const out = fileURLToPath(new URL("./geometric-portrait.png", import.meta.url));
writeFileSync(out, image);
console.log(`wrote ${out} (${image.length} bytes)`);
