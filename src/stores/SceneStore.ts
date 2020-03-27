import { observable, action, computed } from "mobx";

export class SceneStore {
  @observable
  public scenes = SCENE_FILES;

  @observable
  public scene?= this.scenes[0];

  @computed
  public get sceneIdx() {
    return this.scene ? this.scenes.indexOf(this.scene) : -1;
  }

  @action.bound
  public setScene(scene: SCENE_FILE) {
    this.scene = scene;
  }
}
