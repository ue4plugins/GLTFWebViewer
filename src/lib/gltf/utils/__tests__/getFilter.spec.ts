import "jest";
import pc from "playcanvas";
import { getFilter } from "../getFilter";
import { MipMapType } from "../../types";

describe("getFilter", () => {
  it("should return pc.FILTER_LINEAR when unknown type is passed", () => {
    expect(getFilter(1337)).toBe(pc.FILTER_LINEAR);
  });

  it("should return pc.FILTER_NEAREST from MipMapType.NEAREST", () => {
    expect(getFilter(MipMapType.LINEAR)).toBe(pc.FILTER_NEAREST);
  });

  it("should return pc.FILTER_LINEAR from MipMapType.LINEAR", () => {
    expect(getFilter(MipMapType.LINEAR)).toBe(pc.FILTER_LINEAR);
  });

  it("should return pc.FILTER_NEAREST_MIPMAP_NEAREST from MipMapType.NEAREST_MIPMAP_NEAREST", () => {
    expect(getFilter(MipMapType.NEAREST_MIPMAP_NEAREST)).toBe(
      pc.FILTER_NEAREST_MIPMAP_NEAREST,
    );
  });

  it("should return pc.FILTER_LINEAR_MIPMAP_NEAREST from MipMapType.LINEAR_MIPMAP_NEAREST", () => {
    expect(getFilter(MipMapType.LINEAR_MIPMAP_NEAREST)).toBe(
      pc.FILTER_LINEAR_MIPMAP_NEAREST,
    );
  });

  it("should return pc.FILTER_NEAREST_MIPMAP_LINEAR from MipMapType.NEAREST_MIPMAP_LINEAR", () => {
    expect(getFilter(MipMapType.NEAREST_MIPMAP_LINEAR)).toBe(
      pc.FILTER_NEAREST_MIPMAP_LINEAR,
    );
  });

  it("should return pc.FILTER_LINEAR_MIPMAP_LINEAR from MipMapType.LINEAR_MIPMAP_LINEAR", () => {
    expect(getFilter(MipMapType.LINEAR_MIPMAP_LINEAR)).toBe(
      pc.FILTER_LINEAR_MIPMAP_LINEAR,
    );
  });
});
