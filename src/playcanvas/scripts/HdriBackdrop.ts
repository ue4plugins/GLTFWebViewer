import * as pc from "@animech-public/playcanvas";

type CubemapAsset = Omit<pc.Asset, "resource"> & { resource: pc.Texture };
type ModelAsset = Omit<pc.Asset, "resource"> & { resource: pc.Model };

interface HdriBackdrop {
  /**
   * Typings for Playcanvas script-attributes attached to the class.
   */
  cubemap?: CubemapAsset | null;
  model?: ModelAsset | null;
  size: number;
  intensity: number;
  projectionCenter: pc.Vec3;
  lightingDistanceFactor: number;
  useCameraProjection: boolean;

  entity: pc.Entity & {
    model: pc.ModelComponent;
  };
}

class HdriBackdrop extends pc.ScriptType {
  private _material = new pc.Material();
  private _worldProjectionCenter = new pc.Vec3();
  private _mapRotationMatrix = new pc.Mat4();

  public initialize() {
    this.entity.tags.add("ignoreBoundingBox");
    this.entity.addComponent("model");

    this._initializeMaterial();
    this._updateModel();
    this._updateCubemapUniform();
    this._updateIntensityUniform();
    this._updateLightingDistanceUniform();
    this._updateTransformRelatedUniforms();

    // TODO: Recapture sky(?)
    // TODO: Allow the model to be switched after creation?

    this.on("attr:cubemap", this._updateCubemapUniform, this);
    this.on("attr:model", this._updateModel, this);
    this.on("attr:size", this._updateLightingDistanceUniform, this);
    this.on("attr:size", this._updateEntityScale, this);
    this.on("attr:intensity", this._updateIntensityUniform, this);
    this.on(
      "attr:lightingDistanceFactor",
      this._updateLightingDistanceUniform,
      this,
    );
  }

  public postUpdate() {
    this._restrictCurrentRotationToY();
    this._updateTransformRelatedUniforms();
  }

  private _updateModel() {
    const model = this.model;
    const entity = this.entity;
    const modelComponent = entity.model;

    if (model) {
      modelComponent.model = model.resource.clone();
      modelComponent.meshInstances.forEach(
        meshInstance => (meshInstance.material = this._material),
      );
    } else {
      modelComponent.model = null as any;
    }

    this._updateEntityScale();
  }

  private _updateCubemapUniform() {
    const material = this._material;
    const uHdriMap = this.cubemap?.resource;

    if (uHdriMap) {
      material.setParameter("uHdriMap", uHdriMap);
    } else {
      material.deleteParameter("uHdriMap");
    }
  }

  private _updateLightingDistanceUniform() {
    const material = this._material;
    // TODO: Verify that the last constant isn't just a conversion to UE centimeters
    const uLightingDistance = this.size * this.lightingDistanceFactor * 100.0;

    material.setParameter("uLightingDistance", uLightingDistance);
  }

  private _updateIntensityUniform() {
    const material = this._material;
    const uIntensity = this.intensity;

    material.setParameter("uIntensity", uIntensity);
  }

  private _updateTransformRelatedUniforms() {
    const material = this._material;

    const uProjectionCenter = this._calculateProjectionCenterUniform();
    const uMapRotationMatrix = this._calculateMapRotationMatrixUniform();

    material.setParameter("uProjectionCenter", uProjectionCenter);
    material.setParameter("uMapRotationMatrix", uMapRotationMatrix);
  }

  private _updateEntityScale() {
    const model = this.model;

    if (model) {
      // Calculate and apply the scale needed to make the model as large as this.size
      const boundingBox = new pc.BoundingBox();
      const meshInstances = model.resource.meshInstances;

      if (meshInstances.length > 0) {
        boundingBox.copy(meshInstances[0].aabb);
        meshInstances
          .slice(1)
          .forEach(meshInstance => boundingBox.add(meshInstance.aabb));
      }

      const radius = boundingBox.halfExtents.length();
      const scale = this.size / (radius * 2);

      this.entity.setLocalScale(scale, scale, scale);
    } else {
      this.entity.setLocalScale(1, 1, 1);
    }
  }

  private _restrictCurrentRotationToY() {
    // TODO: Should we optimize or cache this since it's performed per frame?

    const rotation = this.entity.getRotation();
    const yaw = rotation.getAxisAngle(pc.Vec3.UP);

    rotation.setFromAxisAngle(pc.Vec3.UP, yaw);
  }

  private _calculateProjectionCenterUniform(): number[] {
    const app = this.app;
    const worldProjectionCenter = this._worldProjectionCenter;

    if (this.useCameraProjection) {
      const cameras = app.systems.camera.cameras;
      const camera = cameras[cameras.length - 1];

      if (!camera) {
        throw new Error("No active camera found");
      }

      worldProjectionCenter.copy(camera.entity.getPosition());
    } else {
      const rotation = this.entity.getRotation();

      rotation.transformVector(this.projectionCenter, worldProjectionCenter);
      worldProjectionCenter.add(this.entity.getPosition());
    }

    return [
      worldProjectionCenter.x,
      worldProjectionCenter.y,
      worldProjectionCenter.z,
    ];
  }

