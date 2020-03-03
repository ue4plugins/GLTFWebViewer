import { observable, action } from "mobx";

export class ModelStore {
  @observable
  public models = GLTF_MODELS;

  @observable
  public model = this.models.find(
    val => val.name === "DamagedHelmet",
  ) as GLTF_MODEL;

  @action.bound
  public setModel(model: GLTF_MODEL) {
    this.model = model;
  }
}
