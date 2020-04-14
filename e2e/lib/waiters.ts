export const waitUntilTrue = async (
  expression: () => Promise<boolean>,
  timeout = 10000,
) => {
  const interval = 500;
  if (timeout < interval) {
    return Promise.reject(new Error("waitUntilTrue timed out"));
  }
  if (await expression()) {
    return Promise.resolve();
  }
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(waitUntilTrue(expression, timeout - interval));
    }, interval);
  });
};

export const waitForViewer = (timeout = 10000) =>
  waitUntilTrue(() => page.evaluate(() => !!window.viewerInitiated), timeout);

export const waitForScene = (timeout = 10000) =>
  waitUntilTrue(() => page.evaluate(() => !!window.viewerSceneLoaded), timeout);

export const waitForModel = (timeout = 10000) =>
  waitUntilTrue(() => page.evaluate(() => !!window.viewerModelLoaded), timeout);
