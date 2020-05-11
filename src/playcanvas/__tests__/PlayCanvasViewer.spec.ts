/* eslint-disable import/extensions */
import "jest";
import xhrMock from "xhr-mock";
import pc from "playcanvas";
import { PlayCanvasViewer } from "../PlayCanvasViewer";
import {
  mockConfigResponse,
  mockModelResponse,
  mockSceneResponse,
} from "../__fixtures__";

const mockSceneUrl = "scene.json";
const mockModelUrl = "model.gltf";

const toEscapedRegExp = (pattern: string) =>
  new RegExp(pattern.replace(/\./g, "\\."));

const createAndConfigureViewer = async () => {
  const canvas = document.createElement("canvas");
  const viewer = new PlayCanvasViewer(canvas, { autoPlayAnimations: false });
  await viewer.configure();
  return viewer;
};

describe("PlayCanvasViewer", () => {
  beforeEach(() => {
    xhrMock.setup();
    xhrMock.get(toEscapedRegExp("config.json"), { body: mockConfigResponse });
    xhrMock.get(toEscapedRegExp(mockSceneUrl), { body: mockSceneResponse });
    xhrMock.get(toEscapedRegExp(mockModelUrl), { body: mockModelResponse });
    xhrMock.get(toEscapedRegExp(".dds"), { body: null });
  });

  afterEach(() => xhrMock.teardown());

  describe("Setup and teardown", () => {
    it("should be initiated after setup", async () => {
      const viewer = await createAndConfigureViewer();
      expect(viewer.initiated).toBe(true);
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
      await viewer.loadScene(mockSceneUrl);
      expect(viewer.sceneLoaded).toBe(true);
      expect(viewer.app.scene.root).toBeInstanceOf(pc.GraphNode);
    });

    it("should clean up when destroying scene", async () => {
      const viewer = await createAndConfigureViewer();
      await viewer.loadScene(mockSceneUrl);
      viewer.destroyScene();
      expect(viewer.sceneLoaded).toBe(false);
      expect(viewer.app.scene.root).toBeUndefined();
    });
  });

  describe("Model", () => {
    it("should be able to load model", async () => {
      const viewer = await createAndConfigureViewer();
      expect(viewer.modelLoaded).toBe(false);

      const modelBeforeLoad = viewer.app.root.findComponent("model");
      expect(modelBeforeLoad).toBeFalsy();

      await viewer.loadModel(mockModelUrl);
      expect(viewer.modelLoaded).toBe(true);

      const modelAfterLoad = viewer.app.root.findComponent("model");
      expect(modelAfterLoad).not.toBeFalsy();
    });

    it("should be able to load model from blob URL (drag-and-drop) ", async () => {
      // TODO
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
