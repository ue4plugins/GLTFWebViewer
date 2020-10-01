import { observable, computed, action } from "mobx";
import { GltfSource, GltfAnimation, GltfScene, GltfCamera } from "../types";
import { VariantSetManager } from "../variants";

export class GltfStore {
  private defaultGltf: string | null;
  private noAnimations: boolean;

  public constructor() {
    const urlParams = new URLSearchParams(window.location.search);
    this.defaultGltf = urlParams.get("gltf");
    this.noAnimations = !!urlParams.get("noAnimations");
  }

  @observable
  public gltfs: GltfSource[] = [];

  @observable
  public gltf?: GltfSource;

  @observable
  public sceneHierarchy?: GltfScene;

  @observable
  public camera?: GltfCamera;

  @observable
  public variantSetId?: number;

  @computed
  public get animations(): GltfAnimation[] {
    return this.sceneHierarchy?.animations ?? [];
  }

  @computed
  public get activeAnimationIds(): number[] {
    return this.animations.filter(a => a.active).map(a => a.id);
  }

  @computed
  public get variantSetManager(): VariantSetManager | undefined {
    return this.sceneHierarchy?.variantSetManager;
  }

  @computed
  public get cameras(): GltfCamera[] {
    return this.sceneHierarchy?.cameras ?? [];
  }

  @computed
  public get hasBackdrops(): boolean {
    return this.sceneHierarchy?.hasBackdrops ?? false;
  }

  @action.bound
  public setGltf(gltf?: GltfSource) {
    this.gltf = gltf;
  }

  @action.bound
  public setCamera(camera?: GltfCamera) {
    this.camera = camera;
  }

  @action.bound
  public showVariantSet(id?: number) {
    this.variantSetId = id;
  }

  @action.bound
  public async fetchGltfs() {
    let gltfs: GltfSource[] = [];

    try {
      const res = await fetch("index.json");
      gltfs = await res.json();
    } catch (e) {
      // Ignore since it should be possible to start the application
      // without assets
    }

    this.gltfs = gltfs;

    if (!this.gltf && gltfs.length > 0) {
      if (this.defaultGltf) {
        this.setGltf(gltfs.find(m => m.name === this.defaultGltf));
      } else if (gltfs.length === 1) {
        this.setGltf(gltfs[0]);
      }
    }
  }

  @action.bound
  public setSceneHierarchy(sceneHierarchy?: GltfScene) {
    if (sceneHierarchy) {
      this.camera = sceneHierarchy.cameras[0];
      if (this.noAnimations) {
        sceneHierarchy.animations.forEach(a => (a.active = false));
      }
    } else {
      this.camera = undefined;
    }
    this.sceneHierarchy = sceneHierarchy;
    this.variantSetId = undefined;
  }
}
