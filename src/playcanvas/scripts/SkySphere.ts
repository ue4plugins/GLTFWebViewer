import * as pc from "@animech-public/playcanvas";

declare module "@animech-public/playcanvas" {
  interface ScriptComponent {
    SkySphere?: SkySphere;
  }
}

type TextureAsset = Omit<pc.Asset, "resource"> & { resource: pc.Texture };
type ModelAsset = Omit<pc.Asset, "resource"> & { resource: pc.Model };
type EntityWithModel = pc.Entity & { model: pc.ModelComponent };

/**
 * Typings for PlayCanvas script-attributes attached to the class.
 */
interface SkySphere {
  skySphereModel?: ModelAsset | null;
  skyTexture?: TextureAsset | null;
  cloudsTexture?: TextureAsset | null;
  starsTexture?: TextureAsset | null;

  directionalLight?: pc.Entity | null;

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

  zenithColor: pc.Color;
  horizonColor: pc.Color;
  cloudColor: pc.Color;
  overallColor: pc.Color;

  zenithColorCurve: pc.CurveSet;
  horizonColorCurve: pc.CurveSet;
  cloudColorCurve: pc.CurveSet;

  scale: pc.Vec3;
}

const skySphereScriptName = "SkySphere";

class SkySphere extends pc.ScriptType {
  private static _skyboxWasInitiallyEnabled = false;
  private static _instanceCount = 0;

  private _skyEntity!: EntityWithModel;
  private _material = new pc.Material();
  private _lightComponent?: pc.LightComponent | null;

  private _time = 0;

  private _defaultHorizonSunColor = new pc.Color(1, 0.221, 0.04);
  private _defaultZenithSunColor = new pc.Color(0.954, 0.901, 0.74412);

  private _entityRotation = new pc.Quat();
  private _lightDir = new pc.Vec3();

  private _tempColor = new pc.Color();
  private _tempQuat = new pc.Quat();

  public initialize() {
    SkySphere._instanceCount += 1;

    this._skyEntity = new pc.Entity("Sky") as EntityWithModel;
    this._skyEntity.tags.add("ignoreBoundingBox");
    this._skyEntity.addComponent("model");
    this.entity.addChild(this._skyEntity);

    this._initializeMaterial();
    this._cacheLightComponent();
    this._updateModel();
    this._updateTextures();
    this._updateSettings();
    this._updateColors();
    this._updateSun();

    this.on("attr:skySphereModel", this._updateModel, this);
    this.on("attr:scale", this._updateSkySphereSize, this);
    this.on("attr:skyTexture", this._updateTextures, this);
    this.on("attr:cloudsTexture", this._updateTextures, this);
    this.on("attr:starsTexture", this._updateTextures, this);
    this.on("attr:directionalLight", this._cacheLightComponent, this);
    this.on("attr:sunBrightness", this._updateSettings, this);
    this.on("attr:starsBrightness", this._updateSettings, this);
    this.on("attr:cloudSpeed", this._updateSettings, this);
    this.on("attr:cloudOpacity", this._updateSettings, this);
    this.on("attr:horizonFalloff", this._updateColors, this);
    this.on("attr:sunRadius", this._updateSettings, this);
    this.on("attr:noisePower1", this._updateSettings, this);
    this.on("attr:noisePower2", this._updateSettings, this);
    this.on("attr:zenithColor", this._updateColors, this);
    this.on("attr:horizonColor", this._updateColors, this);
    this.on("attr:cloudColor", this._updateColors, this);
    this.on("attr:overallColor", this._updateColors, this);
    this.on("attr:zenithColorCurve", this._updateColors, this);
    this.on("attr:horizonColorCurve", this._updateColors, this);
    this.on("attr:cloudColorCurve", this._updateColors, this);
    this.on("attr:colorsDeterminedBySunPosition", this._updateColors, this);

    // Ensure that the skybox is disabled while a SkySphere instance exists in the scene
    const layers = this.app.scene.layers;
    const skyboxLayer = layers.getLayerById(pc.LAYERID_SKYBOX);

    if (SkySphere._instanceCount === 1 && skyboxLayer) {
      SkySphere._skyboxWasInitiallyEnabled = skyboxLayer.enabled;
      skyboxLayer.enabled = false;
    }

    this.on("destroy", () => {
      SkySphere._instanceCount -= 1;

      if (SkySphere._instanceCount === 0 && skyboxLayer) {
        skyboxLayer.enabled = SkySphere._skyboxWasInitiallyEnabled;
      }
    });
  }

