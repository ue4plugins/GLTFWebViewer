import * as pc from "@animech-public/playcanvas";

type TextureAsset = Omit<pc.Asset, "resource"> & { resource: pc.Texture };
type OnToggleCallback = (active: boolean) => void;
type InteractionState = "default" | "hovered" | "toggled" | "toggled-hovered";

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
}

const interactionHotspotScriptName = "InteractionHotspot";

class InteractionHotspot extends pc.ScriptType {
  private _onToggleCallbacks: OnToggleCallback[] = [];
  private _active = false;
  private _parentElem: HTMLElement | null = null;
  private _hotspotElem: HTMLElement;
  private _hotspotImageElem: HTMLElement;

  public constructor(args: { app: pc.Application; entity: pc.Entity }) {
    super(args);

    this._onToggle = this._onToggle.bind(this);

    this._hotspotElem = document.createElement("div");
    this._hotspotImageElem = document.createElement("div");
    this._hotspotElem.appendChild(this._hotspotImageElem);

    const { style: hotspotStyle } = this._hotspotElem;
    hotspotStyle.position = "absolute";
    hotspotStyle.top = "0px";
    hotspotStyle.left = "0px";

    const { style: imageStyle } = this._hotspotImageElem;
    imageStyle.width = "100%";
    imageStyle.height = "100%";
    imageStyle.transform = "translateX(-50%) translateY(-50%)";
    imageStyle.backgroundSize = "cover";
  }

  public get active() {
    return this._active;
  }

  public get elem() {
    return this._hotspotElem;
  }

  public initialize() {
    // TODO: store entity pos on init to prevent unnecessary calls to getPosition?

    this._setParentElem();
    this._setSize();
    this._setTransitionDuration();

    this.on("attr:parentElementId", this._setParentElem, this);
    this.on("attr:size", this._setSize, this);
    this.on("attr:transitionDuration", this._setTransitionDuration, this);

    this._hotspotElem.addEventListener("click", this._onToggle);

    this.on("destroy", () => {
      this._parentElem?.removeChild(this._hotspotElem);
      this._hotspotElem.removeEventListener("click", this._onToggle);
    });

    // TODO: remove
    this._setImage("default");

    console.log(this.image, this.hoveredImage);
  }

  public update() {
    const { x, y } = this.getScreenPosition();
    this._moveElem(x, y);
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

  public getScreenPosition(): pc.Vec3 {
    const camera = this._getActiveCamera();
    if (camera) {
      return camera.worldToScreen(this.entity.getPosition());
    }
    return new pc.Vec3(0, 0, 0);
  }

  private _onToggle() {
    this._active = !this._active;
    this._onToggleCallbacks.forEach(callback => callback(this._active));
  }

  private _getActiveCamera(): pc.CameraComponent | undefined {
    const { cameras } = this.app.systems.camera;
    return cameras[cameras.length - 1];
  }

  private _moveElem(x: number, y: number) {
    this._hotspotElem.style.transform = `translateX(${x}px) translateY(${y}px)`;
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
    this._hotspotImageElem.style.transition = `background ${this.transitionDuration}ms`;
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

export { InteractionHotspot, interactionHotspotScriptName };
