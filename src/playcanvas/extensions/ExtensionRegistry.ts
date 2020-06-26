// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExtensionData = any;
type ExtensionDataByName = { [extension: string]: ExtensionData };
type ObjectData = {
  extensions?: ExtensionDataByName;
};
type GltfData = {
  extensions?: ExtensionDataByName;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ContainerAssetOptions = any;

/**
 * Function used by ExtensionRegistry to apply extension data to parsed glTF objects.
 */
export type ExtensionPostParseCallback<TObject> = (
  /**
   * The object to be modified.
   */
  object: TObject,

  /**
   * Extension data that should be applied to "object".
   */
  extensionData: ExtensionData,
) => void;

/**
 * ExtensionParserCallbacks grouped by call order.
 */
export type ExtensionParsersByCallOrder<TObject> = {
  postParse?: ExtensionPostParseCallback<TObject>;
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
    this.destroy = this.destroy.bind(this);
    this.add = this.add.bind(this);
    this.remove = this.remove.bind(this);
    this.removeAll = this.removeAll.bind(this);
    this.find = this.find.bind(this);
    this.index = this.index.bind(this);
    this.postParse = this.postParse.bind(this);
    this.postParseAll = this.postParseAll.bind(this);
  }

  /**
   * Let go of all registered parsers.
   */
  public destroy() {
    this._extensions = {};
  }

  /**
   * Add a new extension parser to the registry.
   * @param name - The name of the extension.
   * @param parser - Function used transform objects that have an extension matching name.
   * @returns Returns true if the parser was successfully added to the registry, false otherwise.
   */
  public add(name: string, parser: ExtensionParsersByCallOrder<TObject>) {
    if (this._extensions[name]) {
      return false;
    }
    this._extensions[name] = parser;
    return true;
  }

  /**
   * Remove an extension parser from the registry.
   * @param name - The name of the extension.
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
   * @param name - The name of the extension.
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
   * Apply a single extension to an object.
   * @param name - The name of the extension to be applied to "object".
   * @param object - The object to be modified.
   * @param extensionData - Extension data that should be applied to "object".
   */
  public postParse(
    name: string,
    object: TObject,
    extensionData: ExtensionData,
  ) {
    const extensionParser = this._extensions[name];
    if (extensionParser && extensionParser.postParse) {
      extensionParser.postParse(object, extensionData);
    }
  }

  /**
   * Apply multiple extensions on an object.
   * @param object - The object to be modified.
   * @param extensionDataByName - Object containing extension data that should be applied to "object", grouped by extension name.
   */
  public postParseAll(
    object: TObject,
    extensionDataByName: ExtensionDataByName,
  ) {
    const extensionParsers = this._extensions;
    Object.keys(extensionDataByName || {}).forEach(extensionId => {
      const extensionParser = extensionParsers[extensionId];
      if (extensionParser && extensionParser.postParse) {
        extensionParser.postParse(object, extensionDataByName[extensionId]);
      }
    });
  }
}

/**
 * Function used by ExtensionRegistry to report global extension data of glTF objects.
 */
export type GlobalExtensionPreParseCallback = (
  extensionData: ExtensionData,
) => void;

/**
 * GlobalExtensionCallback grouped by call order.
 */
export type GlobalExtensionParsersByCallOrder = {
  preParse?: GlobalExtensionPreParseCallback;
};

/**
 * GlobalExtensionParsersByCallOrder objects grouped by extension name.
 */
export type GlobalExtensionCallbacksByName = {
  [extension: string]: GlobalExtensionParsersByCallOrder;
};

/**
 * Container for callbacks to be called when parsing global glTF extension data.
 */
export class GlobalExtensionCallbackRegistry {
  private _extensions: GlobalExtensionCallbacksByName = {};

  public constructor() {
    this.destroy = this.destroy.bind(this);
    this.add = this.add.bind(this);
    this.remove = this.remove.bind(this);
    this.removeAll = this.removeAll.bind(this);
    this.find = this.find.bind(this);
    this.index = this.index.bind(this);
    this.preParseAll = this.preParseAll.bind(this);
  }

  /**
   * Let go of all registered callbacks.
   */
  public destroy() {
    this._extensions = {};
  }