  public postUpdate(dt: number) {
    this._time += dt;
    this._material.setParameter("uTime", this._time);

    this._restrictSkyRotation();
    this._updateSun();
  }

  private _restrictSkyRotation() {
    // Keep the sky oriented in the same direction regardless of entity rotation
    const entityRotation = this.entity.getRotation();

    if (!entityRotation.equals(this._entityRotation)) {
      this._entityRotation.copy(entityRotation);
      this._skyEntity.setRotation(pc.Quat.IDENTITY);
    }
  }

  private _cacheLightComponent() {
    this._lightComponent = this.directionalLight?.findComponent(
      "light",
    ) as pc.LightComponent | null;
  }

  private _updateModel() {
    const modelAsset = this.skySphereModel;
    const modelComponent = this._skyEntity.model;
    const material = this._material;

    if (modelAsset) {
      const model = modelAsset.resource.clone();

      modelComponent.model = model;
      model.meshInstances.forEach(instance => (instance.material = material));
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      modelComponent.model = null as any;
    }

    this._updateSkySphereSize();
  }

  private _updateSkySphereSize() {
    this._skyEntity.setLocalScale(this.scale);

    let objectRadius = 0;

    const modelComponent = this._skyEntity.model;
    if (modelComponent?.model) {
      objectRadius = this._calculateModelSphereRadius(
        modelComponent.model,
        this.scale,
      );
    }

    this._material.setParameter("uObjectRadius", objectRadius);
  }

  private _updateTextures() {
    this._setTextureParameter("uSkyMap", this.skyTexture);
    this._setTextureParameter("uCloudsMap", this.cloudsTexture);
    this._setTextureParameter("uStarsMap", this.starsTexture);
  }

  private _updateSettings() {
    const material = this._material;
    material.setParameter("uCloudSpeed", this.cloudSpeed);
    material.setParameter("uNoisePower1", this.noisePower1);
    material.setParameter("uNoisePower2", this.noisePower2);
    material.setParameter("uSunRadius", this.sunRadius);
    material.setParameter("uCloudOpacity", this.cloudOpacity);
    material.setParameter("uStarsBrightness", this.starsBrightness);
    material.setParameter("uSunBrightness", this.sunBrightness);
  }

  private _updateColors() {
    const material = this._material;

    if (this.colorsDeterminedBySunPosition) {
      const sunHeight = pc.math.clamp(this.sunHeight, -1, 1);

      material.setParameter(
        "uHorizonColor",
        this.horizonColorCurve.value(sunHeight),
      );

      material.setParameter(
        "uZenithColor",
        this.zenithColorCurve.value(sunHeight),
      );

      material.setParameter(
        "uCloudColor",
        this.cloudColorCurve.value(sunHeight),
      );

      material.setParameter(
        "uHorizonFalloff",
        pc.math.lerp(3, 7, Math.abs(sunHeight)),
      );
    } else {
      this._setVectorParameter("uCloudColor", this.cloudColor);
      this._setVectorParameter("uHorizonColor", this.horizonColor);
      this._setVectorParameter("uZenithColor", this.zenithColor);
      material.setParameter("uHorizonFalloff", this.horizonFalloff);
    }

    this._setVectorParameter("uOverallColor", this.overallColor);
  }

