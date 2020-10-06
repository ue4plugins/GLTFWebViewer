import * as pc from "@animech-public/playcanvas";

const interactionStates = [
  "default",
  "hovered",
  "toggled",
  "toggled-hovered",
] as const;
type InteractionState = typeof interactionStates[number];
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
}

const animationHotspotScriptName = "AnimationHotspot";

// NOTE: We keep a constant resolution for the picker regardless of
// current canvas-resolution in order to prevent expensive resizing.
const pickerWidth = 256;
const pickerHeight = 256;

class AnimationHotspot extends pc.ScriptType {
  private static _picker: pc.Picker;
  private static _pickerPixels: Uint8Array;
  private static _pickerModel: pc.Model;
  private static _pickerMaterial: pc.Material;
  private static _instanceCount = 0;

  private _onToggleCallbacks: OnToggleCallback[] = [];
  private _active = false;
  private _parentElem: HTMLElement | null = null;
  private _hotspotElem: HTMLElement;
  private _hotspotImageElems: {
    [state in InteractionState]: HTMLImageElement;
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
    AnimationHotspot._onInstanceAdded();

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
      AnimationHotspot._onInstanceRemoved();
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

  private static _onInstanceAdded() {
    this._initialize();
    this._instanceCount += 1;

    // Start updating the picker when the first instance is added
    if (this._instanceCount === 1) {
      this._updatePicker();
      this._picker.app.on("postrender", this._updatePicker, this);
    }
  }

  private static _onInstanceRemoved() {
    this._initialize();
    this._instanceCount -= 1;

    // Stop updating the picker when all instances have been removed
    if (this._instanceCount === 0) {
      this._picker.app.off("postrender", this._updatePicker, this);
    }

    // Sanity check, keep count inside valid range
    this._instanceCount = Math.max(this._instanceCount, 0);
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

    // Setup special material for picking hotspots
    this._pickerMaterial = new pc.Material();
    this._pickerMaterial.shader = new pc.Shader(app.graphicsDevice, {
      attributes: {
        aPosition: pc.SEMANTIC_POSITION,
      },
      vshader: `
        attribute vec4 aPosition;

        uniform mat4   matrix_model;
        uniform mat4   matrix_viewProjection;

        void main(void)
        {
            vec4 worldPosition = matrix_model * vec4(aPosition.xyz, 1);
            gl_Position = matrix_viewProjection * worldPosition;
            gl_PointSize = 1.0;
        }
    `,
      fshader: `
        precision mediump float;

        uniform vec4 uColor;
        varying vec4 outColor;

        void main(void)
        {
            gl_FragColor = uColor;
        }
    `,
    });

    // Setup special mesh for picking hotspots
    const mesh = new pc.Mesh(app.graphicsDevice);
    mesh.setPositions([0, 0, 0]);
    mesh.update(pc.PRIMITIVE_POINTS, false);
    mesh.aabb = new pc.BoundingBox(
      new pc.Vec3(-1, -1, -1),
      new pc.Vec3(1, 1, 1),
    );

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

    const worldLayer = picker.app.scene.layers.getLayerById(pc.LAYERID_WORLD);

    // Render to the picker's render-target
    this._setPickerMaterialVisible(true);
    picker.prepare(camera, picker.app.scene, worldLayer);
    this._setPickerMaterialVisible(false);

    // Read all pixels from the render-target into our pixel-array
    const device = picker.app.graphicsDevice;
    const prevRenderTarget = device.getRenderTarget();
    device.setRenderTarget(picker.layer.renderTarget);
    device.updateBegin();
    device.readPixels(0, 0, pickerWidth, pickerHeight, this._pickerPixels);
    device.updateEnd();
    device.setRenderTarget(prevRenderTarget);
  }

  private static _isInstanceVisibleAtPosition(
    instance: AnimationHotspot,
    screenPosition: pc.Vec3,
  ) {
    const picker = this._picker;
    const device = picker.app.graphicsDevice;

    const scaleX = pickerWidth / device.width;
    const scaleY = pickerHeight / device.height;

    const pickerX = Math.round(screenPosition.x * scaleX);
    let pickerY = Math.round(screenPosition.y * scaleY);

    // Flip Y to match the way textures are stored
    pickerY = picker.height - 1 - pickerY;

    const pixels = this._pickerPixels;
    const drawCalls = picker.layer.instances.visibleOpaque[0].list;

    const minX = Math.max(pickerX - 1, 0);
    const maxX = Math.min(pickerX + 1, pickerWidth - 1);
    const minY = Math.max(pickerY - 1, 0);
    const maxY = Math.min(pickerY + 1, pickerHeight - 1);

    // To avoid issues with precision, we sample 3x3 pixels instead of just 1
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const idx = y * picker.width + x;
        const r = pixels[4 * idx + 0];
        const g = pixels[4 * idx + 1];
        const b = pixels[4 * idx + 2];
        const index = (r << 16) | (g << 8) | b;

        // White is 'no selection'
        if (index === 0xffffff) {
          continue;
        }

        if (drawCalls[index]?.node?.parent === instance._pickerEntity) {
          return true;
        }
      }
    }

    return false;
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

    // NOTE: The picker is updated post render (and this is pre render), so we sample it using
    // the last screen-position instead of the current position.
    const isVisible = AnimationHotspot._isInstanceVisibleAtPosition(
      this,
      lastScreenPos,
    );

    // Only update position of HTML element if it has changed
    if (!lastScreenPos.equals(screenPos)) {
      const zIndex = Math.max(
        Math.floor(((camera.farClip - screenPos.z) / camera.farClip) * 10000),
        1,
      );

      this._hotspotElem.style.transform = `translateX(${screenPos.x}px) translateY(${screenPos.y}px)`;
      this._hotspotElem.style.zIndex = String(zIndex);
    }

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

  private _getStateImageSource(state: InteractionState) {
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
    interactionStates.forEach(
      state =>
        (this._hotspotImageElems[state].src = this._getStateImageSource(state)),
    );
  }

  private _setStateVisibility(state: InteractionState) {
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

export { AnimationHotspot, animationHotspotScriptName };