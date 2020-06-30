import Debug from "debug";
import { ExtensionParser } from "./ExtensionParser";
import { ExtensionRegistry } from "./ExtensionRegistry";

const debug = Debug("HdriBackdrop");

type BackdropData = {
  mesh: number;
  cubemap: number[];
  intensity: number;
  size: number;
  projectionCenter: [number, number, number];
  lightingDistanceFactor: number;
  useCameraProjection: boolean;
};

type NodeExtensionData = {
  backdrop: number;
};

type RootData = {
  textures?: { source: number }[];
  extensions?: {
    EPIC_hdri_backdrops?: {
      backdrops: BackdropData[];
    };
  };
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
    rootData: RootData,
  ) {
    debug("Parse backdrop", node, extensionData, rootData);

    const backdrop =
      rootData.extensions?.EPIC_hdri_backdrops?.backdrops?.[
        extensionData.backdrop
      ];
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
