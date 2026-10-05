import { expect, test, type Page } from "@playwright/test";
import { FIXTURE } from "./helpers";

// The old DESERT orbit and assembly pictured a connecting bar absent from the owner's reference.
// They stay in the archive, but current product views must never offer or request that media.
const FAMILY = "/product/desert-eye-love";
const FORMS = [
  { id: "anti-eyebrow", slot: "desert-eye-love", pieces: 2 },
  { id: "micro-dermal", slot: "desert-eye-symbol", pieces: 1 },
  { id: "nose", slot: "desert-eye-gem", pieces: 1 },
];
const chooseForm = (page: Page, formId: string) => page.locator("label", { has: page.getByTestId(`form-${formId}`) }).click();
const retiredRequests = (page: Page) => {
  const media: string[] = [];
  page.on("request", (request) => {
    if (/\/media\/(?:hero-orbit\/desert-eye-love|product-animation\/desert-eye-love|cinema\/orbit)\//.test(request.url())) media.push(request.url());
  });
  return media;
};

async function noRetiredControls(page: Page) {
  await expect(page.getByRole("tab", { name: "Assembly", exact: true })).toHaveCount(0);
  await expect(page.getByRole("tab", { name: "Orbit study", exact: true })).toHaveCount(0);
  for (const id of ["product-film", "film-play", "film-replay", "orbit-turn", "piece-assembly"]) {
    await expect(page.getByTestId(id)).toHaveCount(0);
  }
}

test.describe("DESERT EYE uses the corrected separate-top imagery", () => {
  for (const form of FORMS) {
    test(`${form.id} shows its own photograph and retains placement and try-on`, async ({ page }) => {
      const retired = retiredRequests(page);
      await page.goto(`${FAMILY}?form=${form.id}`);
      await expect(page.getByTestId("family")).toHaveAttribute("data-form", form.id);
      await expect(page.getByTestId("render-stage")).toHaveAttribute("data-presentation", "photographic");
      const image = page.getByTestId("render-stage-image");
      await expect(image).toHaveAttribute("src", `/products/photographic/${form.slot}/hero.webp`);
      await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
      await noRetiredControls(page);
      await expect(page.getByTestId("add-to-bag")).toBeEnabled();

      await page.getByRole("tab", { name: "Placement", exact: true }).click();
      await expect(page.getByTestId("placement-preview")).toHaveAttribute("data-form", form.id);
      await expect(page.getByTestId("placement-piece")).toHaveCount(form.pieces);
      await page.getByRole("tab", { name: "Try on", exact: true }).click();
      await expect(page.getByTestId("tryon-preview")).toHaveAttribute("data-form", form.id);
      await page.getByRole("tab", { name: "The piece", exact: true }).click();
      await expect(image).toHaveAttribute("src", `/products/photographic/${form.slot}/hero.webp`);
      await page.waitForLoadState("networkidle");
      expect(retired).toEqual([]);
    });
  }

  test("switching forms updates the image and try-on address without reviving the old film", async ({ page }) => {
    const retired = retiredRequests(page);
    await page.goto(FAMILY);
    for (const form of [...FORMS.slice(1), FORMS[0]]) {
      await chooseForm(page, form.id);
      await expect(page.getByTestId("render-stage-image")).toHaveAttribute("src", `/products/photographic/${form.slot}/hero.webp`);
      await expect(page.getByTestId("try-it-on")).toHaveAttribute("href", `/face-studio?product=desert-eye-love&form=${form.id}`);
      await expect(page).toHaveURL(new RegExp(`form=${form.id}`));
      await noRetiredControls(page);
    }
    await page.waitForLoadState("networkidle");
    expect(retired).toEqual([]);
  });

  test("reduced motion retains the corrected still and never loads archived animation", async ({ page }) => {
    const retired = retiredRequests(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(FAMILY);
    await expect(page.getByTestId("render-stage-image")).toHaveAttribute("src", "/products/photographic/desert-eye-love/hero.webp");
    await noRetiredControls(page);
    await expect(page.locator("video:not([data-testid='mascot-clip'])")).toHaveCount(0);
    await page.waitForLoadState("networkidle");
    expect(retired).toEqual([]);
  });

  test("Face Studio keeps editable placement and contains no product film", async ({ page }) => {
    const retired = retiredRequests(page);
    await page.goto("/face-studio?product=desert-eye-love");
    await expect(page.getByTestId("studio-head")).toBeVisible();
    await expect(page.getByTestId("product-film")).toHaveCount(0);
    await expect(page.locator("video:not([data-testid='mascot-clip'])")).toHaveCount(0);
    await page.getByTestId("photo-input").first().setInputFiles(FIXTURE);
    await expect(page.getByTestId("placed-item")).toHaveCount(1);
    await expect(page.locator("video:not([data-testid='mascot-clip'])")).toHaveCount(0);
    expect(retired).toEqual([]);
  });
});
