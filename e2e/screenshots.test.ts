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

describe("todo", () => {
  it("todo", async () => {
    await page.goto("http://localhost:3001");
    await page.setViewport({ width: 1920, height: 1080 });

    await Promise.all([
      waitUntilTrue(() => page.evaluate(() => !!window.viewerInitiated)),
      waitUntilTrue(() => page.evaluate(() => !!window.viewerSceneLoaded)),
      waitUntilTrue(() => page.evaluate(() => !!window.viewerModelLoaded)),
    ]);

    await page.click("#search-input");
    expect(await page.screenshot()).toMatchImageSnapshot();

    // await expect(page).toFill("#search-input", "Duck");
    // await page.waitFor(1000);
    // expect(await page.screenshot()).toMatchImageSnapshot();

    // const firstItem = (await page.$$("#model-list .MuiListItem-button"))[3];
    // if (!firstItem) {
    //   throw new Error("Missing item");
    // }

    // const firstItemSpan = await firstItem.$(".MuiListItemText-primary");
    // if (!firstItemSpan) {
    //   throw new Error("Missing item span");
    // }

    // expect(
    //   await page.evaluate(element => element.textContent, firstItemSpan),
    // ).toBe("Duck");

    // await firstItem.hover();
    // expect(await page.screenshot()).toMatchImageSnapshot();

    // try {
    //   await firstItem.click();
    // } catch (e) {
    //   console.error("Failed to click item", e);
    // }
    // await page.waitFor(1000);
    // expect(await page.screenshot()).toMatchImageSnapshot();
  });
});
