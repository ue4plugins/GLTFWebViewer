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
export type ExtensionParserCallback<TObject> = (
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
 * Mapping from extension name to ExtensionParserCallbacks.
 */
export type ExtensionParsersByName<TObject> = {
  [extension: string]: ExtensionParserCallback<TObject>;
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
    this.apply = this.apply.bind(this);
    this.applyAll = this.applyAll.bind(this);
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
  public add(name: string, parser: ExtensionParserCallback<TObject>) {
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
  public apply(name: string, object: TObject, extensionData: ExtensionData) {
    const extensionParser = this._extensions[name];
    if (extensionParser) {
      extensionParser(object, extensionData);
    }
  }

  /**
   * Apply multiple extensions on an object.
   * @param object - The object to be modified.
   * @param extensionDataByName - Object containing extension data that should be applied to "object", grouped by extension name.
   */
  public applyAll(object: TObject, extensionDataByName: ExtensionDataByName) {
    const extensionParsers = this._extensions;
    Object.keys(extensionDataByName || {}).forEach(extensionId => {
      const extensionParser = extensionParsers[extensionId];
      if (extensionParser) {
        extensionParser(object, extensionDataByName[extensionId]);
      }
    });
  }
}

/**
 * Function used by ExtensionRegistry to report global extension data of glTF objects.
 */
export type GlobalExtensionCallback = (extensionData: ExtensionData) => void;

/**
 * Mapping from extension name to GlobalExtensionCallback.
 */
export type GlobalExtensionCallbacksByName = {
  [extension: string]: GlobalExtensionCallback;
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
    this.callAll = this.callAll.bind(this);
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
  public add(name: string, callback: GlobalExtensionCallback) {
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
  public callAll(extensionDataByName: ExtensionDataByName) {
    const extensionCallbacks = this._extensions;
    Object.keys(extensionDataByName || {}).forEach(extensionId => {
      const extensionCallback = extensionCallbacks[extensionId];
      if (extensionCallback) {
        extensionCallback(extensionDataByName[extensionId]);
      }
    });
  }
}

/**
 * Container of extension parsers to be used when parsing glTF files.
 */
export class ExtensionRegistry {
  private _nodePostParse = new ExtensionParserCallbackRegistry<pc.Entity>();
  private _scenePostParse = new ExtensionParserCallbackRegistry<pc.Entity>();
  private _texturePostParse = new ExtensionParserCallbackRegistry<pc.Texture>();
  private _materialPostParse = new ExtensionParserCallbackRegistry<
    pc.Material
  >();
  private _animationPostParse = new ExtensionParserCallbackRegistry<
    pc.AnimTrack
  >();
  private _globalPreParse = new GlobalExtensionCallbackRegistry();

  public constructor() {
    this.destroy = this.destroy.bind(this);
    this.removeAll = this.removeAll.bind(this);
  }

  /**
   * Registry for handling global extension callbacks.
   */
  public get globalPreParse() {
    return this._globalPreParse;
  }

  /**
   * Registry for handling node extension parsers.
   */
  public get nodePostParse() {
    return this._nodePostParse;
  }

  /**
   * Registry for handling scene extension parsers.
   */
  public get scenePostParse() {
    return this._scenePostParse;
  }

  /**
   * Registry for handling texture extension parsers.
   */
  public get texturePostParse() {
    return this._texturePostParse;
  }

  /**
   * Registry for handling material extension parsers.
   */
  public get materialPostParse() {
    return this._materialPostParse;
  }

  /**
   * Registry for handling animation extension parsers.
   */
  public get animationPostParse() {
    return this._animationPostParse;
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
            this.globalPreParse.callAll(gltfData.extensions);
          }
        },
      },
      node: {
        postprocess: (nodeData: ObjectData, node: pc.Entity) => {
          if (nodeData.extensions) {
            this.nodePostParse.applyAll(node, nodeData.extensions);
          }
        },
      },
      scene: {
        postprocess: (sceneData: ObjectData, scene: pc.Entity) => {
          if (sceneData.extensions) {
            this.scenePostParse.applyAll(scene, sceneData.extensions);
          }
        },
      },
      // TODO
      texture: {},
      material: {},
      animation: {},
    };
  }

  /**
   * Destroy all registered extension parsers.
   */
  public destroy() {
    this._nodePostParse.destroy();
    this._scenePostParse.destroy();
    this._texturePostParse.destroy();
    this._materialPostParse.destroy();
    this._animationPostParse.destroy();
    this._globalPreParse.destroy();
  }

  /**
   * Remove all extension parsers.
   */
  public removeAll() {
    this._nodePostParse.removeAll();
    this._scenePostParse.removeAll();
    this._texturePostParse.removeAll();
    this._materialPostParse.removeAll();
    this._animationPostParse.removeAll();
    this._globalPreParse.removeAll();
  }
}
