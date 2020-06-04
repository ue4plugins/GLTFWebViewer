import pc from "@animech-public/playcanvas";
import Debug from "debug";
import { ExtensionHandler, HdriBackdropExtensionHandler } from "./extensions";

const debug = Debug("playCanvasGltfLoader");

type GltfData = {
  asset: pc.Asset;
  scene: pc.Entity;
  animations: pc.AnimComponentLayer[];
};

// private _registerExtensionsOld() {
//   const registry = this._app.glbExtensions;

//   registry.node.add("EPIC_interaction_hotspots", (node, extension, gltf) => {
//     console.log("EPIC_interaction_hotspots", node, extension, gltf);

//     const child = new pc.Entity();
//     child.rotateLocal(45, 45, 45);
//     child.setLocalScale(2, 2, 2);
//     child.addComponent("model", {
//       type: "box",
//     });
//     const material = child.model!.material as pc.StandardMaterial;
//     material.diffuse.fromString("ff0ff0");
//     material.update();

//     node.addChild(child);

//     return node;
//   });
// }

export class PlayCanvasGltfLoader {
  public constructor(
    private _app: pc.Application,
    private _assetPrefix: string,
  ) {}

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

  private _parseResource(
    resource: pc.ContainerResource,
    asset: pc.Asset,
  ): GltfData {
    debug("Parse glTF asset", resource);

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
    const extensionRegistry = this._app.glbExtensions;
    extensionRegistry.removeAll();

    const extensions: ExtensionHandler[] = [new HdriBackdropExtensionHandler()];
    extensions.forEach(e => e.register(extensionRegistry));

    const asset = await this._loadAsset(url, fileName);
    if (!asset) {
      extensions.forEach(e => e.unregister(extensionRegistry));
      throw new Error("Asset not found");
    }

    const resource = asset.resource as pc.ContainerResource | undefined;
    if (!resource) {
      throw new Error("Asset is empty");
    }

    extensions.forEach(e => e.postProcess(resource));
    extensions.forEach(e => e.unregister(extensionRegistry));

    console.log("GLOBAL", asset.resource.extensions);

    return this._parseResource(resource, asset);
  }
}
