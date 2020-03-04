import "jest";
import path from "path";
import { readFile } from "fs-extra";
import { loadBuffers } from "../loadBuffers";
import { GlTf } from "../../types";
import { toArrayBuffer } from "../toArrayBuffer";

const basePath = "./public/assets/models/Duck";

async function loadGltf(): Promise<GlTf> {
  return JSON.parse(
    (await readFile(path.join(basePath, "./glTF/Duck.gltf"))).toString(),
  );
}

async function loadBin(): Promise<ArrayBuffer> {
  return toArrayBuffer(await readFile(path.join(basePath, "./glTF/Duck0.bin")));
}

async function loadEmbeddedGltf(): Promise<GlTf> {
  return JSON.parse(
    (
      await readFile(path.join(basePath, "./glTF-Embedded/Duck.gltf"))
    ).toString(),
  );
}

function dataViewsAreEqual(a: DataView, b: DataView) {
  if (a.byteLength !== b.byteLength) {
    return false;
  }
  for (let i = 0; i < a.byteLength; i += 1) {
    if (a.getUint8(i) !== b.getUint8(i)) {
      return false;
    }
  }
  return true;
}

function arrayBuffersAreEqual(a: ArrayBuffer, b: ArrayBuffer) {
  return dataViewsAreEqual(new DataView(a), new DataView(b));
}

describe("loadBuffers", () => {
  it("should resolve to empty array if buffers are missing", () => {
    const gltf = {} as GlTf;
    expect(loadBuffers(gltf, basePath)).resolves.toStrictEqual([]);
  });

  it("should load buffers from external source", async () => {
    const orgBuffers = await loadBin();
    const spy = jest.spyOn(window, "fetch").mockImplementation(
      () =>
        Promise.resolve({
          arrayBuffer: () => Promise.resolve(orgBuffers),
        }) as any, // eslint-disable-line
    );

    const gltf = await loadGltf();
    const loadedBuffers = await loadBuffers(gltf, basePath + "/glTF/");
    expect(loadedBuffers.length).toBe(1);
    expect(arrayBuffersAreEqual(loadedBuffers[0], orgBuffers)).toBe(true);
    expect(window.fetch).toHaveBeenCalledWith(basePath + "/glTF/Duck0.bin");
    expect(window.fetch).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it("should load buffers from embedded source", async () => {
    const orgBuffers = await loadBin();
    const gltf = await loadEmbeddedGltf();
    const loadedBuffers = await loadBuffers(gltf, basePath + "/glTF-Embedded/");
    expect(loadedBuffers.length).toBe(1);
    expect(arrayBuffersAreEqual(loadedBuffers[0], orgBuffers)).toBe(true);
  });

  it("should resolve to empty array buffer if fetch fails", async () => {
    const spy = jest.spyOn(window, "fetch").mockImplementation(
      () => Promise.reject(new Error("Test")) as any, // eslint-disable-line
    );
    const gltf = await loadGltf();
    const loadedBuffers = await loadBuffers(gltf, basePath + "/glTF/");
    expect(loadedBuffers.length).toBe(1);
    expect(arrayBuffersAreEqual(loadedBuffers[0], new ArrayBuffer(0))).toBe(
      true,
    );
    expect(window.fetch).toHaveBeenCalledWith(basePath + "/glTF/Duck0.bin");
    expect(window.fetch).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
