import pc from "playcanvas";
import Debug from "debug";
import debounce from "lodash.debounce";
import ResizeObserver from "resize-observer-polyfill";
import { OrbitCamera } from "./scripts";

const debug = Debug("playCanvasViewer");
const orbitCameraScriptName = "OrbitCamera";
const assetPrefix = "assets/playcanvas/";

type CameraEntity = pc.Entity & {
  script: pc.ScriptComponent & {
    [orbitCameraScriptName]: OrbitCamera;
  };
};

type ContainerResource = {
  model?: pc.Asset;
  textures: pc.Asset[];
  animations: pc.Asset[];
};

export type PlayCanvasViewerOptions = {
  autoPlayAnimations: boolean;
};

export class PlayCanvasViewer implements TestableViewer {
  private _app: pc.Application;
  private _camera: CameraEntity;
  private _scene?: pc.Scene;
  private _entity?: pc.Entity;
  private _gltfAsset?: pc.Asset;
  private _modelAsset?: pc.Asset;
  private _animationAssets: pc.Asset[] = [];
  private _debouncedCanvasResize = debounce(() => this._resizeCanvas(), 10);
  private _canvasResizeObserver = new ResizeObserver(
    this._debouncedCanvasResize,
  );
  private _autoPlayAnimations: boolean;
  private _initiated = false;
  private _sceneLoaded = false;
  private _modelLoaded = false;

  public constructor(
    public canvas: HTMLCanvasElement,
    { autoPlayAnimations }: PlayCanvasViewerOptions,
  ) {
    this._resizeCanvas = this._resizeCanvas.bind(this);

    this._autoPlayAnimations = autoPlayAnimations;

    this._app = this._createApp();
    this._camera = this._createCamera(this._app);

    this._canvasResizeObserver.observe(this.canvas);
  }

  public get app() {
    return this._app;
  }

  public get initiated() {
    return !!this._app.graphicsDevice && this._initiated;
  }

  public get sceneLoaded() {
    return this._sceneLoaded;
  }

  public get modelLoaded() {
    return this._modelLoaded;
  }

  public get scenes(): pc.SceneFile[] {
    return this._app.scenes?.list() || [];
  }

  private _resizeCanvas() {
    this._app.resizeCanvas(
      this.canvas.parentElement?.clientWidth,
      this.canvas.parentElement?.clientHeight,
    );
  }

  private _createApp() {
    const existingApp = pc.Application.getApplication();
    if (existingApp) {
      debug("Destroying existing app");
      existingApp.destroy();
    }

    debug("Creating app for target", this.canvas);
    const app = new pc.Application(this.canvas, {
      assetPrefix,
      mouse: new pc.Mouse(document.body),
      keyboard: new pc.Keyboard(window),
      graphicsDeviceOptions: {
        preserveDrawingBuffer: false,
        antialias: true,
        alpha: true,
        preferWebGl2: true,
        use3dPhysics: false,
      },
    });

    app.setCanvasFillMode(pc.FILLMODE_NONE);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);
    app.resizeCanvas(
      this.canvas.parentElement?.clientWidth,
      this.canvas.parentElement?.clientHeight,
    );

    debug("Starting app");
    app.start();

