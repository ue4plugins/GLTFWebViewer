import { observable, action } from "mobx";
import { GltfFile } from "../lib/GltfFile";

const urlParams = new URLSearchParams(window.location.search);
const defaultModel = urlParams.get("model");

export class ModelStore {
  @observable
  public models: GltfFile[] = [];

  @observable
  public model?: GltfFile;

  @action.bound
  public setModel(model: GltfFile) {
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
      this.model = this.models.find(
        m =>
          m.name === defaultModel ||
          (m.name === "DamagedHelmet" && m.type === "unpacked"), // TODO: remove this line
      );
    }
  }
}
