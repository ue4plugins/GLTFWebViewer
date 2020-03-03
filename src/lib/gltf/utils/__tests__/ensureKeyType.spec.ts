import "jest";
import { ensureKeyType } from "../ensureKeyType";
import { AnimationKeyableType } from "../../animation/AnimationKeyable";

describe("ensureKeyType", () => {
  it("shouldn't do anything if type is expected", () => {
    const cur = AnimationKeyableType.VEC;
    ensureKeyType(cur, AnimationKeyableType.VEC);
    expect(cur).toBe(AnimationKeyableType.VEC);
  });

  it("should replace with expected type when unexpected type", () => {
    let cur = AnimationKeyableType.QUAT;
    cur = ensureKeyType(cur, AnimationKeyableType.VEC);
    expect(cur).toBe(AnimationKeyableType.VEC);
  });
});
