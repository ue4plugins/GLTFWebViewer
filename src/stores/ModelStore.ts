import { observable, action } from "mobx";

const urlParams = new URLSearchParams(window.location.search);
const defaultModel = urlParams.get("model") || "DamagedHelmet";

export class ModelStore {
  @observable
  public models = GLTF_MODELS;

  @observable
  public model? = this.models.find(
    val => val.name === defaultModel && val.type === "normal",
  );

  @action.bound
  public setModel(model: GLTF_MODEL) {
    this.model = model;
  }
}
