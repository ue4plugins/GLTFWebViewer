import { observable, computed, action } from "mobx";
import { GltfSource, GltfAnimation } from "../playcanvas";

export class ModelStore {
  private defaultModel: string | null;
  private autoPlayAnimations: boolean;

  public constructor() {
    const urlParams = new URLSearchParams(window.location.search);
    this.defaultModel = urlParams.get("model");
    this.autoPlayAnimations = !urlParams.get("noAnimations");
  }

  @observable
  public models: GltfSource[] = [];

  @observable
  public model?: GltfSource;

  @observable
  public animations: GltfAnimation[] = [];

  @computed
  public get activeAnimations() {
    return this.animations.filter(a => a.active);
  }

  @action.bound
  public setModel(model?: GltfSource) {
    this.model = model;
  }

  @action.bound
  public async fetchModels() {
    const res = await fetch("assets/index.json");
    const models = (await res.json()) as GltfSource[] | undefined;

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
  public setAnimations(animations: GltfAnimation[]) {
    this.animations = animations;
    if (this.autoPlayAnimations) {
      this.animations.forEach(a => (a.active = true));
    }
  }
}
