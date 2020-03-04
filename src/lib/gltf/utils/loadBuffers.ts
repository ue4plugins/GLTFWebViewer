/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Buffer, GlTf } from "../types";
import { isDataURI } from "./isDataURI";

export function loadBuffers(gltf: GlTf, basePath = ""): Promise<ArrayBuffer[]> {
  if (!gltf.buffers) {
    return Promise.resolve([]);
  }

  type BufferWithUri = Buffer & { uri: string };
  return Promise.all(
    gltf.buffers
      .filter((buf): buf is BufferWithUri => typeof buf.uri !== "undefined")
      .map(async buffer => {
        if (isDataURI(buffer.uri)) {
          // convert base64 to raw binary data held in a string
          // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
          const byteString = atob(buffer.uri.split(",")[1]);
          // write the bytes of the string to an ArrayBuffer
          const arrayBuffer = new ArrayBuffer(byteString.length);
          // create a view into the buffer
          const uint8Array = new Uint8Array(arrayBuffer);
          // set the bytes of the buffer to the correct values
          for (let i = 0; i < byteString.length; i += 1) {
            uint8Array[i] = byteString.charCodeAt(i);
          }
          return Promise.resolve(arrayBuffer);
        } else {
          try {
            const res = await fetch(basePath + buffer.uri);
            return res.arrayBuffer();
          } catch (e) {
            return Promise.resolve(new ArrayBuffer(0));
          }
        }
      }),
  );
}
