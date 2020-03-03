import "jest";
import { getAccessorTypeSize } from "../getAccessorTypeSize";

describe("getAccessorSpecType", () => {
  it("should return 3 for unknown type", () => {
    expect(getAccessorTypeSize("UNKNOWN")).toBe(3);
  });

  it("should return 1 for SCALAR", () => {
    expect(getAccessorTypeSize("SCALAR")).toBe(1);
  });

  it("should return 2 for VEC2", () => {
    expect(getAccessorTypeSize("VEC2")).toBe(2);
  });

  it("should return 3 for VEC3", () => {
    expect(getAccessorTypeSize("VEC3")).toBe(3);
  });

  it("should return 4 for VEC4", () => {
    expect(getAccessorTypeSize("VEC4")).toBe(4);
  });

  it("should return 4 for MAT2", () => {
    expect(getAccessorTypeSize("MAT2")).toBe(4);
  });

  it("should return 9 for MAT3", () => {
    expect(getAccessorTypeSize("MAT3")).toBe(9);
  });

  it("should return 16 for MAT4", () => {
    expect(getAccessorTypeSize("MAT4")).toBe(16);
  });
});
