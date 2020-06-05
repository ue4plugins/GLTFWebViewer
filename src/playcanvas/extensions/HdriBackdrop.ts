import { ExtensionParser } from "./ExtensionParser";

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
    this._backdrops.forEach(backdrop => {
      const texture = container.textures[backdrop.data.cubemap];
      console.log(this.name, "postProcess", texture);
    });
  }

  private _parse(node: pc.Entity, extension: any, gltf: any) {
    const backdrops: HdriBackdropData[] | undefined =
      gltf?.extensions?.[this.name]?.backdrops;
    if (!backdrops) {
      return node;
    }

    const backdrop = backdrops[extension.backdrop];
    if (!backdrop) {
      return node;
    }

    console.log(this.name, "_process", backdrop);

    this._backdrops.push({
      node,
      data: backdrop,
    });

    return node;
  }
}
