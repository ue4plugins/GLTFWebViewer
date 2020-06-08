import pc from "@animech-public/playcanvas";
import Debug from "debug";
import {
  ExtensionParser,
  HdriBackdropExtensionParser,
  InteractionHotspotExtensionParser,
  VariantSetExtensionParser,
} from "./extensions";

const debug = Debug("playCanvasGltfLoader");

type GltfData = {
  asset: pc.Asset;
  scene: pc.Entity;
  scenes: pc.Entity[];
  animations: pc.AnimComponentLayer[];
};

export class PlayCanvasGltfLoader {
  public constructor(private _app: pc.Application) {}

  private async _loadAsset(
    url: string,
    fileName?: string,
  ): Promise<pc.Asset | undefined> {
    debug("Load glTF asset", url, fileName);

    return new Promise<pc.Asset | undefined>((resolve, reject) => {
      const callback: pc.callbacks.LoadAsset = (err, asset) => {
        if (err) {
          reject(err);
        } else {
          resolve(asset);
        }
      };

      if (fileName) {
        this._app.assets.loadFromUrlAndFilename(
          url,
          fileName,
          "container",
          callback,
        );
      } else {
        this._app.assets.loadFromUrl(
          pc.path.join("../..", url),
          "container",
          callback,
        );
      }
    });
  }

  private _getAnimationLayersForScene(scene: pc.Entity) {
    const animationComponents = scene
      ? ((scene.findComponents("anim") as unknown) as pc.AnimComponent[])
      : [];

    return animationComponents.reduce<pc.AnimComponentLayer[]>(
      (acc, component) => [...acc, ...component.data.layers],
      [],
    );
  }

  private _clearExtensions() {
    this._app.glbExtensions.removeAll();
  }

  private _registerExtensions(extensions: ExtensionParser[]) {
    extensions.forEach(e => e.register(this._app.glbExtensions));
  }

  private _unregisterExtensions(extensions: ExtensionParser[]) {
    extensions.forEach(e => e.unregister(this._app.glbExtensions));
  }

  private _applyExtensionPostParse(
    extensions: ExtensionParser[],
    container: pc.ContainerResource,
  ) {
    extensions.forEach(e => e.postParse(container));
  }

  public async load(url: string, fileName?: string): Promise<GltfData> {
    debug("Load glTF asset", url, fileName);

    const variantSetParser = new VariantSetExtensionParser();
    const extensions: ExtensionParser[] = [
      new HdriBackdropExtensionParser(),
      new InteractionHotspotExtensionParser(),
      variantSetParser,
    ];

    this._clearExtensions();
    this._registerExtensions(extensions);

    try {
      const asset = await this._loadAsset(url, fileName);
      if (!asset) {
        throw new Error("Asset not found");
      }

      const container = asset.resource as pc.ContainerResource | undefined;
      if (!container) {
        throw new Error("Asset is empty");
      }

      const scene = container.scene;
      if (!scene) {
        throw new Error("Asset contains no scene");
      }

      this._applyExtensionPostParse(extensions, container);
      this._unregisterExtensions(extensions);

      // TODO: get multiple
      const variantSets = variantSetParser.getVariantSetForScene(scene);
      debug("glTF global extensions", container.extensions);

      debug("glTF variant sets", variantSets);
      // TODO: return multiple scenes, default scene index,
      // variant sets and animations per scene

      return {
        asset,
        scene,
        scenes: container.scenes,
        animations: this._getAnimationLayersForScene(scene),
      };
    } catch (e) {
      this._unregisterExtensions(extensions);
      throw e;
    }
  }
}