    return app;
  }

  private _createCamera(app: pc.Application) {
    debug("Creating camera");

    pc.registerScript(OrbitCamera, orbitCameraScriptName);

    const camera = new pc.Entity("camera") as CameraEntity;
    camera.addComponent("camera", {
      fov: 45.8366,
      clearColor: new pc.Color(0, 0, 0),
    });
    camera.addComponent("script");
    camera.script.create(orbitCameraScriptName);
    camera.script[orbitCameraScriptName].inertiaFactor = 0.07;
    camera.script[orbitCameraScriptName].nearClipFactor = 0.002;
    camera.script[orbitCameraScriptName].farClipFactor = 10;

    app.root.addChild(camera);

    return camera;
  }

  public destroy() {
    this.destroyModel();
    this.destroyScene();
    this._canvasResizeObserver.unobserve(this.canvas);
    this._app.destroy();
  }

  public async configure() {
    const app = this._app;

    debug("Configuring app");
    return new Promise<void>((resolve, reject) => {
      const url = pc.path.join(assetPrefix, "config.json");

      app.configure(url, error => {
        if (error) {
          reject(error);
          return;
        }
        app.preload(() => {
          this._initiated = true;
          resolve();
        });
      });
    });
  }

  public async loadScene(url: string) {
    this.destroyScene();

    debug("Loading scene", url);
    return new Promise<void>((resolve, reject) => {
      this._app.scenes.loadScene(url, (error, scene) => {
        this._sceneLoaded = true;
        if (error) {
          reject(error);
          return;
        }
        this._scene = (scene as unknown) as pc.Scene;
        resolve();
      });
    });
  }

  public destroyScene() {
    debug("Destroy scene", this._scene);

    this._sceneLoaded = false;

    if (this._scene) {
      if (this._scene.root) {
        this._scene.root.destroy();
        (this._scene.root as pc.Entity | undefined) = undefined;
      }
      this._scene.destroy();
      this._scene = undefined;
    }
  }

  public destroyModel() {
    debug("Destroy model", this._entity);

    this._modelLoaded = false;

    if (this._entity) {
      this._entity.destroy();
      this._entity = undefined;
    }

    if (this._gltfAsset) {
      // If not done in this order,
      // the entity will be retained by the JS engine.
      this._app.assets.remove(this._gltfAsset);
      this._gltfAsset.unload();
      this._gltfAsset = undefined;
    }

    this._modelAsset = undefined;
    this._animationAssets = [];
  }

  private _initModel() {
    debug("Init model");

    if (this._entity) {
      // Model already initialized
      return;
    }

    if (!this._gltfAsset || !this._modelAsset) {
      throw new Error("initModel called before registering resources");
    }

    // Add the loaded model to the hierarchy
    this._entity = new pc.Entity("gltf");
    this._entity.addComponent("model", {
      type: "asset",
      asset: this._modelAsset,
      castShadows: true,
      receiveShadows: true,
      shadowType: pc.SHADOW_VSM32,
    });
    this._entity.addComponent("script");
    this._app.root.addChild(this._entity);

    debug("Init animations", this._animationAssets);

    if (this._animationAssets.length > 0) {
      this._entity.addComponent("animation", {
        assets: this._animationAssets.map(asset => asset.id),
        speed: 0,
        active: false,
      });
      if (this._entity.animation && this._autoPlayAnimations) {
        this._entity.animation.speed = 1;
        this._entity.animation.play(this._animationAssets[0].name, 0);
      }
    }

    this.focusCameraOnEntity();
  }

  public focusCameraOnEntity() {
    debug("Focus on model", this._entity);

    if (this._entity) {
      this._camera.script[orbitCameraScriptName].focus(this._entity);
    }
  }

  public resetCamera(yaw?: number, pitch?: number, distance?: number) {
    this._camera.script[orbitCameraScriptName].reset(yaw, pitch, distance);
  }

  private async _loadGltfAsset(url: string, fileName?: string) {
    debug("Load glTF asset", url, fileName);

    return new Promise<pc.Asset | undefined>((resolve, reject) => {
      const callback: pc.callbacks.LoadAsset = (err, asset) => {
        if (err) {
          reject(err);
        } else {
          resolve(asset);
        }
      };

      if (fileName) {
        // Remove asset prefix in order to prevent it from being prepended
        // to blob urls
        this._app.assets.prefix = "";
        this._app.assets.loadFromUrlAndFilename(
          url,
          fileName,
          "container",
          callback,
        );
        // Add asset prefix again
        this._app.assets.prefix = assetPrefix;
      } else {
        this._app.assets.loadFromUrl(
          pc.path.join("../..", url),
          "container",
          callback,
        );
      }
    });
  }

  private async _registerGltfResources(asset: pc.Asset) {
    debug("Register glTF resources", asset.resource);

    const resource = asset.resource as ContainerResource | undefined;
    if (!resource) {
      throw new Error("Asset is empty");
    }

    this._gltfAsset = asset;
    this._modelAsset = resource.model;
    this._animationAssets = resource.animations || [];
  }

  public async loadModel(url: string, fileName?: string) {
    this.destroyModel();

    try {
      const asset = await this._loadGltfAsset(url, fileName);
      if (!asset) {
        throw new Error("Asset not found");
      }

      await this._registerGltfResources(asset);
      this._initModel();

      this._modelLoaded = true;
    } catch (e) {
      this._modelLoaded = true;
      throw e;
    }
  }
}
