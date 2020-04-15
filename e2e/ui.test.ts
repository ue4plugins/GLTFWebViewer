import "jest";
import { waitForModel, waitForScene, waitForViewer } from "./lib/waiters";
import { screenshotElement } from "./lib/screenshotElement";

describe("UI", () => {
  beforeAll(async () => {
    await page.setViewport({ width: 1920, height: 1080 });
  });

  beforeEach(async () => {
    await page.goto("http://localhost:3001");
    await Promise.all([waitForViewer(), waitForScene(), waitForModel()]);
  });

  it("should have a searchable model list", async () => {
    await page.click("#search-input");
    expect(await screenshotElement("#sidebar")).toMatchImageSnapshot();

    await expect(page).toFill("#search-input", "Duck");
    expect(await screenshotElement("#sidebar")).toMatchImageSnapshot();

    const item = (await page.$$("#model-list .MuiListItem-button"))[0];
    if (!item) {
      throw new Error("Missing item");
    }

    const itemSpan = await item.$(".MuiListItemText-primary");
    if (!itemSpan) {
      throw new Error("Missing item span");
    }

    expect(await page.evaluate(element => element.textContent, itemSpan)).toBe(
      "Duck",
    );

    await item.hover();
    expect(await screenshotElement("#sidebar")).toMatchImageSnapshot();

    await item.click();
    expect(await screenshotElement("#sidebar")).toMatchImageSnapshot();
  });

  it("should have a scene list", async () => {
    await page.click("#scene-select");
    expect(await screenshotElement("#sidebar")).toMatchImageSnapshot();

    const item = (await page.$$("#scene-select-list .MuiListItem-button"))[1];
    if (!item) {
      throw new Error("Missing item");
    }

    await item.hover();
    expect(await screenshotElement("#sidebar")).toMatchImageSnapshot();

    await item.click();
    expect(await screenshotElement("#sidebar")).toMatchImageSnapshot();
  });
});