  private _updateSun() {
    const lightComponent = this._lightComponent;
    const lightDir = this._lightDir;
    const sunColor = this._tempColor;
    const tempQuat = this._tempQuat;

    if (lightComponent) {
      const { color, entity } = lightComponent;

      entity.getRotation().transformVector(pc.Vec3.DOWN, lightDir);
      sunColor.set(color.r, color.g, color.b);

      this.sunHeight = (Math.asin(-lightDir.y) * 180) / Math.PI / 90;
    } else {
      this.entity.getRotation().transformVector(pc.Vec3.FORWARD, lightDir);

      const pitch = -pc.math.clamp(this.sunHeight, -1, 1) * 90;
      const yaw = Math.atan2(-lightDir.x, -lightDir.z) * pc.math.RAD_TO_DEG;

      tempQuat.setFromEulerAngles(pitch, yaw, 0);
      tempQuat.transformVector(pc.Vec3.FORWARD, lightDir);

      const horizonColor = this._defaultHorizonSunColor;
      const zenithColor = this._defaultZenithSunColor;
      const alpha = pc.math.clamp(this.sunHeight + 0.2, 0, 1);

      sunColor.lerp(horizonColor, zenithColor, alpha);
    }

    this._setVectorParameter("uLightDirection", lightDir);
    this._setVectorParameter("uSunColor", sunColor);
    this._material.setParameter(
      "uSunHeight",
      Math.abs(Math.min(this.sunHeight, 0)),
    );

    if (this.colorsDeterminedBySunPosition) {
      this._updateColors();
    }
  }

  private _setTextureParameter(
    parameter: string,
    value: TextureAsset | null | undefined,
  ) {
    const material = this._material;
    const texture = value?.resource;

    if (texture) {
      material.setParameter(parameter, texture);
    } else {
      material.deleteParameter(parameter);
    }
  }

  private _setVectorParameter(
    parameter: string,
    value: pc.Vec3 | pc.Color | number[],
  ) {
    const material = this._material;

    if (value instanceof pc.Vec3) {
      material.setParameter(parameter, [value.x, value.y, value.z]);
    } else if (value instanceof pc.Color) {
      material.setParameter(parameter, [value.r, value.g, value.b]);
    } else {
      material.setParameter(parameter, value);
    }
  }

  private _calculateModelSphereRadius(
    model: pc.Model | null | undefined,
    baseScale: pc.Vec3,
  ): number {
    if (!model) {
      return 0;
    }

    const meshInstances = model.meshInstances;
    if (!meshInstances || meshInstances.length < 1) {
      return 0;
    }

    const boundingBox = new pc.BoundingBox();

    // Find center of the meshes using a normal bounding-box
    boundingBox.copy(meshInstances[0].aabb);
    meshInstances
      .slice(1)
      .forEach(meshInstance => boundingBox.add(meshInstance.aabb));

    const positions: number[] = [];
    const tmpVec1 = new pc.Vec3();
    const tmpVec2 = new pc.Vec3();
    let radiusSquared = 0;

    // Calculate the sphere radius using the distance of each vertex from the center
    meshInstances.forEach(meshInstance => {
      const vertexCount = meshInstance.mesh.getPositions(positions);

      for (let idx = 0; idx < vertexCount; idx += 3) {
        tmpVec1.set(
          positions[idx * 3 + 0],
          positions[idx * 3 + 1],
          positions[idx * 3 + 2],
        );

        tmpVec2.sub2(tmpVec1, boundingBox.center);
        radiusSquared = Math.max(radiusSquared, tmpVec2.lengthSq());
      }
    });

    return (
      Math.max(baseScale.x, Math.max(baseScale.y, baseScale.z)) *
      Math.sqrt(radiusSquared)
    );
  }

  private _initializeMaterial() {
    const graphicsDevice = this.app.graphicsDevice;
    const precision = graphicsDevice.precision;
    const vertexCode = this._getVertexShaderCode();
    const fragmentCode = this._getFragmentShaderCode();

    const shader = new pc.Shader(graphicsDevice, {
      attributes: {
        aPosition: pc.SEMANTIC_POSITION,
        aUv0: pc.SEMANTIC_TEXCOORD0,
        aUv1: pc.SEMANTIC_TEXCOORD1,
      },
      vshader: vertexCode,
      fshader: `precision ${precision} float;\n ${fragmentCode}`,
    });

    this._material.shader = shader;
  }

