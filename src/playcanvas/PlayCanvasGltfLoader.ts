import pc from "@animech-public/playcanvas";
import Debug from "debug";

const debug = Debug("playCanvasGltfLoader");

type GltfData = {
  asset: pc.Asset;
  scene: pc.Entity;
  animations: pc.AnimComponentLayer[];
};

export class PlayCanvasGltfLoader {
  public constructor(
    private _app: pc.Application,
    private _assetPrefix: string,
  ) {
    this._registerExtensions();
  }

  private _registerExtensions() {
    this._app.glbExtensions.node.add(
      "EPIC_interaction_hotspots",
      (node, extension, gltf) => {
        console.log("EPIC_interaction_hotspots", node, extension, gltf);
        node.rotateLocal(45, 45, 45);
        return node;
      },
    );
  }

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
        // Remove asset prefix in order to prevent it from being prepended
        // to blob urls
        this._app.assets.prefix = "";
        this._app.assets.loadFromUrlAndFilename(
          url,
          fileName,
          "container",
          callback,
        );
        // Add asset prefix again
        this._app.assets.prefix = this._assetPrefix;
      } else {
        this._app.assets.loadFromUrl(
          pc.path.join("../..", url),
          "container",
          callback,
        );
      }
    });
  }

  private _parseAsset(asset: pc.Asset): GltfData {
    debug("Parse glTF asset", asset.resource);

    const resource = asset.resource as pc.ContainerResource | undefined;
    if (!resource) {
      throw new Error("Asset is empty");
    }

    const scene = resource.scene;
    if (!scene) {
      throw new Error("Asset contains no scene");
    }

    const animationComponents = scene
      ? ((scene.findComponents("anim") as unknown) as pc.AnimComponent[])
      : [];

    const animComponentLayers = animationComponents.reduce<
      pc.AnimComponentLayer[]
    >((acc, component) => [...acc, ...component.data.layers], []);

    return {
      asset,
      scene,
      animations: animComponentLayers,
    };
  }

  public async load(url: string, fileName?: string): Promise<GltfData> {
    const asset = await this._loadAsset(url, fileName);
    if (!asset) {
      throw new Error("Asset not found");
    }

    console.log("GLOBAL", asset.resource.extensions);

    return this._parseAsset(asset);
  }
}
