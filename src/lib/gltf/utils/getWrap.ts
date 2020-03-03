import pc from "playcanvas";

const typeMap: Record<number, number> = {
  33071: pc.ADDRESS_CLAMP_TO_EDGE,
  33648: pc.ADDRESS_MIRRORED_REPEAT,
  10497: pc.ADDRESS_REPEAT,
};

export function getWrap(wrap: number) {
  return typeMap[wrap] ?? pc.ADDRESS_REPEAT;
}
