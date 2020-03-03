import "jest";
import path from "path";
import { readFile } from "fs-extra";
import { decodeBinaryUtf8 } from "../decodeBinaryUtf8";
import { toArrayBuffer } from "../toArrayBuffer";

describe("decodeBinaryUtf8", () => {
  it("should decode binary to utf8", async () => {
    expect.assertions(2);
    const glb = toArrayBuffer(
      await readFile(path.join(__dirname, "./assets/Duck.glb")),
    );
    const dataView = new DataView(glb);
    const chunkLength = dataView.getUint32(12, true);
    const jsonData = new Uint8Array(glb, 20, chunkLength);
    const gltf = JSON.parse(decodeBinaryUtf8(jsonData));
    expect(gltf.asset).toBeDefined();
    expect(gltf.asset.generator).toBe("COLLADA2GLTF");
  });
});
