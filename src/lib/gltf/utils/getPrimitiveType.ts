import pc from "playcanvas";
import { MeshPrimitive } from "../types";

const typeMap: Record<number, number> = {
  0: pc.PRIMITIVE_POINTS,
  1: pc.PRIMITIVE_LINES,
  2: pc.PRIMITIVE_LINELOOP,
  3: pc.PRIMITIVE_LINESTRIP,
  4: pc.PRIMITIVE_TRIANGLES,
  5: pc.PRIMITIVE_TRISTRIP,
  6: pc.PRIMITIVE_TRIFAN,
};

export function getPrimitiveType(primitive: MeshPrimitive) {
  return (primitive.mode && typeMap[primitive.mode]) ?? pc.PRIMITIVE_TRIANGLES;
}
