import { observable, computed, action } from "mobx";
import { GltfSource, GltfScene, GltfCamera } from "../types";
import { VariantSetManager } from "../variants";

export class GltfStore {
  private defaultGltf: string | null;

  public constructor() {
    const urlParams = new URLSearchParams(window.location.search);
    this.defaultGltf = urlParams.get("gltf");
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
  public levelVariantSetId?: number;

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
    this.levelVariantSetId = id;
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
    this.camera = sceneHierarchy?.cameras[0];
    this.sceneHierarchy = sceneHierarchy;
    this.levelVariantSetId = undefined;
  }
}
