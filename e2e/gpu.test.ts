import "jest";

describe("GPU", () => {
  it("should use hardware acceleration", async () => {
    await page.setViewport({ width: 1080, height: 1080 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36",
    );
    await page.goto("chrome://gpu", { waitUntil: "networkidle0" });
    expect(await page.screenshot({ fullPage: true })).toMatchImageSnapshot();
  });
});
