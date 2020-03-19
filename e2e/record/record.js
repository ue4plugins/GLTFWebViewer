var url = process.argv[2] || "http://chantier.lecollecteur.fr/nuit-du-cirque/",
  exportname = process.argv[3] || "capture",
  size = process.argv[4] || "1280x720",
  width = parseInt(size.split("x")[0]),
  height = parseInt(size.split("x")[1]),
  length = process.argv[5];
length = process.argv[5] ? parseInt(length.replace("s", "")) : 5;

const puppeteer = require("puppeteer");

var options = {
  headless: true,
  args: [
    "--enable-usermedia-screen-capturing",
    "--allow-http-screen-capture",
    "--auto-select-desktop-capture-source=puppetcam",
    "--load-extension=" + __dirname,
    "--disable-extensions-except=" + __dirname,
    "--disable-infobars",
    "--force-device-scale-factor=1",
  ],
};

async function main() {
  exportname =
    exportname.replace(".webm", "") + "-" + width + "x" + height + ".webm";
  const browser = await puppeteer.launch(options);
  const pages = await browser.pages();
  const page = pages[0];
  await page._client.send("Emulation.clearDeviceMetricsOverride");
  await page._client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: __dirname,
  });
  await page.setViewport({
    width: width,
    height: height,
    deviceScaleFactor: 1,
  });
  await page.goto(url, { waitUntil: "networkidle2" });
  await page.setBypassCSP(true);

  // Perform any actions that have to be captured in the exported video

  // Give a file name
  await page.evaluate(filename => {
    window.postMessage({ type: "SET_EXPORT_PATH", filename: filename }, "*");
  }, exportname);

  // Wait
  await page.waitFor(length * 1000);

  // Stop recording
  await page.evaluate(filename => {
    window.postMessage({ type: "REC_STOP" }, "*");
  }, exportname);

  // Wait for download of webm to complete
  await page.waitForSelector("html.downloadComplete", { timeout: 0 });
  await browser.close();
}

main();
