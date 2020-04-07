/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="react-scripts" />

declare namespace pc {
  interface GraphNode {
    _dirtifyLocal: () => void;
    localScale: pc.Vec3;
  }

  interface Scene {
    destroy: () => void;
    root: Entity | undefined;
  }

  type Morph = any;
  type MorphTarget = any;
  type MorphInstance = any;

  type SceneFile = {
    name: string;
    url: string;
  };
}

declare module "draco3dgltf" {
  function createDecoderModule(): any;
  function createEncoderModule(): any;
}
