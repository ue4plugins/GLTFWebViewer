import * as pc from "@animech-public/playcanvas";
import Debug from "debug";
import { SkySphere as SkySphereScript } from "../scripts";
import { ExtensionParser } from "./ExtensionParser";
import { ExtensionRegistry } from "./ExtensionRegistry";

const debug = Debug("SkySphere");

type SkySphereData = {
  name?: string;

  skySphereMesh: number;
  skyTexture: number;
  cloudsTexture: number;
  starsTexture: number;

  directionalLight?: number;

  sunHeight: number;
  sunBrightness: number;
  starsBrightness: number;
  cloudSpeed: number;
  cloudOpacity: number;
  horizonFalloff: number;

  sunRadius: number;
  noisePower1: number;
  noisePower2: number;

  colorsDeterminedBySunPosition: boolean;

  zenithColor: [number, number, number, number];
  horizonColor: [number, number, number, number];
  cloudColor: [number, number, number, number];
  overallColor?: [number, number, number, number];

  scale?: [number, number, number];
};

type NodeExtensionData = {
  skySphere: number;
};

type RootData = {
  extensions?: {
    EPIC_sky_spheres?: {
      skySpheres: SkySphereData[];
    };
  };
};

type NodeSkySphereData = SkySphereData & {
  node: pc.Entity;
};

export class SkySphereExtensionParser implements ExtensionParser {
  private _nodeSkySphereDatas: NodeSkySphereData[] = [];

  public get name() {
    return "EPIC_sky_spheres";
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
    debug("Post parse sky sphere");

    this._nodeSkySphereDatas.forEach(data => {
      const {
        node,
        sunHeight,
        sunBrightness,
        starsBrightness,
        cloudSpeed,
        cloudOpacity,
        horizonFalloff,
        sunRadius,
        noisePower1,
        noisePower2,
        colorsDeterminedBySunPosition,
        zenithColor,
        horizonColor,
        cloudColor,
      } = data;
      const skySphereName = `Sky sphere '${data.name ?? node.name}'`;

      const skySphereModel = container.models[data.skySphereMesh];
      if (!skySphereModel) {
        debug(`${skySphereName} has an invalid mesh`, skySphereModel);
        return;
      }

      const skyTexture = container.textures[data.skyTexture];
      if (!skyTexture) {
        debug(`${skySphereName} has an invalid sky texture`, skyTexture);
        return;
      }

      const cloudsTexture = container.textures[data.cloudsTexture];
      if (!cloudsTexture) {
        debug(`${skySphereName} has an invalid clouds texture`, cloudsTexture);
        return;
      }

      const starsTexture = container.textures[data.starsTexture];
      if (!starsTexture) {
        debug(`${skySphereName} has an invalid stars texture`, starsTexture);
        return;
      }

      let directionalLight: pc.Entity | null = null;
      if (data.directionalLight !== undefined) {
        directionalLight = container.nodes[data.directionalLight];
        if (!directionalLight) {
          debug(
            `${skySphereName} has an invalid directional light`,
            directionalLight,
          );
          return;
        }
      }

      const overallColor = data.overallColor ?? [1, 1, 1, 1];
      const scale = data.scale ?? [1, 1, 1];

      node.addComponent("script").create(SkySphereScript, {
        attributes: {
          skySphereModel,
          skyTexture,
          cloudsTexture,
          starsTexture,
          directionalLight,

          sunHeight,
          sunBrightness,
          starsBrightness,
          cloudSpeed,
          cloudOpacity,
          horizonFalloff,

          sunRadius,
          noisePower1,
          noisePower2,

          colorsDeterminedBySunPosition,

          zenithColor,
          horizonColor,
          cloudColor,
          overallColor,

          scale,
        },
      });
    });
  }

  private _nodePostParse(
    node: pc.Entity,
    extensionData: NodeExtensionData,
    rootData: RootData,
  ) {
    debug("Parse sky sphere", node, extensionData, rootData);

    const skySphere =
      rootData.extensions?.EPIC_sky_spheres?.skySpheres?.[
        extensionData.skySphere
      ];
    if (!skySphere) {
      return;
    }

    debug("Found sky sphere", skySphere);

    this._nodeSkySphereDatas.push({
      node,
      ...skySphere,
    });
  }

  private _tryParseColor(data?: number[] | null): pc.Color | null {
    if (!data || data.length < 3) {
      return null;
    }

    return data.length > 3
      ? new pc.Color(data[0], data[1], data[2], data[3])
      : new pc.Color(data[0], data[1], data[2]);
  }
}
