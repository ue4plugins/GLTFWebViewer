import { observable, computed, action } from "mobx";
import {
  GltfSource,
  GltfAnimation,
  GltfScene,
  GltfVariantSetConfigurator,
} from "../types";

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
  public sceneHierarchy?: GltfScene;

  @computed
  public get animations(): GltfAnimation[] {
    return this.sceneHierarchy?.animations || [];
  }

  @computed
  public get activeAnimationIds(): number[] {
    return this.animations.filter(a => a.active).map(a => a.id);
  }

  @computed
  public get configurator(): GltfVariantSetConfigurator | undefined {
    return this.sceneHierarchy?.configurator;
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
  public setSceneHierarchy(sceneHierarchy?: GltfScene) {
    this.sceneHierarchy = sceneHierarchy;
    if (this.sceneHierarchy && this.autoPlayAnimations) {
      this.sceneHierarchy.animations.forEach(a => (a.active = true));
    }
  }
}
