import * as pc from "@animech-public/playcanvas";

const hotspotStates = [
  "default",
  "hovered",
  "toggled",
  "toggled-hovered",
] as const;
type HotspotState = typeof hotspotStates[number];
type TextureAsset = Omit<pc.Asset, "resource"> & { resource: pc.Texture };
type OnToggleCallback = (active: boolean) => void;

/**
 * Typings for PlayCanvas script-attributes attached to the class.
 */
interface AnimationHotspot {
  image: TextureAsset;
  hoveredImage: TextureAsset | null;
  toggledImage: TextureAsset | null;
  toggledHoveredImage: TextureAsset | null;
  transitionDuration: number;
  parentElementId: string;
  cacheEntityPosition: boolean;
  colliderScreenRadius: number;
}

const animationHotspotScriptName = "AnimationHotspot";

// NOTE: We keep a constant resolution for the picker regardless of
// current canvas-resolution in order to prevent expensive resizing.
const pickerWidth = 256;
const pickerHeight = 256;

type PickerHotspot = {
  script: AnimationHotspot;
  pickerPosition: pc.Vec3;
};

class AnimationHotspot extends pc.ScriptType {
  private static _picker: pc.Picker;
  private static _pickerPixels: Uint8Array;
  private static _pickerModel: pc.Model;
  private static _pickerMaterial: pc.Material;
  private static _hotspots: PickerHotspot[] = [];
  private static _tempVecs = [new pc.Vec3(), new pc.Vec3(), new pc.Vec3()];

  private _onToggleCallbacks: OnToggleCallback[] = [];
  private _active = false;
  private _parentElem: HTMLElement | null = null;
  private _hotspotElem: HTMLElement;
  private _hotspotImageElems: {
    [state in HotspotState]: HTMLImageElement;
  };
  private _cachedEntityPosition?: pc.Vec3;
  private _pickerEntity!: pc.Entity;

  private _screenPosition = new pc.Vec3();
  private _lastScreenPosition = new pc.Vec3();

  private _wasVisible?: boolean;

  public constructor(args: { app: pc.Application; entity: pc.Entity }) {
    super(args);

    this._onClick = this._onClick.bind(this);
    this._onMouseOver = this._onMouseOver.bind(this);
    this._onMouseOut = this._onMouseOut.bind(this);

    this._hotspotElem = document.createElement("div");
    this._hotspotImageElems = {
      default: document.createElement("img"),
      hovered: document.createElement("img"),
      toggled: document.createElement("img"),
      "toggled-hovered": document.createElement("img"),
    };

    Object.values(this._hotspotImageElems).forEach(elem =>
      this._hotspotElem.appendChild(elem),
    );

    const { style: hotspotStyle } = this._hotspotElem;
    hotspotStyle.position = "absolute";
    hotspotStyle.top = "0px";
    hotspotStyle.left = "0px";
    hotspotStyle.transitionProperty = "opacity";
    hotspotStyle.transitionTimingFunction = "cubic-bezier(0.4, 0, 0.2, 1)";

    Object.values(this._hotspotImageElems).forEach(imageElem => {
      imageElem.draggable = false;

      const { style: imageStyle } = imageElem;
      imageStyle.position = "absolute";
      imageStyle.top = "0";
      imageStyle.left = "0";
      imageStyle.transform = "translateX(-50%) translateY(-50%)";
      imageStyle.opacity = "0";
      imageStyle.cursor = "pointer";
    });
  }

  public get active() {
    return this._active;
  }

  public get elem() {
    return this._hotspotElem;
  }

  public initialize() {
    AnimationHotspot._onInstanceAdded(this);

    this._setStateImages();
    this._setStateVisibility("default");
    this._setCachedEntityPosition();
    this._setParentElem();
    this._setTransitionDuration();
    this._addPickerEntity();

    this.on("attr:cacheEntityPosition", this._setCachedEntityPosition, this);
    this.on("attr:parentElementId", this._setParentElem, this);
    this.on("attr:transitionDuration", this._setTransitionDuration, this);

    this._hotspotElem.addEventListener("click", this._onClick);
    this._hotspotElem.addEventListener("mouseover", this._onMouseOver);
    this._hotspotElem.addEventListener("mouseout", this._onMouseOut);

    this.on("destroy", () => {
      AnimationHotspot._onInstanceRemoved(this);
      this._parentElem?.removeChild(this._hotspotElem);
      this._hotspotElem.removeEventListener("click", this._onClick);
      this._hotspotElem.removeEventListener("mouseover", this._onMouseOver);
      this._hotspotElem.removeEventListener("mouseout", this._onMouseOut);
    });

    this.app.on("prerender", this._onPrerender, this);
  }

  public onToggle(callback: OnToggleCallback) {
    if (this._onToggleCallbacks.indexOf(callback) > -1) {
      return;
    }
    this._onToggleCallbacks.push(callback);
  }

  public offToggle(callback: OnToggleCallback) {
    const index = this._onToggleCallbacks.indexOf(callback);
    if (index === -1) {
      return;
    }
    this._onToggleCallbacks.splice(index, 1);
  }

