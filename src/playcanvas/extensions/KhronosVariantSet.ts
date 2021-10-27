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

    const variantVariantNodes: Record<number, VariantNode[]> = {};

    for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex += 1) {
      const node = nodes[nodeIndex];
      const entity = container.nodes[nodeIndex];

      if (node.mesh === undefined) {
        continue;
      }

      const mesh = meshes[node.mesh];

      for (
        let primitiveIndex = 0;
        primitiveIndex < mesh.primitives.length;
        primitiveIndex += 1
      ) {
        const primitive = mesh.primitives[primitiveIndex];
        const mappings = primitive.extensions?.KHR_materials_variants?.mappings;

        if (!mappings) {
          continue;
        }

        for (const mapping of mappings) {
          for (const variantIndex of mapping.variants) {
            variantVariantNodes[variantIndex] = [
              ...(variantVariantNodes[variantIndex] ?? []),
              {
                node: entity,
                properties: {
                  visible: true,
                  modelAssetID: container.models[node.mesh].id,
                  materialMapping: {
                    [primitiveIndex]: container.materials[mapping.material].id,
                  },
                },
              },
            ];
          }
        }
      }
    }

    return [
      {
        name: "",
        variantSets: [
          {
            name: "Variants",
            variants: Object.keys(variantVariantNodes).map(variantIndex => {
              const numericVariantIndex = parseInt(variantIndex);

              return new Variant(
                this._variants[numericVariantIndex].name,
                undefined,
                numericVariantIndex === 0,
                variantVariantNodes[numericVariantIndex],
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
}
