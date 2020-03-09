import "jest";
import pc from "playcanvas";
import { shouldResampleImage } from "../shouldResampleImage";

describe("shouldResampleImage", () => {
  it("should return correct for adressU", () => {
    let ret = shouldResampleImage(pc.ADDRESS_REPEAT, undefined, -1);
    expect(ret).toBe(true);
    ret = shouldResampleImage(pc.ADDRESS_MIRRORED_REPEAT, -1, undefined);
    expect(ret).toBe(true);
    expect(shouldResampleImage(1337, -1, -1)).toBe(false);
  });

  it("should return correct for adressV", () => {
    let ret = shouldResampleImage(-1, pc.ADDRESS_REPEAT, undefined);
    expect(ret).toBe(true);
    ret = shouldResampleImage(undefined, pc.ADDRESS_MIRRORED_REPEAT, -1);
    expect(ret).toBe(true);
    expect(shouldResampleImage(-1, 1337, -1)).toBe(false);
  });

  it("should return correct for minFilter", () => {
    let ret = shouldResampleImage(null, -1, pc.FILTER_LINEAR_MIPMAP_LINEAR);
    expect(ret).toBe(true);
    ret = shouldResampleImage(-1, null, pc.FILTER_NEAREST_MIPMAP_LINEAR);
    expect(ret).toBe(true);
    ret = shouldResampleImage(null, -1, pc.FILTER_LINEAR_MIPMAP_NEAREST);
    expect(ret).toBe(true);
    ret = shouldResampleImage(-1, null, pc.FILTER_NEAREST_MIPMAP_NEAREST);
    expect(ret).toBe(true);
    expect(shouldResampleImage(null, -1, 1337)).toBe(false);
  });
});