  private static _onInstanceAdded(script: AnimationHotspot) {
    this._initialize();

    if (!this._hotspots.find(hotspot => hotspot.script === script)) {
      this._hotspots.push({
        script: script,
        pickerPosition: pc.Vec3.ZERO.clone(),
      });

      // Start updating the picker when the first instance is added
      if (this._hotspots.length === 1) {
        this._updatePicker();
        this._picker.app.on("postrender", this._updatePicker, this);
      }
    }
  }

  private static _onInstanceRemoved(script: AnimationHotspot) {
    this._initialize();

    const hotspot = this._hotspots.find(hotspot => hotspot.script === script);
    if (hotspot) {
      this._hotspots.splice(this._hotspots.indexOf(hotspot), 1);

      // Stop updating the picker when all instances have been removed
      if (this._hotspots.length === 0) {
        this._picker.app.off("postrender", this._updatePicker, this);
      }
    }
  }

  private static _initialize() {
    if (this._picker) {
      return;
    }

    const app = pc.Application.getApplication();
    if (!app) {
      throw new Error("No Playcanvas application running!");
    }

    this._picker = new pc.Picker(app, pickerWidth, pickerHeight);
    this._pickerPixels = new Uint8Array(4 * pickerWidth * pickerHeight);
    this._pickerMaterial = new pc.BasicMaterial();

    const mesh = pc.createSphere(app.graphicsDevice, {
      radius: 1,
    });

    const node = new pc.GraphNode();
    const meshInstance = new pc.MeshInstance(
      node,
      mesh,
      AnimationHotspot._pickerMaterial,
    );

    const model = new pc.Model();
    model.graph = node;
    model.meshInstances = [meshInstance];

    this._pickerModel = model;

    this._setPickerMaterialVisible(false);
  }

  private static _setPickerMaterialVisible(visible: boolean) {
    this._pickerMaterial.redWrite = visible;
    this._pickerMaterial.greenWrite = visible;
    this._pickerMaterial.blueWrite = visible;
    this._pickerMaterial.alphaWrite = visible;
    this._pickerMaterial.depthWrite = visible;
  }

  private static _getActiveCamera(): pc.CameraComponent | undefined {
    this._initialize();

    const { cameras } = this._picker.app.systems.camera;
    return cameras[cameras.length - 1];
  }

  private static _updatePicker() {
    this._initialize();

    const picker = this._picker;
    const camera = this._getActiveCamera();
    if (!camera) {
      return;
    }

    const device = picker.app.graphicsDevice;
    const scaleX = pickerWidth / device.width;
    const scaleY = pickerHeight / device.height;

    const [screenPos, testPos] = this._tempVecs;
    const cameraPosition = camera.entity.getPosition();

    // Update scale and calculated picker-position of all active hotspots
    this._hotspots.forEach(hotspot => {
      const { script, pickerPosition } = hotspot;
      if (!script._pickerEntity) {
        return;
      }

      const position = script._pickerEntity.getPosition();
      const cameraDistance = position.distance(cameraPosition); // TODO: Should this be projected along the camera's forward-vector?

      camera.worldToScreen(position, screenPos);
      camera.screenToWorld(
        screenPos.x + script.colliderScreenRadius,
        screenPos.y,
        cameraDistance,
        testPos,
      );

      const scale = testPos.distance(position);
      script._pickerEntity.setLocalScale(scale, scale, scale);

      pickerPosition.x = Math.floor(screenPos.x * scaleX);
      pickerPosition.y = Math.floor(screenPos.y * scaleY);

      // Flip Y to match the way textures are stored
      pickerPosition.y = Math.floor(picker.height - 1 - pickerPosition.y);
    });

    const worldLayer = picker.app.scene.layers.getLayerById(pc.LAYERID_WORLD);

    // Render to the picker's render-target
    this._setPickerMaterialVisible(true);
    picker.prepare(camera, picker.app.scene, worldLayer);
    this._setPickerMaterialVisible(false);

    // Read all pixels from the render-target into our pixel-array
    const prevRenderTarget = device.getRenderTarget();
    device.setRenderTarget(picker.layer.renderTarget);
    device.updateBegin();
    device.readPixels(0, 0, pickerWidth, pickerHeight, this._pickerPixels);
    device.updateEnd();
    device.setRenderTarget(prevRenderTarget);
  }

  private static _isHotspotVisible(script: AnimationHotspot) {
    const hotspot = this._hotspots.find(hotspot => hotspot.script === script);
    if (!hotspot) {
      return false;
    }

    const picker = this._picker;
    const pixels = this._pickerPixels;
    const drawCalls = picker.layer.instances.visibleOpaque[0].list;

    const { x, y } = hotspot.pickerPosition;

    // To avoid issues with precision, we sample 3x3 pixels instead of just 1
    const idx = y * picker.width + x;
    const r = pixels[4 * idx + 0];
    const g = pixels[4 * idx + 1];
    const b = pixels[4 * idx + 2];
    const index = (r << 16) | (g << 8) | b;

    // White is 'no selection'
    if (index === 0xffffff) {
      return false;
    }

    return drawCalls[index]?.node?.parent === script._pickerEntity;
  }

