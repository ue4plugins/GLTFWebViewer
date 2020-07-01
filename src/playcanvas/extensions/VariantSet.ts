import * as pc from "@animech-public/playcanvas";
import Debug from "debug";
import { hasNoUndefinedValues } from "../../utilities/typeGuards";
import { ExtensionParser } from "./ExtensionParser";
import { ExtensionRegistry } from "./ExtensionRegistry";

const debug = Debug("VariantSet");

type SceneExtensionData = {
  levelVariantSets: number[];
};

type RootData = {
  extensions?: {
    EPIC_variant_sets?: {
      levelVariantSets: LevelVariantSet[];
    };
  };
};

type SceneVariantSetDataMap = {
  scene: pc.Entity;
  data: LevelVariantSet[];
};

type LevelVariantSet = {
  name: string;
  variantSets: VariantSet[];
};

export type VariantSet = {
  name: string;
  default: number;
  variants: Variant[];
};

export type Variant = {
  name: string;
  thumbnailSource?: string;
  nodes: {
    node: pc.Entity;
    properties: {
      visible?: boolean;
    };
  }[];
};

export class VariantSetExtensionParser implements ExtensionParser {
  private _variantSets: SceneVariantSetDataMap[] = [];

  public get name() {
    return "EPIC_variant_sets";
  }

  public getVariantSetsForScene(scene: pc.Entity): VariantSet[] {
    return this._variantSets
      .filter(set => set.scene === scene)
      .reduce<LevelVariantSet[]>((sets, set) => [...sets, ...set.data], [])
      .reduce<VariantSet[]>((sets, set) => [...sets, ...set.variantSets], []);
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
    debug("Parse variant sets", scene, extensionData);

    const levelVariantSets = extensionData.levelVariantSets.map(
      set => rootData.extensions?.EPIC_variant_sets?.levelVariantSets[set],
    );

    if (!hasNoUndefinedValues(levelVariantSets)) {
      return;
    }

    debug("Found variant sets", levelVariantSets);

    this._variantSets.push({
      scene,
      data: levelVariantSets,
    });
  }
}
