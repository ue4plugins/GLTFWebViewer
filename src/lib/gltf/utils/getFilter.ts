import pc from "playcanvas";
export function getFilter(filter: number) {
  switch (filter) {
    case 9728:
      return pc.FILTER_NEAREST;
    case 9729:
    default:
      return pc.FILTER_LINEAR;
    case 9984:
      return pc.FILTER_NEAREST_MIPMAP_NEAREST;
    case 9985:
      return pc.FILTER_LINEAR_MIPMAP_NEAREST;
    case 9986:
      return pc.FILTER_NEAREST_MIPMAP_LINEAR;
    case 9987:
      return pc.FILTER_LINEAR_MIPMAP_LINEAR;
  }
}
