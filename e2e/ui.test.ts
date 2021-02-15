import "jest";
import { waitForViewer, screenshotElement } from "./utilities";

describe("UI", () => {
  beforeAll(async () => {
    await page.setDefaultNavigationTimeout(0);
    await page.setViewport({ width: 1920, height: 1080 });
  });

  beforeEach(async () => {
    await page.goto("http://localhost:3001?gltf=_");
    await page.addStyleTag({
      content: `* { caret-color: transparent !important; }`,
    });
    await Promise.all([waitForViewer()]);
  });

  it("should have glTF list", async () => {
    await page.waitFor(1000);
    expect(
      await screenshotElement("[data-testid=sidebar]"),
    ).toMatchImageSnapshot();

    const item = (await page.$$("[data-testid=gltf-list] li"))[0];
    if (!item) {
      throw new Error("Missing items");
    }

    await item.click();
    await page.waitFor(500);
    expect(
      await screenshotElement("[data-testid=sidebar]"),
    ).toMatchImageSnapshot();
  });
});
