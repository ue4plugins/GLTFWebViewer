import pc from "@animech-public/playcanvas";
import Debug from "debug";

const debug = Debug("playCanvasGltfLoader");

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

  private async _loadAsset(url: string, fileName?: string) {
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

  public async load(url: string, fileName?: string): Promise<pc.Asset> {
    const asset = await this._loadAsset(url, fileName);
    if (!asset) {
      throw new Error("Asset not found");
    }

    console.log("GLOBAL", asset.resource.extensions);

    return asset;
  }
}
