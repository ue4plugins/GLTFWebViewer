import { observable, action, computed } from "mobx";

export class SceneStore {
  @observable
  public scenes: pc.SceneFile[] = [];

  @observable
  public scene?: pc.SceneFile;

  @computed
  public get sceneIndex() {
    const scene = this.scene;
    return scene ? this.scenes.findIndex(s => s.url === scene.url) : -1;
  }

  @action.bound
  public setScene(scene?: pc.SceneFile) {
    this.scene = scene;
  }

  @action.bound
  public setScenes(scenes: pc.SceneFile[]) {
    this.scenes = scenes;
    if (!this.scene) {
      this.setScene(scenes[0]);
    }
  }
}
