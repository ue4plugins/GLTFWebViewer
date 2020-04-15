import "jest";
import { GltfFile } from "../src/playcanvas";
import { waitForModel, waitForScene, waitForViewer } from "./lib/waiters";

describe("Models", () => {
  let models: GltfFile[] = [];

  beforeAll(async () => {
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto("http://localhost:3001?hideUI=true");

    const modelsResponse = await page.evaluate(async () => {
      const response = await fetch("assets/index.json");
      return (await response.json()) as GltfFile[] | undefined;
    });

    if (!modelsResponse || modelsResponse.length === 0) {
      throw new Error("Model index file not found");
    }

    models = modelsResponse;
  });

  // it("should be able to load binary glTF", async () => {
  //   expect(models).toBeDefined();

  //   for (const model of models.filter(m => m.type === "binary").slice(0, 5)) {
  //     await page.goto(
  //       `http://localhost:3001?hideUI=true&model=${model.name}&modelType=${model.type}`,
  //     );
  //     await Promise.all([waitForViewer(), waitForScene(), waitForModel()]);

  //     expect(await page.screenshot()).toMatchImageSnapshot({
  //       customSnapshotIdentifier: `model-${model.name}-${model.type}`,
  //     });
  //   }
  // });

  it("should be able to load binary glTF", async () => {
    expect(models).toBeDefined();

    for (const model of models.filter(m => m.type === "binary").slice(0, 5)) {
      await page.evaluate(async (path: string) => {
        if (!window.viewer) {
          throw new Error("window.viewer not found");
        }
        await window.viewer.loadModel(path);
      }, model.path);

      await waitForModel();

      expect(await page.screenshot()).toMatchImageSnapshot({
        customSnapshotIdentifier: `model-${model.name}-${model.type}`,
      });
    }
  });

  // it("should have a default model", async () => {

  //   const models = await page.evaluate(async () => {
  //     const response = await fetch("assets/index.json");
  //     return (await response.json()) as GltfFile[] | undefined;
  //   });

  //   if (!models || models.length === 0) {
  //     throw new Error("Model index file not found");
  //   }

  //   expect(models).toBeDefined();

  //   for (const model of models.slice(0, 5)) {
  //     await page.evaluate(async (path: string) => {
  //       await window.viewer.loadModel(path);
  //     }, model.path);
  //     await waitForModel();

  //     expect(await page.screenshot()).toMatchImageSnapshot({
  //       customSnapshotIdentifier: `model-${model.name}-${model.type}`,
  //     });
  //   }

  //   // await page.goto("http://localhost:3001?hideUI=true");
  //   // await Promise.all([waitForViewer(), waitForScene(), waitForModel()]);
  //   // expect(await page.screenshot()).toMatchImageSnapshot();
  // });

  // it("should have model 'Duck'", async () => {
  //   await page.goto("http://localhost:3001?hideUI=true&model=Duck");
  //   await Promise.all([waitForViewer(), waitForScene(), waitForModel()]);
  //   expect(await page.screenshot()).toMatchImageSnapshot();
  // });

  // it("should have model 'DamagedHelmet'", async () => {
  //   await page.goto("http://localhost:3001?hideUI=true&model=DamagedHelmet");
  //   await Promise.all([waitForViewer(), waitForScene(), waitForModel()]);
  //   expect(await page.screenshot()).toMatchImageSnapshot();
  // });
});
