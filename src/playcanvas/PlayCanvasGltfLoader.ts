import * as pc from "@animech-public/playcanvas";
import Debug from "debug";
import { LevelVariantSet } from "../variants";
import {
  ExtensionRegistry,
  ExtensionParser,
  VariantSetExtensionParser,
  AnimationHotspotExtensionParser,
  HdriBackdropExtensionParser,
  LightMapExtensionParser,
  HdriBackdrop,
  HdrEncodingExtensionParser,
  OrbitCameraExtensionParser,
  AnimationPlaybackExtensionParser,
  AnimationPlayback,
  animationPlaybackDefaults,
  SkySphereExtensionParser,
} from "./extensions";
import { AnimationState, Animation } from "./Animation";
import { CameraEntity, convertToCameraEntity } from "./Camera";
import { AnimationHotspot } from "./scripts";

const debug = Debug("PlayCanvasGltfLoader");

export type GltfSceneData = {
  root: pc.Entity;
  levelVariantSets: LevelVariantSet[];
  hotspots: AnimationHotspot[];
  backdrops: HdriBackdrop[];
  animations: Animation[];
  cameras: CameraEntity[];
};

export type GltfData = {
  asset: pc.Asset;
  scenes: GltfSceneData[];
  defaultScene: number;
};

export class PlayCanvasGltfLoader {
  private _extensionRegistry: ExtensionRegistry;

  public constructor(private _app: pc.Application) {
    this._extensionRegistry = new ExtensionRegistry();
  }

  private async _loadAsset(
    url: string,
    fileName?: string,
  ): Promise<pc.Asset | undefined> {
    debug("Load glTF asset", url, fileName);

    return new Promise<pc.Asset | undefined>((resolve, reject) => {
      const { assets } = this._app;

      const fileUrl = fileName ? url : pc.path.join("../..", url);
      const assetName = pc.path.getBasename(fileName || fileUrl);

      let asset = assets.getByUrl(fileUrl);
      if (!asset) {
        asset = new pc.Asset(
          assetName,
          "container",
          { url: fileUrl, filename: fileName || assetName },
          null,
          this._extensionRegistry.containerAssetOptions,
        );
        assets.add(asset);
      }

      if (asset.resource) {
        resolve(asset);
        return;
      }

      asset.once("load", loadedAsset => resolve(loadedAsset));
      asset.once("error", err => reject(err));
      assets.load(asset);
    });
  }

