import "jest";
import { waitForModel, waitForScene, waitForViewer } from "./lib/waiters";
import { removeIllegalChars } from "./lib/removeIllegalChars";
import { TestModel, models } from "./__fixtures__/models";

type ModelTuple = [string, boolean];
const toModelTuple = (model: TestModel): ModelTuple => [
  model.name,
  !!model.multipleAngles,
];

describe("Models", () => {
  beforeAll(async () => {
    await page.setDefaultNavigationTimeout(0);
    await page.setViewport({ width: 1920, height: 1080 });
  });

  test.each(models.map(toModelTuple))(
    "model '%s' renders the same as baseline snapshot",
    async (name, multipleAngles) => {
      await page.goto(
        `http://localhost:3001?hideUI=true&noAnimations=true&model=${name}`,
      );
      await Promise.all([waitForViewer(), waitForScene(), waitForModel()]);
      await page.waitFor(1000);

      const fileName = removeIllegalChars(name);

      expect(await page.screenshot()).toMatchImageSnapshot({
        customSnapshotIdentifier: `model-${fileName}-front`,
      });

      if (multipleAngles) {
        page.evaluate(() => window.viewer?.resetCamera(90));

        expect(await page.screenshot()).toMatchImageSnapshot({
          customSnapshotIdentifier: `model-${fileName}-left`,
        });

        page.evaluate(() => window.viewer?.resetCamera(180));

        expect(await page.screenshot()).toMatchImageSnapshot({
          customSnapshotIdentifier: `model-${fileName}-rear`,
        });

        page.evaluate(() => window.viewer?.resetCamera(270));

        expect(await page.screenshot()).toMatchImageSnapshot({
          customSnapshotIdentifier: `model-${fileName}-right`,
        });

        page.evaluate(() => window.viewer?.resetCamera(0, -90));

        expect(await page.screenshot()).toMatchImageSnapshot({
          customSnapshotIdentifier: `model-${fileName}-above`,
        });
      }
    },
  );
});
