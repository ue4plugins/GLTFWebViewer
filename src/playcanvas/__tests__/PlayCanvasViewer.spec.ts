/* eslint-disable import/extensions */
import "jest";
import xhrMock from "xhr-mock";
import { MockFunction } from "xhr-mock/lib/types";
import pc from "@animech-public/playcanvas";
import { PlayCanvasViewer } from "../PlayCanvasViewer";
import {
  configResponse,
  sceneResponse,
  modelEmbeddedResponse,
  modelEmbeddedInvalidResponse,
  modelEmbeddedAnimatedResponse,
  modelUnpackedResponse,
  modelUnpackedBinResponse,
} from "../__fixtures__";

const sceneUrl = "scene.json";
const modelEmbeddedUrl = "model-embedded.gltf";
const modelEmbeddedInvalidUrl = "model-embedded-invalid.gltf";
const modelEmbeddedAnimatedUrl = "model-embedded-anim.gltf";
const modelUnpackedUrl = "model-unpacked.gltf";
const modelUnpackedBlobUrl = "d9031d07-b017-4aa8-af51-f6bc461f37a4";

const toEscapedRegExp = (pattern: string) =>
  new RegExp(pattern.replace(/\./g, "\\."));

const createAndConfigureViewer = async () => {
  const canvas = document.createElement("canvas");
  const viewer = new PlayCanvasViewer(canvas);
  await viewer.configure();
  return viewer;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createRequestHandler = (body: any) => {
  const handler: MockFunction = (_, res) => res.body(body);
  return jest.fn(handler);
};

const waitForAnimationFrame = () =>
  new Promise<void>(resolve => {
    requestAnimationFrame(() => resolve());
  });

describe("PlayCanvasViewer", () => {
  const configHandler = createRequestHandler(configResponse);
  const sceneHandler = createRequestHandler(sceneResponse);
  const modelEmbeddedHandler = createRequestHandler(modelEmbeddedResponse);
  const modelEmbeddedInvalidHandler = createRequestHandler(
    modelEmbeddedInvalidResponse,
  );
  const modelEmbeddedAnimatedHandler = createRequestHandler(
    modelEmbeddedAnimatedResponse,
  );
  const modelUnpackedHandler = createRequestHandler(modelUnpackedResponse);
  const ddsHandler = createRequestHandler(null);
  const binHandler = createRequestHandler(modelUnpackedBinResponse);

  beforeAll(() => {
    xhrMock.setup();
    xhrMock.get(toEscapedRegExp("config.json"), configHandler);
    xhrMock.get(toEscapedRegExp(sceneUrl), sceneHandler);
    xhrMock.get(toEscapedRegExp(modelEmbeddedUrl), modelEmbeddedHandler);
    xhrMock.get(
      toEscapedRegExp(modelEmbeddedInvalidUrl),
      modelEmbeddedInvalidHandler,
    );
    xhrMock.get(
      toEscapedRegExp(modelEmbeddedAnimatedUrl),
      modelEmbeddedAnimatedHandler,
    );
    xhrMock.get(toEscapedRegExp(modelUnpackedUrl), modelUnpackedHandler);
    xhrMock.get(toEscapedRegExp(modelUnpackedBlobUrl), modelUnpackedHandler);
    xhrMock.get(toEscapedRegExp(".dds"), ddsHandler);
    xhrMock.get(toEscapedRegExp(".bin"), binHandler);
  });

  afterAll(() => xhrMock.teardown());

  beforeEach(() => {
    configHandler.mockClear();
    sceneHandler.mockClear();
    modelEmbeddedHandler.mockClear();
    modelUnpackedHandler.mockClear();
    ddsHandler.mockClear();
    binHandler.mockClear();
  });

  describe("Setup and teardown", () => {
    it("should be initiated after setup", async () => {
      const viewer = await createAndConfigureViewer();
      expect(viewer.initiated).toBe(true);
      expect(configHandler).toHaveBeenCalledTimes(1);
    });

    it("should have scene list after setup", async () => {
      const viewer = await createAndConfigureViewer();
      expect(viewer.scenes.length).toBeGreaterThan(0);
    });

    it("should destroy model, scene and app on teardown", async () => {
      const viewer = await createAndConfigureViewer();
      await viewer.loadScene(sceneUrl);
      await viewer.loadModel(modelEmbeddedUrl);
      viewer.destroy();

      expect(viewer.initiated).toBe(false);
      expect(viewer.sceneLoaded).toBe(false);
      expect(viewer.modelLoaded).toBe(false);
      expect(viewer.scenes.length).toBe(0);
      expect(viewer.app.scene || undefined).toBeUndefined();
      expect(viewer.app.root || undefined).toBeUndefined();
    });
  });

  describe("Scene", () => {
    it("should be able to load scene", async () => {
      const viewer = await createAndConfigureViewer();
      expect(viewer.sceneLoaded).toBe(false);
      expect(viewer.app.scene.root).toBe(null);

      await viewer.loadScene(sceneUrl);
      expect(viewer.sceneLoaded).toBe(true);
      expect(viewer.app.scene.root).toBeInstanceOf(pc.GraphNode);
      expect(sceneHandler).toHaveBeenCalledTimes(1);
    });

    it("should clean up when destroying scene", async () => {
      const viewer = await createAndConfigureViewer();
      await viewer.loadScene(sceneUrl);
      viewer.destroyScene();
      expect(viewer.sceneLoaded).toBe(false);
      expect(viewer.app.scene.root).toBeUndefined();
    });
  });

  describe("Model", () => {
    it("should be able to load embedded model", async () => {
      const viewer = await createAndConfigureViewer();
      expect(viewer.modelLoaded).toBe(false);

      const modelBeforeLoad = viewer.app.root.findComponent("model");
      expect(modelBeforeLoad || undefined).toBeUndefined();

      await viewer.loadModel(modelEmbeddedUrl);
      expect(viewer.modelLoaded).toBe(true);
      expect(modelEmbeddedHandler).toHaveBeenCalledTimes(1);

      const modelAfterLoad = viewer.app.root.findComponent("model");
      expect(modelAfterLoad || undefined).toBeDefined();
    });

    it("should be able to load unpacked model", async () => {
      const viewer = await createAndConfigureViewer();
      expect(viewer.modelLoaded).toBe(false);

      const modelBeforeLoad = viewer.app.root.findComponent("model");
      expect(modelBeforeLoad || undefined).toBeUndefined();

      await viewer.loadModel(modelUnpackedUrl);
      expect(viewer.modelLoaded).toBe(true);
      expect(modelUnpackedHandler).toHaveBeenCalledTimes(1);
      expect(binHandler).toHaveBeenCalledTimes(1);

      const modelAfterLoad = viewer.app.root.findComponent("model");
      expect(modelAfterLoad || undefined).toBeDefined();
    });

    it("should be able to load model from blob URL (drag-and-drop) ", async () => {
      const viewer = await createAndConfigureViewer();
      expect(viewer.modelLoaded).toBe(false);

      const modelBeforeLoad = viewer.app.root.findComponent("model");
      expect(modelBeforeLoad || undefined).toBeUndefined();

      await viewer.loadModel(modelUnpackedBlobUrl, "model.gltf");
      expect(viewer.modelLoaded).toBe(true);
      expect(modelUnpackedHandler).toHaveBeenCalledTimes(1);
      expect(binHandler).toHaveBeenCalledTimes(1);

      const modelAfterLoad = viewer.app.root.findComponent("model");
      expect(modelAfterLoad || undefined).toBeDefined();
    });

    it("should clean up when destroying model", async () => {
      const viewer = await createAndConfigureViewer();
      await viewer.loadModel(modelEmbeddedUrl);
      viewer.destroyModel();
      expect(viewer.modelLoaded).toBe(false);

      const model = viewer.app.root.findComponent("model");
      expect(model || undefined).toBeUndefined();
    });

    it("should throw when loading invalid model", async () => {
      const originalConsoleError = console.error;
      console.error = jest.fn();

      expect.assertions(3);

      const viewer = await createAndConfigureViewer();

      try {
        await viewer.loadModel(modelEmbeddedInvalidUrl);
      } catch (e) {
        expect(e).toBeDefined();
      }

      expect(viewer.modelLoaded).toBe(true);
      const model = viewer.app.root.findComponent("model");
      expect(model || undefined).toBeUndefined();

      console.error = originalConsoleError;
    });
  });

  describe("Camera", () => {
    it("should have a default camera", async () => {
      const viewer = await createAndConfigureViewer();
      const camera = viewer.app.root.findComponent("camera");
      expect(camera || undefined).toBeDefined();
    });

    it("should focus camera after loading model", async () => {
      const viewer = await createAndConfigureViewer();
      const camera = viewer.app.root.findComponent(
        "camera",
      ) as pc.CameraComponent;
      expect(camera || undefined).toBeDefined();

      const transformBefore = camera.entity.getLocalTransform().clone().data;

      await viewer.loadModel(modelEmbeddedUrl);
      await waitForAnimationFrame();

      const transformAfter = camera.entity.getLocalTransform().clone().data;
      expect(transformAfter).not.toEqual(transformBefore);
    });

    it("should be able to focus on entity", async () => {
      const viewer = await createAndConfigureViewer();
      const camera = viewer.app.root.findComponent(
        "camera",
      ) as pc.CameraComponent;

      await viewer.loadModel(modelEmbeddedUrl);
      await waitForAnimationFrame();

      const transformBefore = camera.entity.getLocalTransform().clone().data;

      viewer.resetCamera(0, 0, 0);
      await waitForAnimationFrame();
      viewer.focusCameraOnEntity();
      await waitForAnimationFrame();

      const transformAfter = camera.entity.getLocalTransform().clone().data;
      expect(transformAfter).toEqual(transformBefore);
    });

    it("should be able to reset camera placement props", async () => {
      const viewer = await createAndConfigureViewer();
      const camera = viewer.app.root.findComponent(
        "camera",
      ) as pc.CameraComponent;

      await viewer.loadModel(modelEmbeddedUrl);
      await waitForAnimationFrame();

      const transformBefore = camera.entity.getLocalTransform().clone().data;

      viewer.resetCamera(1, 1, 1);
      await waitForAnimationFrame();

      const transformAfter = camera.entity.getLocalTransform().clone().data;
      expect(transformAfter).not.toEqual(transformBefore);
    });
  });
});