  private _addPickerEntity() {
    this._pickerEntity = new pc.Entity();

    const model = this._pickerEntity.addComponent("model");
    model.model = AnimationHotspot._pickerModel.clone();

    this.entity.addChild(this._pickerEntity);
  }

  private _onPrerender(this: AnimationHotspot) {
    const camera = AnimationHotspot._getActiveCamera();
    if (!camera) {
      return;
    }

    const screenPos = this._screenPosition;
    const lastScreenPos = this._lastScreenPosition;

    lastScreenPos.copy(screenPos);
    camera.worldToScreen(this._getEntityPosition(), screenPos);

    // Only update position of HTML element if it has changed
    if (!lastScreenPos.equals(screenPos)) {
      const zIndex = Math.max(
        Math.floor(((camera.farClip - screenPos.z) / camera.farClip) * 10000),
        1,
      );

      this._hotspotElem.style.transform = `translateX(${screenPos.x}px) translateY(${screenPos.y}px)`;
      this._hotspotElem.style.zIndex = String(zIndex);
    }

    const isVisible = AnimationHotspot._isHotspotVisible(this);

    // Only update visibility of HTML element if it has changed
    if (this._wasVisible !== isVisible) {
      this._hotspotElem.style.opacity = isVisible ? "1" : "0";
      this._hotspotElem.style.pointerEvents = isVisible ? "auto" : "none";
    }

    this._wasVisible = isVisible;
  }

  private _onClick() {
    this._active = !this._active;
    this._onToggleCallbacks.forEach(callback => callback(this._active));
    this._setStateVisibility(this._active ? "toggled-hovered" : "hovered");
  }

  private _onMouseOver() {
    this._setStateVisibility(this._active ? "toggled-hovered" : "hovered");
  }

  private _onMouseOut() {
    this._setStateVisibility(this._active ? "toggled" : "default");
  }

  private _setCachedEntityPosition() {
    this._cachedEntityPosition = this.cacheEntityPosition
      ? this.entity.getPosition().clone()
      : undefined;
  }

  private _getEntityPosition(): pc.Vec3 {
    return this._cachedEntityPosition ?? this.entity.getPosition();
  }

  private _setParentElem() {
    const elem = this.parentElementId
      ? document.getElementById(this.parentElementId)
      : this.app.graphicsDevice.canvas.parentElement;

    if (elem !== this._parentElem) {
      this._parentElem?.removeChild(this._hotspotElem);
      elem?.appendChild(this._hotspotElem);
    }

    this._parentElem = elem;
  }

  private _setTransitionDuration() {
    this._hotspotElem.style.transitionDuration = `${this.transitionDuration}ms`;
  }

  private _getStateImageSource(state: HotspotState) {
    const texture = (() => {
      switch (state) {
        case "default":
          return this.image;
        case "hovered":
          return this.hoveredImage ?? this.image;
        case "toggled":
          return this.toggledImage ?? this.image;
        case "toggled-hovered":
          return (
            this.toggledHoveredImage ??
            this.toggledImage ??
            this.hoveredImage ??
            this.image
          );
      }
    })();
    return texture.resource.getSource().src;
  }

  private _setStateImages() {
    // By assigning all sources immediately we prevent asset load times from
    // affecting the transition between states
    hotspotStates.forEach(
      state =>
        (this._hotspotImageElems[state].src = this._getStateImageSource(state)),
    );
  }

  private _setStateVisibility(state: HotspotState) {
    Object.values(this._hotspotImageElems).forEach(
      elem => (elem.style.opacity = "0"),
    );
    this._hotspotImageElems[state].style.opacity = "1";
  }
}

AnimationHotspot.attributes.add("image", {
  type: "asset",
  assetType: "texture",
  title: "Image",
  description: "",
});

AnimationHotspot.attributes.add("hoveredImage", {
  type: "asset",
  assetType: "texture",
  default: null,
  title: "Hovered image",
  description: "",
});

AnimationHotspot.attributes.add("toggledImage", {
  type: "asset",
  assetType: "texture",
  default: null,
  title: "Toggled image",
  description: "",
});

AnimationHotspot.attributes.add("toggledHoveredImage", {
  type: "asset",
  assetType: "texture",
  default: null,
  title: "Toggled hovered image",
  description: "",
});

AnimationHotspot.attributes.add("transitionDuration", {
  type: "number",
  default: 0,
  title: "Transition duration (ms)",
  description:
    "Duration of transition when toggling between images for states.",
});

AnimationHotspot.attributes.add("parentElementId", {
  type: "string",
  default: "",
  title: "Element ID",
  description: "The ID of the element that should parent the hotspot.",
});

AnimationHotspot.attributes.add("cacheEntityPosition", {
  type: "boolean",
  default: false,
  title: "Cache entity position",
  description:
    "Cache entity world position on initialize instead of reading from entity on every frame.",
});

AnimationHotspot.attributes.add("colliderScreenRadius", {
  type: "number",
  default: 10,
  title: "Radius of collider in pixels",
  description:
    "Used for determining if a hotspot is visible or hidden behind other geometry.",
});

export { AnimationHotspot, animationHotspotScriptName };
