import * as pc from "@animech-public/playcanvas";
import Debug from "debug";
import debounce from "lodash.debounce";
import ResizeObserver from "resize-observer-polyfill";
import { GltfScene, GltfVariantSetConfigurator } from "../types";
import { HotspotBuilder } from "../utilities";
import { FieldManager, Configurator } from "../configurator";
import {
  OrbitCamera,
  orbitCameraScriptName,
  HotspotTracker,
  hotspotTrackerScriptName,
  HotspotTrackerHandle,
  HotspotTrackerEventType,
  HdriBackdrop as HdriBackdropScript,
  hdriBackdropScriptName,
  NodeLightmap,
  nodeLightmapScriptName,
} from "./scripts";
import {
  PlayCanvasGltfLoader,
  GltfData,
  GltfSceneData,
} from "./PlayCanvasGltfLoader";
import {
  InteractionHotspot,
  VariantSet,
  VariantNode,
  HdriBackdrop,
} from "./extensions";
import { AnimationState } from "./Animation";
import {
  CameraEntity,
  OrbitCameraEntity,
  isOrbitCameraEntity,
  convertToCameraEntity,
} from "./Camera";

const debug = Debug("PlayCanvasViewer");

type Fields = GltfVariantSetConfigurator["manager"]["fields"];

const waitForAnimationFrame = () =>
  new Promise<void>(resolve => {
    requestAnimationFrame(() => resolve());
  });

export class PlayCanvasViewer implements TestableViewer {
  private _app: pc.Application;
  private _activeCamera?: CameraEntity;
  private _defaultCamera: OrbitCameraEntity;
  private _loader: PlayCanvasGltfLoader;
  private _scene?: pc.Scene;
  private _gltf?: GltfData;
  private _activeGltfScene?: GltfSceneData;
  private _configurator?: GltfVariantSetConfigurator;
  private _hotspotTrackerHandles?: HotspotTrackerHandle[];
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
  private _sceneLoaded = false;
  private _gltfLoaded = false;

