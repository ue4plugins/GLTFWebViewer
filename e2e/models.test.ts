import "jest";
import { GltfFile } from "../src/playcanvas";
import { waitForModel, waitForScene, waitForViewer } from "./lib/waiters";
import {
  binaryModels,
  embeddedModels,
  unpackedModels,
  dracoModels,
  quantizedModels,
  pbrspecularglossinessModels,
} from "./__fixtures__/models";

type ModelTuple = [string, string];
const toModelTuple = (model: GltfFile): ModelTuple => [model.type, model.name];

const models = [
  ...binaryModels,
  ...embeddedModels,
  ...unpackedModels,
  ...dracoModels,
  ...quantizedModels,
  ...pbrspecularglossinessModels,
];

describe("Models", () => {
  beforeAll(async () => {
    await page.setViewport({ width: 1920, height: 1080 });
  });

  test.each(models.map(toModelTuple))(
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
