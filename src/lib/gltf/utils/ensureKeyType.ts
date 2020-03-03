import { AnimationKeyableType } from "../animation/AnimationKeyable";

export function ensureKeyType(
  keyType: AnimationKeyableType,
  expectedKeyType: AnimationKeyableType,
) {
  if (keyType !== expectedKeyType) {
    console.warn(
      `Unexpected key type: "${keyType}" (expected "${expectedKeyType}")`,
    );
    keyType = expectedKeyType;
  }
  return keyType;
}
