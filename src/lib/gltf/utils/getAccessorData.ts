import createDebug from "debug";
import { GlTf, Accessor, ComponentType } from "../types";
import { getAccessorTypeSize } from "./getAccessorTypeSize";

const debug = createDebug("getAccessorData");

export function getAccessorData(
  gltf: GlTf,
  accessor: Accessor,
  buffers: ArrayBuffer[],
) {
  if (
    typeof gltf.bufferViews === "undefined" ||
    typeof accessor.bufferView === "undefined"
  ) {
    debug(
      !gltf.bufferViews
        ? "Missing buffer views"
        : "Missing accessor buffer view",
    );
    return null;
  }

  const bufferView = gltf.bufferViews[accessor.bufferView];
  const arrayBuffer = buffers[bufferView.buffer];
  const accessorByteOffset = accessor.byteOffset ?? 0;
  const bufferViewByteOffset = bufferView.byteOffset ?? 0;
  const byteOffset = accessorByteOffset + bufferViewByteOffset;
  const length = accessor.count * getAccessorTypeSize(accessor.type);

  // TODO: Support KHR_mesh_quantization
  // const isQuantized =
  //   gltf.extensionsRequired?.includes("KHR_mesh_quantization") ?? false;

  switch (accessor.componentType) {
    case ComponentType.BYTE:
      return new Int8Array(arrayBuffer, byteOffset, length);

    case ComponentType.UNSIGNED_BYTE:
      return new Uint8Array(arrayBuffer, byteOffset, length);

    case ComponentType.SHORT:
      return new Int16Array(arrayBuffer, byteOffset, length);

    case ComponentType.UNSIGNED_SHORT:
      return new Uint16Array(arrayBuffer, byteOffset, length);

    case ComponentType.UNSIGNED_INT:
      return new Uint32Array(arrayBuffer, byteOffset, length);

    case ComponentType.FLOAT:
      return new Float32Array(arrayBuffer, byteOffset, length);

    default:
      return null;
  }
}