  /**
   * Add a new extension callback to the registry.
   * @param name - The name of the extension.
   * @param callback - Function used transform objects that have an extension matching name.
   * @returns Returns true if the callback was successfully added to the registry, false otherwise.
   */
  public add(name: string, callback: GlobalExtensionParsersByCallOrder) {
    if (this._extensions[name]) {
      return false;
    }
    this._extensions[name] = callback;
    return true;
  }

  /**
   * Remove an extension callback from the registry.
   * @param name - The name of the extension.
   */
  public remove(name: string) {
    if (!this._extensions[name]) {
      return;
    }
    delete this._extensions[name];
  }

  /**
   * Remove all extension callbacks from the registry.
   */
  public removeAll() {
    this._extensions = {};
  }

  /**
   * Find an extension callback in the registry.
   * @param name - The name of the extension.
   * @returns The found extension callback or undefined.
   */
  public find(name: string) {
    if (!this._extensions[name]) {
      return undefined;
    }
    return this._extensions[name];
  }

  /**
   * Get the index of all extension callbacks currently in the registry.
   * @returns An object of callbacks by extension name.
   */
  public index() {
    return this._extensions;
  }

  /**
   * Trigger all extension callbacks matching the given extension data.
   * @param extensionDataByName - Object containing global extension data, grouped by extension name.
   */
  public preParseAll(extensionDataByName: ExtensionDataByName) {
    const extensionCallbacks = this._extensions;
    Object.keys(extensionDataByName || {}).forEach(extensionId => {
      const extensionCallback = extensionCallbacks[extensionId];
      if (extensionCallback.preParse) {
        extensionCallback.preParse(extensionDataByName[extensionId]);
      }
    });
  }
}

/**
 * Container of extension parsers to be used when parsing glTF files.
 */
export class ExtensionRegistry {
  private _global = new GlobalExtensionCallbackRegistry();
  private _node = new ExtensionParserCallbackRegistry<pc.Entity>();
  private _scene = new ExtensionParserCallbackRegistry<pc.Entity>();
  private _texture = new ExtensionParserCallbackRegistry<pc.Texture>();
  private _material = new ExtensionParserCallbackRegistry<pc.Material>();
  private _animation = new ExtensionParserCallbackRegistry<pc.AnimTrack>();

  public constructor() {
    this.destroy = this.destroy.bind(this);
    this.removeAll = this.removeAll.bind(this);
  }

  /**
   * Registry for handling global extension callbacks.
   */
  public get global() {
    return this._global;
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
    return {
      global: {
        preprocess: (gltfData: GltfData) => {
          if (gltfData.extensions) {
            this.global.preParseAll(gltfData.extensions);
          }
        },
      },
      node: {
        postprocess: (nodeData: ObjectData, node: pc.Entity) => {
          if (nodeData.extensions) {
            this.node.postParseAll(node, nodeData.extensions);
          }
        },
      },
      scene: {
        postprocess: (sceneData: ObjectData, scene: pc.Entity) => {
          if (sceneData.extensions) {
            this.scene.postParseAll(scene, sceneData.extensions);
          }
        },
      },
      texture: {}, // TODO: can we use postprocess for textures? we possibly need to return a new texture
      material: {
        postprocess: (materialData: ObjectData, material: pc.Material) => {
          if (materialData.extensions) {
            this.material.postParseAll(material, materialData.extensions);
          }
        },
      },
      animation: {
        postprocess: (animationData: ObjectData, animation: pc.AnimTrack) => {
          if (animationData.extensions) {
            this.animation.postParseAll(animation, animationData.extensions);
          }
        },
      },
    };
  }

  /**
   * Destroy all registered extension parsers.
   */
  public destroy() {
    this._node.destroy();
    this._scene.destroy();
    this._texture.destroy();
    this._material.destroy();
    this._animation.destroy();
    this._global.destroy();
  }

  /**
   * Remove all extension parsers.
   */
  public removeAll() {
    this._node.removeAll();
    this._scene.removeAll();
    this._texture.removeAll();
    this._material.removeAll();
    this._animation.removeAll();
    this._global.removeAll();
  }
}
