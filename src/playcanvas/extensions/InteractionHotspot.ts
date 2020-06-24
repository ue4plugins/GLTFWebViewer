import pc from "@animech-public/playcanvas";
import Debug from "debug";
import { Animation } from "../Animation";
import { ExtensionParser } from "./ExtensionParser";

const debug = Debug("InteractionHotspot");

type InteractionHotspotData = {
  image: 0;
  animation: 0;
};

export type InteractionHotspot = {
  node: pc.Entity;
  imageSource: string;
  animation?: Animation;
};

export class InteractionHotspotExtensionParser implements ExtensionParser {
  private _hotspots: {
    node: pc.Entity;
    data: InteractionHotspotData;
  }[] = [];

  public get name() {
    return "EPIC_interaction_hotspots";
  }

  public register(registry: pc.GlbExtensionRegistry) {
    registry.node.add(this.name, this._parse.bind(this));
  }

  public unregister(registry: pc.GlbExtensionRegistry) {
    registry.node.remove(this.name);
  }

  public postParse() {
    // Ignore
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

  public getHotspotAnimationIndices(): number[] {
    return this._hotspots
      .map(({ data }) => data.animation)
      .filter(
        (animationIndex, index, animationIndices) =>
          animationIndices.indexOf(animationIndex) === index,
      );
  }

  private _parse(node: pc.Entity, extension: any, gltf: any) {
    debug("Parse hotspot", node, extension);

    const hotspots: InteractionHotspotData[] | undefined =
      gltf?.extensions?.[this.name]?.interactions;
    if (!hotspots) {
      return node;
    }

    const hotspot = hotspots[extension.interaction];
    if (!hotspot) {
      return node;
    }

    debug("Found hotspot", hotspot);

    this._hotspots.push({
      node,
      data: hotspot,
    });

    return node;
  }
}
