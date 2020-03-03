import "jest";
import pc from "playcanvas";
import { getWrap } from "../getWrap";

describe("getWrap", () => {
  it("should get pc.ADDRESS_REPEAT as default", () => {
    expect(getWrap(1337)).toBe(pc.ADDRESS_REPEAT);
  });

  it("should get pc.ADDRESS_CLAMP_TO_EDGE", () => {
    expect(getWrap(33071)).toBe(pc.ADDRESS_CLAMP_TO_EDGE);
  });

  it("should get pc.ADDRESS_MIRRORED_REPEAT", () => {
    expect(getWrap(33648)).toBe(pc.ADDRESS_MIRRORED_REPEAT);
  });

  it("should get pc.ADDRESS_REPEAT", () => {
    expect(getWrap(10497)).toBe(pc.ADDRESS_REPEAT);
  });
});
