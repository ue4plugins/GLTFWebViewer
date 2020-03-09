import pc from "playcanvas";

const repeatValues = [pc.ADDRESS_REPEAT, pc.ADDRESS_MIRRORED_REPEAT];

const minmapValues = [
  pc.FILTER_LINEAR_MIPMAP_LINEAR,
  pc.FILTER_NEAREST_MIPMAP_LINEAR,
  pc.FILTER_LINEAR_MIPMAP_NEAREST,
  pc.FILTER_NEAREST_MIPMAP_NEAREST,
];

export function shouldResampleImage(aU?: number, aV?: number, mF?: number) {
  const isAURepeat = repeatValues.includes(aU ?? -1);
  const isAVRepeat = repeatValues.includes(aV ?? -1);
  const nearestMinFilter = minmapValues.includes(mF ?? -1);
  return !!(isAURepeat || isAVRepeat || nearestMinFilter);
}
