import * as pc from "@animech-public/playcanvas";
import Debug from "debug";
import { HdriBackdrop as HdriBackdropScript } from "../scripts";
import {
  createCubemapFromTextures,
  prefilterRgbmCubemap,
} from "../utilities/CubemapUtilities";
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

type NodeBackdropDefinition = {
  node: pc.Entity;
  data: BackdropData;
};

function hasNoUndefinedValues<T>(items: (T | undefined)[]): items is T[] {
  return !items.some(item => item === undefined);
}

export type HdriBackdrop = {
  node: pc.Entity;
  script: HdriBackdropScript;
  cubemap: pc.Texture;
  skyboxCubemaps: pc.Texture[];
};

export class HdriBackdropExtensionParser implements ExtensionParser {
  private _nodeBackdrops: NodeBackdropDefinition[] = [];

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

  public getBackdropsForScene(
    scene: pc.Entity,
    container: pc.ContainerResource,
  ): HdriBackdrop[] {
    const app = pc.Application.getApplication();
    if (!app) {
      throw new Error("Couldn't find current application");
    }

    const device = app.graphicsDevice;

    return this._nodeBackdrops
      .filter(nodeBackdrop => scene.findOne(node => node === nodeBackdrop.node))
      .map(({ data, node }) => {
        const textures = this._findCubemapTextures(data, container);
        if (!textures) {
          debug("Invalid or missing cubemap textures for node ", node.name);
          return null;
        }

        const modelAsset = container.models[data.mesh];
        if (!modelAsset) {
          debug("Model is missing for node ", node.name);
          return null;
        }

        // TODO: Share cubemaps between multiple backdrops that use the same textures
        const cubemap = createCubemapFromTextures(textures, device, true);
        if (!cubemap) {
          debug("Cubemap could not be created for node ", node.name);
          return null;
        }

        const cubemapAsset = new pc.Asset("", "cubemap");
        cubemapAsset.resource = cubemap;

        const script = node.addComponent("script").create(HdriBackdropScript, {
          enabled: false, // Since there can be more than one backdrop, we need to enable the correct one later
          attributes: {
            model: modelAsset,
            cubemap: cubemapAsset,
            size: data.size,
            intensity: data.intensity,
            projectionCenter: data.projectionCenter,
            lightingDistanceFactor: data.lightingDistanceFactor,
            useCameraProjection: data.useCameraProjection,
          },
        });

        // TODO: Use reflection probe to capture the environment instead of setting the skybox
        const skyboxCubemaps = prefilterRgbmCubemap(cubemap, device, {
          createMipChainInFirstMip: true,
        });

        return {
          node,
          script,
          cubemap,
          skyboxCubemaps,
        };
      })
      .filter((backdrop): backdrop is HdriBackdrop => backdrop !== null);
  }

  public postParse(_container: pc.ContainerResource) {
    // Ignore
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

    this._nodeBackdrops.push({
      node,
      data: {
        ...backdrop,
        cubemap,
      },
    });
  }

  private _findCubemapTextures(
    data: BackdropData,
    container: pc.ContainerResource,
  ): pc.Texture[] | null {
    if (data?.cubemap?.length !== 6) {
      return null;
    }

    const textures = data.cubemap
      .map(index => container.textures[index])
      .map(asset => asset?.resource)
      .filter(texture => !!texture);

    // TODO: The texture-type should ideally be handled automatically by
    // creating a handler for the EPIC_texture_hdr extension (where rgbm encoding can be set per texture)
    textures.forEach(texture => (texture.type = pc.TEXTURETYPE_RGBM));

    return textures.length === 6 ? textures : null;
  }
}
