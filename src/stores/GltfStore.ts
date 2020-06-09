import { observable, computed, action } from "mobx";
import { GltfSource, GltfAnimation } from "../types";

export class GltfStore {
  private defaultGltf: string | null;
  private autoPlayAnimations: boolean;

  public constructor() {
    const urlParams = new URLSearchParams(window.location.search);
    this.defaultGltf = urlParams.get("gltf");
    this.autoPlayAnimations = !urlParams.get("noAnimations");
  }

  @observable
  public gltfs: GltfSource[] = [];

  @observable
  public gltf?: GltfSource;

  @observable
  public animations: GltfAnimation[] = [];

  @computed
  public get activeAnimationIds() {
    return this.animations.filter(a => a.active).map(a => a.id);
  }

  @action.bound
  public setGltf(gltf?: GltfSource) {
    this.gltf = gltf;
  }

  @action.bound
  public async fetchGltfs() {
    const res = await fetch("assets/index.json");
    const gltfs = (await res.json()) as GltfSource[] | undefined;

    if (!gltfs || gltfs.length === 0) {
      throw new Error("No glTFs found");
    }

    this.gltfs = gltfs;

    if (!this.gltf) {
      this.setGltf(
        gltfs.length > 0
          ? this.defaultGltf
            ? gltfs.find(m => m.name === this.defaultGltf)
            : gltfs[0]
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
