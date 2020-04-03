import "jest";
import "jest-webgl-canvas-mock";
import pc from "playcanvas";
import { readFile } from "fs-extra";
import { translateImage } from "../translateImage";
import { loadGltf } from "../../helpers";
import { translateTexture } from "../translateTexture";
import { loadBuffers } from "../loadBuffers";
import { toArrayBuffer } from "../toArrayBuffer";

describe("translateImage", () => {
  it("should translate glTF image to Playcanvas", async () => {
    const spy = jest.spyOn(window, "fetch").mockImplementation(
      file =>
        Promise.resolve({
          arrayBuffer: async () => {
            return toArrayBuffer(await readFile(file as string));
          },
        }) as any, // eslint-disable-line
    );

    const gltf = await loadGltf("TextureSettingsTest");

    const buffers = await loadBuffers(
      gltf,
      "./public/assets/gltf/TextureSettingsTest/glTF/",
    );

    const canvas = document.createElement("canvas");
    const device = new pc.GraphicsDevice(canvas);
    const textures: pc.Texture[] =
      gltf.textures?.map(tex => translateTexture(tex, { gltf, device })) || [];

    const images = gltf.images
      ?.map(img =>
        translateImage(img, {
          gltf,
          basePath: "./public/assets/gltf/TextureSettingsTest/glTF/",
          textures,
          buffers,
        }),
      )
      .filter((i): i is HTMLImageElement => !!i);

    if (images) {
      // Trigger load event
      const loadEvent = new Event("load");
      images.forEach(img => img.dispatchEvent(loadEvent));

      expect(images.length).toBe(3);
      expect(images[0]).toBeInstanceOf(HTMLImageElement);
      expect(images[1]).toBeInstanceOf(HTMLImageElement);
      expect(images[2]).toBeInstanceOf(HTMLImageElement);
      expect(images[0]?.src.endsWith("CheckAndX_V.png")).toBe(true);
      expect(images[1]?.src.endsWith("CheckAndX.png")).toBe(true);
      expect(images[2]?.src.endsWith("TextureTestLabels.png")).toBe(true);
    }
    spy.mockRestore();
  });
});
