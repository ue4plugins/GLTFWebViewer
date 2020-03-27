/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="react-scripts" />

declare namespace pc {
  interface GraphNode {
    _dirtifyLocal: () => void;
    localScale: pc.Vec3;
  }

  type Morph = any;
  type MorphTarget = any;
  type MorphInstance = any;
}

declare type GLTF_FILE = {
  type: string;
  name: string;
  path: string;
};

declare const GLTF_FILES: GLTF_FILE[];

declare type SKYBOX_CUBEMAP = {
  name: string;
  path: string;
  prefiltered: string;
  faces: string[];
};

declare const SKYBOX_CUBEMAPS: SKYBOX_CUBEMAP[];

declare module "draco3dgltf" {
  function createDecoderModule(): any;
  function createEncoderModule(): any;
}
