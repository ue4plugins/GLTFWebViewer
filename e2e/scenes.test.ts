import "jest";
import { waitForScene, waitForViewer } from "./lib/waiters";
import { scenes } from "./__fixtures__/scenes";

type SceneTuple = [string];
const toSceneTuple = (scene: pc.SceneFile): SceneTuple => [scene.name];

describe("Scenes", () => {
  beforeAll(async () => {
    await page.setViewport({ width: 1920, height: 1080 });
  });

  test.each(scenes.map(toSceneTuple))(
    "scene '%s' renders the same as baseline snapshot",
    async name => {
      await page.goto(
        `http://localhost:3001?hideUI=true&model=_&scene=${name}`,
      );
      await Promise.all([waitForViewer(), waitForScene()]);

      expect(await page.screenshot()).toMatchImageSnapshot({
        customSnapshotIdentifier: `scene-${name}`,
      });
    },
  );
});
