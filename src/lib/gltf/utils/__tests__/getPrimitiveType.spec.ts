import "jest";
import pc from "playcanvas";
import { getPrimitiveType } from "../getPrimitiveType";
import { MeshPrimitive } from "../../types";

describe("getPrimitiveType", () => {
  it("should return pc.PRIMITIVE_TRIANGLES for unknown mode", () => {
    const primitive: MeshPrimitive = {
      attributes: {},
      mode: 1337,
    };
    expect(getPrimitiveType(primitive)).toBe(pc.PRIMITIVE_TRIANGLES);
  });

  it("should return pc.PRIMITIVE_POINTS", () => {
    const primitive: MeshPrimitive = {
      attributes: {},
      mode: 0,
    };
    expect(getPrimitiveType(primitive)).toBe(pc.PRIMITIVE_POINTS);
  });

  it("should return pc.PRIMITIVE_LINES", () => {
    const primitive: MeshPrimitive = {
      attributes: {},
      mode: 1,
    };
    expect(getPrimitiveType(primitive)).toBe(pc.PRIMITIVE_LINES);
  });

  it("should return pc.PRIMITIVE_LINELOOP", () => {
    const primitive: MeshPrimitive = {
      attributes: {},
      mode: 2,
    };
    expect(getPrimitiveType(primitive)).toBe(pc.PRIMITIVE_LINELOOP);
  });

  it("should return pc.PRIMITIVE_LINESTRIP", () => {
    const primitive: MeshPrimitive = {
      attributes: {},
      mode: 3,
    };
    expect(getPrimitiveType(primitive)).toBe(pc.PRIMITIVE_LINESTRIP);
  });

  it("should return pc.PRIMITIVE_TRIANGLES", () => {
    const primitive: MeshPrimitive = {
      attributes: {},
      mode: 4,
    };
    expect(getPrimitiveType(primitive)).toBe(pc.PRIMITIVE_TRIANGLES);
  });

  it("should return pc.PRIMITIVE_TRISTRIP", () => {
    const primitive: MeshPrimitive = {
      attributes: {},
      mode: 5,
    };
    expect(getPrimitiveType(primitive)).toBe(pc.PRIMITIVE_TRISTRIP);
  });

  it("should return pc.PRIMITIVE_TRIFAN", () => {
    const primitive: MeshPrimitive = {
      attributes: {},
      mode: 6,
    };
    expect(getPrimitiveType(primitive)).toBe(pc.PRIMITIVE_TRIFAN);
  });
});
