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

  sunHeight?: number;
  sunBrightness?: number;
  starsBrightness?: number;
  cloudSpeed?: number;
  cloudOpacity?: number;
  horizonFalloff?: number;

  sunRadius?: number;
  noisePower1?: number;
  noisePower2?: number;

  colorsDeterminedBySunPosition?: boolean;

  zenithColor?: [number, number, number, number];
  horizonColor?: [number, number, number, number];
  cloudColor?: [number, number, number, number];
  overallColor?: [number, number, number, number];

  zenithColorCurve?: number[][];
  horizonColorCurve?: number[][];
  cloudColorCurve?: number[][];

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
      const node = data.node;
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

      let zenithColorCurve: pc.CurveSet | undefined;
      if (data.zenithColorCurve) {
        if (data.zenithColorCurve.length >= 3) {
          zenithColorCurve = new pc.CurveSet(data.zenithColorCurve);
        } else {
          debug(
            `${skySphereName} has an invalid zenithColorCurve`,
            data.zenithColorCurve,
          );
          return;
        }
      }

      let horizonColorCurve: pc.CurveSet | undefined;
      if (data.horizonColorCurve) {
        if (data.horizonColorCurve.length >= 3) {
          horizonColorCurve = new pc.CurveSet(data.horizonColorCurve);
        } else {
          debug(
            `${skySphereName} has an invalid horizonColorCurve`,
            data.horizonColorCurve,
          );
          return;
        }
      }

      let cloudColorCurve: pc.CurveSet | undefined;
      if (data.cloudColorCurve) {
        if (data.cloudColorCurve.length >= 3) {
          cloudColorCurve = new pc.CurveSet(data.cloudColorCurve);
        } else {
          debug(
            `${skySphereName} has an invalid cloudColorCurve`,
            data.cloudColorCurve,
          );
          return;
        }
      }

      node.addComponent("script").create(SkySphereScript, {
        attributes: this._stripUndefinedProperties({
          ...data,
          name: undefined,
          skySphereMesh: undefined,
          skySphereModel,
          skyTexture,
          cloudsTexture,
          starsTexture,
          directionalLight,
          zenithColorCurve,
          horizonColorCurve,
          cloudColorCurve,
        }),
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

  private _stripUndefinedProperties<T extends {}>(obj: T): T {
    const result = { ...obj };

    Object.keys(result).forEach(<K extends keyof T>(key: K) => {
      if (result[key] === undefined) {
        delete result[key];
      }
    });

    return result;
  }
}
