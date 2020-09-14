import * as pc from "@animech-public/playcanvas";

type TextureAsset = Omit<pc.Asset, "resource"> & { resource: pc.Texture };
type OnToggleCallback = (active: boolean) => void;
type InteractionState = "default" | "hovered" | "toggled" | "toggled-hovered";
type Position = {
  x: number;
  y: number;
};

/**
 * Typings for PlayCanvas script-attributes attached to the class.
 */
interface InteractionHotspot {
  image: TextureAsset;
  hoveredImage: TextureAsset | null;
  toggledImage: TextureAsset | null;
  toggledHoveredImage: TextureAsset | null;
  size: number;
  transitionDuration: number;
  parentElementId: string;
  cacheEntityPosition: boolean;
}

const interactionHotspotScriptName = "InteractionHotspot";

class InteractionHotspot extends pc.ScriptType {
  private _onToggleCallbacks: OnToggleCallback[] = [];
  private _active = false;
  private _parentElem: HTMLElement | null = null;
  private _hotspotElem: HTMLElement;
  private _hotspotImageElem: HTMLElement;
  private _cachedEntityPosition?: pc.Vec3;
  private _canvasHeight = 0;
  private _depthPixels = new Uint8Array(4);
  private _depthVector = new pc.Vec4();
  private _depthDotVector = new pc.Vec4(
    1 / (256 * 256 * 256),
    1 / (256 * 256),
    1 / 256,
    1,
  );

  public constructor(args: { app: pc.Application; entity: pc.Entity }) {
    super(args);

    this._setCanvasHeight = this._setCanvasHeight.bind(this);
    this._onClick = this._onClick.bind(this);
    this._onMouseOver = this._onMouseOver.bind(this);
    this._onMouseOut = this._onMouseOut.bind(this);

    this._setCanvasHeight();

    this._hotspotElem = document.createElement("div");
    this._hotspotImageElem = document.createElement("div");
    this._hotspotElem.appendChild(this._hotspotImageElem);

    const timingFunction = "cubic-bezier(0.4, 0, 0.2, 1)";

    const { style: hotspotStyle } = this._hotspotElem;
    hotspotStyle.position = "absolute";
    hotspotStyle.top = "0px";
    hotspotStyle.left = "0px";
    hotspotStyle.transitionProperty = "opacity";
    hotspotStyle.transitionTimingFunction = timingFunction;

    const { style: imageStyle } = this._hotspotImageElem;
    imageStyle.width = "100%";
    imageStyle.height = "100%";
    imageStyle.transform = "translateX(-50%) translateY(-50%)";
    imageStyle.backgroundSize = "cover";
    imageStyle.cursor = "pointer";
    imageStyle.transitionProperty = "background";
    imageStyle.transitionTimingFunction = timingFunction;
  }

  public get active() {
    return this._active;
  }

  public get elem() {
    return this._hotspotElem;
  }

  public initialize() {
    this._setDepthMapActive(true);
    this._setImage("default");
    this._setCachedEntityPosition();
    this._setParentElem();
    this._setSize();
    this._setTransitionDuration();

    this.on("attr:cacheEntityPosition", this._setCachedEntityPosition, this);
    this.on("attr:parentElementId", this._setParentElem, this);
    this.on("attr:size", this._setSize, this);
    this.on("attr:transitionDuration", this._setTransitionDuration, this);

    window.addEventListener("resize", this._setCanvasHeight);
    this._hotspotElem.addEventListener("click", this._onClick);
    this._hotspotElem.addEventListener("mouseover", this._onMouseOver);
    this._hotspotElem.addEventListener("mouseout", this._onMouseOut);

    this.on("destroy", () => {
      window.removeEventListener("resize", this._setCanvasHeight);
      this._parentElem?.removeChild(this._hotspotElem);
      this._hotspotElem.removeEventListener("click", this._onClick);
      this._hotspotElem.removeEventListener("mouseover", this._onMouseOver);
      this._hotspotElem.removeEventListener("mouseout", this._onMouseOut);
    });
  }

