import { observable, action } from "mobx";
import { GltfFile } from "../playcanvas";

const urlParams = new URLSearchParams(window.location.search);
const defaultModel = urlParams.get("model");
const defaultModelType = urlParams.get("modelType");

export class ModelStore {
  @observable
  public models: GltfFile[] = [];

  @observable
  public model?: GltfFile;

  @action.bound
  public setModel(model?: GltfFile) {
    this.model = model;
  }

  @action.bound
  public async fetchModels() {
    const res = await fetch("assets/index.json");
    const models = (await res.json()) as GltfFile[] | undefined;

    if (!models || models.length === 0) {
      throw new Error("No models found");
    }

    this.models = models;

    if (!this.model) {
      this.model =
        models.length > 0
          ? defaultModel
            ? models.find(
                m =>
                  m.name === defaultModel &&
                  (m.type === defaultModelType || defaultModelType === null),
              )
            : models[0]
          : undefined;
    }
  }
}
