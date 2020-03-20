import { observable, action, computed } from "mobx";

export class SkyboxStore {
  @observable
  public skyboxes = SKYBOX_CUBEMAPS;

  @observable
  public skybox? = this.skyboxes[0];

  @computed
  public get skyboxIdx() {
    return this.skybox ? this.skyboxes.indexOf(this.skybox) : -1;
  }

  @action.bound
  public setSkybox(skybox: SKYBOX_CUBEMAP) {
    this.skybox = skybox;
  }
}
