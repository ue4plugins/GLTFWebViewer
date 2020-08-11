import * as pc from "@animech-public/playcanvas";
import Debug from "debug";
import { ExtensionParser } from "./ExtensionParser";
import { ExtensionRegistry } from "./ExtensionRegistry";

const debug = Debug("LightMap");

type LightmapData = {
  lightmapAdd: number[];
  lightmapScale: number[];
  coordinateScaleBias: number[];

  texture: {
    index: number;
    texCoord?: number;
  };
};

type NodeExtensionData = {
  lightmap: number;
};

type RootData = {
  extensions?: {
    EPIC_lightmap_textures?: {
      lightmaps: LightmapData[];
    };
  };
};

type NodeLightmapData = LightmapData & {
  node: pc.Entity;
};

type MaterialMapping = {
  original: pc.StandardMaterial;
  extended: pc.StandardMaterial;
};

type NodeLightmap = {
  node: pc.Entity;
  meshInstances: pc.MeshInstance[];

  texture: pc.Texture;
  texCoord: number;

  lightmapAdd: number[];
  lightmapScale: number[];
  coordinateScaleBias: number[];
};

export class LightMapExtensionParser implements ExtensionParser {
  private _nodeLightmapDatas: NodeLightmapData[] = [];
  private _nodeLightmaps: NodeLightmap[] = [];
  private _materialMappings: MaterialMapping[] = [];

  public get name() {
    return "EPIC_lightmap_textures";
  }

  public register(registry: ExtensionRegistry) {
    registry.node.add(this.name, {
      postParse: this._nodePostParse.bind(this),
    });
  }

  public unregister(registry: ExtensionRegistry) {
    registry.node.remove(this.name);
  }

  public findNodeLightmap(node: pc.Entity): NodeLightmap | null {
    return (
      this._nodeLightmaps.find(nodeLightmap => nodeLightmap.node === node) ??
      null
    );
  }

  public getExtendedMaterial(
    nodeLightmap: NodeLightmap,
    sourceMaterial: pc.StandardMaterial,
  ): pc.StandardMaterial | null {
    if (!nodeLightmap) {
      return null;
    }

    return (
      this._materialMappings.find(
        mapping =>
          mapping.original === sourceMaterial &&
          mapping.extended.lightMap === nodeLightmap.texture &&
          mapping.extended.lightMapUv === nodeLightmap.texCoord,
      )?.extended ?? null
    );
  }

  public getOrCreateExtendedMaterial(
    nodeLightmap: NodeLightmap,
    sourceMaterial: pc.StandardMaterial,
  ): pc.StandardMaterial {
    let material = this.getExtendedMaterial(nodeLightmap, sourceMaterial);

    if (!material) {
      const { texture, texCoord } = nodeLightmap;
      material = sourceMaterial.clone();

      material.lightMap = texture;
      material.lightMapUv = texCoord;
      material.chunks.lightmapSinglePS = this._createLightmapSinglePS();
      material.update();

      this._materialMappings.push({
        original: sourceMaterial,
        extended: material,
      });
    }

    return material;
  }

  public postParse(container: pc.ContainerResource) {
    debug("Post parse lightmap");

    this._nodeLightmapDatas.forEach(data => {
      const {
        node,
        lightmapScale,
        lightmapAdd,
        coordinateScaleBias,
        texture: { texCoord, index },
      } = data;

      if (
        !coordinateScaleBias ||
        !lightmapAdd ||
        !lightmapScale ||
        index === undefined
      ) {
        debug(`Node '${node.name}' has invalid data`, data);
        return;
      }

      const meshInstances = node.model?.meshInstances;
      if (!meshInstances) {
        debug(`Node '${node.name}' is missing a model or mesh-instances`);
        return;
      }

      const texture = container.textures[index]?.resource;
      if (!texture) {
        debug(`Node '${node.name}' is using an invalid lightmap texture`);
        return;
      }

      const nodeLightmap: NodeLightmap = {
        node,
        meshInstances,
        texture,
        texCoord: texCoord ?? 0,
        lightmapAdd,
        lightmapScale,
        coordinateScaleBias,
      };

      meshInstances.forEach(instance => {
        const sourceMaterial = instance.material as pc.StandardMaterial;
        const material = this.getOrCreateExtendedMaterial(
          nodeLightmap,
          sourceMaterial,
        );

        instance.material = material;
        instance.setParameter("lm_coordinateScaleBias", coordinateScaleBias);
        instance.setParameter("lm_lightmapAdd", lightmapAdd);
        instance.setParameter("lm_lightmapScale", lightmapScale);
      });

      this._nodeLightmaps.push(nodeLightmap);

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
      rootData.extensions?.EPIC_lightmap_textures?.lightmaps?.[
        extensionData.lightmap
      ];

    if (!lightmap) {
      debug(
        `Unable to find lightmap with index ${extensionData.lightmap} for node '${node.name}'`,
      );
      return;
    }

    debug("Found lightmap", lightmap);

    this._nodeLightmapDatas.push({
      node: node,
      ...lightmap,
    });
  }

  private _createLightmapSinglePS(): string {
    return this._getCommonShaderCode() + this._getHighQualityShaderCode();
  }

  private _getCommonShaderCode(): string {
    return `
      #ifdef MAPTEXTURE
      uniform sampler2D texture_lightMap;
      #endif

      uniform vec4 lm_coordinateScaleBias;
      uniform vec4 lm_lightmapAdd;
      uniform vec4 lm_lightmapScale;
      
      vec2 getLightmapUV0(vec2 uv)
      {
        return (uv * lm_coordinateScaleBias.xy + lm_coordinateScaleBias.zw) * vec2(1.0, 0.5);
      }

      vec2 getLightmapUV1(vec2 uv)
      {
        return getLightmapUV0(uv) + vec2(0.0, 0.5);
      }
    `;
  }

  private _getHighQualityShaderCode(): string {
    return `
      vec2 flipY(vec2 uv)
      {
        return vec2(uv.x, 1.0 - uv.y);
      }

      vec3 getLightMapColorHQ()
      {
        // NOTE: Mesh Uv's are flipped in Y(V) compared to UE4, and
        // we therefore need to temporarily flip them (again) while
        // performing scale- and bias-calculations.
        vec2 flippedUv = flipY($UV);
        vec2 lightmapUv0 = flipY(getLightmapUV0(flippedUv));
        vec2 lightmapUv1 = flipY(getLightmapUV1(flippedUv));

        vec4 lightmap0 = texture2D(texture_lightMap, lightmapUv0).rgba;
        vec4 lightmap1 = texture2D(texture_lightMap, lightmapUv1).rgba;
      
        float logL = lightmap0.w;
      
        // Add residual
        logL += lightmap1.w * (1.0 / 255.0) - (0.5 / 255.0);
      
        // Range scale logL
        logL = logL * lm_lightmapScale.w + lm_lightmapAdd.w;
          
        // Range scale uvw
        vec3 uvw = lightmap0.rgb * lightmap0.rgb * lm_lightmapScale.rgb + lm_lightmapAdd.rgb;
      
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
