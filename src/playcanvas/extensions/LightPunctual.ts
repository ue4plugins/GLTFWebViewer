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
    this._nodeLights.forEach(nodeLight => {
      const { node, data } = nodeLight;

      const component = node
        .findComponents("light")
        .find(c => c.entity.name === node.name && c.entity.parent === node); // The parser adds a child-entity that contains the component

      if (component) {
        // TODO: Correctly convert intensity to match lux (lm/m2) for directional lights,
        // and candela (lm/sr) for point- and spot-lights.

        // NOTE: For now we'll apply a "fudge factor" until we are able to corectly handle intensity
        const intensityFactor = 1 / 5;
        const intensity = (data.intensity ?? 1) * intensityFactor;

        component.intensity = intensity;
      }
    });
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