  public update() {
    const camera = this._getActiveCamera();
    if (!camera) {
      return;
    }

    const screenPos = camera.worldToScreen(this._getEntityPosition());
    const hitDepth = this._getPixelDepth(screenPos);
    const hidden = screenPos.z < 0 || hitDepth < screenPos.z;

    this._hotspotElem.style.transform = `translateX(${screenPos.x}px) translateY(${screenPos.y}px)`;
    this._hotspotElem.style.opacity = hidden ? "0" : "1";
    this._hotspotElem.style.pointerEvents = hidden ? "none" : "auto";
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

  private _onClick() {
    this._active = !this._active;
    this._onToggleCallbacks.forEach(callback => callback(this._active));
    this._setImage(this._active ? "toggled-hovered" : "hovered");
  }

  private _onMouseOver() {
    this._setImage(this._active ? "toggled-hovered" : "hovered");
  }

  private _onMouseOut() {
    this._setImage(this._active ? "toggled" : "default");
  }

  private _setCachedEntityPosition() {
    this._cachedEntityPosition = this.cacheEntityPosition
      ? this.entity.getPosition().clone()
      : undefined;
  }

  private _getEntityPosition(): pc.Vec3 {
    return this._cachedEntityPosition ?? this.entity.getPosition();
  }

  private _getActiveCamera(): pc.CameraComponent | undefined {
    const { cameras } = this.app.systems.camera;
    return cameras[cameras.length - 1];
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

  private _setSize() {
    this._hotspotElem.style.width = `${this.size}px`;
    this._hotspotElem.style.height = `${this.size}px`;
  }

  private _setTransitionDuration() {
    this._hotspotElem.style.transitionDuration = `${this.transitionDuration}ms`;
    this._hotspotImageElem.style.transitionDuration = `${this.transitionDuration}ms`;
  }

  private _setImage(state: InteractionState) {
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
    this._hotspotImageElem.style.backgroundImage = `url(${
      texture.resource.getSource().src
    })`;
  }

  private _setCanvasHeight() {
    this._canvasHeight = parseInt(
      this.app.graphicsDevice.canvas.clientHeight.toString(),
      10,
    );
  }

  private _setDepthMapActive(activate: boolean) {
    const depthLayer = this.app.scene.layers.getLayerById(pc.LAYERID_DEPTH);
    if (depthLayer.enabled !== activate) {
      if (activate) {
        depthLayer.incrementCounter();
        this.app.render();
      } else {
        depthLayer.decrementCounter();
      }
    }
  }

  /**
   * Returns the depths of the supplied canvas position from the cameras depth-map.
   *
   * @param positions A canvas-positions to return the depth for.
   */
  private _getPixelDepth(pos: Position): number {
    const camera = this._getActiveCamera();
    if (!camera) {
      throw new Error("No active camera!");
    }

    const device = this.app.graphicsDevice;
    const depthLayer = this.app.scene.layers.getLayerById(pc.LAYERID_DEPTH);
    if (!depthLayer.enabled) {
      throw new Error("No depth-map active on the camera!");
    }

    const prevRenderTarget = device.getRenderTarget();
    const pixels = this._depthPixels;
    const position: Position = { x: 0, y: 0 };

    device.setRenderTarget(depthLayer.renderTarget);
    device.updateBegin();

    this._convertFromCanvasToDepthTexture(pos, position);

    device.readPixels(position.x, position.y, 1, 1, pixels);
    this._depthVector.set(pixels[0], pixels[1], pixels[2], pixels[3]);
    this._depthVector.scale(1 / 256); // Scale from byte to 0..1 float

    const result = this._depthVector.dot(this._depthDotVector) * camera.farClip;

    device.updateEnd();
    device.setRenderTarget(prevRenderTarget);

    return result;
  }

  /**
   * Scales / converts the supplied position or rectangle from canvas-space to depth texture-space.
   * The y-value is also flipped to be bottom-up instead of top-down.
   *
   * @param pos Position / rectangle to convert.
   * @param target (Optional) Target to store the result in. If omitted, the supplied value will be cloned.
   */
  private _convertFromCanvasToDepthTexture(
    pos: Position,
    target?: Position,
  ): Position {
    target = target || { ...pos };
    target.x = pos.x;
    target.y = pos.y;
    target.y = this._canvasHeight - target.y; // Convert from top-down to bottom-up
    return target;
  }
}

InteractionHotspot.attributes.add("image", {
  type: "asset",
  assetType: "texture",
  title: "Image",
  description: "",
});

InteractionHotspot.attributes.add("hoveredImage", {
  type: "asset",
  assetType: "texture",
  default: null,
  title: "Hovered image",
  description: "",
});

InteractionHotspot.attributes.add("toggledImage", {
  type: "asset",
  assetType: "texture",
  default: null,
  title: "Toggled image",
  description: "",
});

InteractionHotspot.attributes.add("toggledHoveredImage", {
  type: "asset",
  assetType: "texture",
  default: null,
  title: "Toggled hovered image",
  description: "",
});

InteractionHotspot.attributes.add("size", {
  type: "number",
  default: 50,
  title: "Size (px)",
  description: "Width and height of hotspot in px.",
});

InteractionHotspot.attributes.add("transitionDuration", {
  type: "number",
  default: 0,
  title: "Transition duration (ms)",
  description:
    "Duration of transition when toggling between images for states.",
});

InteractionHotspot.attributes.add("parentElementId", {
  type: "string",
  default: "",
  title: "Element ID",
  description: "The ID of the element that should parent the hotspot.",
});

InteractionHotspot.attributes.add("cacheEntityPosition", {
  type: "boolean",
  default: false,
  title: "Cache entity position",
  description:
    "Cache entity world position on initialize instead of reading from entity on every frame.",
});

export { InteractionHotspot, interactionHotspotScriptName };
