import "jest";
import { PlayCanvasViewer } from "../PlayCanvasViewer";

describe("PlayCanvasViewer", () => {
  it("should start", () => {
    const canvas = document.createElement("canvas");
    const viewer = new PlayCanvasViewer(canvas);
    expect(viewer.configure).toBeDefined();
  });
});