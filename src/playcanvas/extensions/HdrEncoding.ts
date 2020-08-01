import * as pc from "@animech-public/playcanvas";
import Debug from "debug";
import { ExtensionParser } from "./ExtensionParser";
import { ExtensionRegistry } from "./ExtensionRegistry";

const debug = Debug("HdrEncoding");

type Encoding = "RGBM";

type TextureExtensionData = {
  encoding: Encoding;
};

export class HdrEncodingExtensionParser implements ExtensionParser {
  public get name() {
    return "EPIC_texture_hdr_encoding";
  }

  public register(registry: ExtensionRegistry) {
    registry.texture.add(this.name, {
      postParse: this._texturePostParse.bind(this),
    });
  }

  public unregister(registry: ExtensionRegistry) {
    registry.texture.remove(this.name);
  }

  public postParse() {
    // Ignore
  }

  private _texturePostParse(
    texture: pc.Texture,
    extensionData: TextureExtensionData,
  ) {
    debug("Parse HDR encoding", texture, extensionData);

    if (extensionData.encoding === "RGBM") {
      texture.type = pc.TEXTURETYPE_RGBM;
    }
  }
}
