import "jest";
import { waitForGltf, waitForScene, waitForViewer } from "./lib/waiters";
import { removeIllegalChars } from "./lib/removeIllegalChars";
import { TestGltf, gltfs } from "./__fixtures__/gltfs";

type GltfTuple = [string, boolean];
const toGltfTuple = (gltf: TestGltf): GltfTuple => [
  gltf.name,
  !!gltf.multipleAngles,
];

describe("glTFs", () => {
  beforeAll(async () => {
    await page.setDefaultNavigationTimeout(0);
    await page.setViewport({ width: 1920, height: 1080 });
  });

  test.each(gltfs.map(toGltfTuple))(
    "glTF '%s' renders the same as baseline snapshot",
    async (name, multipleAngles) => {
      await page.goto(
        `http://localhost:3001?hideUI=true&noAnimations=true&model=${name}`,
      );
      await Promise.all([waitForViewer(), waitForScene(), waitForGltf()]);
      await page.waitFor(1000);

      const fileName = removeIllegalChars(name);

      expect(await page.screenshot()).toMatchImageSnapshot({
        customSnapshotIdentifier: `gltf-${fileName}-front`,
      });

      if (multipleAngles) {
        page.evaluate(() => window.viewer?.resetCamera(90));

        expect(await page.screenshot()).toMatchImageSnapshot({
          customSnapshotIdentifier: `gltf-${fileName}-left`,
        });

        page.evaluate(() => window.viewer?.resetCamera(180));

        expect(await page.screenshot()).toMatchImageSnapshot({
          customSnapshotIdentifier: `gltf-${fileName}-rear`,
        });

        page.evaluate(() => window.viewer?.resetCamera(270));

        expect(await page.screenshot()).toMatchImageSnapshot({
          customSnapshotIdentifier: `gltf-${fileName}-right`,
        });

        page.evaluate(() => window.viewer?.resetCamera(0, -90));

        expect(await page.screenshot()).toMatchImageSnapshot({
          customSnapshotIdentifier: `gltf-${fileName}-above`,
        });
      }
    },
  );
});
