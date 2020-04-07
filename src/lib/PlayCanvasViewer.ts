import pc from "playcanvas";
import Debug from "debug";
import debounce from "lodash.debounce";
import ResizeObserver from "resize-observer-polyfill";
import { createCameraScripts } from "./createCameraScripts";

const debug = Debug("playCanvasViewer");

type ContainerResource = {
  model?: pc.Asset;
  textures: pc.Asset[];
  animations: pc.Asset[];
};

type OrbitCameraEntity = pc.Entity & {
  script: pc.ScriptComponent & {
    orbitCamera: any;
  };
};

export class PlayCanvasViewer {
  public app: pc.Application;
  public camera!: OrbitCameraEntity;
  public playing = true;
  public gltf?: pc.Entity;
  public model?: pc.Asset;
  public asset?: pc.Asset;
  public scene?: pc.Scene;
  public textures: pc.Asset[] = [];
  public animations: pc.Asset[] = [];
  private debouncedCanvasResize = debounce(() => this.resizeCanvas(), 10);
  private canvasResizeObserver = new ResizeObserver(this.debouncedCanvasResize);

  public constructor(public canvas: HTMLCanvasElement) {
    if (!canvas) {
      throw new Error("Missing canvas");
    }
    this.resizeCanvas = this.resizeCanvas.bind(this);
    // TODO: remove side effects of createApp
    this.app = this.createApp();
  }

  private resizeCanvas() {
    this.app.resizeCanvas(
      this.canvas.parentElement?.clientWidth,
      this.canvas.parentElement?.clientHeight,
    );
  }

  public get isReady() {
    return !!this.app.graphicsDevice;
  }

  public get scenes(): pc.SceneFile[] {
    // TODO: change this when the new scene API is introduced in the engine
    return (this.app as any)._sceneRegistry?.list() || [];
  }

  private createApp() {
    const existingApp = pc.Application.getApplication();
    if (existingApp) {
      debug("Destroying existing PlayCanvas app");
      existingApp.destroy();
    }

    debug("Creating PlayCanvas for target", this.canvas);
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

    // TODO: refactor and make scripts strongly typed
    createCameraScripts(app);

    // TODO: remove?
    const Rotate = pc.createScript("rotate");
    Rotate.prototype.update = function(deltaTime: number) {
      this.entity.rotate(0, deltaTime * 20, 0);
    };

    app.setCanvasFillMode(pc.FILLMODE_NONE);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);
    app.resizeCanvas(
      this.canvas.parentElement?.clientWidth,
      this.canvas.parentElement?.clientHeight,
    );

    this.canvasResizeObserver.observe(this.canvas);

    debug("Creating camera");
    const camera = new pc.Entity("camera");
    camera.addComponent("camera", {
      fov: 45.8366,
      clearColor: new pc.Color(0, 0, 0),
    });
    camera.setPosition(0, 0, 8);
    camera.addComponent("script");
    if (camera.script) {
      camera.script.create("orbitCamera");
      camera.script.create("keyboardInput");
      camera.script.create("mouseInput");
    }
    app.root.addChild(camera);
    this.camera = camera as OrbitCameraEntity;

    debug("Starting app");
    app.start();

    return app;
  }

  public destroy() {
    this.destroyModel();
    this.destroyScene();
    this.canvasResizeObserver.unobserve(this.canvas);
    this.app.destroy();
  }

  public async configure() {
    const app = this.app;

    debug("Configuring app");
    return new Promise<void>((resolve, reject) => {
      const url = "assets/playcanvas/config.json";

      app.configure(url, error => {
        if (error) {
          reject(error);
          return;
        }
        app.preload(() => resolve());
      });
    });
  }

  public async loadScene(url: string) {
    this.destroyScene();

    debug("Loading scene", url);
    return new Promise<void>((resolve, reject) => {
      // TODO: change to new scene registry API once it's released
      (this.app as any).loadScene(url, (error: string, scene: pc.Scene) => {
        if (error) {
          reject(error);
          return;
        }
        this.scene = scene;
        resolve();
      });
    });
  }

  public destroyScene() {
    debug("Destroy scene", this.scene);

    if (this.scene) {
      if (this.scene.root) {
        this.scene.root.destroy();
        (this.scene.root as pc.Entity | undefined) = undefined;
      }
      this.scene.destroy();
      this.scene = undefined;
    }
  }

  public destroyModel() {
    debug("Destroy model", this.gltf);

    this.textures.forEach(asset => asset.unload());
    this.textures = [];

    this.animations.forEach(asset => asset.unload());
    this.animations = [];

    if (this.model) {
      this.model.unload();
      this.model = undefined;
    }

    if (this.gltf) {
      this.gltf.destroy();
      this.gltf = undefined;
    }

    if (this.asset) {
      // If not done in this order,
      // the entity will be retained by the JS engine.
      this.app.assets.remove(this.asset);
      this.asset.unload();
      this.asset = undefined;
    }
  }

  private initModel() {
    debug("Init model");

    if (this.gltf) {
      // Model already initialized
      return;
    }

    if (!this.asset || !this.model) {
      throw new Error("initModel called before registering resources");
    }

    // Add the loaded model to the hierarchy
    this.gltf = new pc.Entity("gltf");
    this.gltf.addComponent("model", {
      type: "asset",
      asset: this.model,
      castShadows: true,
      receiveShadows: true,
      shadowType: pc.SHADOW_VSM32,
    });
    this.gltf.addComponent("script");
    // this.gltf.script?.create("rotate");
    this.app.root.addChild(this.gltf);

    debug("Init animations", this.animations);

    if (this.animations.length > 0) {
      this.gltf.addComponent("animation", {
        assets: this.animations.map(asset => asset.id),
        speed: 1,
      });
      if (this.gltf.animation) {
        this.gltf.animation.play(this.animations[0].name, 1);
      }
    }

    this.focusCameraOnEntity();
  }

  public focusCameraOnEntity() {
    debug("Focus on model", this.gltf);

    this.camera.script.orbitCamera.frameOnStart = true;
    this.camera.script.orbitCamera.focusEntity = this.gltf;
  }

  private async loadGltfAsset(url: string) {
    debug("Load glTF asset", url);

    return new Promise<pc.Asset | undefined>((resolve, reject) => {
      this.app.assets.loadFromUrl(
        pc.path.join("../..", url), // Counteract assetPrefix
        "container",
        (err, asset) => {
          if (err) {
            reject(err);
          } else {
            resolve(asset);
          }
        },
      );
    });
  }

  private async registerGltfResources(asset: pc.Asset) {
    debug("Register glTF resources", asset.resource);

    const resource = asset.resource as ContainerResource | undefined;
    if (!resource) {
      return;
    }

    this.asset = asset;
    this.model = resource.model;
    this.textures = resource.textures || [];
    this.animations = resource.animations || [];
  }

  public async loadModel(url: string) {
    this.destroyModel();

    const asset = await this.loadGltfAsset(url);
    if (!asset) {
      throw new Error("Asset not found");
    }

    await this.registerGltfResources(asset);
    this.initModel();
  }
}
