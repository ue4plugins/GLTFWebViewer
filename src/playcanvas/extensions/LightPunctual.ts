import * as pc from "@animech-public/playcanvas";
import Debug from "debug";
import { ExtensionParser } from "./ExtensionParser";
import { ExtensionRegistry } from "./ExtensionRegistry";

const debug = Debug(" LightPunctual");

type SharedLightData = {
  name?: string;
  color?: number[];
  intensity?: number;
};

type DirectionalLightData = SharedLightData & {
  type: "directional";
};

type PointLightData = SharedLightData & {
  type: "point";
};

type SpotLightData = SharedLightData & {
  type: "spot";
  spot: {
    innerConeAngle?: number;
    outerConeAngle?: number;
  };
};

type LightData = DirectionalLightData | PointLightData | SpotLightData;

type NodeExtensionData = {
  light: number;
};

type RootData = {
  extensions?: {
    KHR_lights_punctual?: {
      lights: LightData[];
    };
  };
};

type NodeLightDefinition = {
  node: pc.Entity;
  data: LightData;
};

export class LightPunctualExtensionParser implements ExtensionParser {
  private _nodeLights: NodeLightDefinition[] = [];

  public get name() {
    return "KHR_lights_punctual" as const;
  }

  public register(registry: ExtensionRegistry) {
    console.log("Bind light extension handler");
    registry.node.add(this.name, {
      postParse: this._nodePostParse.bind(this),
    });
  }

  public unregister(registry: ExtensionRegistry) {
    registry.scene.remove(this.name);
  }

  public postParse() {
    // TODO: Implement
  }

  private _nodePostParse(
    node: pc.Entity,
    extensionData: NodeExtensionData,
    rootData: RootData,
  ) {
    debug("Parse light", node, extensionData, rootData);

    const light =
      rootData.extensions?.[this.name]?.lights?.[extensionData.light];
    if (!light) {
      return;
    }

    debug("Found light", light);

    this._nodeLights.push({
      node: node,
      data: light,
    });
  }
}
