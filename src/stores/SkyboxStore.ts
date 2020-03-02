import { observable, action, computed } from "mobx";

export class SkyboxStore {
  @observable
  public skyboxes = SKYBOX_CUBEMAPS;

  @observable
  public skybox = this.skyboxes.find(
    val => val.name === "helipad",
  ) as SKYBOX_CUBEMAP;

  @computed
  public get skyboxIdx() {
    return this.skyboxes.indexOf(this.skybox);
  }

  @action.bound
  public setSkybox(skybox: SKYBOX_CUBEMAP) {
    this.skybox = skybox;
  }
}
