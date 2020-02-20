import { AnimationKeyableType } from "../animation/AnimationKeyable";

export function ensureKeyType(
  keyType: AnimationKeyableType,
  expectedKeyType: AnimationKeyableType,
) {
  if (keyType !== expectedKeyType) {
    // eslint-disable-next-line autofix/no-console
    console.warn(
      "Unexpected key type: " +
        '"' +
        keyType +
        '" ' +
        '(expected "' +
        expectedKeyType +
        '")',
    );
    keyType = expectedKeyType;
  }
}
