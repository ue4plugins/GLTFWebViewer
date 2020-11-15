import * as pc from "@animech-public/playcanvas";
import Debug from "debug";
import { ExtensionParser } from "./ExtensionParser";
import { ExtensionRegistry } from "./ExtensionRegistry";

const debug = Debug("BlendMode");

type BlendMode = "ADDITIVE" | "MODULATE" | "ALPHACOMPOSITE";

type BlendModeData = {
  blendMode: BlendMode;
};

export class BlendModeExtensionParser implements ExtensionParser {
  public get name() {
    return "EPIC_blend_modes";
  }

  public register(registry: ExtensionRegistry) {
    registry.material.add(this.name, {
      postParse: this._materialPostParse.bind(this),
    });
  }

  public unregister(registry: ExtensionRegistry) {
    registry.texture.remove(this.name);
  }

  public postParse() {
    // Ignore
  }

  private _materialPostParse(
    material: pc.Material,
    extensionData: BlendModeData,
  ) {
    debug("Parse Blend mode", material, extensionData);

    switch (extensionData.blendMode) {
      case "ADDITIVE":
        material.blendType = pc.BLEND_ADDITIVEALPHA;
        break;
      case "MODULATE":
        material.blendType = pc.BLEND_MULTIPLICATIVE;
        break;
      case "ALPHACOMPOSITE":
        material.blendType = pc.BLEND_PREMULTIPLIED;
        break;
    }
  }
}
