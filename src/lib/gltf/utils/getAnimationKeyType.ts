import { AnimationKeyableType } from "../animation/AnimationKeyable";

const typeMap: Record<number, AnimationKeyableType> = {
  1: AnimationKeyableType.NUM,
  3: AnimationKeyableType.VEC,
  4: AnimationKeyableType.QUAT,
};

export function getAnimationKeyType(numCurves: number) {
  if (typeof typeMap[numCurves] === "undefined") {
    console.warn("Unexpected amount of curves per keyframe: " + numCurves);
    return AnimationKeyableType.NUM;
  }
  return typeMap[numCurves];
}
