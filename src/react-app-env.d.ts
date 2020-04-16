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

interface TestableViewer {
  initiated: readonly boolean;
  sceneLoaded: readonly boolean;
  modelLoaded: readonly boolean;
  loadModel(path: string): Promise<void>;
  loadScene(path: string): Promise<void>;
}

interface Window {
  /**
   * Used by e2e tests to access the current viewer instance.
   */
  viewer?: TestableViewer;
}

declare module "draco3dgltf" {
  function createDecoderModule(): any;
  function createEncoderModule(): any;
}
