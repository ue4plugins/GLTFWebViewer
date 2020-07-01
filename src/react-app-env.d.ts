/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="react-scripts" />

declare namespace pc {
  interface Scene {
    destroy: () => void;
  }

  type SceneSource = {
    name: string;
    url: string;
  };

  interface Texture {
    // NOTE: Actually "string", but set to "any" since all pc.TEXTURETYPE_XXX consts are incorrectly typed as number.
    type: any;
    _levels: any[];
    _prefilteredMips?: boolean;
  }

  interface GraphicsDevice {
    gl: WebGLRenderingContext;
    setFramebuffer(frameBuffer: number): void;
  }

  interface Vec4 {
    data: number[];
  }

  interface RenderTarget {
    _colorBuffer: pc.Texture;
    _glFrameBuffer: number;
  }
}

interface TestableViewer {
  initiated: boolean;
  sceneLoaded: boolean;
  gltfLoaded: boolean;
  loadGltf(path: string): Promise<void>;
  loadScene(path: string): Promise<void>;
  resetCamera(yaw?: number, pitch?: number, distance?: number): void;
}

interface Window {
  /**
   * Used by e2e tests to access the current viewer instance.
   */
  viewer?: TestableViewer;

  /**
   * Used by PlayCanvas glTF parser.
   */
  DracoDecoderModule: any;
}

declare module "draco3d" {
  function createDecoderModule(): any;
  function createEncoderModule(): any;
}
