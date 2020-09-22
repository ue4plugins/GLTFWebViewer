/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="react-scripts" />

declare namespace pc {
  interface Application {
    _skyboxLast: number | null;
  }

  interface Scene {
    destroy(): void;
    setSkybox(textures: (pc.Texture | null)[]): void;
  }

  type SceneSource = {
    name: string;
    url: string;
  };

  interface MeshInstance {
    setParameter: Material["setParameter"];
    setParameters: Material["setParameters"];
    deleteParameter: Material["deleteParameter"];
  }

  interface Texture {
    // NOTE: Actually "string", but set to "any" since all pc.TEXTURETYPE_XXX consts are incorrectly typed as number.
    type: any;
    _levels: any[];
    _prefilteredMips?: boolean;
  }

  interface GraphicsDevice {
    gl: WebGLRenderingContext;
    setFramebuffer(frameBuffer: number): void;
    readPixels(
      x: number,
      y: number,
      w: number,
      h: number,
      pixels: Uint8Array,
    ): void;
  }

  interface Vec4 {
    data: number[];
  }

  interface RenderTarget {
    _colorBuffer: pc.Texture;
    _glFrameBuffer: number;
  }

  interface ComponentSystemRegistry {
    camera: CameraComponentSystem;
  }

  interface Entity {
    addComponent(type: "script", data?: any): pc.ScriptComponent;
    addComponent(type: "model", data?: any): pc.ModelComponent;
    addComponent(type: "camera", data?: any): pc.CameraComponent;
    anim?: pc.AnimComponent;
  }

  interface ScriptComponent {
    create<T extends typeof ScriptType>(
      nameOrType: T,
      args?: {
        enabled?: boolean;
        attributes?: any;
        preloading?: boolean;
        ind?: number;
      },
    ): InstanceType<T>;
  }

  interface InstanceList {
    opaqueMeshInstances: pc.MeshInstance[];
    transparentMeshInstances: pc.MeshInstance[];

    /** Arrays of visible instances for each camera */
    visibleOpaque: VisibleInstanceList[];

    /** Arrays of visible instances for each camera */
    visibleTransparent: VisibleInstanceList[];
  }

  interface VisibleInstanceList {
    list: pc.MeshInstance[];
  }

  interface Layer {
    incrementCounter(): void;
    decrementCounter(): void;

    instances: pc.InstanceList;
  }

  interface Picker {
    app: pc.Application;
    device: pc.GraphicsDevice;
    layer: pc.Layer;
  }

  const programlib: any;
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
