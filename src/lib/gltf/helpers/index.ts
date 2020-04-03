import path from "path";
import { readFile } from "fs-extra";
import { GlTf, ComponentType, Accessor } from "../types";
import { toArrayBuffer } from "../utils/toArrayBuffer";

const basePath = "./public/assets/gltf";

export async function loadAsset(
  name: string,
  filename?: string,
  type?: string,
): Promise<Buffer> {
  const typeDir = type ? `glTF-${type}` : "glTF";
  const ext = path.extname(filename || name);
  const fullPath = path.join(
    basePath,
    path.basename(name, ext),
    typeDir,
    filename || name,
  );
  return readFile(fullPath);
}

export async function loadGltf(
  name: string,
  filename?: string,
  type?: string,
): Promise<GlTf> {
  return JSON.parse(
    (await loadAsset(name, filename || `${name}.gltf`, type)).toString(),
  );
}

export async function loadBin(
  name: string,
  filename?: string,
  type?: string,
): Promise<ArrayBuffer> {
  return toArrayBuffer(await loadAsset(name, filename || `${name}.bin`, type));
}

export function getAccessor(
  gltf: GlTf,
  componentType: ComponentType,
): Accessor {
  if (!gltf.accessors) {
    throw Error("Missing accessors");
  }
  const accessor = Object.values(gltf.accessors).find(
    acc => acc.componentType === componentType,
  );
  if (!accessor) {
    throw Error("Missing accessor");
  }
  return accessor;
}

export function dataViewsAreEqual(a: DataView, b: DataView) {
  if (a.byteLength !== b.byteLength) {
    return false;
  }
  for (let i = 0; i < a.byteLength; i += 1) {
    if (a.getUint8(i) !== b.getUint8(i)) {
      return false;
    }
  }
  return true;
}

export function arrayBuffersAreEqual(a: ArrayBuffer, b: ArrayBuffer) {
  return dataViewsAreEqual(new DataView(a), new DataView(b));
}
