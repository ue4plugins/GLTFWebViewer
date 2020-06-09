import pc from "@animech-public/playcanvas";
import Debug from "debug";
import { ExtensionParser } from "./ExtensionParser";

const debug = Debug("VariantSet");

type VariantSetData = any;

export class VariantSetExtensionParser implements ExtensionParser {
  private _variantSets: {
    scene: pc.Entity;
    data: VariantSetData;
  }[] = [];

  public get name() {
    return "EPIC_variant_sets";
  }

  public register(registry: pc.GlbExtensionRegistry) {
    registry.scene.add(this.name, this._parse.bind(this));
  }

  public unregister(registry: pc.GlbExtensionRegistry) {
    registry.scene.remove(this.name);
  }

  public postParse() {
    // Ignore
  }

  public getVariantSetForScene(scene: pc.Entity) {
    return this._variantSets.find(set => set.scene === scene);
  }

  private _parse(scene: pc.Entity, extension: any, gltf: any) {
    debug("Parse variant set", scene, extension);

    const variantSets: VariantSetData[] | undefined =
      gltf?.extensions?.[this.name]?.variantSets;
    if (!variantSets) {
      return scene;
    }

    const variantSet = variantSets[extension.interaction];
    if (!variantSet) {
      return scene;
    }

    debug("Found variant set", variantSet);

    this._variantSets.push({
      scene,
      data: variantSet,
    });

    return scene;
  }
}
