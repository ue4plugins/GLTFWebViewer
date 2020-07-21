import * as pc from "@animech-public/playcanvas";
import Debug from "debug";
import { HdriBackdrop as HdriBackdropScript } from "../scripts";
import {
  createCubemapFromTextures,
  prefilterRgbmCubemap,
  getImageIndex,
} from "../utilities";
import { hasNoUndefinedValues } from "../../utilities/typeGuards";
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
      .map<HdriBackdrop | null>(({ data, node }) => {
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

        // TODO: The texture-type of the cubemap textures should ideally be set automatically
        // by creating a parser for the EPIC_texture_hdrencoding extension.
        // Playcanvas currently lacks support for handling texture-extensions, so for now we'll
        // assume that the textures are *meant* to be RGBM-encoded, and we set that type manually.
        // Once we have a working parser for EPIC_texture_hdrencoding, we can (optionally) handle
        // multiple HDR-formats, and properly display warnings for unsupported encodings.
        textures.forEach(texture => (texture.type = pc.TEXTURETYPE_RGBM));

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

    // Convert texture index to image index since ContainerResource.textures
    // is indexed by images
    const cubemap = backdrop.cubemap.map(index =>
      getImageIndex(index, rootData),
    );
    if (!hasNoUndefinedValues(cubemap)) {
      return;
    }
    backdrop.cubemap = cubemap;

    debug("Found cubemap textures", cubemap);

    const backdropNode = new pc.Entity(node.name + "_backdrop");
    node.addChild(backdropNode);

    this._nodeBackdrops.push({
      node: backdropNode,
      data: backdrop,
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

    return textures.length === 6 ? textures : null;
  }
}
