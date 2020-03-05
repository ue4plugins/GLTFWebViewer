import pc from "playcanvas";
import createDebug from "debug";
import { GlTfParser } from "../GlTfParser";
import { Texture, GlTf } from "../types";
import { getFilter } from "./getFilter";
import { getWrap } from "./getWrap";

const debug = createDebug("translateTexture");

interface Arguments {
  gltf: GlTf;
  device: pc.GraphicsDevice;
}

// Specification:
//   https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#texture
export function translateTexture(data: Texture, { gltf, device }: Arguments) {
  debug("begin");
  const texture = new pc.Texture(device, {
    flipY: false,
    anisotropy: device?.maxAnisotropy,
  });

  if (data.name) {
    texture.name = data.name;
  }

  if (data.sampler && gltf.samplers) {
    const sampler = gltf.samplers[data.sampler];
    if (sampler.minFilter) {
      texture.minFilter = getFilter(sampler.minFilter);
    }
    if (sampler.magFilter) {
      texture.magFilter = getFilter(sampler.magFilter);
    }
    if (sampler.wrapS) {
      texture.addressU = getWrap(sampler.wrapS);
    }
    if (sampler.wrapT) {
      texture.addressV = getWrap(sampler.wrapT);
    }
  }

  return texture;
}
