import "jest";
import { getAnimationKeyType } from "../getAnimationKeyType";
import { AnimationKeyableType } from "../../animation/AnimationKeyable";

describe("getAnimationKeyType", () => {
  it("should return AnimationKeyableType.NUM for 1", () => {
    expect(getAnimationKeyType(1)).toBe(AnimationKeyableType.NUM);
  });

  it("should return AnimationKeyableType.VEC for 3", () => {
    expect(getAnimationKeyType(3)).toBe(AnimationKeyableType.VEC);
  });

  it("should return AnimationKeyableType.QUAT for 4", () => {
    expect(getAnimationKeyType(4)).toBe(AnimationKeyableType.QUAT);
  });

  it("should return AnimationKeyableType.NUM for unknown", () => {
    expect(getAnimationKeyType(1337)).toBe(AnimationKeyableType.NUM);
  });
});
