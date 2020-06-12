import "jest";
import { waitForScene, waitForViewer } from "./lib/waiters";
import { removeIllegalChars } from "./lib/removeIllegalChars";
import { scenes } from "./__fixtures__/scenes";

type SceneTuple = [string];
const toSceneTuple = (scene: pc.SceneSource): SceneTuple => [scene.name];

describe("Scenes", () => {
  beforeAll(async () => {
    await page.setDefaultNavigationTimeout(0);
    await page.setViewport({ width: 1920, height: 1080 });
  });

  test.each(scenes.map(toSceneTuple))(
    "scene '%s' renders the same as baseline snapshot",
    async name => {
      await page.goto(`http://localhost:3001?hideUI=true&gltf=_&scene=${name}`);
      await Promise.all([waitForViewer(), waitForScene()]);
      await page.waitFor(500);

      expect(await page.screenshot()).toMatchImageSnapshot({
        customSnapshotIdentifier: `scene-${removeIllegalChars(name)}`,
      });
    },
  );
});