  public constructor(public canvas: HTMLCanvasElement) {
    this._resizeCanvas = this._resizeCanvas.bind(this);

    this._app = this._createApp();

    pc.registerScript(OrbitCamera, orbitCameraScriptName);
    pc.registerScript(HotspotTracker, hotspotTrackerScriptName);
    pc.registerScript(HdriBackdropScript, hdriBackdropScriptName);
    pc.registerScript(NodeLightmap, nodeLightmapScriptName);

    this._defaultCamera = this._createDefaultCamera(this._app);
    this._activeCamera = this._defaultCamera;

    this._loader = new PlayCanvasGltfLoader(this._app);

    this._canvasSizeElem =
      this.canvas.parentElement?.parentElement ?? undefined;
    if (this._canvasSizeElem) {
      this._canvasResizeObserver.observe(this._canvasSizeElem);
    }

    this._onConfigurationChange = this._onConfigurationChange.bind(this);
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
      configurator: this._configurator,
      cameras: scene.cameras.map((camera, index) => {
        return {
          id: index,
          name: camera.name,
          orbit: isOrbitCameraEntity(camera),
          previewSource: this._cameraPreviews?.[index],
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
          : clientHeight / aspectRatio,
        aspectRatio > sizeElemAspectRatio
          ? clientWidth * aspectRatio
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

  private _createDefaultCamera(app: pc.Application): OrbitCameraEntity {
    debug("Creating default camera");

    const camera = convertToCameraEntity(new pc.Entity("Default"));

    const script = camera.script.create(OrbitCamera, {
      enabled: false, // This is enabled later for the active camera
    });
    script.nearClipFactor = 0.002;
    script.farClipFactor = 100;

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

    // Add default camera to start of camera list
    gltfScene.cameras.unshift(this._defaultCamera);

    // Cameras are only shown in UI if there are more than one
    if (gltfScene.cameras.length > 1) {
      await this._initCameraPreviews(gltfScene.cameras, 80, 80);
    }

    if (gltfScene.variantSets.length > 0) {
      this._initConfigurator(gltfScene.variantSets);
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
        this._focusOrbitCamera(orbitCamera);
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

  private _initHotspots(hotspots: InteractionHotspot[], camera: CameraEntity) {
    debug("Init hotspots", hotspots);

    const canvasWrapperElem = this.canvas.parentElement;
    if (!canvasWrapperElem) {
      return;
    }

    this._hotspotTrackerHandles = hotspots.map(hotspot => {
      const { animation } = hotspot;
      const renderer = new HotspotBuilder(canvasWrapperElem);

      renderer.render({
        imageSource: hotspot.imageSource,
        toggledImageSource: hotspot.toggledImageSource,
        onToggle: active => {
          debug("Toggle hotspot", active);

          if (!animation || !animation.playable) {
            return;
          }

          animation.play(
            active ? AnimationState.Once : AnimationState.OnceReverse,
          );
        },
      });

      return camera.script[hotspotTrackerScriptName].track(
        hotspot.node.getPosition(),
        (ev, screen) => {
          ev === HotspotTrackerEventType.Stop
            ? renderer.destroy()
            : renderer.move(screen.x, screen.y);
        },
      );
    });
  }

  private _destroyHotspots(camera: CameraEntity) {
    if (!this._hotspotTrackerHandles) {
      return;
    }

    debug("Destroy hotspots", this._hotspotTrackerHandles);

    this._hotspotTrackerHandles.forEach(handle =>
      camera.script[hotspotTrackerScriptName].untrack(handle),
    );
    this._hotspotTrackerHandles = undefined;
  }

  private _initConfigurator(sets: VariantSet[]) {
    this._destroyConfigurator();

    debug("Init configurator", sets);

    const fields: Fields = sets.map(vs => ({
      name: vs.name,
      values: vs.variants,
      defaultValue: vs.variants.findIndex(variant => variant.active),
    }));

    this._configurator = new Configurator(new FieldManager(fields));
    this._configurator.onConfigurationChange(this._onConfigurationChange);
    this._onConfigurationChange(this._configurator.configuration);
  }

  private _destroyConfigurator() {
    if (!this._configurator) {
      return;
    }

    debug("Destroy configurator", this._configurator);

    this._configurator.offConfigurationChange(this._onConfigurationChange);
    this._configurator = undefined;
  }

  private _onConfigurationChange(configuration: readonly number[]) {
    debug("Configuration changed", configuration);

    const fieldManager = this._configurator?.manager;
    if (!fieldManager) {
      return;
    }

    this._applyVariantNodeTransforms(
      configuration
        .map(
          (valueId, fieldId) =>
            fieldManager.getValue(fieldId, valueId)?.nodes || [],
        )
        .reduce((allNodes, nodes) => [...allNodes, ...nodes], []),
    );
  }

  private _applyVariantNodeTransforms(nodeTransforms: VariantNode[]) {
    debug("Apply node transforms", nodeTransforms);

    nodeTransforms.forEach(({ node, properties }) => {
      if (properties.visible !== undefined) {
        debug("Set node visibility", node.name, properties.visible);
        node.enabled = properties.visible;
      }
      if (properties.materials !== undefined) {
        const meshInstances = node.model?.meshInstances;
        if (!meshInstances) {
          return;
        }

        debug("Set node materials", node.name, properties.materials);
        properties.materials.forEach(({ index, material }) => {
          if (meshInstances[index]) {
            meshInstances[index].material = material;
          }
        });
      }
    });
  }

  private _initBackdrops(backdrops: HdriBackdrop[]) {
    debug("Init backdrops", backdrops);

    this._destroyBackdrops();

    const app = this._app;
    const originalSkyboxAsset = app.assets.get(app._skyboxLast ?? 0);

    const onBackdropEnabled = (backdrop: HdriBackdrop) => {
      // TODO: Add support for using reflection probes instead of skyboxes
      app.scene.setSkybox([null, ...backdrop.skyboxCubemaps]);
    };

    const onBackdropDisabled = (_backdrop: HdriBackdrop) => {
      app.setSkybox(originalSkyboxAsset);
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
    orbitCamera.focus(focusEntity);
  }

  public destroy() {
    this.destroyGltf();
    this.destroyScene();
    if (this._canvasSizeElem) {
      this._canvasResizeObserver.unobserve(this._canvasSizeElem);
    }
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

          // Override fill mode from config
          app.setCanvasFillMode(pc.FILLMODE_NONE);

          resolve();
        });
      });
    });
  }

  public async loadScene(url: string) {
    // NOTE: When using backdrops, they provide their own "scene" / lighting.
    if (this._backdrops) {
      return Promise.resolve();
    }

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
      this._destroyConfigurator();
      this._destroyBackdrops();
      this._destroyCameraPreviews();
    }

    if (this._activeCamera) {
      this._destroyHotspots(this._activeCamera);
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

    // Destroy hotspots for previous camera
    if (this._activeCamera) {
      this._destroyHotspots(this._activeCamera);
    }

    this._activeCamera = this._activeGltfScene.cameras.find(
      camera => camera.camera.enabled,
    );

    // Init hotspots for new camera
    if (this._activeGltfScene.hotspots.length > 0 && this._activeCamera) {
      this._initHotspots(this._activeGltfScene.hotspots, this._activeCamera);
    }

    // Set focus for orbit cameras
    if (this._activeCamera && isOrbitCameraEntity(this._activeCamera)) {
      this._focusOrbitCamera(this._activeCamera.script[orbitCameraScriptName]);
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
