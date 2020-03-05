import "jest";
import { ComponentType } from "../../types";
import { getAccessorData } from "../getAccessorData";
import { loadGltf, loadBin, getAccessor } from "../../helpers";

describe("getAccessorData", () => {
  it("should get 5120 (BYTE) as Int8Array", async () => {
    const gltf = await loadGltf("AnimatedMorphCube", undefined, "Quantized");
    const buffers = await loadBin("AnimatedMorphCube", undefined, "Quantized");
    const accessor = getAccessor(gltf, ComponentType.BYTE);
    const data = getAccessorData(gltf, accessor, [buffers]);
    expect(data).toBeInstanceOf(Int8Array);
    expect(data?.length).toBe(72);
  });

  it("should get 5121 (UNSIGNED_BYTE) as Uint8Array", async () => {
    const gltf = await loadGltf("AnimatedMorphCube", undefined, "Quantized");
    const buffers = await loadBin("AnimatedMorphCube", undefined, "Quantized");
    const accessor = getAccessor(gltf, ComponentType.UNSIGNED_BYTE);
    const data = getAccessorData(gltf, accessor, [buffers]);
    expect(data).toBeInstanceOf(Uint8Array);
    expect(data?.length).toBe(254);
  });

  it("should get 5122 (SHORT) as Uint8Array", async () => {
    const gltf = await loadGltf("AnimatedMorphCube", undefined, "Quantized");
    const buffers = await loadBin("AnimatedMorphCube", undefined, "Quantized");
    const accessor = getAccessor(gltf, ComponentType.SHORT);
    const data = getAccessorData(gltf, accessor, [buffers]);
    expect(data).toBeInstanceOf(Int16Array);
    expect(data?.length).toBe(72);
  });

  it("should get 5123 (UNSIGNED_SHORT) as Uint16Array", async () => {
    const gltf = await loadGltf("AnimatedMorphCube", undefined, "Quantized");
    const buffers = await loadBin("AnimatedMorphCube", undefined, "Quantized");
    const accessor = getAccessor(gltf, ComponentType.UNSIGNED_SHORT);
    const data = getAccessorData(gltf, accessor, [buffers]);
    expect(data).toBeInstanceOf(Uint16Array);
    expect(data?.length).toBe(72);
  });

  it("should get 5125 (UNSIGNED_INT) as Uint32Array", async () => {
    const gltf = await loadGltf("TextureTransformTest");
    const buffers = await loadBin("TextureTransformTest");
    const accessor = getAccessor(gltf, ComponentType.UNSIGNED_INT);
    const data = getAccessorData(gltf, accessor, [buffers]);
    expect(data).toBeInstanceOf(Uint32Array);
    expect(data?.length).toBe(6);
  });

  it("should get 5126 (FLOAT) as Float32Array", async () => {
    const gltf = await loadGltf("AnimatedMorphCube", undefined, "Quantized");
    const buffers = await loadBin("AnimatedMorphCube", undefined, "Quantized");
    const accessor = getAccessor(gltf, ComponentType.FLOAT);
    const data = getAccessorData(gltf, accessor, [buffers]);
    expect(data).toBeInstanceOf(Float32Array);
    expect(data?.length).toBe(127);
  });
});
