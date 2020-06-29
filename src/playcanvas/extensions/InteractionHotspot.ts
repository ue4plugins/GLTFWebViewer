import * as pc from "@animech-public/playcanvas";
import Debug from "debug";
import { Animation } from "../Animation";
import { ExtensionParser } from "./ExtensionParser";
import { ExtensionRegistry } from "./ExtensionRegistry";

const debug = Debug("InteractionHotspot");

type InteractionData = {
  image: number;
  animation: number;
};

type NodeExtensionData = {
  interaction: number;
};

type RootExtensionData = {
  interactions: InteractionData[];
};

type NodeInteractionDataMap = {
  node: pc.Entity;
  data: InteractionData;
};

export type InteractionHotspot = {
  node: pc.Entity;
  imageSource: string;
  animation?: Animation;
};

export class InteractionHotspotExtensionParser implements ExtensionParser {
  private _hotspots: NodeInteractionDataMap[] = [];

  public get name() {
    return "EPIC_interaction_hotspots";
  }

  public get hotspotAnimationIndices(): number[] {
    return this._hotspots
      .map(({ data }) => data.animation)
      .filter(
        (animationIndex, index, animationIndices) =>
          animationIndices.indexOf(animationIndex) === index,
      );
  }

  public getHotspotsForScene(
    scene: pc.Entity,
    animations: Animation[],
    container: pc.ContainerResource,
  ): InteractionHotspot[] {
    const { textures } = container;

    return this._hotspots
      .filter(
        hotspot =>
          textures[hotspot.data.image] &&
          animations[hotspot.data.animation] &&
          scene.findOne(node => node === hotspot.node),
      )
      .map(hotspot => {
        const image = textures[hotspot.data.image].resource as pc.Texture;
        return {
          node: hotspot.node,
          imageSource: image.getSource().src,
          animation: animations.find(
            ({ index }) => index === hotspot.data.animation,
          ),
        };
      });
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
    rootExtensionData?: RootExtensionData,
  ) {
    debug("Parse hotspot", node, extensionData, rootExtensionData);

    const hotspot = rootExtensionData?.interactions[extensionData.interaction];
    if (!hotspot) {
      return;
    }

    debug("Found hotspot", hotspot);

    this._hotspots.push({
      node,
      data: hotspot,
    });
  }
}
