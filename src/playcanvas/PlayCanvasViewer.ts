import pc from "@animech-public/playcanvas";
import Debug from "debug";
import debounce from "lodash.debounce";
import ResizeObserver from "resize-observer-polyfill";
import { GltfAnimation } from "../types";
import { OrbitCamera } from "./scripts";
import { PlayCanvasGltfLoader } from "./PlayCanvasGltfLoader";

const debug = Debug("PlayCanvasViewer");
const orbitCameraScriptName = "OrbitCamera";

type CameraEntity = pc.Entity & {
  script: pc.ScriptComponent & {
    [orbitCameraScriptName]: OrbitCamera;
  };
};

export class PlayCanvasViewer implements TestableViewer {
  private _app: pc.Application;
  private _camera: CameraEntity;
  private _loader: PlayCanvasGltfLoader;
  private _scene?: pc.Scene;
  private _gltfRoot?: pc.Entity;
  private _gltfAsset?: pc.Asset;
  private _gltfRootEntity?: pc.Entity;
  private _gltfAnimations: pc.AnimComponentLayer[] = [];
  private _debouncedCanvasResize = debounce(() => this._resizeCanvas(), 10);
  private _canvasResizeObserver = new ResizeObserver(
    this._debouncedCanvasResize,
  );
  private _initiated = false;
  private _sceneLoaded = false;
  private _gltfLoaded = false;

  public constructor(public canvas: HTMLCanvasElement) {
    this._resizeCanvas = this._resizeCanvas.bind(this);

    this._app = this._createApp();
    this._camera = this._createCamera(this._app);
    this._loader = new PlayCanvasGltfLoader(this._app);

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

  public get gltfLoaded() {
    return this._gltfLoaded;
  }

  public get scenes(): pc.SceneSource[] {
    return this._app.scenes?.list() || [];
  }

  public get animations(): GltfAnimation[] {
    return this._gltfAnimations
      .map((anim, index) => ({
        id: index,
        name: anim.name,
        active: false,
      }))
      .filter((_, index) => this._gltfAnimations[index].playable);
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
      assetPrefix: "assets/playcanvas/",
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
    this.destroyGltf();
    this.destroyScene();
    this._canvasResizeObserver.unobserve(this.canvas);
    this._app.destroy();
  }

  public async configure() {
    const app = this._app;

    debug("Configuring app");
    return new Promise<void>((resolve, reject) => {
      const url = pc.path.join(app.assets.prefix, "config.json");

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

  public destroyGltf() {
    debug("Destroy glTF", this._gltfRoot);

    this._gltfLoaded = false;

    if (this._gltfRoot) {
      this._gltfRoot.destroy();
      this._gltfRoot = undefined;
    }

    if (this._gltfRootEntity) {
      this._gltfRootEntity.destroy();
      this._gltfRootEntity = undefined;
    }

    if (this._gltfAnimations.length > 0) {
      this._gltfAnimations = [];
    }

    if (this._gltfAsset) {
      this._app.assets.remove(this._gltfAsset);
      this._gltfAsset.unload();
      this._gltfAsset = undefined;
    }
  }

  private _initGltf() {
    debug("Init glTF", this._gltfRootEntity);

    if (this._gltfRoot) {
      // glTF already initialized
      return;
    }

    if (!this._gltfRootEntity) {
      throw new Error("_initGltf called before registering resources");
    }

    this._gltfRoot = this._gltfRootEntity;
    this._app.root.addChild(this._gltfRoot);

    this.focusCameraOnEntity();
  }

  public setActiveAnimations(animations: GltfAnimation[]) {
    debug("Set active animations", animations);

    const animationIndexes = animations.map(a => a.id);

    this._gltfAnimations.forEach((animation, animationIndex) => {
      const active = animationIndexes.includes(animationIndex);
      if (active && animation.playable) {
        animation.play();
      } else {
        animation.pause();
      }
    });
  }

  public focusCameraOnEntity() {
    debug("Focus on root entity", this._gltfRoot);

    if (this._gltfRoot) {
      this._camera.script[orbitCameraScriptName].focus(this._gltfRoot);
    }
  }

  public resetCamera(yaw?: number, pitch?: number, distance?: number) {
    this._camera.script[orbitCameraScriptName].reset(yaw, pitch, distance);
  }

  public async loadGltf(url: string, fileName?: string) {
    this.destroyGltf();

    try {
      const gltf = await this._loader.load(url, fileName);
      this._gltfAsset = gltf.asset;
      this._gltfRootEntity = gltf.scene;
      this._gltfAnimations = gltf.animations;

      this._initGltf();
      this._gltfLoaded = true;
    } catch (e) {
      this._gltfLoaded = true;
      throw e;
    }
  }
}
