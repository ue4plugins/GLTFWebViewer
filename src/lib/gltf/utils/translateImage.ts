import pc from "playcanvas";
import createDebug from "debug";
import { Image as GlTfImage, GlTf } from "../types";
import { resampleImage } from "./resampleImage";
import { isPowerOf2 } from "./isPowerOf2";
import { isDataURI } from "./isDataURI";

const debug = createDebug("translateImage");

interface Arguments {
  basePath: string;
  textures: pc.Texture[];
  buffers: ArrayBuffer[];
  gltf: GlTf;
}

export function translateImage(
  data: GlTfImage,
  { basePath, textures, buffers, gltf }: Arguments,
) {
  const gltfTextures = gltf.textures;
  const gltfImages = gltf.images;

  if (!gltfTextures || !gltfImages) {
    return;
  }

  const imageIndex = gltfImages.indexOf(data);
  const image = new Image();

  const onLoad = () => {
    image.removeEventListener("load", onLoad, false);
    const gltfTexture = gltfTextures.find(gt => gt.source === imageIndex);

    if (!gltfTexture) {
      return;
    }

    const glTextureIdx = gltfTextures.indexOf(gltfTexture);
    const texture = textures[glTextureIdx];

    // Prevent race condition
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!texture || !(texture as any)._levels) {
      return;
    }

    const { addressU: aU, addressV: aV, minFilter: mF } = gltfTexture;

    const notPowerOf2 = !isPowerOf2(image.width) || !isPowerOf2(image.width);

    const isAURepeat =
      aU && [pc.ADDRESS_REPEAT, pc.ADDRESS_MIRRORED_REPEAT].includes(aU);

    const isAVRepeat =
      aV && [pc.ADDRESS_REPEAT, pc.ADDRESS_MIRRORED_REPEAT].includes(aV);

    const nearestMinFilter =
      mF &&
      [
        pc.FILTER_LINEAR_MIPMAP_LINEAR,
        pc.FILTER_NEAREST_MIPMAP_LINEAR,
        pc.FILTER_LINEAR_MIPMAP_NEAREST,
        pc.FILTER_NEAREST_MIPMAP_NEAREST,
      ].includes(mF);

    if (notPowerOf2 && (isAURepeat || isAVRepeat || nearestMinFilter)) {
      const potImage = new Image();
      potImage.addEventListener("load", function() {
        texture.setSource(potImage);
      });
      debug("Set resampled source");
      potImage.src = resampleImage(image);
    } else if (image) {
      debug("Set source");
      texture.setSource(image);
    }
  };

  image.addEventListener("load", onLoad, false);

  if (data.uri) {
    if (isDataURI(data.uri)) {
      image.src = data.uri;
      // } else if (processUri) {
      //   processUri(data.uri, uri => {
      //     image.crossOrigin = "anonymous";
      //     image.src = uri;
      //   });
    } else {
      image.crossOrigin = "anonymous";
      image.src = basePath + data.uri;
    }
  }

  if (data.bufferView && gltf.bufferViews) {
    const bufferView = gltf.bufferViews[data.bufferView];
    const arrayBuffer = buffers[bufferView.buffer];
    const byteOffset = bufferView.byteOffset ? bufferView.byteOffset : 0;
    const imageBuffer = arrayBuffer.slice(
      byteOffset,
      byteOffset + bufferView.byteLength,
    );
    const blob = new Blob([imageBuffer], { type: data.mimeType });
    image.src = URL.createObjectURL(blob);
  }

  return image;
}
