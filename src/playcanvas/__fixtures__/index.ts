/* eslint-disable import/extensions */
import { TextEncoder } from "util";
import mockConfigObject from "../../../public/assets/playcanvas/config.json";
import mockSceneObject from "./Scene.json";
import mockModelObject from "./Model.json";

export const mockConfigResponse = JSON.stringify(mockConfigObject);
export const mockSceneResponse = JSON.stringify(mockSceneObject);
export const mockModelResponse = new TextEncoder().encode(
  JSON.stringify(mockModelObject),
);
