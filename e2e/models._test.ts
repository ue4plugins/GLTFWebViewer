import "jest";
import { waitForModel, waitForScene, waitForViewer } from "./lib/waiters";

describe("Models", () => {
  it("todo", async () => {
    await page.goto("http://localhost:3001");
    await page.setViewport({ width: 1920, height: 1080 });

    await Promise.all([waitForViewer(), waitForScene(), waitForModel()]);

    await page.click("#search-input");
    expect(await page.screenshot()).toMatchImageSnapshot();

    await expect(page).toFill("#search-input", "Duck");
    expect(await page.screenshot()).toMatchImageSnapshot();

    const firstItem = (await page.$$("#model-list .MuiListItem-button"))[3];
    if (!firstItem) {
      throw new Error("Missing item");
    }

    const firstItemSpan = await firstItem.$(".MuiListItemText-primary");
    if (!firstItemSpan) {
      throw new Error("Missing item span");
    }

    expect(
      await page.evaluate(element => element.textContent, firstItemSpan),
    ).toBe("Duck");

    await firstItem.click();
    await waitForModel(3000);
    expect(await page.screenshot()).toMatchImageSnapshot();
  });
});
