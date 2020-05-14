import "jest";

describe("GPU", () => {
  it("should use hardware acceleration", async () => {
    await page.setViewport({ width: 1080, height: 1080 });
    await page.goto("chrome://gpu", { waitUntil: "networkidle0" });
    expect(await page.screenshot({ fullPage: true })).toMatchImageSnapshot();
  });
});
