import "jest";
import xhrMock from "xhr-mock";
import { PlayCanvasViewer } from "../PlayCanvasViewer";
// eslint-disable-next-line
import mockConfig from "../../../public/assets/playcanvas/config.json";

describe("PlayCanvasViewer", () => {
  beforeEach(() => {
    xhrMock.setup();
    // xhrMock.use((...args) => {
    //   // console.log(args);
    //   return undefined;
    // });
    xhrMock.get(/config\.json$/, { body: JSON.stringify(mockConfig) });
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
  });
});
