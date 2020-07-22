/* eslint-disable @typescript-eslint/no-explicit-any */
type ExtensionData = any;
type ExtensionDataByName = { [extension: string]: ExtensionData };
type ObjectData = { extensions?: ExtensionDataByName };
type GltfData = any;
type ContainerAssetOptions = any;
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Function used by ExtensionRegistry to apply extension data to parsed glTF objects.
 */
export type ExtensionPostParseCallback<
  TObject,
  TExtData = ExtensionData,
  TGltfData = GltfData
> = (
  /**
   * The object to be modified.
   */
  object: TObject,
  /**
   * Extension data that should be applied to "object".
   */
  extensionData: TExtData,
  /**
   * The glTF root.
   */
  gltfData: TGltfData,
) => void;

/**
 * ExtensionParserCallbacks grouped by call order.
 */
export type ExtensionParsersByCallOrder<
  TObject,
  TExtData = ExtensionData,
  TGltfData = GltfData
> = {
  postParse?: ExtensionPostParseCallback<TObject, TExtData, TGltfData>;
};

/**
 * ExtensionParsersByCallOrder objects grouped by extension name.
 */
export type ExtensionParsersByName<TObject> = {
  [extension: string]: ExtensionParsersByCallOrder<TObject>;
};

/**
 * Container for extension parsers for a single glTF object type.
 */
export class ExtensionParserCallbackRegistry<TObject> {
  private _extensions: ExtensionParsersByName<TObject> = {};

  public constructor() {
    this.add = this.add.bind(this);
    this.remove = this.remove.bind(this);
    this.removeAll = this.removeAll.bind(this);
    this.find = this.find.bind(this);
    this.index = this.index.bind(this);
    this.postParse = this.postParse.bind(this);
    this.postParse = this.postParse.bind(this);
  }

  /**
   * Add a new extension parser to the registry.
   * @param name The name of the extension.
   * @param parsers Functions used transform objects that have an extension matching name.
   * @returns Returns true if the parser was successfully added to the registry, false otherwise.
   */
  public add<TExtData, TRootExtData>(
    name: string,
    parsers: ExtensionParsersByCallOrder<TObject, TExtData, TRootExtData>,
  ) {
    if (this._extensions[name]) {
      return false;
    }
    this._extensions[name] = parsers;
    return true;
  }

  /**
   * Remove an extension parser from the registry.
   * @param name The name of the extension.
   */
  public remove(name: string) {
    if (!this._extensions[name]) {
      return;
    }
    delete this._extensions[name];
  }

  /**
   * Remove all extension parsers from the registry.
   */
  public removeAll() {
    this._extensions = {};
  }

  /**
   * Find an extension parser in the registry.
   * @param name The name of the extension.
   * @returns The found extension parser or undefined.
   */
  public find(name: string) {
    if (!this._extensions[name]) {
      return undefined;
    }
    return this._extensions[name];
  }

  /**
   * Get the index of all extension parsers currently in the registry.
   * @returns An object of parsers by extension name.
   */
  public index() {
    return this._extensions;
  }

  /**
   * Apply all extensions on an object.
   * @param object The object to be modified.
   * @param extensionDataByName Object containing extension data that should be applied to "object", grouped by extension name.
   * @param gltfData The glTF root.
   */
  public postParse(
    object: TObject,
    extensionDataByName: ExtensionDataByName = {},
    gltfData: GltfData = {},
  ) {
    const extensionParsers = this._extensions;
    Object.keys(extensionDataByName).forEach(extensionId => {
      const extensionParser = extensionParsers[extensionId];
      if (extensionParser && extensionParser.postParse) {
        extensionParser.postParse(
          object,
          extensionDataByName[extensionId],
          gltfData,
        );
      }
    });
  }
}

/**
 * Container of extension parsers to be used when parsing glTF files.
 */
export class ExtensionRegistry {
  private _node = new ExtensionParserCallbackRegistry<pc.Entity>();
  private _scene = new ExtensionParserCallbackRegistry<pc.Entity>();
  private _camera = new ExtensionParserCallbackRegistry<pc.CameraComponent>();
  private _texture = new ExtensionParserCallbackRegistry<pc.Texture>();
  private _material = new ExtensionParserCallbackRegistry<pc.Material>();
  private _animation = new ExtensionParserCallbackRegistry<pc.AnimTrack>();

  public constructor() {
    this.removeAll = this.removeAll.bind(this);
  }

  /**
   * Registry for handling node extension parsers.
   */
  public get node() {
    return this._node;
  }

  /**
   * Registry for handling scene extension parsers.
   */
  public get scene() {
    return this._scene;
  }

  /**
   * Registry for handling camera extension parsers.
   */
  public get camera() {
    return this._camera;
  }

  /**
   * Registry for handling texture extension parsers.
   */
  public get texture() {
    return this._texture;
  }

  /**
   * Registry for handling material extension parsers.
   */
  public get material() {
    return this._material;
  }

  /**
   * Registry for handling animation extension parsers.
   */
  public get animation() {
    return this._animation;
  }

  /**
   * Options object that can be passed to pc.Asset of type "container" in order to bind
   * the glTF parser callbacks to the parsers in this registry,
   */
  public get containerAssetOptions(): ContainerAssetOptions {
    let gltfData: GltfData | undefined;

    function createPostProcessHandler<T>(
      registry: ExtensionParserCallbackRegistry<T>,
    ) {
      return (objectData: ObjectData, object: T) => {
        if (!objectData.extensions) {
          return;
        }

        if (!gltfData) {
          console.error(
            "Gltf data was not loaded before postParse, skipping postParse extensions for",
            objectData,
          );
          return;
        }

        registry.postParse(object, objectData.extensions, gltfData);
      };
    }

    return {
      global: { preprocess: (gltf: GltfData) => (gltfData = gltf) },
      node: { postprocess: createPostProcessHandler(this.node) },
      scene: { postprocess: createPostProcessHandler(this.scene) },
      camera: { postprocess: createPostProcessHandler(this.camera) },
      texture: {}, // TODO: implement when PC has added support for texture extensions
      material: { postprocess: createPostProcessHandler(this.material) },
      animation: { postprocess: createPostProcessHandler(this.animation) },
    };
  }

  /**
   * Remove all extension parsers.
   */
  public removeAll() {
    this._node.removeAll();
    this._scene.removeAll();
    this._camera.removeAll();
    this._texture.removeAll();
    this._material.removeAll();
    this._animation.removeAll();
  }
}
