import "jest";
import { loadBuffers } from "../loadBuffers";
import { GlTf } from "../../types";
import { loadGltf, loadBin, arrayBuffersAreEqual } from "../../helpers";

const basePath = "./public/assets/models/Duck";

describe("loadBuffers", () => {
  it("should resolve to empty array if buffers are missing", () => {
    const gltf = {} as GlTf;
    expect(loadBuffers(gltf, basePath)).resolves.toStrictEqual([]);
  });

  it("should load buffers from external source", async () => {
    const orgBuffers = await loadBin("Duck", "Duck0.bin");
    const spy = jest.spyOn(window, "fetch").mockImplementation(
      () =>
        Promise.resolve({
          arrayBuffer: () => Promise.resolve(orgBuffers),
        }) as any, // eslint-disable-line
    );

    const gltf = await loadGltf("Duck");
    const loadedBuffers = await loadBuffers(gltf, basePath + "/glTF/");
    expect(loadedBuffers.length).toBe(1);
    expect(arrayBuffersAreEqual(loadedBuffers[0], orgBuffers)).toBe(true);
    expect(window.fetch).toHaveBeenCalledWith(basePath + "/glTF/Duck0.bin");
    expect(window.fetch).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it("should load buffers from embedded source", async () => {
    const orgBuffers = await loadBin("Duck", "Duck0.bin");
    const gltf = await loadGltf("Duck", "Duck.gltf", "Embedded");
    const loadedBuffers = await loadBuffers(gltf, basePath + "/glTF-Embedded/");
    expect(loadedBuffers.length).toBe(1);
    expect(arrayBuffersAreEqual(loadedBuffers[0], orgBuffers)).toBe(true);
  });

  it("should resolve to empty array buffer if fetch fails", async () => {
    const spy = jest.spyOn(window, "fetch").mockImplementation(
      () => Promise.reject(new Error("Test")) as any, // eslint-disable-line
    );
    const gltf = await loadGltf("Duck");
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
