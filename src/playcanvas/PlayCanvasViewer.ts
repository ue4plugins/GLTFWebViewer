import * as pc from "@animech-public/playcanvas";
import Debug from "debug";
import debounce from "lodash.debounce";
import ResizeObserver from "resize-observer-polyfill";
import { GltfScene } from "../types";
import { VariantSetManager, LevelVariantSet } from "../variants";
import {
  OrbitCamera,
  orbitCameraScriptName,
  HdriBackdrop as HdriBackdropScript,
  hdriBackdropScriptName,
  NodeLightmap,
  nodeLightmapScriptName,
  animationHotspotScriptName,
  AnimationHotspot,
  SkySphere,
  skySphereScriptName,
} from "./scripts";
import {
  PlayCanvasGltfLoader,
  GltfData,
  GltfSceneData,
} from "./PlayCanvasGltfLoader";
import { HdriBackdrop } from "./extensions";
import {
  CameraEntity,
  OrbitCameraEntity,
  isOrbitCameraEntity,
  convertToCameraEntity,
} from "./Camera";
import { configUrl, sceneUrl } from "./PlayCanvasOfflineHack"; // TODO: replace hack

const debug = Debug("PlayCanvasViewer");

const waitForAnimationFrame = () =>
  new Promise<void>(resolve => {
    requestAnimationFrame(() => resolve());
  });

export type CameraPreviewSize = {
  width: number;
  height: number;
};

export class PlayCanvasViewer implements TestableViewer {
  private _app: pc.Application;
  private _activeCamera?: CameraEntity;
  private _defaultCamera: OrbitCameraEntity;
  private _loader: PlayCanvasGltfLoader;
  private _scene?: pc.Scene;
  private _gltf?: GltfData;
  private _activeGltfScene?: GltfSceneData;
  private _variantSetManager?: VariantSetManager;
  private _hotspots?: AnimationHotspot[];
  private _backdrops?: HdriBackdrop[];
  private _cameraPreviews?: string[];
  private _debouncedCanvasResize = debounce(
    () => this._resizeCanvas(this._activeCamera),
    10,
  );
  private _canvasResizeObserver = new ResizeObserver(
    this._debouncedCanvasResize,
  );
  private _canvasSizeElem?: HTMLElement;
  private _initiated = false;
  private _gltfLoaded = false;
  private _noAnimations: boolean;

  public constructor(
    public canvas: HTMLCanvasElement,
    private _cameraPreviewSize: CameraPreviewSize,
  ) {
    this._resizeCanvas = this._resizeCanvas.bind(this);

    const urlParams = new URLSearchParams(window.location.search);
    this._noAnimations = !!urlParams.get("noAnimations");

    this._app = this._createApp();

    pc.registerScript(OrbitCamera, orbitCameraScriptName);
    pc.registerScript(AnimationHotspot, animationHotspotScriptName);
    pc.registerScript(HdriBackdropScript, hdriBackdropScriptName);
    pc.registerScript(NodeLightmap, nodeLightmapScriptName);
    pc.registerScript(SkySphere, skySphereScriptName);

    this._defaultCamera = this._createDefaultCamera(this._app);
    this._activeCamera = this._defaultCamera;

    this._loader = new PlayCanvasGltfLoader(this._app);

    this._canvasSizeElem =
      this.canvas.parentElement?.parentElement ?? undefined;
    if (this._canvasSizeElem) {
      this._canvasResizeObserver.observe(this._canvasSizeElem);
    }

    // For debugging purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).getStats = this._getStats.bind(this);
  }

  public get app() {
    return this._app;
  }

  public get initiated() {
    return !!this._app.graphicsDevice && this._initiated;
  }

  public get gltfLoaded() {
    return this._gltfLoaded;
  }

  public get activeSceneHierarchy(): GltfScene | undefined {
    const scene = this._activeGltfScene;
    if (!scene) {
      return undefined;
    }
    return {
      variantSetManager: this._variantSetManager,
      cameras: scene.cameras.map((camera, index) => {
        return {
          id: index,
          name: camera.name,
          type: isOrbitCameraEntity(camera)
            ? // TODO: Base type on orbit camera mode when this has been implemented
              // in the extension parser
              camera.script[orbitCameraScriptName].focusEntity ===
              this._app.root
              ? "pov"
              : "orbit"
            : "static",
          previewSource: this._cameraPreviews?.[index] ?? "",
        };
      }),
      hasBackdrops: scene.backdrops.length > 0,
    };
  }

