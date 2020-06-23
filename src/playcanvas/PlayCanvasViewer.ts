import pc from "@animech-public/playcanvas";
import Debug from "debug";
import debounce from "lodash.debounce";
import ResizeObserver from "resize-observer-polyfill";
import { GltfScene } from "../types";
import {
  OrbitCamera,
  orbitCameraScriptName,
  HotspotTracker,
  hotspotTrackerScriptName,
  HotspotTrackerHandle,
} from "./scripts";
import {
  PlayCanvasGltfLoader,
  GltfData,
  GltfSceneData,
  AnimationState,
} from "./PlayCanvasGltfLoader";
import { InteractionHotspot } from "./extensions";

const debug = Debug("PlayCanvasViewer");

type CameraEntity = pc.Entity & {
  script: pc.ScriptComponent & {
    [orbitCameraScriptName]: OrbitCamera;
    [hotspotTrackerScriptName]: HotspotTracker;
  };
};

export class PlayCanvasViewer implements TestableViewer {
  private _app: pc.Application;
  private _camera: CameraEntity;
  private _loader: PlayCanvasGltfLoader;
  private _scene?: pc.Scene;
  private _gltf?: GltfData;
  private _activeGltfScene?: GltfSceneData;
  private _hotspotTrackerHandles?: HotspotTrackerHandle[];
  private _debouncedCanvasResize = debounce(() => this._resizeCanvas(), 10);
  private _canvasResizeObserver = new ResizeObserver(
    this._debouncedCanvasResize,
  );
  private _observedElement: HTMLElement;
  private _initiated = false;
  private _sceneLoaded = false;
  private _gltfLoaded = false;

  public constructor(public canvas: HTMLCanvasElement) {
    this._resizeCanvas = this._resizeCanvas.bind(this);

    this._app = this._createApp();

    pc.registerScript(OrbitCamera, orbitCameraScriptName);
    pc.registerScript(HotspotTracker, hotspotTrackerScriptName);

    this._camera = this._createCamera(this._app);
    this._loader = new PlayCanvasGltfLoader(this._app);

    this._observedElement = this.canvas.parentElement || this.canvas;
    this._canvasResizeObserver.observe(this._observedElement);
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

  public get activeSceneHierarchy(): GltfScene | undefined {
    const scene = this._activeGltfScene;
    if (!scene) {
      return undefined;
    }
    return {
      animations: scene.animations
        .map((anim, index) => ({
          id: index,
          name: anim.name,
          active: false,
        }))
        .filter((_, index) => scene.animations[index].playable),
    };
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

    camera.script.create(hotspotTrackerScriptName);
    return camera;
  }

  private _setSceneHierarchy(gltfScene: GltfSceneData) {
    debug("Set scene hierarchy", gltfScene);

    if (this._activeGltfScene) {
      this._app.root.removeChild(this._activeGltfScene.root);
    }

    this._activeGltfScene = gltfScene;
    this._app.root.addChild(gltfScene.root);

    if (gltfScene.hotspots) {
      this._initHotspots(gltfScene.hotspots);
    }

    this.focusCameraOnRootEntity();
  }

  private _initHotspots(hotspots: InteractionHotspot[]) {
    debug("Init hotspots", hotspots);

    this._destroyHotspots();

    const parentElem = this._app.graphicsDevice.canvas.parentElement;
    if (!parentElem) {
      return;
    }

    this._hotspotTrackerHandles = hotspots.map(hotspot => {
      const { animation } = hotspot;

      let active = false;

      const imageElem = document.createElement("div");
      imageElem.style.width = "100%";
      imageElem.style.height = "100%";
      imageElem.style.backgroundImage = `url(${hotspot.imageSource})`;
      imageElem.style.backgroundSize = "cover";
      imageElem.style.borderRadius = "50%";

      const outerElem = document.createElement("div");
      outerElem.style.position = "absolute";
      outerElem.style.top = "0px";
      outerElem.style.left = "0px";
      outerElem.style.width = "40px";
      outerElem.style.height = "40px";
      outerElem.style.padding = "5px";
      outerElem.style.borderRadius = "50%";
      outerElem.style.background = "rgba(255, 255, 255, 0.5)";
      outerElem.addEventListener("click", () => {
        if (!animation || !animation.playable) {
          return;
        }
        if (active) {
          animation.play(AnimationState.OnceReverse);
          active = false;
          outerElem.style.background = "rgba(255, 255, 255, 0.5)";
        } else {
          animation.play(AnimationState.Once);
          active = true;
          outerElem.style.background = "rgba(255, 0, 0, 0.5)";
        }
      });

      outerElem.appendChild(imageElem);
      parentElem.appendChild(outerElem);

      const position = hotspot.node.getPosition();
      return this._camera.script[hotspotTrackerScriptName].track(
        position,
        (ev, screen) => {
          if (ev === "stop") {
            parentElem.removeChild(outerElem);
            return;
          }
          outerElem.style.top = `${screen.y}px`;
          outerElem.style.left = `${screen.x}px`;
        },
      );
    });
  }

  private _destroyHotspots() {
    debug("Destroy hotspots", this._hotspotTrackerHandles);

    if (this._hotspotTrackerHandles) {
      this._hotspotTrackerHandles.forEach(handle =>
        this._camera.script[hotspotTrackerScriptName].untrack(handle),
      );
      this._hotspotTrackerHandles = undefined;
    }
  }

  public destroy() {
    this.destroyGltf();
    this.destroyScene();
    this._canvasResizeObserver.unobserve(this._observedElement);
    this._app.destroy();
  }

  public async configure() {
    debug("Configuring app");

    const app = this._app;

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
    debug("Destroy glTF", this._gltf);

    this._gltfLoaded = false;

    if (this._activeGltfScene) {
      this._app.root.removeChild(this._activeGltfScene.root);
      this._activeGltfScene = undefined;
      this._destroyHotspots();
    }

    if (this._gltf) {
      this._loader.unload(this._gltf);
      this._gltf = undefined;
    }
  }

  public setActiveAnimations(animationIds: number[]) {
    debug("Set active animations", animationIds);

    if (!this._activeGltfScene) {
      return;
    }

    this._activeGltfScene.animations.forEach((animation, animationIndex) => {
      const active = animationIds.includes(animationIndex);
      if (active && animation.playable) {
        animation.play(AnimationState.Loop);
      } else {
        animation.pause();
      }
    });
  }

  public focusCameraOnRootEntity() {
    debug("Focus on root entity", this._app.root);

    if (this._app.root) {
      this._camera.script[orbitCameraScriptName].focus(this._app.root);
    }
  }

  public resetCamera(yaw?: number, pitch?: number, distance?: number) {
    this._camera.script[orbitCameraScriptName].reset(yaw, pitch, distance);
  }

  public async loadGltf(url: string, fileName?: string) {
    debug("Load glTF", url, fileName);

    this.destroyGltf();

    try {
      this._gltf = await this._loader.load(url, fileName);
      debug("Loaded glTF", this._gltf);
      this._setSceneHierarchy(this._gltf.scenes[this._gltf.defaultScene]);
      this._gltfLoaded = true;
    } catch (e) {
      this._gltfLoaded = true;
      throw e;
    }
  }
}
