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
import { CameraEntity, OrbitCameraEntity, isOrbitCameraEntity } from "./Camera";

const debug = Debug("PlayCanvasViewer");

type Fields = GltfVariantSetConfigurator["manager"]["fields"];

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
  private _debouncedCanvasResize = debounce(() => this._resizeCanvas(), 10);
  private _canvasResizeObserver = new ResizeObserver(
    this._debouncedCanvasResize,
  );
  private _observedElement?: HTMLElement;
  private _initiated = false;
  private _sceneLoaded = false;
  private _gltfLoaded = false;

  public constructor(public canvas: HTMLCanvasElement) {
    this._resizeCanvas = this._resizeCanvas.bind(this);

    this._app = this._createApp();

    pc.registerScript(OrbitCamera, orbitCameraScriptName);
    pc.registerScript(HotspotTracker, hotspotTrackerScriptName);
    pc.registerScript(
      HdriBackdropScript,
      HdriBackdropScript.scriptName ?? undefined,
    );

    this._defaultCamera = this._createDefaultCamera(this._app);
    this._activeCamera = this._defaultCamera;

    this._loader = new PlayCanvasGltfLoader(this._app);

    this._observedElement =
      this.canvas.parentElement?.parentElement ?? undefined;
    if (this._observedElement) {
      this._canvasResizeObserver.observe(this._observedElement);
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
      cameras: scene.cameras.map((camera, index) => ({
        id: index,
        name: camera.name,
        orbit: isOrbitCameraEntity(camera),
      })),
    };
  }

  private _resizeCanvas() {
    const app = this._app;
    const sizeElem = this.canvas.parentElement?.parentElement;

    if (!sizeElem) {
      app.resizeCanvas();
      return;
    }

    const { clientWidth, clientHeight } = sizeElem;
    const cameraComponent = this._activeCamera?.camera;
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

    debug("Starting app");
    app.start();

    return app;
  }

  private _createDefaultCamera(app: pc.Application): OrbitCameraEntity {
    debug("Creating default camera");

    const camera = new pc.Entity("Default camera") as OrbitCameraEntity;
    camera.addComponent("camera", {
      clearColor: new pc.Color(0, 0, 0),
    });

    camera.addComponent("script");
    camera.script.create(orbitCameraScriptName);
    camera.script[orbitCameraScriptName].inertiaFactor = 0.07;
    camera.script[orbitCameraScriptName].nearClipFactor = 0.002;
    camera.script[orbitCameraScriptName].farClipFactor = 100;

    camera.script.create(hotspotTrackerScriptName);

    app.root.addChild(camera);

    return camera;
  }

  private _setSceneHierarchy(gltfScene: GltfSceneData) {
    debug("Set scene hierarchy", gltfScene);

    if (this._activeGltfScene) {
      this._app.root.removeChild(this._activeGltfScene.root);
    }

    this._activeGltfScene = gltfScene;
    this._app.root.addChild(gltfScene.root);

    // Add default camera to start of camera list
    gltfScene.cameras.unshift(this._defaultCamera);

    if (gltfScene.variantSets.length > 0) {
      this._initConfigurator(gltfScene.variantSets);
    }

    if (gltfScene.backdrops.length > 0) {
      this._initBackdrops(gltfScene.backdrops);
    }
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
      // TODO: Prevent the user from switching between scenes / skyboxes when backdrops are used
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

  public destroy() {
    this.destroyGltf();
    this.destroyScene();
    if (this._observedElement) {
      this._canvasResizeObserver.unobserve(this._observedElement);
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
    // TODO: Prevent the user from selecting scenes in the UI when backdrop(s) are present.
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
      if (cameraIndex === cameraId) {
        camera.camera.enabled = true;
      } else {
        camera.camera.enabled = false;
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

    // Resize since new camera aspect ratio might affect canvas size
    this._resizeCanvas();

    this.focusCameraOnRootEntity();
  }

  public focusCameraOnRootEntity() {
    debug("Focus on root entity", this._app.root);

    if (
      this._app.root &&
      this._activeCamera &&
      isOrbitCameraEntity(this._activeCamera)
    ) {
      this._activeCamera.script[orbitCameraScriptName].focus(this._app.root);
    }
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
      this._setSceneHierarchy(this._gltf.scenes[this._gltf.defaultScene]);
      this._gltfLoaded = true;
    } catch (e) {
      this._gltfLoaded = true;
      throw e;
    }
  }
}