  private _calculateMapRotationMatrixUniform(): number[] {
    const rotation = this.entity.getRotation();
    const yaw = rotation.getAxisAngle(pc.Vec3.UP);

    // TODO: Do we need to flip yaw to match the direction in UE?
    this._mapRotationMatrix.setFromAxisAngle(pc.Vec3.UP, yaw);

    return (this._mapRotationMatrix.data as unknown) as number[];
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
      },
      vshader: vertexCode,
      fshader: `precision ${precision} float;\n ${fragmentCode}`,
    });

    this._material.shader = shader;
  }

  private _getVertexShaderCode(): string {
    return `
      attribute vec4 aPosition;
      
      uniform mat4 matrix_model;
      uniform mat4 matrix_viewProjection;
      
      varying vec3 vWorldVertexPosition;
      
      void main(void)
      {
        vec4 worldVertexPosition = matrix_model * aPosition;
        vWorldVertexPosition = worldVertexPosition.xyz;
        gl_Position = matrix_viewProjection * worldVertexPosition;
      }
    `;
  }

  private _getFragmentShaderCode(): string {
    // TODO: Support HDR / LDR cubemaps in addition to RGBM?

    const scene = this.app.scene;
    const chunks = pc.shaderChunks;
    const programlib = pc.programlib;

    let shaderCode = "";

    shaderCode += programlib.gammaCode(scene.gammaCorrection);
    shaderCode += programlib.tonemapCode(scene.toneMapping);
    shaderCode += chunks.rgbmPS;

    shaderCode += `
      uniform samplerCube uHdriMap;
      uniform mat4        uMapRotationMatrix;
      uniform float       uIntensity;
      uniform vec3        uProjectionCenter;
      uniform float       uLightingDistance;
      
      varying vec3 vWorldVertexPosition;
      
      struct HdriAttributes
      {
        vec3 baseColor;
        float specular;
        vec3 emissiveColor;
      };
      
      float saturate(float source)
      {
        return clamp(source, 0.0, 1.0);
      }
            
      HdriAttributes createHdriAttributes(vec3 in_)
      {
        vec3 projectionDirection = normalize(vWorldVertexPosition - uProjectionCenter);
        vec3 sampleDirection =  (vec4(projectionDirection, 1.0) * uMapRotationMatrix).xyz;

        sampleDirection.x *= -1.0;  // Same flip in x is used by skybox.vert in the Playcanvas engine

        vec3 hdriMapRgb = textureCubeRGBM(uHdriMap, sampleDirection).xyz;
        vec3 poweredIn = pow(in_, vec3(4.0));
            
        HdriAttributes result;

        result.baseColor = hdriMapRgb * poweredIn * saturate(uIntensity);
        result.specular = 0.0;
        result.emissiveColor = hdriMapRgb * uIntensity * (vec3(1.0) - poweredIn);
        
        return result;
      }
      
      void main(void)
      {
        vec3 in_ = vec3(saturate((uLightingDistance - length(vWorldVertexPosition - uProjectionCenter)) / uLightingDistance));
            
        HdriAttributes hdriAttributes = createHdriAttributes(in_);

        vec3 color = hdriAttributes.baseColor + vec3(hdriAttributes.specular) + hdriAttributes.emissiveColor;

        color = toneMap(color);
        color = gammaCorrectOutput(color);
    
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    return shaderCode;
  }
}

HdriBackdrop.attributes.add("cubemap", {
  type: "asset",
  assetType: "cubemap",
  title: "Cubemap",
  description:
    "Assign an imported HDR cubemap that will be projected on the ground & backdrop.",
});

HdriBackdrop.attributes.add("model", {
  type: "asset",
  assetType: "model",
  title: "Model",
  description: "Specify a model to use as a backdrop.",
});

HdriBackdrop.attributes.add("size", {
  type: "number",
  default: 150.0,
  title: "Size",
  description:
    "The size of the model used to project the HDR cubemap (Meters). The supplied model will be scaled to match the size as closely as possible.",
});

HdriBackdrop.attributes.add("intensity", {
  type: "number",
  default: 1.0,
  title: "Intensity",
  description:
    "Emissivity of the backdrop. Higher values will results brighter ambient lighting sampled from the HDR cubemap (cd/m2).",
});

HdriBackdrop.attributes.add("projectionCenter", {
  type: "vec3",
  default: [0.0, 1.7, 0.0],
  title: "Projection Center",
  description:
    "Defines the projection point of the HDR cubemap. Note that the position is relative to the position of the entity this script belongs to.",
});

HdriBackdrop.attributes.add("lightingDistanceFactor", {
  type: "number",
  default: 0.5,
  title: "Lighting Distance Factor",
  description:
    "Specify the ground area that will be affected by lighting and shadows. Lit area will have slightly different shading depending on the Intensity and other lighting parameters in the scene.",
});

HdriBackdrop.attributes.add("useCameraProjection", {
  type: "boolean",
  default: false,
  title: "Use Camera Projection",
  description:
    "Disables ground tracking, making the HDR cubemap follow the camera.",
});

export { HdriBackdrop };
