import "jest";
import { scenes } from "../__fixtures__/scenes";
import { SceneStore } from "../SceneStore";

const mockLocationSearch = (search: string) =>
  Object.defineProperty(window, "location", {
    writable: true,
    value: {
      search,
    },
  });

describe("SceneStore", () => {
  const originalLocation = window.location;

  afterAll(() => {
    Object.defineProperty(window, "location", {
      value: originalLocation,
    });
  });

  it("should have scene list after setScenes is called", async () => {
    const store = new SceneStore();
    store.setScenes(scenes);
    expect(store.scenes).toEqual(scenes);
  });

  it("should have default scene after setScenes is called", async () => {
    const store = new SceneStore();
    store.setScenes(scenes);
    expect(store.scene).toEqual(scenes[0]);
  });

  it("should have scene after setScene is called", async () => {
    const store = new SceneStore();
    store.setScenes(scenes);
    expect(store.scene).toEqual(scenes[0]);

    store.setScene(undefined);
    expect(store.scene).toBeUndefined();

    store.setScene(scenes[1]);
    expect(store.scene).toEqual(scenes[1]);
  });

  it("should have scene index after setScene is called", async () => {
    const store = new SceneStore();
    store.setScenes(scenes);
    expect(store.sceneIndex).toEqual(0);

    store.setScene(undefined);
    expect(store.sceneIndex).toEqual(-1);

    store.setScene(scenes[1]);
    expect(store.sceneIndex).toEqual(1);
  });

  it("should automatically set scene from url param", async () => {
    mockLocationSearch("?scene=Tropical%20Beach");

    const store = new SceneStore();
    store.setScenes(scenes);

    expect(store.scene).toEqual(scenes.find(m => m.name === "Tropical Beach"));
  });

  it("should not have scene if scene from url param is not found", async () => {
    mockLocationSearch("?scene=none");

    const store = new SceneStore();
    store.setScenes(scenes);

    expect(store.scene).toBeUndefined();
  });
});
