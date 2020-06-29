import Debug from "debug";
import { ExtensionParser } from "./ExtensionParser";
import { ExtensionRegistry } from "./ExtensionRegistry";

const debug = Debug("HdriBackdrop");

type BackdropData = {
  type: "dome";
  cubemap: number;
  intensity: number;
  size: number;
  projectionCenter: [number, number, number];
  lightingDistance: number;
  cameraProjection: boolean;
};

type NodeExtensionData = {
  backdrop: number;
};

type RootExtensionData = {
  backdrops: BackdropData[];
};

type NodeBackdropDataMap = {
  node: pc.Entity;
  data: BackdropData;
};

export class HdriBackdropExtensionParser implements ExtensionParser {
  private _backdrops: NodeBackdropDataMap[] = [];

  public get name() {
    return "EPIC_hdri_backdrops";
  }

  public register(registry: ExtensionRegistry) {
    registry.node.add(this.name, {
      postParse: this._nodePostParse.bind(this),
    });
  }

  public unregister(registry: ExtensionRegistry) {
    registry.node.remove(this.name);
  }

  public postParse(container: pc.ContainerResource) {
    debug("Post parse backdrop", container);

    this._backdrops.forEach(backdrop => {
      const texture = container.textures[backdrop.data.cubemap];
      debug("Found texture ", texture);
    });
  }

  private _nodePostParse(
    node: pc.Entity,
    extensionData: NodeExtensionData,
    rootExtensionData?: RootExtensionData,
  ) {
    debug("Parse backdrop", node, extensionData, rootExtensionData);

    const backdrop = rootExtensionData?.backdrops?.[extensionData.backdrop];
    if (!backdrop) {
      return;
    }

    debug("Found backdrop", backdrop);

    this._backdrops.push({
      node,
      data: backdrop,
    });
  }
}
