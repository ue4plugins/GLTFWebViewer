module.exports = {
  server: {
    command:
      "cross-env BROWSER=none NODE_ENV=development CI=true PORT=3001 npm start",
    port: 3001,
    launchTimeout: 30000,
    debug: true,
  },
  launch: {
    dumpio: true,
    // Headless is way less performant when running WebGL because the lack of hardware
    // acceleration and it causes PlayCanvas to crash when opening some glTFs
    headless: false,
    args: [
      "--window-size=600,400",
      "--force-device-scale-factor=1",
      "--mute-audio",
      "--no-sandbox",
      "--hide-scrollbars",
      // "--enable-usermedia-screen-capturing",
      // "--allow-http-screen-capture",
      // "--auto-select-desktop-capture-source=unreal2web",
      // "--load-extension=" + path.join(__dirname, "./e2e/record/"),
      // "--disable-extensions-except=" + path.join(__dirname, "./e2e/record/"),
    ],
  },
};
