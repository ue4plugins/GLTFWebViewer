import * as pc from "@animech-public/playcanvas";

type HdriBackdropEntity = pc.Entity & {
  model: pc.ModelComponent;
};

export class HdriBackdrop extends pc.ScriptType {
  /**
   * Assign an imported HDR cubemap that will be projected on the ground & backdrop.
   */
  public cubemap!: pc.Texture;

  /**
   * Specify a model to use as a backdrop.
   */
  public model!: pc.Model;

  /**
   * The size of the model used to project the HDR cubemap (Meters).
   * The supplied model will be scaled to match the size as closely as possible.
   */
  public size = 150;

  /**
   * Emissivity of the backdrop.
   * Higher values will results brighter ambient lighting sampled from the HDR cubemap (cd/m2).
   */
  public intensity = 1;

  /**
   * Specify the ground area that will be affected by lighting and shadows.
   * Lit area will have slightly different shading depending on the Intensity and other lighting parameters in the scene.
   */
  public lightingDistanceFactor = 0.5;

  /**
   * Defines the projection point of the HDR cubemap.
   * Note that the position is relative to the position of the entity this script belongs to.
   */
  public projectionCenter = new pc.Vec3(0, 1.7, 0);

  /**
   * Disables ground tracking, making the HDR cubemap follow the camera.
   */
  public useCameraProjection = false;

  private _material = new pc.Material();
  private _worldProjectionCenter = new pc.Vec3();
  private _mapRotationMatrix = new pc.Mat4();

  public initialize() {
    if (!this.cubemap?.cubemap) {
      throw new Error("Missing or invalid cubemap");
    }

    if (!this.model) {
      throw new Error("Missing model");
    }

    // Ignore the backdrop-model in other scripts when calculating the bounding-box of an entity
    this.entity.tags.add("ignoreBoundingBox");

    this.entity.addComponent("model");

    this._initializeMaterial();
    this._setActiveModel(this.model);
    this._setScaleBasedOnActiveModel();

    // TODO: Fix rotation of entity to only be around the Y-axis

    // TODO: Recapture sky(?)

    // TODO: Allow the model to be switched after creation?
  }

  public postUpdate() {
    this._restrictCurrentRotationToY();
    this._updateMaterialUniforms();
  }

  private _setScaleBasedOnActiveModel() {
    // Calculate and apply the scale needed to make the model as large as this.size
    const radius = this._calculateModelRadius(this.model);
    const scale = this.size / (radius * 2);

    this.entity.setLocalScale(scale, scale, scale);
  }

  private _calculateModelRadius(model: pc.Model): number {
    const boundingBox = new pc.BoundingBox();
    const meshInstances = model.meshInstances;

    if (meshInstances.length > 0) {
      boundingBox.copy(meshInstances[0].aabb);
      meshInstances
        .slice(1)
        .forEach(meshInstance => boundingBox.add(meshInstance.aabb));
    }

    return boundingBox.halfExtents.length();
  }

  private _restrictCurrentRotationToY() {
    // TODO: Should we optimize or cache this since it's performed per frame?

    const rotation = this.entity.getRotation();
    const yaw = rotation.getAxisAngle(pc.Vec3.UP);

    rotation.setFromAxisAngle(pc.Vec3.UP, yaw);
  }

  private _updateMaterialUniforms() {
    // TODO: Cache values and only recalculate when needed

    const uHdriMap = this.cubemap;
    const uIntensity = this.intensity;
    const uLightingDistance = this._calculateLightingDistanceUniform();
    const uProjectionCenter = this._calculateProjectionCenterUniform();
    const uMapRotationMatrix = this._calculateMapRotationMatrixUniform();

    const material = this._material;

    material.setParameter("uHdriMap", uHdriMap);
    material.setParameter("uIntensity", uIntensity);
    material.setParameter("uLightingDistance", uLightingDistance);
    material.setParameter("uProjectionCenter", uProjectionCenter);
    material.setParameter("uMapRotationMatrix", uMapRotationMatrix);
  }

  private _calculateLightingDistanceUniform(): number {
    // TODO: Verify that the last constant isn't just a conversion to UE centimeters
    return this.size * this.lightingDistanceFactor * 100.0;
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

  private _setActiveModel(model?: pc.Model | null) {
    const entity = this.entity as HdriBackdropEntity;
    const modelComponent = entity.model;

    if (model) {
      modelComponent.model = model.clone();
      modelComponent.meshInstances.forEach(
        meshInstance => (meshInstance.material = this._material),
      );
    } else {
      modelComponent.model = null as any;
    }
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
