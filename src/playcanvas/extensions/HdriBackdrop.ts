import { ExtensionHandler } from "./ExtensionHandler";

type HdriBackdropData = {
  type: "dome";
  cubemap: number;
  intensity: number;
  size: number;
  projectionCenter: [number, number, number];
  lightingDistance: number;
  cameraProjection: boolean;
};

export class HdriBackdropExtensionHandler implements ExtensionHandler {
  private _backdrops: {
    node: pc.Entity;
    data: HdriBackdropData;
  }[] = [];

  public get name() {
    return "EPIC_hdri_backdrops";
  }

  public register(registry: pc.GlbExtensionRegistry) {
    registry.node.add(this.name, this._process.bind(this));
  }

  public unregister(registry: pc.GlbExtensionRegistry) {
    registry.node.remove(this.name);
  }

  public postProcess(container: pc.ContainerResource) {
    this._backdrops.forEach(backdrop => {
      const texture = container.textures[backdrop.data.cubemap];
      console.log(this.name, "postProcess", texture);
    });
  }

  private _process(node: pc.Entity, extension: any, gltf: any) {
    const backdrops: HdriBackdropData[] | undefined =
      gltf?.extensions?.EPIC_hdri_backdrops?.backdrops;
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
