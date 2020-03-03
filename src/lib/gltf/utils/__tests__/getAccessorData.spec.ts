import "jest";
import path from "path";
import { readFile } from "fs-extra";
import { GlTf, ComponentType } from "../../types";
import { getAccessorData } from "../getAccessorData";
import { toArrayBuffer } from "../toArrayBuffer";

async function getQuanizedData() {
  const basePath = "./public/assets/models/AnimatedMorphCube/glTF-Quantized";
  const gltf: GlTf = JSON.parse(
    (
      await readFile(path.join(basePath, "./AnimatedMorphCube.gltf"))
    ).toString(),
  );
  const buffers = [
    toArrayBuffer(
      await readFile(path.join(basePath, "./AnimatedMorphCube.bin")),
    ),
  ];
  return { gltf, buffers };
}

async function getNormalData() {
  const basePath = "./public/assets/models/TextureTransformTest/glTF";
  const gltf: GlTf = JSON.parse(
    (
      await readFile(path.join(basePath, "./TextureTransformTest.gltf"))
    ).toString(),
  );
  const buffers = [
    toArrayBuffer(
      await readFile(path.join(basePath, "./TextureTransformTest.bin")),
    ),
  ];
  return { gltf, buffers };
}

describe("getAccessorData", () => {
  it("should get 5120 (BYTE) as Int8Array", async () => {
    const { gltf, buffers } = await getQuanizedData();
    const accessor = Object.values(gltf.accessors).find(
      acc => acc.componentType === ComponentType.BYTE,
    );
    const data = getAccessorData(gltf, accessor, buffers);
    expect(data).toBeInstanceOf(Int8Array);
    expect(data.length).toBe(72);
  });

  it("should get 5121 (UNSIGNED_BYTE) as Uint8Array", async () => {
    const { gltf, buffers } = await getQuanizedData();
    const accessor = Object.values(gltf.accessors).find(
      acc => acc.componentType === ComponentType.UNSIGNED_BYTE,
    );
    const data = getAccessorData(gltf, accessor, buffers);
    expect(data).toBeInstanceOf(Uint8Array);
    expect(data.length).toBe(254);
  });

  it("should get 5122 (SHORT) as Uint8Array", async () => {
    const { gltf, buffers } = await getQuanizedData();
    const accessor = Object.values(gltf.accessors).find(
      acc => acc.componentType === ComponentType.SHORT,
    );
    const data = getAccessorData(gltf, accessor, buffers);
    expect(data).toBeInstanceOf(Int16Array);
    expect(data.length).toBe(72);
  });

  it("should get 5123 (UNSIGNED_SHORT) as Uint16Array", async () => {
    const { gltf, buffers } = await getQuanizedData();
    const accessor = Object.values(gltf.accessors).find(
      acc => acc.componentType === ComponentType.UNSIGNED_SHORT,
    );
    const data = getAccessorData(gltf, accessor, buffers);
    expect(data).toBeInstanceOf(Uint16Array);
    expect(data.length).toBe(72);
  });

  it("should get 5125 (UNSIGNED_INT) as Uint32Array", async () => {
    const { gltf, buffers } = await getNormalData();
    const accessor = Object.values(gltf.accessors).find(
      acc => acc.componentType === ComponentType.UNSIGNED_INT,
    );
    const data = getAccessorData(gltf, accessor, buffers);
    expect(data).toBeInstanceOf(Uint32Array);
    expect(data.length).toBe(6);
  });

  it("should get 5126 (FLOAT) as Float32Array", async () => {
    const { gltf, buffers } = await getQuanizedData();
    const accessor = Object.values(gltf.accessors).find(
      acc => acc.componentType === ComponentType.FLOAT,
    );
    const data = getAccessorData(gltf, accessor, buffers);
    expect(data).toBeInstanceOf(Float32Array);
    expect(data.length).toBe(127);
  });
});
