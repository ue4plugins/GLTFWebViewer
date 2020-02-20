import pc from "playcanvas";
import { Material } from "../types";
import { GlTfParser } from "../GlTfParser";

// Specification:
//   https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#material

const glossChunk = `
#ifdef MAPFLOAT
uniform float material_shininess;
#endif

#ifdef MAPTEXTURE
uniform sampler2D texture_glossMap;
#endif

void getGlossiness() {
    dGlossiness = 1.0;

#ifdef MAPFLOAT
    dGlossiness *= material_shininess;
#endif

#ifdef MAPTEXTURE
    dGlossiness *= texture2D(texture_glossMap, $UV).$CH;
#endif

#ifdef MAPVERTEX
    dGlossiness *= saturate(vVertexColor.$VC);
#endif

    dGlossiness = 1.0 - dGlossiness;

    dGlossiness += 0.0000001;
}
`;

const specularChunk = `
#ifdef MAPCOLOR
uniform vec3 material_specular;
#endif

#ifdef MAPTEXTURE
uniform sampler2D texture_specularMap;
#endif

void getSpecularity() {
    dSpecularity = vec3(1.0);

    #ifdef MAPCOLOR
        dSpecularity *= material_specular;
    #endif

    #ifdef MAPTEXTURE
        vec3 srgb = texture2D(texture_specularMap, $UV).$CH;
        dSpecularity *= vec3(pow(srgb.r, 2.2), pow(srgb.g, 2.2), pow(srgb.b, 2.2));
    #endif

    #ifdef MAPVERTEX
        dSpecularity *= saturate(vVertexColor.$VC);
    #endif
}`;

