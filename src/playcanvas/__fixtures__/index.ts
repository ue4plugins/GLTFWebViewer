/* eslint-disable import/extensions */
import { join } from "path";
import { readFileSync } from "fs";
import configObject from "../../../public/assets/playcanvas/config.json";
import sceneObject from "./Scene.json";

export const configResponse = JSON.stringify(configObject);
export const sceneResponse = JSON.stringify(sceneObject);

export const gltfEmbeddedResponse = readFileSync(
  join(__dirname, "./ModelEmbedded.gltf"),
);

export const gltfEmbeddedInvalidResponse = readFileSync(
  join(__dirname, "./ModelEmbeddedInvalid.gltf"),
);

export const gltfEmbeddedAnimatedResponse = readFileSync(
  join(__dirname, "./ModelEmbeddedAnimated.gltf"),
);

export const gltfUnpackedResponse = readFileSync(
  join(__dirname, "./ModelUnpacked.gltf"),
);

export const gltfUnpackedBinResponse = readFileSync(
  join(__dirname, "./ModelUnpacked.bin"),
);
