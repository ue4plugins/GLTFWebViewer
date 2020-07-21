import * as pc from "@animech-public/playcanvas";
import Debug from "debug";
import { hasNoUndefinedValues } from "../../utilities/typeGuards";
import { getImageIndex } from "../utilities";
import { ExtensionParser } from "./ExtensionParser";
import { ExtensionRegistry } from "./ExtensionRegistry";

const debug = Debug("VariantSet");

type SceneExtensionData = {
  levelVariantSets: number[];
};

type RootData = {
  textures?: { source: number }[];
  extensions?: {
    EPIC_level_variant_sets?: {
      levelVariantSets: LevelVariantSetData[];
    };
  };
};

type SceneVariantSetDataMap = {
  scene: pc.Entity;
  data: LevelVariantSetData[];
};

type LevelVariantSetData = {
  name: string;
  variantSets: VariantSetData[];
};

type VariantSetData = {
  name: string;
  variants: {
    name: string;
    active: boolean;
    thumbnail?: number;
    nodes: {
      node: number;
      properties: VariantNodePropertiesData;
    }[];
  }[];
};

type VariantMaterialData = {
  index: number;
  material: number;
};

type VariantNodePropertiesData = {
  visible?: boolean;
  materials?: VariantMaterialData[];
};

export type VariantSet = {
  name: string;
  variants: Variant[];
};

export type Variant = {
  name: string;
  active: boolean;
  thumbnailSource?: string;
  nodes: VariantNode[];
};

export type VariantNode = {
  node: pc.Entity;
  properties: {
    visible?: boolean;
    materials?: VariantMaterial[];
  };
};

export type VariantMaterial = {
  index: number;
  material: pc.StandardMaterial;
};

export type VariantNodeProperties = {
  visible?: boolean;
  materials?: VariantMaterial[];
};

export type VariantMaterialResolver = (
  sourceMaterial: pc.StandardMaterial,
  node: pc.Entity,
) => pc.StandardMaterial | null;

export class VariantSetExtensionParser implements ExtensionParser {
  private _variantSets: SceneVariantSetDataMap[] = [];

  public get name() {
    return "EPIC_level_variant_sets";
  }

  public getVariantSetsForScene(
    scene: pc.Entity,
    container: pc.ContainerResource,
    materialResolver?: VariantMaterialResolver,
  ): VariantSet[] {
    const { textures, nodes: nodeEntities } = container;

    return this._variantSets
      .filter(set => set.scene === scene)
      .reduce<LevelVariantSetData[]>((sets, set) => [...sets, ...set.data], [])
      .reduce<VariantSetData[]>(
        (sets, set) => [...sets, ...set.variantSets],
        [],
      )
      .map<VariantSet>(set => ({
        ...set,
        variants: set.variants.map<Variant>(
          ({ name, active, thumbnail, nodes }) => ({
            name,
            active,
            thumbnailSource:
              thumbnail !== undefined
                ? (textures[thumbnail]?.resource as
                    | pc.Texture
                    | undefined)?.getSource().src
                : undefined,
            nodes: nodes.map<VariantNode>(({ node, properties }) => ({
              node: nodeEntities[node],
              properties: this._parseVariantNodeProperties(
                nodeEntities[node],
                properties,
                container,
                materialResolver,
              ),
            })),
          }),
        ),
      }));
  }

  public register(registry: ExtensionRegistry) {
    registry.scene.add(this.name, {
      postParse: this._scenePostParse.bind(this),
    });
  }

  public unregister(registry: ExtensionRegistry) {
    registry.scene.remove(this.name);
  }

  public postParse() {
    // Ignore
  }

  private _scenePostParse(
    scene: pc.Entity,
    extensionData: SceneExtensionData,
    rootData: RootData,
  ) {
    debug("Parse variant sets", scene, extensionData);

    const levelVariantSets = extensionData.levelVariantSets.map(
      set =>
        rootData.extensions?.EPIC_level_variant_sets?.levelVariantSets[set],
    );

    if (!hasNoUndefinedValues(levelVariantSets)) {
      return;
    }

    debug("Found variant sets", levelVariantSets);

    // Convert thumbnail texture indexes to image indexes since
    // ContainerResource.textures is indexed by images
    levelVariantSets.forEach(({ variantSets }) => {
      variantSets.forEach(({ variants }) => {
        variants.forEach(variant => {
          if (variant.thumbnail) {
            variant.thumbnail = getImageIndex(variant.thumbnail, rootData);
          }
        });
      });
    });

    this._variantSets.push({
      scene,
      data: levelVariantSets,
    });
  }

  private _parseVariantNodeProperties(
    node: pc.Entity,
    { visible, materials }: VariantNodePropertiesData,
    container: pc.ContainerResource,
    materialResolver?: VariantMaterialResolver,
  ): VariantNodeProperties {
    return {
      visible,
      materials: materials
        ?.map(data =>
          this._parseVariantMaterial(node, data, container, materialResolver),
        )
        .filter((material): material is VariantMaterial => material !== null),
    };
  }

  private _parseVariantMaterial(
    node: pc.Entity,
    data: VariantMaterialData,
    container: pc.ContainerResource,
    materialResolver?: VariantMaterialResolver,
  ): VariantMaterial | null {
    let material: pc.StandardMaterial | null =
      container.materials[data.material]?.resource ?? null;

    if (material && materialResolver) {
      material = materialResolver(material, node);
    }

    return material ? { ...data, material } : null;
  }
}
