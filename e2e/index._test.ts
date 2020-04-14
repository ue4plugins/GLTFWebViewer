/* eslint-disable @typescript-eslint/no-explicit-any */
import path from "path";
import { ensureDir } from "fs-extra";
import { BoundingBox } from "puppeteer";
// import { record } from "./lib/puppeteer-record";

let counter = -1;
const screenshot = async (name: string, clip?: BoundingBox) => {
  counter += 1;
  return page.screenshot({
    path: path.join(__dirname, "screenshots", `${counter}-${name}.png`),
    type: "png",
    clip,
  });
};

// const recordScreen = async (name: string, seconds: number) => {
//   counter += 1;
//   const fps = 60;
//   return record({
//     page,
//     fps,
//     format: "mp4",
//     frames: fps * seconds,
//     output: path.join(__dirname, "screenshots", `${counter}-${name}.mp4`),
//     pipeOutput: true,
//   });
// };

// async function screenshotDOMElement(
//   name: string,
//   selector: string,
//   padding = 0,
// ) {
//   const rect = await page.evaluate(selector => {
//     const element = document.querySelector(selector);
//     const { x, y, width, height } = element.getBoundingClientRect();
//     return { left: x, top: y, width, height, id: element.id };
//   }, selector);

//   return screenshot(name, {
//     x: rect.left - padding,
//     y: rect.top - padding,
//     width: rect.width + padding * 2,
//     height: rect.height + padding * 2,
//   });
// }

jest.setTimeout(600000);

describe("app", () => {
  beforeAll(async () => {
    await ensureDir(path.join(__dirname, "screenshots"));
    const pages = await browser.pages();
    pages[0].close();
  });

  it('should be titled "unreal2web"', async () => {
    await page.goto("http://localhost:3001");
    await expect(page.title()).resolves.toMatch("unreal2web");
  });

  it("should search for 'Duck' and display the result", async () => {
    await page.goto("http://localhost:3001");
    await page.setViewport({ width: 1920, height: 1080 });
    await screenshot("init");

    await page.click("#search-input");
    await screenshot("search-input");

    await expect(page).toFill("#search-input", "Duck");
    await page.waitFor(1000);
    await screenshot("search-result");

    const firstItem = (await page.$$("#model-list .MuiListItem-button"))[3];

    if (!firstItem) {
      throw Error("Missing result");
    }

    const firstItemSpan = await firstItem.$(".MuiListItemText-primary");
    const text = await page.evaluate(
      element => element.textContent,
      // eslint-disable-next-line
      firstItemSpan!,
    );
    expect(text).toBe("Duck");

    await firstItem.hover();
    await screenshot("hover-result");

    try {
      await firstItem.click();
    } catch (e) {
      console.error("Failed to click item!", e);
    }
    await page.waitFor(1000);

    await screenshot("after-click");

    await screenshot("Duck", { x: 400, y: 100, width: 800, height: 800 });
  });

  // it("should record animation", async () => {
  //   const length = 10;

  //   await (page as any)._client.send("Emulation.clearDeviceMetricsOverride");
  //   await (page as any)._client.send("Page.setDownloadBehavior", {
  //     behavior: "allow",
  //     downloadPath: __dirname,
  //   });
  //   await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  //   await page.goto(
  //     "http://localhost:3001/?hideUI=true&model=BrainStem#hotreload=false",
  //   );
  //   await page.setBypassCSP(true);

  //   // Give a file name
  //   await page.evaluate(filename => {
  //     window.postMessage({ type: "SET_EXPORT_PATH", filename: filename }, "*");
  //   }, "BrainStem.webm");

  //   // Wait
  //   await page.waitFor(length * 1000);

  //   // Stop recording
  //   await page.evaluate(_filename => {
  //     window.postMessage({ type: "REC_STOP" }, "*");
  //   }, "BrainStem.webm");

  //   // Wait for download of webm to complete
  //   await page.waitForSelector("html.downloadComplete", { timeout: 0 });
  // });
});
