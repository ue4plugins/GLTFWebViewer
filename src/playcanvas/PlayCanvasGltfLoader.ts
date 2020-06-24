import pc from "@animech-public/playcanvas";
import Debug from "debug";
import {
  ExtensionParser,
  HdriBackdropExtensionParser,
  InteractionHotspotExtensionParser,
  VariantSetExtensionParser,
} from "./extensions";

const debug = Debug("PlayCanvasGltfLoader");

export type GltfVariantSetData = {};

export type GltfSceneData = {
  root: pc.Entity;
  variantSet?: GltfVariantSetData;
  animations: pc.AnimComponentLayer[];
};

export type GltfData = {
  asset: pc.Asset;
  scenes: GltfSceneData[];
  defaultScene: number;
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

  private _addAnimationComponents(container: pc.ContainerResource) {
    const { nodeAnimations, animations: animationAssets } = container;
    nodeAnimations.forEach(({ node, animations }) => {
      if (animations.length === 0) {
        return;
      }

      const component = node.addComponent("anim") as pc.AnimComponent;

      // Create one layer per animation asset so that the animations can be played simultaneously
      component.loadStateGraph({
        layers: animations.map(animationIndex => ({
          name: (animationAssets[animationIndex].resource as pc.AnimTrack).name,
          states: [
            { name: pc.ANIM_STATE_START },
            { name: "LOOP", speed: 1, loop: true },
            { name: "LOOP_REVERSE", speed: -1, loop: true },
            { name: "ONCE", speed: 1, loop: false },
            { name: "ONCE_REVERSE", speed: -1, loop: false },
          ],
          transitions: [],
        })),
        parameters: {},
      });

      // Assign animation tracks to each layer
      animations.forEach(animationIndex => {
        const track = animationAssets[animationIndex].resource as pc.AnimTrack;
        const layer = component.findAnimationLayer(track.name);
        if (layer) {
          layer.states.slice(1, layer.states.length).forEach(state => {
            layer.assignAnimation(state, track);
          });

          // This is currently the only public method to set the current state of a layer.
          // By doing this the animation of a layer can be played by simply running layer.play()
          // in an application.
          layer.play("LOOP");
          layer.pause();
        }
      });
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

      const defaultScene = container.scene;
      if (!defaultScene) {
        throw new Error("Asset has no default scene");
      }

      this._applyExtensionPostParse(extensions, container);
      this._unregisterExtensions(extensions);
      debug("glTF global extensions", container.extensions);

      this._addAnimationComponents(container);

      return {
        asset,
        scenes: container.scenes.map<GltfSceneData>(sceneRoot => ({
          root: sceneRoot,
          variantSet: variantSetParser.getVariantSetForScene(sceneRoot),
          animations: this._getAnimationLayersForScene(sceneRoot),
        })),
        defaultScene: container.scenes.indexOf(defaultScene),
      };
    } catch (e) {
      this._unregisterExtensions(extensions);
      throw e;
    }
  }

  public unload(data: GltfData) {
    debug("Unload glTF asset", data);

    this._app.assets.remove(data.asset);
    data.asset.unload();
  }
}
