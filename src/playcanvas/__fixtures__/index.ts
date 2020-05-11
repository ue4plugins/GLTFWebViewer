/* eslint-disable import/extensions */
import { join } from "path";
import { readFileSync } from "fs";
import configObject from "../../../public/assets/playcanvas/config.json";
import sceneObject from "./Scene.json";

export const configResponse = JSON.stringify(configObject);
export const sceneResponse = JSON.stringify(sceneObject);

export const modelEmbeddedResponse = readFileSync(
  join(__dirname, "./ModelEmbedded.gltf"),
);

export const modelUnpackedResponse = readFileSync(
  join(__dirname, "./ModelUnpacked.gltf"),
);

export const modelUnpackedBinResponse = readFileSync(
  join(__dirname, "./ModelUnpacked.bin"),
);
