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

type NodeInteractionDataMap = {
  node: pc.Entity;
  data: InteractionData;
};

function mapIsDefined(
  obj: NodeInteractionDataMap | undefined,
): obj is NodeInteractionDataMap {
  return obj !== undefined;
}

export type InteractionHotspot = {
  node: pc.Entity;
  imageSource: string;
  animation?: Animation;
};

export class InteractionHotspotExtensionParser implements ExtensionParser {
  private _nodeExtensionData: {
    node: pc.Entity;
    data: NodeExtensionData;
  }[] = [];

  private _globalExtensionsData?: {
    interactions: InteractionData[];
  };

  private get _hotspots(): NodeInteractionDataMap[] {
    return this._nodeExtensionData
      .map(({ node, data }) => {
        const hotspot = this._globalExtensionsData?.interactions[
          data.interaction
        ];
        if (!hotspot) {
          return undefined;
        }
        return {
          node,
          data: hotspot,
        };
      })
      .filter(mapIsDefined);
  }

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
            animation => animation.index === hotspot.data.animation,
          ),
        };
      });
  }

  public register(registry: ExtensionRegistry) {
    registry.node.add(this.name, this._parse.bind(this));
  }

  public unregister(registry: ExtensionRegistry) {
    registry.node.remove(this.name);
  }

  public postParse(container: pc.ContainerResource) {
    this._globalExtensionsData = container.extensions?.[this.name];
  }

  private _parse(node: pc.Entity, extension: NodeExtensionData) {
    debug("Parse hotspot", node, extension);

    this._nodeExtensionData.push({
      node,
      data: extension,
    });

    return node;
  }
}