export function translateMaterial(data: Material, { textures }: GlTfParser) {
  const material = new pc.StandardMaterial();

  // glTF dooesn't define how to occlude specular
  material.occludeSpecular = 1.0;

  material.diffuseTint = true;
  material.diffuseVertexColor = true;

  material.specularTint = true;
  material.specularVertexColor = true;

  if (typeof data.name === "string") {
    material.name = data.name;
  }

  if (data.extensions && data.extensions["KHR_materials_unlit"]) {
    material.useLighting = false;
  }

  let color: number[] = [];
  if (
    data.extensions &&
    data.extensions["KHR_materials_pbrSpecularGlossiness"]
  ) {
    const specData = data.extensions.KHR_materials_pbrSpecularGlossiness;

    if (specData.diffuseFactor) {
      color = specData.diffuseFactor;
      // Convert from linear space to sRGB space
      material.diffuse.set(
        Math.pow(color[0], 1 / 2.2),
        Math.pow(color[1], 1 / 2.2),
        Math.pow(color[2], 1 / 2.2),
      );
      material.opacity = color[3] ?? 1;
    } else {
      material.diffuse.set(1, 1, 1);
      material.opacity = 1;
    }

    if (specData.diffuseTexture) {
      const diffuseTexture = specData.diffuseTexture;
      const texture = textures[diffuseTexture.index];

      material.diffuseMap = texture;
      material.diffuseMapChannel = "rgb";
      material.opacityMap = texture;
      material.opacityMapChannel = "a";
      if (diffuseTexture.texCoord) {
        material.diffuseMapUv = diffuseTexture.texCoord;
        material.opacityMapUv = diffuseTexture.texCoord;
      }
      if (
        diffuseTexture.extensions &&
        diffuseTexture.extensions["KHR_texture_transform"]
      ) {
        const diffuseTransformData =
          diffuseTexture.extensions.KHR_texture_transform;
        if (diffuseTransformData.scale) {
          material.diffuseMapTiling = new pc.Vec2(
            diffuseTransformData.scale[0],
            diffuseTransformData.scale[1],
          );
          material.opacityMapTiling = new pc.Vec2(
            diffuseTransformData.scale[0],
            diffuseTransformData.scale[1],
          );
        }
        if (diffuseTransformData.offset) {
          material.diffuseMapOffset = new pc.Vec2(
            diffuseTransformData.offset[0],
            diffuseTransformData.offset[1],
          );
          material.opacityMapOffset = new pc.Vec2(
            diffuseTransformData.offset[0],
            diffuseTransformData.offset[1],
          );
        }
      }
    }

    material.useMetalness = false;
    if (specData.specularFactor) {
      color = specData.specularFactor;
      // Convert from linear space to sRGB space
      material.specular.set(
        Math.pow(color[0], 1 / 2.2),
        Math.pow(color[1], 1 / 2.2),
        Math.pow(color[2], 1 / 2.2),
      );
    } else {
      material.specular.set(1, 1, 1);
    }

    if (specData.glossinessFactor) {
      material.shininess = 100 * specData.glossinessFactor;
    } else {
      material.shininess = 100;
    }

    if (specData.specularGlossinessTexture) {
      const specularGlossinessTexture = specData.specularGlossinessTexture;
      material.specularMap = textures[specularGlossinessTexture.index];
      material.specularMapChannel = "rgb";
      material.glossMap = textures[specularGlossinessTexture.index];
      material.glossMapChannel = "a";

      if (specularGlossinessTexture.texCoord) {
        material.glossMapUv = specularGlossinessTexture.texCoord;
        material.metalnessMapUv = specularGlossinessTexture.texCoord;
      }

      if (
        specularGlossinessTexture.extensions &&
        specularGlossinessTexture.extensions["KHR_texture_transform"]
      ) {
        const specGlossTransformData =
          specularGlossinessTexture.extensions.KHR_texture_transform;
        if (specGlossTransformData.scale) {
          material.glossMapTiling = new pc.Vec2(
            specGlossTransformData.scale[0],
            specGlossTransformData.scale[1],
          );
          material.metalnessMapTiling = new pc.Vec2(
            specGlossTransformData.scale[0],
            specGlossTransformData.scale[1],
          );
        }
        if (specGlossTransformData.offset) {
          material.glossMapOffset = new pc.Vec2(
            specGlossTransformData.offset[0],
            specGlossTransformData.offset[1],
          );
          material.metalnessMapOffset = new pc.Vec2(
            specGlossTransformData.offset[0],
            specGlossTransformData.offset[1],
          );
        }
      }
    }

    material.chunks.specularPS = specularChunk;
  } else if (data.pbrMetallicRoughness) {
    const pbrData = data.pbrMetallicRoughness;

    if (pbrData.baseColorFactor) {
      color = pbrData.baseColorFactor;
      // Convert from linear space to sRGB space
      material.diffuse.set(
        Math.pow(color[0], 1 / 2.2),
        Math.pow(color[1], 1 / 2.2),
        Math.pow(color[2], 1 / 2.2),
      );
      material.opacity = color[3];
    } else {
      material.diffuse.set(1, 1, 1);
      material.opacity = 1;
    }
    if (pbrData.baseColorTexture) {
      const baseColorTexture = pbrData.baseColorTexture;
      const texture = textures[baseColorTexture.index];
      material.diffuseMap = texture;
      material.diffuseMapChannel = "rgb";
      material.opacityMap = texture;
      material.opacityMapChannel = "a";
      if (baseColorTexture.texCoord) {
        material.diffuseMapUv = baseColorTexture.texCoord;
        material.opacityMapUv = baseColorTexture.texCoord;
      }
      if (
        baseColorTexture.extensions &&
        baseColorTexture.extensions["KHR_texture_transform"]
      ) {
        const baseColorTransformData =
          baseColorTexture.extensions.KHR_texture_transform;
        if (baseColorTransformData.scale) {
          material.diffuseMapTiling = new pc.Vec2(
            baseColorTransformData.scale[0],
            baseColorTransformData.scale[1],
          );
          material.opacityMapTiling = new pc.Vec2(
            baseColorTransformData.scale[0],
            baseColorTransformData.scale[1],
          );
        }
        if (baseColorTransformData.offset) {
          material.diffuseMapOffset = new pc.Vec2(
            baseColorTransformData.offset[0],
            baseColorTransformData.offset[1],
          );
          material.opacityMapOffset = new pc.Vec2(
            baseColorTransformData.offset[0],
            baseColorTransformData.offset[1],
          );
        }
      }
    }

    material.useMetalness = true;
    if (pbrData.metallicFactor) {
      material.metalness = pbrData.metallicFactor;
    } else {
      material.metalness = 1;
    }

    if (pbrData.roughnessFactor) {
      material.shininess = 100 * pbrData.roughnessFactor;
    } else {
      material.shininess = 100;
    }

    if (pbrData.metallicRoughnessTexture) {
      const metallicRoughnessTexture = pbrData.metallicRoughnessTexture;
      material.metalnessMap = textures[metallicRoughnessTexture.index];
      material.metalnessMapChannel = "b";
      material.glossMap = textures[metallicRoughnessTexture.index];
      material.glossMapChannel = "g";

      if (metallicRoughnessTexture.texCoord) {
        material.glossMapUv = metallicRoughnessTexture.texCoord;
        material.metalnessMapUv = metallicRoughnessTexture.texCoord;
      }

      if (
        metallicRoughnessTexture.extensions &&
        metallicRoughnessTexture.extensions["KHR_texture_transform"]
      ) {
        const metallicTransformData =
          metallicRoughnessTexture.extensions.KHR_texture_transform;
        if (metallicTransformData.scale) {
          material.glossMapTiling = new pc.Vec2(
            metallicTransformData.scale[0],
            metallicTransformData.scale[1],
          );
          material.metalnessMapTiling = new pc.Vec2(
            metallicTransformData.scale[0],
            metallicTransformData.scale[1],
          );
        }
        if (metallicTransformData.offset) {
          material.glossMapOffset = new pc.Vec2(
            metallicTransformData.offset[0],
            metallicTransformData.offset[1],
          );
          material.metalnessMapOffset = new pc.Vec2(
            metallicTransformData.offset[0],
            metallicTransformData.offset[1],
          );
        }
      }
    }

    material.chunks.glossPS = glossChunk;
  }

  if (data.normalTexture) {
    const normalTexture = data.normalTexture;
    material.normalMap = textures[normalTexture.index];
    if (normalTexture.texCoord) {
      material.normalMapUv = normalTexture.texCoord;
    }
    if (
      normalTexture.extensions &&
      normalTexture.extensions["KHR_texture_transform"]
    ) {
      const normalTransformData =
        normalTexture.extensions.KHR_texture_transform;
      if (normalTransformData.scale) {
        material.normalMapTiling = new pc.Vec2(
          normalTransformData.scale[0],
          normalTransformData.scale[1],
        );
      }
      if (normalTransformData.offset) {
        material.normalMapOffset = new pc.Vec2(
          normalTransformData.offset[0],
          normalTransformData.offset[1],
        );
      }
    }
    if (normalTexture.scale) {
      material.bumpiness = normalTexture.scale;
    }
  }
  if (data.occlusionTexture) {
    const occlusionTexture = data.occlusionTexture;
    material.aoMap = textures[occlusionTexture.index];
    material.aoMapChannel = "r";
    if (occlusionTexture.texCoord) {
      material.aoMapUv = occlusionTexture.texCoord;
    }
    if (
      occlusionTexture.extensions &&
      occlusionTexture.extensions["KHR_texture_transform"]
    ) {
      const occlusionTransformData =
        occlusionTexture.extensions.KHR_texture_transform;
      if (occlusionTransformData.scale) {
        material.aoMapTiling = new pc.Vec2(
          occlusionTransformData.scale[0],
          occlusionTransformData.scale[1],
        );
      }
      if (occlusionTransformData.offset) {
        material.aoMapOffset = new pc.Vec2(
          occlusionTransformData.offset[0],
          occlusionTransformData.offset[1],
        );
      }
    }
    // TODO: support 'strength'
  }
  if (data.emissiveFactor) {
    color = data.emissiveFactor;
    // Convert from linear space to sRGB space
    material.emissive.set(
      Math.pow(color[0], 1 / 2.2),
      Math.pow(color[1], 1 / 2.2),
      Math.pow(color[2], 1 / 2.2),
    );
    material.emissiveTint = true;
  } else {
    material.emissive.set(0, 0, 0);
    material.emissiveTint = false;
  }
  if (data.emissiveTexture) {
    const emissiveTexture = data.emissiveTexture;
    material.emissiveMap = textures[emissiveTexture.index];
    if (emissiveTexture.texCoord) {
      material.emissiveMapUv = emissiveTexture.texCoord;
    }
    if (
      emissiveTexture.extensions &&
      emissiveTexture.extensions["KHR_texture_transform"]
    ) {
      const emissiveTransformData =
        emissiveTexture.extensions.KHR_texture_transform;
      if (emissiveTransformData.scale) {
        material.emissiveMapTiling = new pc.Vec2(
          emissiveTransformData.scale[0],
          emissiveTransformData.scale[1],
        );
      }
      if (emissiveTransformData.offset) {
        material.emissiveMapOffset = new pc.Vec2(
          emissiveTransformData.offset[0],
          emissiveTransformData.offset[1],
        );
      }
    }
  }
  if (data.alphaMode) {
    switch (data.alphaMode) {
      case "MASK":
        material.blendType = pc.BLEND_NONE;
        if (data.alphaCutoff) {
          material.alphaTest = data.alphaCutoff;
        } else {
          material.alphaTest = 0.5;
        }
        break;
      case "BLEND":
        material.blendType = pc.BLEND_NORMAL;
        break;
      default:
      case "OPAQUE":
        material.blendType = pc.BLEND_NONE;
        break;
    }
  } else {
    material.blendType = pc.BLEND_NONE;
  }
  if (data.doubleSided) {
    material.twoSidedLighting = data.doubleSided;
    material.cull = data.doubleSided ? pc.CULLFACE_NONE : pc.CULLFACE_BACK;
  } else {
    material.twoSidedLighting = false;
    material.cull = pc.CULLFACE_BACK;
  }

  // if (data.extras && processMaterialExtras) {
  //   processMaterialExtras(material, data.extras);
  // }

  material.update();

  return material;
}