  private _createAnimations(
    container: pc.ContainerResource,
    playbackByAnimationIndex: (AnimationPlayback | undefined)[],
    hotspotAnimationIndices: number[],
  ): Animation[] {
    const {
      nodes,
      animationIndicesByNode,
      animations: animationAssets,
    } = container;

    return animationIndicesByNode
      .map<Animation[]>((animationIndices, nodeIndex) => {
        if (animationIndices.length === 0) {
          return [];
        }

        const node = nodes[nodeIndex];
        const component = node.addComponent("anim") as pc.AnimComponent;

        // Create one layer per animation asset so that the animations can be played simultaneously
        component.loadStateGraph({
          layers: animationIndices.map(index => {
            const speed =
              playbackByAnimationIndex[index]?.playRate ??
              animationPlaybackDefaults.playRate;
            return {
              name: (animationAssets[index].resource as pc.AnimTrack).name,
              states: [
                { name: pc.ANIM_STATE_START },
                { name: AnimationState.Loop, speed, loop: true },
                { name: AnimationState.LoopReverse, speed: -speed, loop: true },
                { name: AnimationState.Once, speed, loop: false },
                {
                  name: AnimationState.OnceReverse,
                  speed: -speed,
                  loop: false,
                },
              ],
              transitions: [],
            };
          }),
          parameters: {},
        });

        // Create one Animation instance per layer
        return animationIndices
          .map(index => {
            const track = animationAssets[index].resource as pc.AnimTrack;
            return {
              track,
              index,
              layer: component.findAnimationLayer(track.name),
            };
          })
          .filter(({ layer }) => !!layer)
          .map<Animation>(({ track, index, layer: layerOrNull }) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const layer = layerOrNull!;

            // Assign animation tracks to all states of each layer
            layer.states
              .slice(1, layer.states.length)
              .forEach(state => layer.assignAnimation(state, track));

            if (hotspotAnimationIndices.includes(index)) {
              return new Animation(node, layer, index);
            }

            const playback = playbackByAnimationIndex[index];

            const defaultState =
              (playback?.loop ?? animationPlaybackDefaults.loop) === false
                ? AnimationState.Once
                : AnimationState.Loop;

            const autoPlay =
              (playback?.autoPlay ?? animationPlaybackDefaults.autoPlay) ===
              false
                ? false
                : true;

            const startTime =
              playback?.startTime ?? animationPlaybackDefaults.startTime;

            return new Animation(
              node,
              layer,
              index,
              defaultState,
              autoPlay,
              startTime,
            );
          });
      })
      .reduce<Animation[]>((acc, anims) => [...acc, ...anims], []);
  }

  private _clearExtensions() {
    this._extensionRegistry.removeAll();
  }

  private _registerExtensions(extensions: ExtensionParser[]) {
    extensions.forEach(e => e.register(this._extensionRegistry));
  }

  private _unregisterExtensions(extensions: ExtensionParser[]) {
    extensions.forEach(e => e.unregister(this._extensionRegistry));
  }

  private _postParseExtensions(
    extensions: ExtensionParser[],
    container: pc.ContainerResource,
  ) {
    extensions.forEach(e => e.postParse(container));
  }

  private _addModelMaterialMappings(container: pc.ContainerResource) {
    const materials = container.materials;

    // Add missing material mappings to all model assets.
    // We need them to support restoring default materials for a model via variants.
    this._app.assets
      .filter(
        asset =>
          asset.type === "model" && !!asset.resource && !asset.data?.mapping,
      )
      .forEach(model => {
        model.data = model.data ?? {};
        model.data.mapping = model.resource.meshInstances.map(
          (meshInstance: pc.MeshInstance) => ({
            material: materials.find(
              material => material.resource === meshInstance.material,
            )?.id,
          }),
        );
      });
  }

  public async load(url: string, fileName?: string): Promise<GltfData> {
    debug("Load glTF asset", url, fileName);

    const variantSetParser = new VariantSetExtensionParser();
    const hotspotParser = new AnimationHotspotExtensionParser();
    const lightMapParser = new LightMapExtensionParser();
    const backdropParser = new HdriBackdropExtensionParser();
    const animationPlaybackParser = new AnimationPlaybackExtensionParser();

    const extensions: ExtensionParser[] = [
      variantSetParser,
      hotspotParser,
      lightMapParser,
      backdropParser,
      animationPlaybackParser,
      new OrbitCameraExtensionParser(),
      new HdrEncodingExtensionParser(),
      new SkySphereExtensionParser(),
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

      debug("Loaded glTF container", container);

      const defaultScene = container.scene;
      if (!defaultScene) {
        throw new Error("Asset has no default scene");
      }

      this._postParseExtensions(extensions, container);
      this._unregisterExtensions(extensions);

      const playbackByAnimationIndex = animationPlaybackParser.getPlaybackByAnimationIndex(
        container,
      );
      const { hotspotAnimationIndices } = hotspotParser;
      const animations = this._createAnimations(
        container,
        playbackByAnimationIndex,
        hotspotAnimationIndices,
      );
      debug("Created animations", animations);

      const cameraEntities = container.cameras.map(component =>
        convertToCameraEntity(component.entity),
      );
      debug("Created camera entities", cameraEntities);

      this._addModelMaterialMappings(container);
      debug("Added model material mappings");

      return {
        asset,
        scenes: container.scenes.map<GltfSceneData>(sceneRoot => {
          const sceneAnimations = animations.filter(animation =>
            sceneRoot.findOne(node => node === animation.node),
          );
          return {
            root: sceneRoot,
            levelVariantSets: variantSetParser.getVariantSetsForScene(
              sceneRoot,
              container,
            ),
            hotspots: hotspotParser.getHotspotsForScene(
              sceneRoot,
              sceneAnimations,
              container,
            ),
            backdrops: backdropParser.getBackdropsForScene(
              sceneRoot,
              container,
            ),
            animations: sceneAnimations.filter(
              animation =>
                hotspotAnimationIndices.indexOf(animation.index) === -1,
            ),
            cameras: cameraEntities.filter(cameraEntity =>
              sceneRoot.findOne(node => node === cameraEntity),
            ),
          };
        }),
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