  private _getVertexShaderCode(): string {
    return `
      attribute vec4 aPosition;
      attribute vec2 aUv0;
      attribute vec2 aUv1;
      
      uniform mat4 matrix_model;
      uniform mat4 matrix_viewProjection;

      varying vec3 vWorldObjectPosition;
      varying vec3 vWorldPosition;
      varying vec2 vUv0;
      varying vec2 vUv1;
      
      void main(void)
      {
        vec4 worldObjectPosition = matrix_model * vec4(0.0, 0.0, 0.0, 1.0);
        vec4 worldPosition = matrix_model * aPosition;

        vWorldObjectPosition = worldObjectPosition.xyz;
        vWorldPosition = worldPosition.xyz;
        vUv0 = aUv0;
        vUv1 = aUv1;

        gl_Position = matrix_viewProjection * worldPosition;
      }
    `;
  }

  private _getFragmentShaderCode(): string {
    // TODO: Do we need support for HDR / RGBM for the different textures?

    // TODO: Do we need to tonemap the output color?

    const scene = this.app.scene;
    const programlib = pc.programlib;

    let shaderCode = "";

    shaderCode += programlib.gammaCode(scene.gammaCorrection);
    shaderCode += programlib.tonemapCode(scene.toneMapping);

    shaderCode += `
      uniform vec3 view_position;
      uniform vec3 uLightDirection;
      uniform float uObjectRadius;

      uniform sampler2D uSkyMap;
      uniform sampler2D uCloudsMap;
      uniform sampler2D uStarsMap;

      uniform float uCloudSpeed;
      uniform float uNoisePower1;
      uniform float uNoisePower2;
      uniform float uHorizonFalloff;
      uniform float uSunRadius;
      uniform float uCloudOpacity;
      uniform float uStarsBrightness;
      uniform float uSunBrightness;
      uniform float uSunHeight;
      uniform float uTime;

      uniform vec3 uCloudColor;
      uniform vec3 uOverallColor;
      uniform vec3 uHorizonColor;
      uniform vec3 uZenithColor;
      uniform vec3 uSunColor;

      varying vec3 vWorldObjectPosition;
      varying vec3 vWorldPosition;
      varying vec2 vUv0;
      varying vec2 vUv1;

      struct HorizonDistribution
      {
        float cloudAlpha;
        float horizonAlpha;
      };

      struct CloudTextures
      {
        float base;
        float exp;
      };

      struct SkyColors
      {
        vec3 color;
      };

      struct SunVector
      {
        float sunDotProduct;
      };

      struct Sun
      {
        vec3 color;
      };

      struct RimLight
      {
        vec3 color;
        float rimLightAlpha;
      };

      float saturate(float source)
      {
        return clamp(source, 0.0, 1.0);
      }

      float sphereMask(float a, float b, float radius, float hardness)
      {
        float invRadius = 1.0 / max(radius, 0.00001);
        float invHardness = 1.0 / max(1.0 - hardness, 0.00001);

        float normalizeDistance = abs(a - b) * invRadius;
        float negNormalizedDistance = 1.0 - normalizeDistance;
        float maskUnclamped = negNormalizedDistance * invHardness;

        return saturate(maskUnclamped);
      }

      void evalHorizonDistribution(vec3 cameraVector, out HorizonDistribution results)
      {
        results.cloudAlpha = saturate(dot(cameraVector, vec3(0.0, -1.0, 0.0)));
        results.horizonAlpha = saturate(pow((1.0 - results.cloudAlpha), uHorizonFalloff));
      }

      void evalCloudTextures(in HorizonDistribution horizonDistribution, out CloudTextures results)
      {
        float time = uTime * uCloudSpeed;
        vec3 position = (vWorldPosition - vWorldObjectPosition) / (uObjectRadius * -0.1);

        vec2 skyUv = vUv0 + vec2(time * 0.0002, 0.0);
        vec2 cloudUv = vUv0 + vec2(time * 0.001, 0.0);

        float skySample = gammaCorrectInput(texture2D(uSkyMap, skyUv)).r;
        float cloudSample = gammaCorrectInput(texture2D(uCloudsMap, cloudUv)).r;
        float mixedSample = mix(skySample, cloudSample, horizonDistribution.cloudAlpha);
        
        float heightAlpha = (1.0 - saturate(position.y)) * uCloudOpacity;
        vec2 noiseUv = vec2(1.0) - ((vec2(1.0) - vUv0) * 0.5); // TODO: Find out why we need this inversion when scaling to match Unreal
        float noiseAlpha = gammaCorrectInput(texture2D(uCloudsMap, noiseUv)).r;

        results.base = mix(0.0, mixedSample, heightAlpha);
        results.exp = mix(uNoisePower1, uNoisePower2, noiseAlpha);
      }

      void evalSkyColors(in HorizonDistribution horizonDistribution, out SkyColors results)
      {
        vec3 starsSample = gammaCorrectInput(texture2D(uStarsMap, vUv1 * 12.0)).rgb;
        vec3 starsColor = starsSample * uStarsBrightness * uSunHeight + uZenithColor;

        results.color = mix(starsColor, uHorizonColor, horizonDistribution.horizonAlpha);
      }

      void evalSunVector(vec3 cameraVector, vec3 lightDirection, out SunVector results)
      {
        results.sunDotProduct = dot(lightDirection, cameraVector);
      }

      void evalSun(in SunVector sunVector, out Sun results)
      {
        float sunSphereMask = sphereMask(sunVector.sunDotProduct, 1.0, uSunRadius, 0.0);
        
        results.color = uSunColor * uSunBrightness * sunSphereMask;
      }

      void evalRimLight(in CloudTextures cloudTextures, in SunVector sunVector, out RimLight results)
      {
        float cloudStrength = pow(cloudTextures.base, cloudTextures.exp);
        float cloudStrengthSq = cloudStrength * cloudStrength;

        float sphereMask = sphereMask(sunVector.sunDotProduct, 1.0, 1.3, 0.0);

        vec3 cloudColor = uCloudColor * cloudStrength;
        vec3 rimColor = uSunColor * saturate(pow(sphereMask, 10.0)) * cloudStrengthSq * 0.4;

        results.color = cloudColor + rimColor;
        results.rimLightAlpha = saturate(cloudStrengthSq);
      }

      void main(void)
      {
        Sun sun;
        RimLight rimLight;
        SunVector sunVector;
        SkyColors skyColors;
        CloudTextures cloudTextures;
        HorizonDistribution horizonDistribution;

        vec3 lightDir = normalize(uLightDirection);
        vec3 viewDir = normalize(vWorldPosition - view_position);
        vec3 cameraVector = -viewDir;
        
        evalHorizonDistribution(cameraVector, horizonDistribution);
        evalSkyColors(horizonDistribution, skyColors);
        evalCloudTextures(horizonDistribution, cloudTextures);
        evalSunVector(cameraVector, lightDir, sunVector);
        evalSun(sunVector, sun);
        evalRimLight(cloudTextures, sunVector, rimLight);

        vec3 outputColor = mix(sun.color + skyColors.color, rimLight.color, rimLight.rimLightAlpha);
        outputColor *= uOverallColor;
        outputColor *= 1.5;

        outputColor = toneMap(outputColor);
        outputColor = gammaCorrectOutput(outputColor);

        gl_FragColor = vec4(outputColor, 1.0);
      }
    `;

    return shaderCode;
  }
}

