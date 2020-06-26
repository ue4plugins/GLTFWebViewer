/**
 * Function used by {@link ExtensionRegistry} to apply extension data to parsed glTF objects.
 * @param object - The object to be modified or replaced.
 * @param extensionData - Extension data that should be applied to "object".
 * @param gltf - The contents of the glTF file being parsed. Can be used to find glTF objects referenced in "extensionData".
 */
export type ExtensionParserCallback<TObject> = (
  object: TObject,
  extensionData: any,
  gltf: any,
) => TObject;

export type ExtensionParserMap<TObject> = {
  [extension: string]: ExtensionParserCallback<TObject>;
};

/**
 * Container for extension parsers for a single glTF object type.
 */
export class ExtensionParserRegistry<TObject> {
  private _extensions: ExtensionParserMap<TObject> = {};

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
   * @returns The found extension parser or null.
   */
  public find(name: string) {
    if (!this._extensions[name]) {
      return null;
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
   * @param object - The object to be modified or replaced.
   * @param extensionData - Extension data that should be applied to "object".
   * @param gltf - The contents of the glTF file being parsed. Can be used to find glTF objects referenced in "extensionData".
   * @returns The new or modified object derived from "object" using "extensionData". Must be of the same type as "object".
   */
  public apply(name: string, object: TObject, extensionData: any, gltf: any) {
    const extensionParser = this._extensions[name];
    if (!extensionParser) {
      return object;
    }
    return extensionParser(object, extensionData, gltf);
  }

  /**
   * Apply multiple extensions on an object.
   * @param object - The object to be modified or replaced.
   * @param extensionDataByName - Object containing extension data that should be applied to "object", grouped by extension name.
   * @param gltf - The contents of the glTF file being parsed. Can be used to find glTF objects referenced in "extensionData".
   * @returns The new or modified object derived from "object" using "extensionData". Must be of the same type as "object".
   */
  public applyAll(object: TObject, extensionDataByName: any, gltf: any) {
    const extensionParsers = this._extensions;
    return Object.keys(extensionDataByName || {})
      .filter(function(extensionId) {
        return extensionParsers[extensionId];
      })
      .reduce(function(prevItem, extensionId) {
        const extensionParser = extensionParsers[extensionId];
        const extensionData = extensionDataByName[extensionId];
        return extensionParser(prevItem, extensionData, gltf);
      }, object);
  }
}

/**
 * Container of extension parsers to be used when parsing glTF files.
 */
export class ExtensionRegistry {
  private _node = new ExtensionParserRegistry<pc.Entity>();
  private _scene = new ExtensionParserRegistry<pc.Entity>();
  private _texture = new ExtensionParserRegistry<pc.Texture>();
  private _material = new ExtensionParserRegistry<pc.Material>();
  private _animation = new ExtensionParserRegistry<pc.AnimTrack>();

  public constructor() {
    this.destroy = this.destroy.bind(this);
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
   * Destroy all registered extension parsers.
   */
  public destroy() {
    this._node.destroy();
    this._scene.destroy();
    this._texture.destroy();
    this._material.destroy();
    this._animation.destroy();
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
  }
}
