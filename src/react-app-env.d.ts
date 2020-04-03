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

declare type SCENE_FILE = {
  name: string;
  path: string;
};

declare const SCENE_FILES: SCENE_FILE[];

declare module "draco3dgltf" {
  function createDecoderModule(): any;
  function createEncoderModule(): any;
}
