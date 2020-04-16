module.exports = {
  server: {
    command:
      "cross-env BROWSER=none NODE_ENV=production CI=true PORT=3001 npm start",
    port: 3001,
    launchTimeout: 10000,
    debug: true,
  },
  launch: {
    dumpio: true,
    // headless: process.env.HEADLESS !== "false",
    headless: false,
    args: [
      "--window-size=1920,1080",
      "--allow-no-sandbox-job",
      // "--enable-usermedia-screen-capturing",
      // "--allow-http-screen-capture",
      // "--auto-select-desktop-capture-source=unreal2web",
      "--force-device-scale-factor=1",
      // "--load-extension=" + path.join(__dirname, "./e2e/record/"),
      // "--disable-extensions-except=" + path.join(__dirname, "./e2e/record/"),
    ],
  },
};
