import * as pc from "@animech-public/playcanvas";
import Debug from "debug";
import { Variant, VariantNode, LevelVariantSet } from "../../variants";
import { ExtensionParser } from "./ExtensionParser";
import { ExtensionRegistry } from "./ExtensionRegistry";

const debug = Debug("KhronosVariantSet");

type GlobalExtensionData = {
  variants: VariantData[];
};

type RootData = {
  extensions?: {
    KHR_materials_variants?: {
      variants: VariantData[];
    };
  };

  meshes?: MeshData[];
  nodes?: NodeData[];
};

type VariantData = {
  name: string;
};

type NodeData = {
  mesh?: number;
};

type MeshData = {
  name: string;
  primitives: PrimitiveData[];
};

type PrimitiveData = {
  extensions?: {
    KHR_materials_variants?: {
      mappings: Mapping[];
    };
  };
};

type Mapping = {
  material: number;
  variants: number[];
};

type VariantNodesMap = Record<number, VariantNode[]>;

export class KhronosVariantSetExtensionParser implements ExtensionParser {
  private _variants: VariantData[] = [];
  private _rootData: RootData | null = null;

  public get name() {
    return "KHR_materials_variants";
  }

  public getVariantSets(container: pc.ContainerResource): LevelVariantSet[] {
    const meshes = this._rootData?.meshes;
    const nodes = this._rootData?.nodes;

    if (!meshes || !nodes) {
      return [];
    }

    const variantNodesMap: VariantNodesMap = {};

    for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex += 1) {
      this._parseNode(
        nodes[nodeIndex],
        meshes,
        container.nodes[nodeIndex],
        container,
        variantNodesMap,
      );
    }

    return [
      {
        name: "",
        variantSets: [
          {
            name: "Variants",
            variants: Object.keys(variantNodesMap).map(variantIndex => {
              const numericVariantIndex = parseInt(variantIndex);

              return new Variant(
                this._variants[numericVariantIndex].name,
                undefined,
                numericVariantIndex === 0,
                variantNodesMap[numericVariantIndex],
              );
            }),
          },
        ],
      },
    ];
  }

  public register(registry: ExtensionRegistry) {
    registry.global.add(this.name, {
      postParse: this._globalPostParse.bind(this),
    });
  }

  public unregister(registry: ExtensionRegistry) {
    registry.global.remove(this.name);
  }

  public postParse() {
    // Ignore
  }

  private _globalPostParse(
    scene: pc.ContainerResource,
    extensionData: GlobalExtensionData,
    rootData: RootData,
  ) {
    debug("Parse variant sets", scene, extensionData, rootData);

    this._variants = extensionData.variants;
    this._rootData = rootData;
  }

  private _parseNode(
    node: NodeData,
    meshes: MeshData[],
    entity: pc.Entity,
    container: pc.ContainerResource,
    variantNodesMap: VariantNodesMap,
  ) {
    if (node.mesh === undefined) {
      return;
    }

    const mesh = meshes[node.mesh];

    for (
      let primitiveIndex = 0;
      primitiveIndex < mesh.primitives.length;
      primitiveIndex += 1
    ) {
      this._parsePrimitive(
        primitiveIndex,
        mesh,
        container.models[node.mesh],
        entity,
        container,
        variantNodesMap,
      );
    }
  }

  private _parsePrimitive(
    primitiveIndex: number,
    mesh: MeshData,
    model: pc.Asset,
    entity: pc.Entity,
    container: pc.ContainerResource,
    variantNodesMap: VariantNodesMap,
  ) {
    const primitive = mesh.primitives[primitiveIndex];
    const mappings = primitive.extensions?.KHR_materials_variants?.mappings;

    if (!mappings) {
      return;
    }

    for (const mapping of mappings) {
      this._parseMapping(
        mapping,
        primitiveIndex,
        container.materials[mapping.material],
        model,
        entity,
        variantNodesMap,
      );
    }
  }

  private _parseMapping(
    mapping: Mapping,
    primitiveIndex: number,
    material: pc.Asset,
    model: pc.Asset,
    entity: pc.Entity,
    variantNodesMap: VariantNodesMap,
  ) {
    for (const variantIndex of mapping.variants) {
      variantNodesMap[variantIndex] = [
        ...(variantNodesMap[variantIndex] ?? []),
        {
          node: entity,
          properties: {
            visible: true,
            modelAssetID: model.id,
            materialMapping: {
              [primitiveIndex]: material.id,
            },
          },
        },
      ];
    }
  }
}
