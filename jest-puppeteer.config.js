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
    // Headless is way less performant when running WebGL and cause PlayCanvas
    // to crash when opening some glTFs
    headless: false,
    args: [
      "--window-size=1280,1024",
      "--force-device-scale-factor=1",
      "--mute-audio",
      "--no-sandbox",
      "--hide-scrollbars",
      // "--use-gl=swiftshader", // Necessary for GL to work in GitLab CI docker executor
      // "--allow-no-sandbox-job",
      // "--enable-usermedia-screen-capturing",
      // "--allow-http-screen-capture",
      // "--auto-select-desktop-capture-source=unreal2web",
      // "--load-extension=" + path.join(__dirname, "./e2e/record/"),
      // "--disable-extensions-except=" + path.join(__dirname, "./e2e/record/"),
    ],
  },
};
