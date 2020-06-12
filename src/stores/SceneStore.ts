import { observable, action, computed } from "mobx";

export class SceneStore {
  private defaultScene: string | null;

  public constructor() {
    const urlParams = new URLSearchParams(window.location.search);
    this.defaultScene = urlParams.get("scene");
  }

  @observable
  public scenes: pc.SceneSource[] = [];

  @observable
  public scene?: pc.SceneSource;

  @computed
  public get sceneIndex() {
    const scene = this.scene;
    return scene ? this.scenes.findIndex(s => s.url === scene.url) : -1;
  }

  @action.bound
  public setScene(scene?: pc.SceneSource) {
    this.scene = scene;
  }

  @action.bound
  public setScenes(scenes: pc.SceneSource[]) {
    this.scenes = scenes;
    if (!this.scene) {
      this.setScene(
        scenes.length > 0
          ? this.defaultScene
            ? scenes.find(s => s.name === this.defaultScene)
            : scenes[0]
          : undefined,
      );
    }
  }
}
