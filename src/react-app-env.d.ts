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

declare const GLTF_MODELS: string[];

declare module "draco3dgltf" {
  type DracoEncoderModule = any;
  type DracoDecoderModule = any;
  function createEncoderModule(encoderModule: DracoEncoderModule): any;
  function createDecoderModule(decoderModule: DracoDecoderModule): any;
}
