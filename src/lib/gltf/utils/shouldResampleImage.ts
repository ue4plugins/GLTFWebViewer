import pc from "playcanvas";

const repeatValues = [pc.ADDRESS_REPEAT, pc.ADDRESS_MIRRORED_REPEAT];

const minmapValues = [
  pc.FILTER_LINEAR_MIPMAP_LINEAR,
  pc.FILTER_NEAREST_MIPMAP_LINEAR,
  pc.FILTER_LINEAR_MIPMAP_NEAREST,
  pc.FILTER_NEAREST_MIPMAP_NEAREST,
];

export function shouldResampleImage(aU?: number, aV?: number, mF?: number) {
  const isAURepeat = aU && repeatValues.includes(aU);
  const isAVRepeat = aV && repeatValues.includes(aV);
  const nearestMinFilter = mF && minmapValues.includes(mF);
  return !!(isAURepeat || isAVRepeat || nearestMinFilter);
}
