import path from "node:path";
import { expect, type Locator, type Page } from "@playwright/test";

// Abstract grid image. It is not a face and proves nothing about face detection.
export const FIXTURE = path.join(__dirname, "..", "fixtures", "geometric-portrait.png");

export async function openStudioWithPhoto(page: Page, query = "") {
  await page.goto(`/face-studio${query}`);
  await page.getByTestId("photo-input").first().setInputFiles(FIXTURE);
  await expect(page.getByTestId("photo-frame")).toBeVisible();
  await expect(page.getByTestId("placed-item")).toHaveCount(1);
  // The photo settles in over most of a second. Measurements wait until it rests.
  await page.getByTestId("studio-stage").evaluate((stage) =>
    Promise.all(
      stage
        .getAnimations({ subtree: true })
        .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => undefined)),
    ).then(() => undefined),
  );
}

/** Centre of an element relative to the displayed photo, 0..1 on both axes. */
export async function relativeCentre(page: Page, target: Locator) {
  const frame = await page.getByTestId("studio-stage").getByTestId("photo-frame").boundingBox();
  const box = await target.boundingBox();
  if (!frame || !box) throw new Error("missing bounding box");
  return {
    x: (box.x + box.width / 2 - frame.x) / frame.width,
    y: (box.y + box.height / 2 - frame.y) / frame.height,
    widthRatio: box.width / frame.width,
  };
}

export async function mouseDrag(page: Page, target: Locator, dx: number, dy: number) {
  await target.scrollIntoViewIfNeeded();
  const box = await target.boundingBox();
  if (!box) throw new Error("missing bounding box");
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx / 2, y + dy / 2, { steps: 4 });
  await page.mouse.move(x + dx, y + dy, { steps: 4 });
  await page.mouse.up();
}

/** Drives the pointer-event path the way a finger does (pointerType "touch"). */
export async function touchDrag(target: Locator, dx: number, dy: number) {
  const box = await target.boundingBox();
  if (!box) throw new Error("missing bounding box");
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const base = { pointerId: 7, pointerType: "touch", isPrimary: true, button: 0, bubbles: true };
  await target.dispatchEvent("pointerdown", { ...base, clientX: x, clientY: y, buttons: 1 });
  for (let i = 1; i <= 5; i++) {
    await target.dispatchEvent("pointermove", { ...base, clientX: x + (dx * i) / 5, clientY: y + (dy * i) / 5, buttons: 1 });
  }
  await target.dispatchEvent("pointerup", { ...base, clientX: x + dx, clientY: y + dy, buttons: 0 });
}
