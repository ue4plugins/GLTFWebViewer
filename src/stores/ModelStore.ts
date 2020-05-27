import { observable, computed, action } from "mobx";
import { GltfFile, GltfFileAnimation } from "../playcanvas";

export class ModelStore {
  private defaultModel: string | null;
  private autoPlayAnimations: boolean;

  public constructor() {
    const urlParams = new URLSearchParams(window.location.search);
    this.defaultModel = urlParams.get("model");
    this.autoPlayAnimations = !urlParams.get("noAnimations");
  }

  @observable
  public models: GltfFile[] = [];

  @observable
  public model?: GltfFile;

  @observable
  public animations: GltfFileAnimation[] = [];

  @computed
  public get activeAnimations() {
    return this.animations.filter(a => a.active);
  }

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
      this.setModel(
        models.length > 0
          ? this.defaultModel
            ? models.find(m => m.name === this.defaultModel)
            : models[0]
          : undefined,
      );
    }
  }

  @action.bound
  public setAnimations(animations: GltfFileAnimation[]) {
    this.animations = animations;
    if (this.autoPlayAnimations) {
      this.animations.forEach(a => (a.active = true));
    }
  }
}
