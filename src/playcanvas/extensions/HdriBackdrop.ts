import Debug from "debug";
import { ExtensionParser } from "./ExtensionParser";

const debug = Debug("HdriBackdrop");

type HdriBackdropData = {
  type: "dome";
  cubemap: number;
  intensity: number;
  size: number;
  projectionCenter: [number, number, number];
  lightingDistance: number;
  cameraProjection: boolean;
};

export class HdriBackdropExtensionParser implements ExtensionParser {
  private _backdrops: {
    node: pc.Entity;
    data: HdriBackdropData;
  }[] = [];

  public get name() {
    return "EPIC_hdri_backdrops";
  }

  public register(registry: pc.GlbExtensionRegistry) {
    registry.node.add(this.name, this._parse.bind(this));
  }

  public unregister(registry: pc.GlbExtensionRegistry) {
    registry.node.remove(this.name);
  }

  public postParse(container: pc.ContainerResource) {
    debug("Post parse backdrop", container);
    this._backdrops.forEach(backdrop => {
      const texture = container.textures[backdrop.data.cubemap];
      debug("Found texture ", texture);
    });
  }

  private _parse(node: pc.Entity, extension: any, gltf: any) {
    debug("Parse backdrop", node, extension);

    const backdrops: HdriBackdropData[] | undefined =
      gltf?.extensions?.[this.name]?.backdrops;
    if (!backdrops) {
      return node;
    }

    const backdrop = backdrops[extension.backdrop];
    if (!backdrop) {
      return node;
    }

    debug("Found backdrop", backdrop);

    this._backdrops.push({
      node,
      data: backdrop,
    });

    return node;
  }
}
