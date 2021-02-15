import "jest";
import { GltfStore } from "../GltfStore";
import { gltfs } from "../__fixtures__/gltfs";

const mockLocationSearch = (search: string) =>
  Object.defineProperty(window, "location", {
    writable: true,
    value: {
      search,
    },
  });

describe("GltfStore", () => {
  const originalLocation = window.location;

  afterAll(() => {
    Object.defineProperty(window, "location", {
      value: originalLocation,
    });
  });

  it("should load glTFs", async () => {
    const store = new GltfStore();
    store.setGltfs(gltfs);
    expect(store.gltfs).toEqual(gltfs);
  });

  it("should not have default glTF", async () => {
    const store = new GltfStore();
    store.setGltfs(gltfs);
    expect(store.gltf).toBeUndefined();
  });

  it("should have glTF after setGltf is called", async () => {
    const store = new GltfStore();
    store.setGltfs(gltfs);
    store.setGltf(store.gltfs[5]);
    expect(store.gltf).toBe(store.gltfs[5]);
  });

  it("should automatically set glTF from url param", async () => {
    mockLocationSearch("?gltf=DamagedHelmet");

    const store = new GltfStore();
    store.setGltfs(gltfs);

    expect(store.gltf).toBeDefined();
    expect(store.gltf).toEqual(gltfs.find(m => m.name === "DamagedHelmet"));
  });

  it("should not have glTF if glTF from url param is not found", async () => {
    mockLocationSearch("?gltf=none");

    const store = new GltfStore();
    store.setGltfs(gltfs);

    expect(store.gltf).toBeUndefined();
  });
});
