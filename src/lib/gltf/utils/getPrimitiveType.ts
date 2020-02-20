import pc from "playcanvas";
import { MeshPrimitive } from "../types";

export function getPrimitiveType(primitive: MeshPrimitive) {
  switch (primitive.mode) {
    case 0:
      return pc.PRIMITIVE_POINTS;
    case 1:
      return pc.PRIMITIVE_LINES;
    case 2:
      return pc.PRIMITIVE_LINELOOP;
    case 3:
      return pc.PRIMITIVE_LINESTRIP;
    case 4:
    default:
      return pc.PRIMITIVE_TRIANGLES;
    case 5:
      return pc.PRIMITIVE_TRISTRIP;
    case 6:
      return pc.PRIMITIVE_TRIFAN;
  }
}
