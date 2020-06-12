export const waitForViewer = (timeout = 10000) =>
  page.waitForFunction(() => !!window.viewer?.initiated, {
    polling: 500,
    timeout,
  });

export const waitForScene = (timeout = 10000) =>
  page.waitForFunction(() => !!window.viewer?.sceneLoaded, {
    polling: 500,
    timeout,
  });

export const waitForGltf = (timeout = 20000) =>
  page.waitForFunction(() => !!window.viewer?.gltfLoaded, {
    polling: 500,
    timeout,
  });
