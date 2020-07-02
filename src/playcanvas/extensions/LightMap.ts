import * as pc from "@animech-public/playcanvas";
import Debug from "debug";
import { ExtensionParser } from "./ExtensionParser";
import { ExtensionRegistry } from "./ExtensionRegistry";

const debug = Debug("LightMap");
const extensionName = "EPIC_lightmap_textures";

type LightmapData = {
  name?: string;

  valueScale: number[];
  valueOffset: number[];
  coordinateScale: number[];
  coordinateOffset: number[];

  texture?: {
    index: number;
    texCoord?: number;
  };
};

type NodeExtensionData = {
  lightmap: number;
};

type RootData = {
  textures?: { source: number }[];
  extensions?: {
    [extensionName]?: {
      lightmaps: LightmapData[];
    };
  };
};

type NodeLightmapDataMap = {
  node: pc.Entity;
  lightmapData: LightmapData;
};

type MaterialMapping = {
  original: pc.StandardMaterial;
  extended: pc.StandardMaterial;
};

export class LightMapExtensionParser implements ExtensionParser {
  private _lightmaps: NodeLightmapDataMap[] = [];
  private _materialMappings: MaterialMapping[] = [];

  public get name() {
    return extensionName;
  }

  public register(registry: ExtensionRegistry) {
    this._reset();
    registry.node.add(this.name, {
      postParse: this._nodePostParse.bind(this),
    });
  }

  public unregister(registry: ExtensionRegistry) {
    registry.node.remove(this.name);
    this._reset();
  }

  public postParse(container: pc.ContainerResource) {
    debug("Post parse lightmap", container);

    this._lightmaps.forEach(({ node, lightmapData }) => {
      const meshInstances = node.model?.meshInstances;
      if (!meshInstances) {
        // TODO: report error
        debug(`Node '${node.name}' is missing a model or mesh-instances`);
        return;
      }

      meshInstances.forEach(meshInstance => {
        if (!(meshInstance.material instanceof pc.StandardMaterial)) {
          // TODO: report error?
          debug(
            `Material '${meshInstance.material.name}' is NOT a StandardMaterial`,
          );
          return;
        }

        const material = this._getOrCreateLightmapMaterial(
          lightmapData,
          meshInstance.material,
          container,
        );

        if (!material) {
          // TODO: report error
          debug(
            `Unable to create a light-map material from source-material '${meshInstance.material.name}'`,
          );
          return;
        }

        meshInstance.material = material;

        this._setShaderUniforms(lightmapData, meshInstance);
      });

      // TODO: cleanup of created resources when the scene or model is changed?
    });
  }

  private _nodePostParse(
    node: pc.Entity,
    extensionData: NodeExtensionData,
    rootData: RootData,
  ) {
    debug("Parse lightmap", node, extensionData, rootData);

    const lightmap =
      rootData.extensions?.[extensionName]?.lightmaps?.[extensionData.lightmap];

    if (!lightmap) {
      debug(
        `Unable to find lightmap with index ${extensionData.lightmap} for node '${node.name}'`,
      );
      return;
    }

    debug("Found lightmap", lightmap);

    this._lightmaps.push({
      node: node,
      lightmapData: lightmap,
    });
  }

  private _reset() {
    this._lightmaps = [];
    this._materialMappings = [];
  }

  private _getOrCreateLightmapMaterial(
    lightmapData: LightmapData,
    originalMaterial: pc.StandardMaterial,
    container: pc.ContainerResource,
  ): pc.StandardMaterial | null {
    if (!lightmapData.texture) {
      return null;
    }

    const texCoord = lightmapData.texture.texCoord ?? 0;
    const texture = container.textures[lightmapData.texture.index]?.resource;

    if (!texture) {
      return null;
    }

    // Try to re-use an existing material if possible
    const materialMapping = this._materialMappings.find(
      mapping =>
        mapping.original === originalMaterial &&
        mapping.extended.lightMap === texture &&
        mapping.extended.lightMapUv === texCoord,
    );

    if (materialMapping !== undefined) {
      return materialMapping.extended;
    }

    const material = originalMaterial.clone();

    material.lightMap = texture;
    material.lightMapUv = texCoord;
    material.chunks.lightmapSinglePS = this._createLightmapSinglePS();
    material.update();

    this._materialMappings.push({
      original: originalMaterial,
      extended: material,
    });

    return material;
  }

  private _setShaderUniforms(
    lightmapData: LightmapData,
    target: pc.MeshInstance | pc.Material,
  ): void {
    // TODO: remove this if-clause once the typings for pc.MeshInstance
    // have been modified to contain setParameter.
    if ("setParameter" in target) {
      target.setParameter("lm_coordinateOffset", lightmapData.coordinateOffset);
      target.setParameter("lm_coordinateScale", lightmapData.coordinateScale);
      target.setParameter("lm_valueOffset", lightmapData.valueOffset);
      target.setParameter("lm_valueScale", lightmapData.valueScale);
    }
  }

  private _createLightmapSinglePS(): string {
    return this._getCommonShaderCode() + this._getHighQualityShaderCode();
  }

  private _getCommonShaderCode(): string {
    return `
      #ifdef MAPTEXTURE
      uniform sampler2D texture_lightMap;
      #endif

      uniform vec2 lm_coordinateOffset;
      uniform vec2 lm_coordinateScale;
      uniform vec4 lm_valueOffset;
      uniform vec4 lm_valueScale;
      
      vec2 getLightmapUV0(vec2 uv)
      {
        return (uv * lm_coordinateScale + lm_coordinateOffset) * vec2(1.0, 0.5);
      }

      vec2 getLightmapUV1(vec2 uv)
      {
        return getLightmapUV0(uv) + vec2(0.0, 0.5);
      }
    `;
  }

  private _getHighQualityShaderCode(): string {
    return `
      vec3 getLightMapColorHQ()
      {
        vec4 lightmap0 = $texture2DSAMPLE(texture_lightMap, getLightmapUV0($UV)).rgba;
        vec4 lightmap1 = $texture2DSAMPLE(texture_lightMap, getLightmapUV1($UV)).rgba;
      
        float logL = lightmap0.w;
      
        // Add residual
        logL += lightmap1.w * (1.0 / 255.0) - (0.5 / 255.0);
      
        // Range scale logL
        logL = logL * lm_valueScale.w + lm_valueOffset.w;
          
        // Range scale uvw
        vec3 uvw = lightmap0.rgb * lightmap0.rgb * lm_valueScale.rgb + lm_valueOffset.rgb;
      
        // logL -> L
        const float logBlackPoint = 0.01858136;
        float l = exp2( logL ) - logBlackPoint;
      
        float directionality = 0.6;
            
        float luma = l * directionality;
        vec3 color = luma * uvw;
      
        return color;
      }

      void addLightMap() {
        dDiffuseLight += getLightMapColorHQ();
      }
    `;
  }
}
