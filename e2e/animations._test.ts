import path from "path";
import { ensureDir } from "fs-extra";
import { record } from "./lib/puppeteer-record";

const recordScreen = async (name: string, seconds: number) => {
  const fps = 60;
  return record({
    page,
    fps,
    format: "mp4",
    frames: fps * seconds,
    output: path.join(__dirname, "screenshots", `${name}.mp4`),
    pipeOutput: true,
  });
};

describe("animations", () => {
  beforeAll(async () => {
    await ensureDir(path.join(__dirname, "screenshots"));
    const pages = await browser.pages();
    pages[0].close();
  });

  it("should record animation", async () => {
    const length = 10;

    await (page as any)._client.send("Emulation.clearDeviceMetricsOverride");
    await (page as any)._client.send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: __dirname,
    });
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
    await page.goto(
      "http://localhost:3001/?hideUI=true&model=BrainStem#hotreload=false",
    );
    await page.setBypassCSP(true);

    // Give a file name
    await page.evaluate(filename => {
      window.postMessage({ type: "SET_EXPORT_PATH", filename: filename }, "*");
    }, "BrainStem.webm");

    // Wait
    await page.waitFor(length * 1000);

    // Stop recording
    await page.evaluate(_filename => {
      window.postMessage({ type: "REC_STOP" }, "*");
    }, "BrainStem.webm");

    // Wait for download of webm to complete
    await page.waitForSelector("html.downloadComplete", { timeout: 0 });
  });
});
