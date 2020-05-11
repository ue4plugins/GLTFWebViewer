import "jest";
import { ModelStore } from "../ModelStore";
import { models } from "../__fixtures__/models";

const fetchMock = () =>
  Promise.resolve({
    json: async () => models,
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

describe("ModelStore", () => {
  const originalLocation = window.location;

  afterAll(() => {
    Object.defineProperty(window, "location", {
      value: originalLocation,
    });
  });

  it("should load models", async () => {
    const spy = jest.spyOn(window, "fetch").mockImplementation(fetchMock);

    const store = new ModelStore();
    await store.fetchModels();
    expect(store.models).toEqual(models);
    expect(window.fetch).toHaveBeenCalledWith("assets/index.json");
    expect(window.fetch).toHaveBeenCalledTimes(1);

    spy.mockRestore();
  });

  it("should have default model", async () => {
    const spy = jest.spyOn(window, "fetch").mockImplementation(fetchMock);

    const store = new ModelStore();
    await store.fetchModels();
    expect(store.model).toEqual(models[0]);

    spy.mockRestore();
  });

  it("should have model after setModel is called", async () => {
    const spy = jest.spyOn(window, "fetch").mockImplementation(fetchMock);

    const store = new ModelStore();
    await store.fetchModels();
    expect(store.model).toEqual(models[0]);

    store.setModel(undefined);
    expect(store.model).toBeUndefined();

    store.setModel(store.models[5]);
    expect(store.model).toBe(store.models[5]);

    spy.mockRestore();
  });

  it("should throw and have empty model list if request fails", async () => {
    const spy = jest.spyOn(window, "fetch").mockImplementation(fetchMockFail);

    expect.assertions(4);

    const store = new ModelStore();
    try {
      await store.fetchModels();
    } catch (e) {
      expect(e).toBeDefined();
    }

    expect(store.models).toEqual([]);
    expect(store.model).toBeUndefined();
    expect(window.fetch).toHaveBeenCalledTimes(1);

    spy.mockRestore();
  });

  it("should throw if empty model list is fetched", async () => {
    const spy = jest.spyOn(window, "fetch").mockImplementation(fetchMockEmpty);

    expect.assertions(4);

    const store = new ModelStore();
    try {
      await store.fetchModels();
    } catch (e) {
      expect(e).toBeDefined();
    }

    expect(store.models).toEqual([]);
    expect(store.model).toBeUndefined();
    expect(window.fetch).toHaveBeenCalledTimes(1);

    spy.mockRestore();
  });

  it("should automatically set model from url param", async () => {
    const spy = jest.spyOn(window, "fetch").mockImplementation(fetchMock);

    mockLocationSearch("?model=DamagedHelmet-binary");

    const store = new ModelStore();
    await store.fetchModels();

    expect(store.model).toBeDefined();
    expect(store.model).toEqual(
      models.find(m => m.name === "DamagedHelmet-binary"),
    );

    spy.mockRestore();
  });

  it("should not have model if model from url param is not found", async () => {
    const spy = jest.spyOn(window, "fetch").mockImplementation(fetchMock);

    mockLocationSearch("?model=none");

    const store = new ModelStore();
    await store.fetchModels();

    expect(store.model).toBeUndefined();

    spy.mockRestore();
  });
});
