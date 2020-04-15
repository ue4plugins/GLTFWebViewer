import "jest";
import { waitForModel, waitForScene, waitForViewer } from "./lib/waiters";

describe("Models", () => {
  beforeAll(async () => {
    await page.setViewport({ width: 1920, height: 1080 });
  });

  it("should have a default model", async () => {
    await page.goto("http://localhost:3001?hideUI=true");
    await Promise.all([waitForViewer(), waitForScene(), waitForModel()]);
    expect(await page.screenshot()).toMatchImageSnapshot();
  });

  it("should have model 'Duck'", async () => {
    await page.goto("http://localhost:3001?hideUI=true&model=Duck");
    await Promise.all([waitForViewer(), waitForScene(), waitForModel()]);
    expect(await page.screenshot()).toMatchImageSnapshot();
  });

  it("should have model 'DamagedHelmet'", async () => {
    await page.goto("http://localhost:3001?hideUI=true&model=DamagedHelmet");
    await Promise.all([waitForViewer(), waitForScene(), waitForModel()]);
    expect(await page.screenshot()).toMatchImageSnapshot();
  });
});
