import pc from "playcanvas";
export function getWrap(wrap: number) {
  switch (wrap) {
    case 33071:
      return pc.ADDRESS_CLAMP_TO_EDGE;
    case 33648:
      return pc.ADDRESS_MIRRORED_REPEAT;
    case 10497:
    default:
      return pc.ADDRESS_REPEAT;
  }
}
