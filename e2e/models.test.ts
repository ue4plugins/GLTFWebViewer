import "jest";
import { waitForModel, waitForScene, waitForViewer } from "./lib/waiters";
import { models } from "./__fixtures__/models";

const binaryModels = models
  .filter(m => m.type === "binary")
  .slice(0, 5)
  .map(m => [m.type, m.name]);

const dracoModels = models
  .filter(m => m.type === "draco")
  .slice(0, 2)
  .map(m => [m.type, m.name]);

const unpackedModels = models
  .filter(m => m.type === "unpacked")
  .slice(0, 5)
  .map(m => [m.type, m.name]);

const allModels = [...binaryModels, ...dracoModels, ...unpackedModels];

describe("Models", () => {
  beforeAll(async () => {
    await page.setViewport({ width: 1920, height: 1080 });
  });

  test.each(allModels)(
    "'%s' model '%s' renders the same as baseline snapshot",
    async (type, name) => {
      await page.goto(
        `http://localhost:3001?hideUI=true&noAnimations=true&model=${name}&modelType=${type}`,
      );
      await Promise.all([waitForViewer(), waitForScene(), waitForModel()]);

      expect(await page.screenshot()).toMatchImageSnapshot({
        customSnapshotIdentifier: `model-${type}-${name}`,
      });
    },
  );
});