SkySphere.attributes.add("skySphereModel", {
  type: "asset",
  assetType: "model",
  title: "Sky-sphere model",
});

SkySphere.attributes.add("skyTexture", {
  type: "asset",
  assetType: "texture",
  title: "Sky texture",
});

SkySphere.attributes.add("cloudsTexture", {
  type: "asset",
  assetType: "texture",
  title: "Clouds texture",
});

SkySphere.attributes.add("starsTexture", {
  type: "asset",
  assetType: "texture",
  title: "Stars texture",
});

SkySphere.attributes.add("directionalLight", {
  type: "entity",
  title:
    "Assign your scenes's directional light entity to this variable to  match the sky's sun position and color",
});

SkySphere.attributes.add("sunHeight", {
  type: "number",
  default: 0,
  title:
    "If no directional light is assigned, this value determines the height of the sun",
});

SkySphere.attributes.add("sunBrightness", {
  type: "number",
  default: 50,
  title: "Brightness multiplier for the sun disk",
});

SkySphere.attributes.add("starsBrightness", {
  type: "number",
  default: 0.1,
  title:
    "Multiplier for the brightness of the stars when the sun is below the horizon",
});

SkySphere.attributes.add("cloudSpeed", {
  type: "number",
  default: 1,
  title: "Panning speed for the clouds",
});

