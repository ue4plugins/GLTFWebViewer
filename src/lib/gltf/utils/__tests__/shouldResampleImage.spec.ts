import "jest";
import pc from "playcanvas";
import { shouldResampleImage } from "../shouldResampleImage";

describe("shouldResampleImage", () => {
  it("should return correct for adressU", () => {
    expect(shouldResampleImage(pc.ADDRESS_REPEAT, -1, -1)).toBe(true);
    expect(shouldResampleImage(pc.ADDRESS_MIRRORED_REPEAT, -1, -1)).toBe(true);
    expect(shouldResampleImage(1337, -1, -1)).toBe(false);
  });

  it("should return correct for adressV", () => {
    expect(shouldResampleImage(-1, pc.ADDRESS_REPEAT, -1)).toBe(true);
    expect(shouldResampleImage(-1, pc.ADDRESS_MIRRORED_REPEAT, -1)).toBe(true);
    expect(shouldResampleImage(-1, 1337, -1)).toBe(false);
  });

  it("should return correct for minFilter", () => {
    let ret = shouldResampleImage(-1, -1, pc.FILTER_LINEAR_MIPMAP_LINEAR);
    expect(ret).toBe(true);
    ret = shouldResampleImage(-1, -1, pc.FILTER_NEAREST_MIPMAP_LINEAR);
    expect(ret).toBe(true);
    ret = shouldResampleImage(-1, -1, pc.FILTER_LINEAR_MIPMAP_NEAREST);
    expect(ret).toBe(true);
    ret = shouldResampleImage(-1, -1, pc.FILTER_NEAREST_MIPMAP_NEAREST);
    expect(ret).toBe(true);
    expect(shouldResampleImage(-1, -1, 1337)).toBe(false);
  });
});
