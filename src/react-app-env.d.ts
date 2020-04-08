/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="react-scripts" />

declare namespace pc {
  interface Scene {
    destroy: () => void;
    root: Entity | undefined;
  }

  type SceneFile = {
    name: string;
    url: string;
  };
}

declare module "draco3dgltf" {
  function createDecoderModule(): any;
  function createEncoderModule(): any;
}
