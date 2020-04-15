export const waitForViewer = (timeout = 10000) =>
  page.waitForFunction(() => !!window.viewerInitiated, {
    polling: 500,
    timeout,
  });

export const waitForScene = (timeout = 10000) =>
  page.waitForFunction(() => !!window.viewerSceneLoaded, {
    polling: 500,
    timeout,
  });

export const waitForModel = (timeout = 10000) =>
  page.waitForFunction(() => !!window.viewerModelLoaded, {
    polling: 500,
    timeout,
  });
