import * as pc from "@animech-public/playcanvas";
import Debug from "debug";
import { Animation, AnimationState } from "../Animation";
import { AnimationHotspot } from "../scripts";
import { ExtensionParser } from "./ExtensionParser";
import { ExtensionRegistry } from "./ExtensionRegistry";

const debug = Debug("AnimationHotspot");

type InteractionData = {
  image: number;
  hoveredImage?: number;
  toggledImage?: number;
  toggledHoveredImage?: number;
  animation?: number;
};

type NodeExtensionData = {
  hotspot: number;
};

type RootData = {
  extensions?: {
    EPIC_animation_hotspots?: {
      hotspots: InteractionData[];
    };
  };
};

type NodeInteractionDataMap = {
  node: pc.Entity;
  data: InteractionData;
};

export class AnimationHotspotExtensionParser implements ExtensionParser {
  private _hotspotDatas: NodeInteractionDataMap[] = [];
  private _hotspots?: AnimationHotspot[];

  public get name() {
    return "EPIC_animation_hotspots";
  }

  public get hotspotAnimationIndices(): number[] {
    return this._hotspotDatas
      .map(({ data }) => data.animation)
      .filter(
        (animationIndex, index, animationIndices): animationIndex is number =>
          animationIndex !== undefined &&
          animationIndices.indexOf(animationIndex) === index,
      );
  }

  public getHotspotsForScene(
    scene: pc.Entity,
    animations: Animation[],
    container: pc.ContainerResource,
  ): AnimationHotspot[] {
    const { textures } = container;

    if (!this._hotspots) {
      this._hotspots = this._initHotspotScripts(animations, textures);
    }

    return this._hotspots.filter(hotspot =>
      scene.findOne(node => node === hotspot.entity),
    );
  }

  public register(registry: ExtensionRegistry) {
    registry.node.add(this.name, {
      postParse: this._nodePostParse.bind(this),
    });
  }

  public unregister(registry: ExtensionRegistry) {
    registry.node.remove(this.name);
  }

  public postParse() {
    // Ignore
  }

  private _nodePostParse(
    node: pc.Entity,
    extensionData: NodeExtensionData,
    rootData: RootData,
  ) {
    debug("Parse hotspot", node, extensionData, rootData);

    const hotspot =
      rootData.extensions?.EPIC_animation_hotspots?.hotspots[
        extensionData.hotspot
      ];
    if (!hotspot) {
      return;
    }

    debug("Found hotspot", hotspot);

    this._hotspotDatas.push({
      node,
      data: hotspot,
    });
  }

  private _initHotspotScripts(animations: Animation[], textures: pc.Asset[]) {
    return this._hotspotDatas
      .filter(hotspot => textures[hotspot.data.image])
      .map(hotspot => {
        const animation = animations.find(
          ({ index }) => index === hotspot.data.animation,
        );

        const script = hotspot.node
          .addComponent("script")
          .create(AnimationHotspot, {
            enabled: false, // This is enabled later for the active scene
          });

        script.transitionDuration = 200;

        script.image = textures[hotspot.data.image];
        if (hotspot.data.hoveredImage) {
          script.hoveredImage = textures[hotspot.data.hoveredImage];
        }
        if (hotspot.data.toggledImage) {
          script.toggledImage = textures[hotspot.data.toggledImage];
        }
        if (hotspot.data.toggledHoveredImage) {
          script.toggledHoveredImage =
            textures[hotspot.data.toggledHoveredImage];
        }

        script.onToggle(active => {
          debug("Toggle hotspot", active);

          if (!animation || !animation.playable) {
            return;
          }

          animation.play(
            active ? AnimationState.Once : AnimationState.OnceReverse,
            animation.activeStateClipTime,
          );
        });

        return script;
      });
  }
}
