import "jest";
import xhrMock from "xhr-mock";
import { readFile } from "fs-extra";
import { PlayCanvasViewer } from "../PlayCanvasViewer";

describe("PlayCanvasViewer", () => {
  let mockConfig = {};

  beforeAll(async () => {
    mockConfig = JSON.parse(
      (await readFile("public/assets/playcanvas/config.json")).toString(),
    );
  });

  beforeEach(() => {
    xhrMock.setup();
    xhrMock.use((...args) => {
      // console.log(args);
      return undefined;
    });
    xhrMock.get(/config\.json$/, { body: JSON.stringify(mockConfig) });
  });

  afterEach(() => xhrMock.teardown());

  it("should start and configure without crashing", async () => {
    const canvas = document.createElement("canvas");
    const viewer = new PlayCanvasViewer(canvas, { autoPlayAnimations: false });
    await viewer.configure();
    expect(viewer.initiated).toBe(true);
  });
});
