/* eslint-disable import/extensions */
import "jest";
import xhrMock from "xhr-mock";
import { MockFunction } from "xhr-mock/lib/types";
import pc from "playcanvas";
import { PlayCanvasViewer } from "../PlayCanvasViewer";
import {
  configResponse,
  sceneResponse,
  modelEmbeddedResponse,
  modelUnpackedResponse,
  modelUnpackedBinResponse,
} from "../__fixtures__";

const sceneUrl = "scene.json";
const modelEmbeddedUrl = "model-embedded.gltf";
const modelUnpackedUrl = "model-unpacked.gltf";
const modelUnpackedBlobUrl = "d9031d07-b017-4aa8-af51-f6bc461f37a4";

const toEscapedRegExp = (pattern: string) =>
  new RegExp(pattern.replace(/\./g, "\\."));

const createAndConfigureViewer = async () => {
  const canvas = document.createElement("canvas");
  const viewer = new PlayCanvasViewer(canvas, { autoPlayAnimations: false });
  await viewer.configure();
  return viewer;
};

const createRequestHandler = (body: any) => {
  const handler: MockFunction = (_, res) => res.body(body);
  return jest.fn(handler);
};

describe("PlayCanvasViewer", () => {
  const configHandler = createRequestHandler(configResponse);
  const sceneHandler = createRequestHandler(sceneResponse);
  const modelEmbeddedHandler = createRequestHandler(modelEmbeddedResponse);
  const modelUnpackedHandler = createRequestHandler(modelUnpackedResponse);
  const ddsHandler = createRequestHandler(null);
  const binHandler = createRequestHandler(modelUnpackedBinResponse);

  beforeAll(() => {
    xhrMock.setup();
    xhrMock.get(toEscapedRegExp("config.json"), configHandler);
    xhrMock.get(toEscapedRegExp(sceneUrl), sceneHandler);
    xhrMock.get(toEscapedRegExp(modelEmbeddedUrl), modelEmbeddedHandler);
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
      // TODO
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
      // TODO
    });

    it("should auto play animations if specified in constructor", async () => {
      // TODO
    });
  });

  describe("Camera", () => {
    it("should have camera", async () => {
      // TODO
    });

    it("should focus camera after loading model", async () => {
      // TODO
    });

    it("should be able to focus on entity", async () => {
      // TODO
    });

    it("should be able to reset camera placement props", async () => {
      // TODO
    });
  });
});
