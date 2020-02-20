import pc from "playcanvas";
import createDebug from "debug";
import { DracoDecoderModule } from "draco3dgltf";
import { GlTf, Material, Animation } from "./types";
import { translateMaterial } from "./utils/translateMaterial";
import { loadBuffers } from "./utils/loadBuffers";
import { translateTexture } from "./utils/translateTexture";
import { translateImage } from "./utils/translateImage";
import { translateMesh } from "./utils/translateMesh";
import { buildHierarchy } from "./utils/buildHierarchy";
import { createModel } from "./utils/createModel";
import { translateNode } from "./utils/translateNode";
import { translateSkin } from "./utils/translateSkin";

const debug = createDebug("GlTfParser");

export interface Options {
  basePath?: string;
  processUri?: string;
  buffers?: ArrayBuffer[];
  processAnimationExtras?: (extras: Animation["extras"]) => void;
  processMaterialExtras?: (extras: Material["extras"]) => void;
  processGlobalExtras?: (extras: GlTf["extras"]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  decoderModule?: DracoDecoderModule;
}

export class GlTfParser {
  public nodeCounter = 0;
  public defaultMaterial: pc.StandardMaterial;
  public buffers: ArrayBuffer[] = [];
  public images: Array<HTMLImageElement> = [];
  public textures: pc.Texture[] = [];
  public animations: pc.Animation[] = [];
  public meshes: Array<pc.Mesh[]> = [];
  public nodes: pc.GraphNode[] = [];
  public materials: pc.Material[] = [];
  public skins: pc.Skin[] = [];

  constructor(
    public gltf: GlTf,
    public device: pc.GraphicsDevice,
    public options: Options = {},
  ) {
    debug("Creating parser");
    this.defaultMaterial = translateMaterial({}, this);
  }

  get imagesLoaded() {
    return this.images.filter(img => img && img.complete).length;
  }

  get basePath() {
    return this.options.basePath ?? "";
  }

  get decoderModule() {
    return this.options.decoderModule ?? "";
  }

  async load() {
    const { gltf } = this;

    const useDecoderModule = !!gltf.extensionsUsed?.includes(
      "KHR_draco_mesh_compression",
    );

    debug("useDecoderModule", useDecoderModule);

    debug("Load buffers");
    this.buffers = await loadBuffers(this.basePath, gltf.buffers);

    debug("Parse textures");
    this.textures =
      gltf.textures?.map(texture => translateTexture(texture, this)) || [];

    debug("Parse images");
    this.images =
      gltf.images
        ?.map(image => translateImage(image, this))
        .filter((i): i is HTMLImageElement => !!i) || [];

    debug("Parse materials");
    this.materials =
      gltf.materials?.map(material => translateMaterial(material, this)) || [];

    debug("Parse meshes");
    this.meshes = (gltf.meshes || [])
      .map(mesh => translateMesh(mesh, this))
      .filter((mesh): mesh is pc.Mesh[] => !!mesh);

    debug("Parse nodes");
    this.nodes = gltf.nodes?.map(node => translateNode(node, this)) || [];

    debug("Parse skins");
    this.skins =
      gltf.skins
        ?.map(node => translateSkin(node, this))
        .filter((skin): skin is pc.Skin => !!skin) || [];

    debug("Generate model");
    const model = createModel(this);

    debug("Build hierarchy");
    buildHierarchy(this);

    return {
      model,
      textures: this.textures,
      animations: this.animations,
    };
  }
}
