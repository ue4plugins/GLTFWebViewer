import * as pc from "@animech-public/playcanvas";

declare module "@animech-public/playcanvas" {
  interface ScriptComponent {
    NodeLightmap?: NodeLightmap;
  }
}

/**
 * Typings for PlayCanvas script-attributes attached to the class.
 */
interface NodeLightmap {
  texture: pc.Asset;
  texCoord: number;

  lightmapAdd: number[];
  lightmapScale: number[];
  coordinateScaleBias: number[];

  entity: pc.Entity & {
    model: pc.ModelComponent;
  };
}

type MaterialMapping = {
  original: pc.StandardMaterial;
  extended: pc.StandardMaterial;
};

const nodeLightmapScriptName = "NodeLightmap";

class NodeLightmap extends pc.ScriptType {
  private static _materialMappings: MaterialMapping[] = [];

  public static clearCachedMaterialMappings() {
    this._materialMappings = [];
  }

  public initialize() {
    if (!this.entity.model) {
      throw new Error("The entity must have a model-component!");
    }

    this.applyLightmapToModel();
  }

  public applyLightmapToModel(): void {
    this.entity.model.meshInstances.forEach(instance => {
      instance.material = NodeLightmap._findOrCreateExtendedMaterial(
        this,
        instance.material as pc.StandardMaterial,
      );

      instance.setParameter("lm_coordinateScaleBias", this.coordinateScaleBias);
      instance.setParameter("lm_lightmapAdd", this.lightmapAdd);
      instance.setParameter("lm_lightmapScale", this.lightmapScale);
    });
  }

  public removeLightmapFromModel(): void {
    this.entity.model.meshInstances.forEach(instance => {
      const originalMaterial = NodeLightmap._findOriginalMaterial(
        instance.material as pc.StandardMaterial,
      );

      if (originalMaterial !== null) {
        instance.material = originalMaterial;
      }

      instance.deleteParameter("lm_coordinateScaleBias");
      instance.deleteParameter("lm_lightmapAdd");
      instance.deleteParameter("lm_lightmapScale");
    });
  }

  private static _findOrCreateExtendedMaterial(
    nodeLightmap: NodeLightmap,
    originalMaterial: pc.StandardMaterial,
  ): pc.StandardMaterial {
    let material = this._findExtendedMaterial(nodeLightmap, originalMaterial);

    if (!material) {
      const { texture, texCoord } = nodeLightmap;
      material = originalMaterial.clone();

      material.lightMap = texture.resource;
      material.lightMapUv = texCoord;
      material.chunks.lightmapSinglePS = this._createLightmapSinglePS();
      material.update();

      this._materialMappings.push({
        original: originalMaterial,
        extended: material,
      });
    }

    return material;
  }

  private static _findExtendedMaterial(
    nodeLightmap: NodeLightmap,
    originalMaterial: pc.StandardMaterial,
  ): pc.StandardMaterial | null {
    return (
      this._materialMappings.find(
        mapping =>
          mapping.extended === originalMaterial ||
          (mapping.original === originalMaterial &&
            mapping.extended.lightMap === nodeLightmap.texture.resource &&
            mapping.extended.lightMapUv === nodeLightmap.texCoord),
      )?.extended ?? null
    );
  }

  private static _findOriginalMaterial(
    extendedMaterial: pc.StandardMaterial,
  ): pc.StandardMaterial | null {
    return (
      this._materialMappings.find(
        mapping => mapping.extended === extendedMaterial,
      )?.original ?? null
    );
  }

  private static _createLightmapSinglePS(): string {
    return this._getCommonShaderCode() + this._getHighQualityShaderCode();
  }

  private static _getCommonShaderCode(): string {
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

  private static _getHighQualityShaderCode(): string {
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

NodeLightmap.attributes.add("texture", {
  type: "asset",
  assetType: "texture",
  title: "Texture",
});

NodeLightmap.attributes.add("texCoord", {
  type: "number",
  title: "TexCoord",
});

NodeLightmap.attributes.add("lightmapAdd", {
  type: "number",
  array: true,
  title: "Lightmap add coefficients",
});

NodeLightmap.attributes.add("lightmapScale", {
  type: "number",
  array: true,
  title: "Lightmap scale coefficients",
});

NodeLightmap.attributes.add("coordinateScaleBias", {
  type: "number",
  array: true,
  title: "Coordinate scale & bias",
});

export { nodeLightmapScriptName, NodeLightmap };
