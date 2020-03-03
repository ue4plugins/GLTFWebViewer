import pc from "playcanvas";
import { MipMapType } from "../types";

const typeMap = {
  [MipMapType.NEAREST]: pc.FILTER_NEAREST,
  [MipMapType.LINEAR]: pc.FILTER_LINEAR,
  [MipMapType.NEAREST_MIPMAP_NEAREST]: pc.FILTER_NEAREST_MIPMAP_NEAREST,
  [MipMapType.LINEAR_MIPMAP_NEAREST]: pc.FILTER_LINEAR_MIPMAP_NEAREST,
  [MipMapType.NEAREST_MIPMAP_LINEAR]: pc.FILTER_NEAREST_MIPMAP_LINEAR,
  [MipMapType.LINEAR_MIPMAP_LINEAR]: pc.FILTER_LINEAR_MIPMAP_LINEAR,
};

export function getFilter(filter: MipMapType) {
  return typeMap[filter] || pc.FILTER_LINEAR;
}
