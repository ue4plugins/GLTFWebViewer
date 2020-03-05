import "jest";
import "jest-webgl-canvas-mock";
import pc from "playcanvas";
import { translateTexture } from "../translateTexture";
import { loadGltf } from "../../helpers";

describe("translateImage", () => {
  it("should translate glTF textures to PlayCanvas textures", async () => {
    const gltf = await loadGltf("TextureSettingsTest");
    const canvas = document.createElement("canvas");
    const device = new pc.GraphicsDevice(canvas);
    const textures: pc.Texture[] =
      gltf.textures?.map(tex => translateTexture(tex, { gltf, device })) || [];
    expect(textures.length).toBe(9);
    expect(textures[0]).toBeInstanceOf(pc.Texture);
  });
});
