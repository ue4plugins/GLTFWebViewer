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

function hasNoUndefinedValues<T>(items: (T | undefined)[]): items is T[] {
  return !items.some(item => item === undefined);
}

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
      const cubemap = backdrop.data.cubemap.map(
        index => container.textures[index],
      );
      debug("Found cubemap ", cubemap);
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

    // Use image source index since ContainerResource.textures is indexed by images
    const cubemap = backdrop.cubemap.map(
      index => rootData.textures?.[index]?.source,
    );
    if (!hasNoUndefinedValues(cubemap)) {
      return;
    }

    debug("Found cubemap textures", cubemap);

    this._backdrops.push({
      node,
      data: {
        ...backdrop,
        cubemap,
      },
    });
  }
}
