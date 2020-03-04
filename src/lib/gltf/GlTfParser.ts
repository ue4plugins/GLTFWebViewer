import pc from "playcanvas";
import { observable, action } from "mobx";
import createDebug from "debug";
import { createDecoderModule } from "draco3dgltf";
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
import { translateAnimation } from "./utils/translateAnimation";
import { AnimationClip } from "./animation/AnimationClip";

const debug = createDebug("GlTfParser");

export interface Options {
  basePath?: string;
  processUri?: string;
  buffers?: ArrayBuffer[];
  processAnimationExtras?: (extras: Animation["extras"]) => void;
  processMaterialExtras?: (extras: Material["extras"]) => void;
  processGlobalExtras?: (extras: GlTf["extras"]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  decoderModule?: any;
}

export enum GlTfParseState {
  PENDING,
  BUFFERS,
  IMAGES,
  TEXTURES,
  ANIMATIONS,
  MESHES,
  NODES,
  MATERIALS,
  SKINS,
  READY,
}

export class GlTfParser {
  public nodeCounter = 0;
  public defaultMaterial: pc.StandardMaterial;
  public buffers: ArrayBuffer[] = [];
  public images: Array<HTMLImageElement> = [];
  public textures: pc.Texture[] = [];
  public animations: AnimationClip[] = [];
  public meshes: Array<pc.Mesh[]> = [];
  public nodes: pc.GraphNode[] = [];
  public materials: pc.Material[] = [];
  public skins: pc.Skin[] = [];

  @observable
  public state = GlTfParseState.PENDING;

  public constructor(
    public gltf: GlTf,
    public device: pc.GraphicsDevice,
    public options: Options = {},
  ) {
    debug("Creating parser");
    this.defaultMaterial = translateMaterial({}, this);
  }

  public get imagesLoaded() {
    return this.images.filter(img => img && img.complete).length;
  }

  public get basePath() {
    return this.options.basePath ?? "";
  }

  public get decoderModule() {
    return this.options.decoderModule ?? createDecoderModule();
  }

  @action
  public setState(state: GlTfParseState) {
    this.state = state;
  }

  public reset() {
    this.setState(GlTfParseState.PENDING);
    this.nodeCounter = 0;
    this.buffers = [];
    this.images = [];
    this.textures = [];
    this.animations = [];
    this.meshes = [];
    this.nodes = [];
    this.materials = [];
    this.skins = [];
  }

  public async load() {
    this.reset();
    const { gltf } = this;

    const useDecoderModule = !!gltf.extensionsUsed?.includes(
      "KHR_draco_mesh_compression",
    );

    debug("useDecoderModule", useDecoderModule, this.decoderModule);

    debug("Load buffers");
    this.setState(GlTfParseState.BUFFERS);
    this.buffers = await loadBuffers(this.gltf, this.basePath);

    debug("Parse textures", gltf.textures);
    this.setState(GlTfParseState.TEXTURES);
    this.textures =
      gltf.textures?.map(texture => translateTexture(texture, this)) || [];

    debug("Parse images", gltf.images);
    this.setState(GlTfParseState.IMAGES);
    this.images =
      gltf.images
        ?.map(image => translateImage(image, this))
        .filter((i): i is HTMLImageElement => !!i) || [];

    debug("Parse materials", gltf.materials);
    this.setState(GlTfParseState.MATERIALS);
    this.materials =
      gltf.materials?.map(material => translateMaterial(material, this)) || [];

    debug("Parse meshes");
    this.setState(GlTfParseState.MESHES);
    this.meshes = (gltf.meshes || [])
      .map(mesh => translateMesh(mesh, this))
      .filter((mesh): mesh is pc.Mesh[] => !!mesh);

    debug("Parse nodes");
    this.setState(GlTfParseState.NODES);
    this.nodes = gltf.nodes?.map(translateNode) || [];

    debug("Parse skins");
    this.setState(GlTfParseState.SKINS);
    this.skins =
      gltf.skins
        ?.map(node => translateSkin(node, this))
        .filter((skin): skin is pc.Skin => !!skin) || [];

    debug("Parse animations");
    this.setState(GlTfParseState.ANIMATIONS);
    this.animations =
      gltf.animations
        ?.map(anim => translateAnimation(anim, this))
        .filter((anim): anim is AnimationClip => !!anim) || [];

    debug("Generate model");
    const model = createModel(this);

    debug("Build hierarchy");
    buildHierarchy(this);

    this.setState(GlTfParseState.READY);

    return {
      model,
      textures: this.textures,
      animations: this.animations,
    };
  }
}