SkySphere.attributes.add("cloudOpacity", {
  type: "number",
  default: 0.7,
  title: "Opacity of the panning clouds",
});

SkySphere.attributes.add("horizonFalloff", {
  type: "number",
  default: 3,
  title: "Affects the size of the gradient from zenith color to horizon color",
});

SkySphere.attributes.add("sunRadius", {
  type: "number",
  default: 0.0003,
  title: "Size of the sun disc",
});

SkySphere.attributes.add("noisePower1", {
  type: "number",
  default: 1,
  title: "Cloud noise 1",
});

SkySphere.attributes.add("noisePower2", {
  type: "number",
  default: 4,
  title: "Cloud noise 2",
});

SkySphere.attributes.add("colorsDeterminedBySunPosition", {
  type: "boolean",
  default: true,
  title: "If enabled, sky colors will change according to the sun's position",
});

SkySphere.attributes.add("zenithColor", {
  type: "vec3",
  default: [0.034046, 0.109247, 0.295],
  title: "Zenith color (HDR)",
});

SkySphere.attributes.add("horizonColor", {
  type: "rgb",
  default: [1.979559, 2.586644, 3],
  title: "Horizon color (HDR)",
});

SkySphere.attributes.add("cloudColor", {
  type: "rgb",
  default: [0.855778, 0.91902, 1],
  title: "Cloud color (HDR)",
});

SkySphere.attributes.add("overallColor", {
  type: "rgb",
  default: [1, 1, 1],
  title: "Overall color (HDR)",
});

SkySphere.attributes.add("zenithColorCurve", {
  type: "curve",
  color: "rgb",
  default: {
    keys: [
      [-1, 0, -0.4, 0.08, 0, 0.23, 0.1, 0.27, 0.2, 0.08, 0.3, 0.05, 0.5, 0.02],
      [-1, 0, -0.4, 0.07, 0, 0.1, 0.1, 0.15, 0.2, 0.13, 0.3, 0.09, 0.5, 0.05],
      [-1, 0, -0.4, 0.08, 0, 0.09, 0.1, 0.13, 0.2, 0.19, 0.3, 0.21, 0.5, 0.12],
    ],
  },
  title: "Zenith color curve. The keys (time) correspond to sunHeight values",
});

SkySphere.attributes.add("horizonColorCurve", {
  type: "curve",
  color: "rgb",
  default: {
    keys: [
      [-1, 0.048, -0.6, 0.386, 0, 2, 0.2, 1.943, 0.4, 0.703, 0.5, 0.92],
      [-1, 0.052, -0.6, 0.131, 0, 0.6, 0.2, 0.613, 0.4, 1.048, 0.5, 1.322],
      [-1, 0.075, -0.6, 0.111, 0, 0.2, 0.2, 0.283, 0.4, 1.669, 0.5, 2],
    ],
  },
  title: "Horizon color curve. The keys (time) correspond to sunHeight values",
});

SkySphere.attributes.add("cloudColorCurve", {
  type: "curve",
  color: "rgb",
  default: {
    keys: [
      [-0.8, 0.054, -0.5, 0.198, -0.2, 0.684, 0.2, 0.81, 0.4, 0.857, 0.8, 0.93],
      [-0.8, 0.059, -0.5, 0.139, -0.2, 0.415, 0.2, 0.514, 0.4, 0.81, 0.8, 0.95],
      [-0.8, 0.065, -0.5, 0.129, -0.2, 0.304, 0.2, 0.407, 0.4, 0.806, 0.8, 1],
    ],
  },
  title: "Cloud color curve. The keys (time) correspond to sunHeight values",
});

SkySphere.attributes.add("scale", {
  type: "vec3",
  default: [1, 1, 1],
  title: "Sky Sphere scale",
});

export { skySphereScriptName, SkySphere };
