import "jest";
import { PlayCanvasViewer } from "../PlayCanvasViewer";

describe("PlayCanvasViewer", () => {
  it("should start without crashing", () => {
    const canvas = document.createElement("canvas");
    const viewer = new PlayCanvasViewer(canvas, { autoPlayAnimations: false });
    expect(viewer.configure).toBeDefined();
  });
});
