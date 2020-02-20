import { nearestPow2 } from "./nearestPow2";

// Specification:
//   https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#image
export function resampleImage(image: CanvasImageSource) {
  let srcW = image.width;
  let srcH = image.height;
  srcW = typeof srcW === "number" ? srcW : srcW.baseVal.value;
  srcH = typeof srcH === "number" ? srcH : srcH.baseVal.value;
  const dstW = nearestPow2(srcW);
  const dstH = nearestPow2(srcH);
  const canvas = document.createElement("canvas");
  canvas.width = dstW;
  canvas.height = dstH;
  const context = canvas.getContext("2d");
  context?.drawImage(image, 0, 0, srcW, srcH, 0, 0, dstW, dstH);
  return canvas.toDataURL();
}
