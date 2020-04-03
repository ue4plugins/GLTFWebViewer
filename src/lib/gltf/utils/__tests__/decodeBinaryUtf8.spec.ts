import "jest";
import path from "path";
import { readFile } from "fs-extra";
import { decodeBinaryUtf8 } from "../decodeBinaryUtf8";
import { toArrayBuffer } from "../toArrayBuffer";

const basePath = "./public/assets/gltf";

describe("decodeBinaryUtf8", () => {
  it("should decode binary Duck to utf8", async () => {
    expect.assertions(2);
    const glb = toArrayBuffer(
      await readFile(path.join(basePath, "./Duck/glTF-Binary/Duck.glb")),
    );
    const dataView = new DataView(glb);
    const chunkLength = dataView.getUint32(12, true);
    const jsonData = new Uint8Array(glb, 20, chunkLength);
    const gltf = JSON.parse(decodeBinaryUtf8(jsonData));
    expect(gltf.asset).toBeDefined();
    expect(gltf.asset.generator).toBe("COLLADA2GLTF");
  });

  it("should decode binary Buggy to utf8", async () => {
    expect.assertions(2);
    const glb = toArrayBuffer(
      await readFile(path.join(basePath, "./Buggy/glTF-Binary/Buggy.glb")),
    );
    const dataView = new DataView(glb);
    const chunkLength = dataView.getUint32(12, true);
    const jsonData = new Uint8Array(glb, 20, chunkLength);
    const gltf = JSON.parse(decodeBinaryUtf8(jsonData));
    expect(gltf.asset).toBeDefined();
    expect(gltf.asset.generator).toBe("COLLADA2GLTF");
  });

  it("should decode binary WaterBottle to utf8", async () => {
    expect.assertions(2);
    const glb = toArrayBuffer(
      await readFile(
        path.join(basePath, "./WaterBottle/glTF-Binary/WaterBottle.glb"),
      ),
    );
    const dataView = new DataView(glb);
    const chunkLength = dataView.getUint32(12, true);
    const jsonData = new Uint8Array(glb, 20, chunkLength);
    const gltf = JSON.parse(decodeBinaryUtf8(jsonData));
    expect(gltf.asset).toBeDefined();
    expect(gltf.asset.generator).toBe("glTF Tools for Unity");
  });
});
