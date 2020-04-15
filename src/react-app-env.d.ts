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

interface Viewer {
  loadModel(path: string): Promise<void>;
  loadScene(path: string): Promise<void>;
}

interface Window {
  /**
   * Used by e2e tests to access the current viewer instance.
   */
  viewer?: Viewer;

  /**
   * Used by e2e tests to determine wether the viewer has been initiated.
   */
  viewerInitiated?: boolean;

  /**
   * Used by e2e tests to determine wether the selected model has finished loading.
   */
  viewerModelLoaded?: boolean;

  /**
   * Used by e2e tests to determine wether the selected scene has finished loading.
   */
  viewerSceneLoaded?: boolean;
}

declare module "draco3dgltf" {
  function createDecoderModule(): any;
  function createEncoderModule(): any;
}
