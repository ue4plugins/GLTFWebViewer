import * as pc from "@animech-public/playcanvas";
import Debug from "debug";
import { ExtensionParser } from "./ExtensionParser";
import { ExtensionRegistry } from "./ExtensionRegistry";

const debug = Debug("VariantSet");

type SceneExtensionData = {
  variantSet: number;
};

type RootData = {
  extensions?: {
    EPIC_variant_sets?: {
      variantSets: VariantSet[];
    };
  };
};

type SceneVariantSetDataMap = {
  scene: pc.Entity;
  data: VariantSet;
};

export type VariantSet = {};

export class VariantSetExtensionParser implements ExtensionParser {
  private _variantSets: SceneVariantSetDataMap[] = [];

  public get name() {
    return "EPIC_variant_sets";
  }

  public getVariantSetForScene(scene: pc.Entity): VariantSet | undefined {
    return this._variantSets.find(set => set.scene === scene)?.data;
  }

  public register(registry: ExtensionRegistry) {
    registry.scene.add(this.name, {
      postParse: this._scenePostParse.bind(this),
    });
  }

  public unregister(registry: ExtensionRegistry) {
    registry.scene.remove(this.name);
  }

  public postParse() {
    // Ignore
  }

  private _scenePostParse(
    scene: pc.Entity,
    extensionData: SceneExtensionData,
    rootData: RootData,
  ) {
    debug("Parse variant set", scene, extensionData);

    const variantSet =
      rootData.extensions?.EPIC_variant_sets?.variantSets?.[
        extensionData.variantSet
      ];
    if (!variantSet) {
      return;
    }

    debug("Found variant set", variantSet);

    this._variantSets.push({
      scene,
      data: variantSet,
    });
  }
}
