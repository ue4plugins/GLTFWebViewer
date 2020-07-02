import * as pc from "@animech-public/playcanvas";
import Debug from "debug";
import { HdriBackdrop } from "../scripts";
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

type NodeBackdropDataMap = {
  node: pc.Entity;
  data: BackdropData;
};

// TODO: Improve official typings, since models are actually included in pc.ContainerResource
type ContainerResourceWithModels = pc.ContainerResource & {
  models: pc.Asset[];
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

  public postParse(container: ContainerResourceWithModels) {
    debug("Post parse backdrop", container);

    const app = pc.Application.getApplication();
    if (!app) {
      return;
    }

    const device = app.graphicsDevice;

    this._backdrops.forEach(({ data, node }) => {
      const textures: pc.Texture[] = data.cubemap
        .map(index => container.textures[index])
        .map(asset => asset?.resource)
        .filter(texture => !!texture);

      debug("Found cubemap textures ", textures);

      if (textures.length !== 6) {
        debug("Invalid number of cubemap textures for node ", node.name);
        return;
      }

      // TODO: The texture-type should ideally be handled automatically by
      // creating a handler for the EPIC_texture_hdr extension (where rgbm encoding can be set per texture)
      textures.forEach(texture => (texture.type = pc.TEXTURETYPE_RGBM as any));

      const model = container.models[data.mesh];
      debug("Found model ", model);

      if (!model) {
        debug("Model is missing for node ", node.name);
        return;
      }

      const cubemap = createCubemapFromTextures(textures, device, true);
      const script = node.addComponent("script");
      const backdropScript = script.create(HdriBackdrop);

      backdropScript.model = model.resource;
      backdropScript.cubemap = cubemap;
      backdropScript.intensity = data.intensity;
      backdropScript.size = data.size;
      backdropScript.projectionCenter = new pc.Vec3(data.projectionCenter);
      backdropScript.lightingDistanceFactor = data.lightingDistanceFactor;
      backdropScript.useCameraProjection = data.useCameraProjection === true;

      // TODO: Use reflection probe to capture the environment instead of setting the skybox
      // TODO: Do we need to clean up created resources, and if so, when?

      const prefilteredCubemaps = prefilterRgbmCubemap(cubemap, device, {
        createMipChainInFirstMip: true,
      });

      // TODO: If the skybox should still be used, handle cases where it's replaced by the user switching scene
      app.setSkybox(null as any);
      app.scene.setSkybox([null as any, ...prefilteredCubemaps]);
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
