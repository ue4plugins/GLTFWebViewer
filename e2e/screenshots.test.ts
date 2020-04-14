import "jest";

const waitUntilTrue = async (
  expression: () => Promise<boolean>,
  timeout = 10000,
) => {
  const interval = 500;
  if (timeout < interval) {
    return Promise.reject(new Error("waitUntilTrue timed out"));
  }
  if (await expression()) {
    return Promise.resolve();
  }
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(waitUntilTrue(expression, timeout - interval));
    }, interval);
  });
};

const waitForViewer = (timeout = 10000) =>
  waitUntilTrue(() => page.evaluate(() => !!window.viewerInitiated), timeout);

const waitForScene = (timeout = 10000) =>
  waitUntilTrue(() => page.evaluate(() => !!window.viewerSceneLoaded), timeout);

const waitForModel = (timeout = 10000) =>
  waitUntilTrue(() => page.evaluate(() => !!window.viewerModelLoaded), timeout);

describe("todo", () => {
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
