// import createDebug from "debug";
import { GlTf, Accessor } from "../types";
import { getAccessorTypeSize } from "./getAccessorTypeSize";

// const debug = createDebug("getAccessorData");

export function getAccessorData(
  gltf: GlTf,
  accessor: Accessor,
  buffers: ArrayBuffer[],
) {
  // if (!gltf.bufferViews || !accessor.bufferView) {
  //   debug(
  //     !gltf.bufferViews
  //       ? "Missing buffer views"
  //       : "Missing accessor buffer view",
  //   );
  //   return null;
  // }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const bufferView = gltf.bufferViews![accessor.bufferView!];
  const arrayBuffer = buffers[bufferView.buffer];
  const accessorByteOffset = accessor.byteOffset ?? 0;
  const bufferViewByteOffset = bufferView.byteOffset ?? 0;
  const byteOffset = accessorByteOffset + bufferViewByteOffset;
  const length = accessor.count * getAccessorTypeSize(accessor.type);

  switch (accessor.componentType) {
    case 5120:
      return new Int8Array(arrayBuffer, byteOffset, length);

    case 5121:
      return new Uint8Array(arrayBuffer, byteOffset, length);

    case 5122:
      return new Int16Array(arrayBuffer, byteOffset, length);

    case 5123:
      return new Uint16Array(arrayBuffer, byteOffset, length);

    case 5125:
      return new Uint32Array(arrayBuffer, byteOffset, length);

    case 5126:
      return new Float32Array(arrayBuffer, byteOffset, length);

    default:
      return null;
  }
}
