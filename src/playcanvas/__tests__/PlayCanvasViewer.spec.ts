import "jest";
import xhrMock from "xhr-mock";
import pc from "playcanvas";
import { PlayCanvasViewer } from "../PlayCanvasViewer";
// eslint-disable-next-line
import mockConfig from "../../../public/assets/playcanvas/config.json";
// eslint-disable-next-line
import mockScene from "../../../public/assets/playcanvas/894846.json";

const mockSceneUrl = `${mockScene.id}.json`;
const mockSceneUrlRegExp = new RegExp(mockSceneUrl.replace(/\./g, "\\."));
describe("PlayCanvasViewer", () => {
  beforeEach(() => {
    xhrMock.setup();
    // xhrMock.use((...args) => {
    //   // console.log(args);
    //   return undefined;
    // });
    xhrMock.get(/config\.json$/, { body: JSON.stringify(mockConfig) });
    xhrMock.get(mockSceneUrlRegExp, { body: JSON.stringify(mockScene) });
    xhrMock.get(/\.dds/, { body: undefined });
  });

  afterEach(() => xhrMock.teardown());

  describe("Setup and teardown", () => {
    it("should be initiated after setup", async () => {
      const canvas = document.createElement("canvas");
      const viewer = new PlayCanvasViewer(canvas, {
        autoPlayAnimations: false,
      });
      await viewer.configure();
      expect(viewer.initiated).toBe(true);
    });

    it("should have scene list after setup", async () => {
      const canvas = document.createElement("canvas");
      const viewer = new PlayCanvasViewer(canvas, {
        autoPlayAnimations: false,
      });
      await viewer.configure();
      expect(viewer.scenes.length).toBeGreaterThan(0);
    });

    it("should destroy model, scene and app on teardown", async () => {
      // TODO
    });
  });

  describe("Scene", () => {
    it("should be able to load scene", async () => {
      const canvas = document.createElement("canvas");
      const viewer = new PlayCanvasViewer(canvas, {
        autoPlayAnimations: false,
      });
      await viewer.configure();
      expect(viewer.sceneLoaded).toBe(false);
      expect(viewer.app.scene.root).toBe(null);

      const scene = viewer.scenes.find(s => s.url === mockSceneUrl);
      if (!scene) {
        throw new Error("Test scene not found");
      }

      await viewer.loadScene(scene.url);
      expect(viewer.sceneLoaded).toBe(true);
      expect(viewer.app.scene.root).toBeInstanceOf(pc.GraphNode);
    });

    it("should clean up when destroying scene", async () => {
      //TODO
    });
  });

  describe("Model", () => {
    it("should be able to load model", async () => {
      //TODO
    });

    it("should be able to load model from blob URL (drag-and-drop) ", async () => {
      //TODO
    });

    it("should clean up when destroying model", async () => {
      //TODO
    });

    it("should auto play animations if specified in constructor", async () => {
      //TODO
    });
  });

  describe("Camera", () => {
    it("should have camera", async () => {
      //TODO
    });

    it("should focus camera after loading model", async () => {
      //TODO
    });

    it("should be able to focus on entity", async () => {
      //TODO
    });

    it("should be able to reset camera placement props", async () => {
      //TODO
    });
  });
});
