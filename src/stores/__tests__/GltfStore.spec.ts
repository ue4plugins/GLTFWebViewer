import "jest";
import { GltfStore } from "../GltfStore";
import { gltfs } from "../__fixtures__/gltfs";

const fetchMock = () =>
  Promise.resolve({
    json: async () => gltfs,
  } as Response);

const fetchMockEmpty = () =>
  Promise.resolve({
    json: async () => [],
  } as Response);

const fetchMockFail = () => Promise.reject(new Error("Request failed"));

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
    const spy = jest.spyOn(window, "fetch").mockImplementation(fetchMock);

    const store = new GltfStore();
    await store.fetchGltfs();
    expect(store.gltfs).toEqual(gltfs);
    expect(window.fetch).toHaveBeenCalledWith("assets/index.json");
    expect(window.fetch).toHaveBeenCalledTimes(1);

    spy.mockRestore();
  });

  it("should have default glTF", async () => {
    const spy = jest.spyOn(window, "fetch").mockImplementation(fetchMock);

    const store = new GltfStore();
    await store.fetchGltfs();
    expect(store.gltf).toEqual(gltfs[0]);

    spy.mockRestore();
  });

  it("should have glTF after setGltf is called", async () => {
    const spy = jest.spyOn(window, "fetch").mockImplementation(fetchMock);

    const store = new GltfStore();
    await store.fetchGltfs();
    expect(store.gltf).toEqual(gltfs[0]);

    store.setGltf(undefined);
    expect(store.gltf).toBeUndefined();

    store.setGltf(store.gltfs[5]);
    expect(store.gltf).toBe(store.gltfs[5]);

    spy.mockRestore();
  });

  it("should throw and have empty glTF list if request fails", async () => {
    const spy = jest.spyOn(window, "fetch").mockImplementation(fetchMockFail);

    expect.assertions(4);

    const store = new GltfStore();
    try {
      await store.fetchGltfs();
    } catch (e) {
      expect(e).toBeDefined();
    }

    expect(store.gltfs).toEqual([]);
    expect(store.gltf).toBeUndefined();
    expect(window.fetch).toHaveBeenCalledTimes(1);

    spy.mockRestore();
  });

  it("should throw if empty glTF list is fetched", async () => {
    const spy = jest.spyOn(window, "fetch").mockImplementation(fetchMockEmpty);

    expect.assertions(4);

    const store = new GltfStore();
    try {
      await store.fetchGltfs();
    } catch (e) {
      expect(e).toBeDefined();
    }

    expect(store.gltfs).toEqual([]);
    expect(store.gltf).toBeUndefined();
    expect(window.fetch).toHaveBeenCalledTimes(1);

    spy.mockRestore();
  });

  it("should automatically set glTF from url param", async () => {
    const spy = jest.spyOn(window, "fetch").mockImplementation(fetchMock);

    mockLocationSearch("?model=DamagedHelmet");

    const store = new GltfStore();
    await store.fetchGltfs();

    expect(store.gltf).toBeDefined();
    expect(store.gltf).toEqual(gltfs.find(m => m.name === "DamagedHelmet"));

    spy.mockRestore();
  });

  it("should not have glTF if glTF from url param is not found", async () => {
    const spy = jest.spyOn(window, "fetch").mockImplementation(fetchMock);

    mockLocationSearch("?model=none");

    const store = new GltfStore();
    await store.fetchGltfs();

    expect(store.gltf).toBeUndefined();

    spy.mockRestore();
  });
});
