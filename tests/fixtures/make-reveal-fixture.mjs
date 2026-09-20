// Records a plain, clearly labeled TEST PATTERN video used only to exercise the reveal player.
// It is not campaign media and is never served by a production build.
// Run: node tests/fixtures/make-reveal-fixture.mjs
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SECONDS = 9; // Longer than the 8 second ceiling, so the player's own limit is what ends it.
const out = fileURLToPath(new URL("../../public/fixtures/reveal-test-pattern.webm", import.meta.url));
mkdirSync(fileURLToPath(new URL("../../public/fixtures/", import.meta.url)), { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
const base64 = await page.evaluate(async (seconds) => {
  const canvas = document.createElement("canvas");
  canvas.width = 480;
  canvas.height = 600;
  const ctx = canvas.getContext("2d");
  const started = performance.now();
  const draw = () => {
    const t = (performance.now() - started) / 1000;
    ctx.fillStyle = "#19191c";
    ctx.fillRect(0, 0, 480, 600);
    ctx.fillStyle = "#c9ced6";
    ctx.fillRect(0, 560, (480 * t) / seconds, 8);
    ctx.fillStyle = "#f4f0e8";
    ctx.font = "bold 30px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("TEST PATTERN", 240, 270);
    ctx.font = "18px sans-serif";
    ctx.fillText("not campaign media", 240, 305);
    ctx.fillText(`${t.toFixed(1)} s`, 240, 345);
  };
  const stream = canvas.captureStream(24);
  const recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp8", videoBitsPerSecond: 250000 });
  const chunks = [];
  recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const timer = setInterval(draw, 1000 / 24);
  draw();
  recorder.start(200);
  await new Promise((r) => setTimeout(r, seconds * 1000));
  clearInterval(timer);
  const stopped = new Promise((r) => (recorder.onstop = r));
  recorder.stop();
  await stopped;
  const buffer = await new Blob(chunks, { type: "video/webm" }).arrayBuffer();
  let binary = "";
  new Uint8Array(buffer).forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}, SECONDS);
await browser.close();

writeFileSync(out, Buffer.from(base64, "base64"));
console.log(`wrote ${out} (${Buffer.from(base64, "base64").length} bytes)`);
