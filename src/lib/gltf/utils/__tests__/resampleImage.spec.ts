import "jest";
import { resampleImage } from "../resampleImage";
import { imageUri, resampledUri } from "../__fixtures__/imageDataUris";

describe("resampleImage", () => {
  it("should resample image", done => {
    const img = new Image();
    img.width = 150;
    img.height = 99;
    img.src = imageUri;

    img.addEventListener("load", () => {
      const resampledImg = resampleImage(img);
      expect(resampledImg).not.toBe(imageUri);
      expect(resampledImg).toBe(resampledUri);
      done();
    });

    img.addEventListener("error", () => {
      done.fail();
    });
  });
});