  private _resizeCanvas(camera?: CameraEntity) {
    const app = this._app;
    const sizeElem = this._canvasSizeElem;

    if (!sizeElem) {
      app.resizeCanvas();
      return;
    }

    const { clientWidth, clientHeight } = sizeElem;
    const cameraComponent = camera?.camera;
    const aspectRatioMode = cameraComponent?.aspectRatioMode;
    const aspectRatio = cameraComponent?.aspectRatio;

    if (aspectRatioMode === pc.ASPECT_MANUAL && aspectRatio !== undefined) {
      const sizeElemAspectRatio = clientWidth / clientHeight;
      app.resizeCanvas(
        aspectRatio > sizeElemAspectRatio
          ? clientWidth
          : clientHeight * aspectRatio,
        aspectRatio > sizeElemAspectRatio
          ? clientWidth / aspectRatio
          : clientHeight,
      );
    } else {
      app.resizeCanvas(clientWidth, clientHeight);
    }
  }

  private _createApp() {
    const existingApp = pc.Application.getApplication();
    if (existingApp) {
      debug("Destroying existing app");
      existingApp.destroy();
    }

    debug("Creating app for target", this.canvas);
    const app = new pc.Application(this.canvas, {
      assetPrefix: "viewer/playcanvas/",
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

    debug("Starting app");
    app.start();

    return app;
  }

  private _getStats() {
    const app = this._app;
    const stats = app.stats;
    const bToKb = 1 / 1024;
    const ib = Math.round(stats.vram.ib * bToKb * 10) / 10;
    const tex = Math.round(stats.vram.tex * bToKb * 10) / 10;
    const vb = Math.round(stats.vram.vb * bToKb * 10) / 10;
    return `VRAM: Triangles ${ib} KB, Textures ${tex} KB, Vertices ${vb} KB`;
  }

  private _createDefaultCamera(app: pc.Application): OrbitCameraEntity {
    debug("Creating default camera");

    const camera = convertToCameraEntity(new pc.Entity("Default"));

    const script = camera.script.create(OrbitCamera, {
      enabled: false, // This is enabled later for the active camera
    });
    script.nearClipFactor = 0.002;
    script.farClipFactor = 100;
    script.allowPan = true;

    app.root.addChild(camera);

    return camera as OrbitCameraEntity;
  }

  private async _setSceneHierarchy(gltfScene: GltfSceneData) {
    debug("Set scene hierarchy", gltfScene);

    if (this._activeGltfScene) {
      this._app.root.removeChild(this._activeGltfScene.root);
    }

    this._activeGltfScene = gltfScene;
    this._app.root.addChild(gltfScene.root);

    // List orbit cameras first
    gltfScene.cameras.sort((a, b) => {
      const aIsOrbit = isOrbitCameraEntity(a);
      const bIsOrbit = isOrbitCameraEntity(b);
      return aIsOrbit === bIsOrbit ? 0 : aIsOrbit ? -1 : 1;
    });

    // Add default camera to start of camera list if no other orbit
    // cameras exist in glTF scene
    if (!gltfScene.cameras.some(isOrbitCameraEntity)) {
      gltfScene.cameras.unshift(this._defaultCamera);
    }

    // Cameras are only shown in UI if there are more than one
    if (gltfScene.cameras.length > 1) {
      const { width, height } = this._cameraPreviewSize;
      await this._initCameraPreviews(gltfScene.cameras, width * 2, height * 2);
    }

    if (gltfScene.hotspots.length > 0) {
      this._initHotspots(gltfScene.hotspots);
    }

    if (gltfScene.levelVariantSets.length > 0) {
      this._initVariantSets(gltfScene.levelVariantSets);
    }

    if (gltfScene.backdrops.length > 0) {
      this._initBackdrops(gltfScene.backdrops);
    }
  }

  private async _initCameraPreviews(
    cameras: CameraEntity[],
    width: number,
    height: number,
  ) {
    debug("Init camera previews", cameras, width, height);

    // Set canvas size by resizing the canvas wrapper element, which
    // will trigger this._resizeCanvas(). Hide canvas to prevent flicker
    // when changing cameras.
    const sizeElem = this._canvasSizeElem;
    if (sizeElem) {
      sizeElem.style.width = `${width}px`;
      sizeElem.style.height = `${height}px`;
      sizeElem.style.visibility = "hidden";
    }

    const previews: string[] = [];

    for (const camera of cameras) {
      const { camera: cameraComponent } = camera;
      const orbitCamera = isOrbitCameraEntity(camera)
        ? camera.script[orbitCameraScriptName]
        : null;
      const { enabled: prevEnabled } = cameraComponent;

      // Enable the camera and script
      cameraComponent.enabled = true;
      if (orbitCamera) {
        orbitCamera.enabled = true;
      }

      // Resize canvas to get correct aspect ratio given
      // the current camera
      this._resizeCanvas(camera);

      // Wait for frame to render and save screenshot
      await waitForAnimationFrame();
      previews.push(this.canvas.toDataURL());

      // Reset camera to previous state
      if (orbitCamera) {
        orbitCamera.enabled = prevEnabled;
      }
      cameraComponent.enabled = prevEnabled;
    }

    this._cameraPreviews = previews;

    // Reset canvas size and visibility
    if (sizeElem) {
      sizeElem.style.width = "";
      sizeElem.style.height = "";
      sizeElem.style.visibility = "visible";
    }
  }

  private _destroyCameraPreviews() {
    debug("Destroy camera previews", this._cameraPreviews);
    this._cameraPreviews = undefined;
  }

  private _initHotspots(hotspots: AnimationHotspot[]) {
    this._destroyHotspots();

    debug("Init hotspots", hotspots);

    this._hotspots = hotspots;
    this._hotspots.forEach(hotspot => (hotspot.enabled = true));
  }

  private _destroyHotspots() {
    if (!this._hotspots) {
      return;
    }

    debug("Destroy hotspots", this._hotspots);

    this._hotspots.forEach(hotspot => (hotspot.enabled = false));
    this._hotspots = undefined;
  }

  private _initVariantSets(sets: LevelVariantSet[]) {
    this._destroyVariantSets();

    debug("Init variant sets", sets);

    this._variantSetManager = new VariantSetManager(sets);
  }

  private _destroyVariantSets() {
    if (!this._variantSetManager) {
      return;
    }

    debug("Destroy variant sets", this._variantSetManager);

    this._variantSetManager = undefined;
  }

  private _initBackdrops(backdrops: HdriBackdrop[]) {
    debug("Init backdrops", backdrops);

    this._destroyBackdrops();

    const app = this._app;
    const originalSkyboxAsset = app.assets.get(app._skyboxLast ?? 0);
    const originalSkyboxIntensity = app.scene.skyboxIntensity;

    const onBackdropEnabled = (backdrop: HdriBackdrop) => {
      // TODO: Add support for using reflection probes instead of skyboxes
      app.scene.setSkybox([null, ...backdrop.skyboxCubemaps]);
      app.scene.skyboxIntensity = backdrop.skyboxIntensity;
    };

    const onBackdropDisabled = (_backdrop: HdriBackdrop) => {
      app.setSkybox(originalSkyboxAsset);
      app.scene.skyboxIntensity = originalSkyboxIntensity;
    };

    backdrops.forEach(backdrop => {
      backdrop.script.on("enable", () => onBackdropEnabled(backdrop));
      backdrop.script.on("disable", () => onBackdropDisabled(backdrop));
      backdrop.script.enabled = true;
    });

    this._backdrops = backdrops;
  }

  private _destroyBackdrops() {
    debug("Destroy backdrops", this._backdrops);

    if (this._backdrops) {
      this._backdrops.forEach(backdrop => {
        // Destroy manually created resources
        backdrop.cubemap.destroy();
        backdrop.skyboxCubemaps.forEach(cubemap => cubemap.destroy());
      });

      this._backdrops = undefined;
    }
  }

  private _focusOrbitCamera(orbitCamera: OrbitCamera) {
    const focusEntity = orbitCamera.focusEntity ?? this._app.root;
    debug("Focus camera on entity", focusEntity);
    orbitCamera.reset(0, 0, 0);
    orbitCamera.focus(focusEntity, {
      frameModels: true,
    });
  }

  public destroy() {
    this.destroyGltf();
    this._destroyScene();
    if (this._canvasSizeElem) {
      this._canvasResizeObserver.unobserve(this._canvasSizeElem);
    }
    this._app.destroy();
  }

  public async configure() {
    debug("Configuring app");

    const app = this._app;

    await new Promise<void>((resolve, reject) => {
      let url = pc.path.join(app.assets.prefix, "config.json");

      url = configUrl || url; // TODO: replace hack

      app.configure(url, error => {
        if (error) {
          reject(error);
          return;
        }
        app.preload(() => {
          // Override fill mode from config
          app.setCanvasFillMode(pc.FILLMODE_NONE);

          resolve();
        });
      });
    });

    const scene = this._app.scenes.list()[0];
    if (scene) {
      await this._loadScene(scene.url);
    }

    this._initiated = true;
  }

  private async _loadScene(url: string) {
    // NOTE: When using backdrops, they provide their own "scene" / lighting.
    if (this._backdrops) {
      return Promise.resolve();
    }

    this._destroyScene();

    url = sceneUrl || url; // TODO: replace hack

    debug("Loading scene", url);

    return new Promise<void>((resolve, reject) => {
      this._app.scenes.loadScene(url, (error, scene) => {
        if (error) {
          reject(error);
          return;
        }
        this._scene = (scene as unknown) as pc.Scene;
        resolve();
      });
    });
  }

  private _destroyScene() {
    debug("Destroy scene", this._scene);

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
      this._destroyVariantSets();
      this._destroyBackdrops();
      this._destroyCameraPreviews();
      this._destroyHotspots();
    }

    if (this._gltf) {
      this._loader.unload(this._gltf);
      this._gltf = undefined;
    }
  }

  /**
   * Initialize animations. Auto played animations will start playing
   * and non-auto played animations will be set to their start frame,
   * if defined.
   *
   * This has to be run after the scene has loaded and rendered for the
   * animations to play.
   */
  public initAnimations() {
    debug("Init animations", this._activeGltfScene?.animations);

    const gltfScene = this._activeGltfScene;
    if (!gltfScene || this._noAnimations) {
      return;
    }

    // Ensure first frame has rendered
    requestAnimationFrame(() =>
      gltfScene.animations.forEach(animation => animation.init()),
    );
  }

  public setActiveAnimations(animationIds: number[]) {
    debug("Set active animations", animationIds);

    if (!this._activeGltfScene) {
      return;
    }

    this._activeGltfScene.animations.forEach((animation, animationIndex) => {
      const active = animationIds.includes(animationIndex);
      if (active && animation.playable && animation.defaultState) {
        animation.play(animation.defaultState);
      } else {
        animation.pause();
      }
    });
  }

  public setActiveCamera(cameraId: number) {
    debug("Set active camera", cameraId);

    if (!this._activeGltfScene) {
      return;
    }

    this._activeGltfScene.cameras.forEach((camera, cameraIndex) => {
      const enabled = cameraIndex === cameraId;
      camera.camera.enabled = enabled;
      if (isOrbitCameraEntity(camera)) {
        camera.script[orbitCameraScriptName].enabled = enabled;
      }
    });

    this._activeCamera = this._activeGltfScene.cameras.find(
      camera => camera.camera.enabled,
    );

    // Focus the camera, but only if it's the default (orbit-)camera
    if (this._activeCamera === this._defaultCamera) {
      this._focusOrbitCamera(this._defaultCamera.script[orbitCameraScriptName]);
    }

    // Resize since new camera aspect ratio might affect canvas size
    this._resizeCanvas(this._activeCamera);
  }

  public resetCamera(yaw?: number, pitch?: number, distance?: number) {
    if (
      this._app.root &&
      this._activeCamera &&
      isOrbitCameraEntity(this._activeCamera)
    ) {
      this._activeCamera.script[orbitCameraScriptName].reset(
        yaw,
        pitch,
        distance,
      );
    }
  }

  public async loadGltf(url: string, fileName?: string) {
    this.destroyGltf();

    debug("Load glTF", url, fileName);

    try {
      this._gltf = await this._loader.load(url, fileName);
      debug("Loaded glTF", this._gltf);
      await this._setSceneHierarchy(this._gltf.scenes[this._gltf.defaultScene]);
      this._gltfLoaded = true;
    } catch (e) {
      this._gltfLoaded = true;
      throw e;
    }
  }
}
