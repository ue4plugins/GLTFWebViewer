import pc from "playcanvas";
import { GlTfParser } from "../GlTfParser";
import { Texture } from "../types";
import { getFilter } from "./getFilter";
import { getWrap } from "./getWrap";

// Specification:
//   https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#texture
export function translateTexture(data: Texture, { gltf, device }: GlTfParser) {
  const texture = new pc.Texture(device, {
    flipY: false,
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
