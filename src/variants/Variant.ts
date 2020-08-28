import * as pc from "@animech-public/playcanvas";
import Debug from "debug";
import { deepEqual } from "../utilities";

const debug = Debug("Variant");

type MaterialMapping = Record<number, number>;

export type VariantNode = {
  node: pc.Entity;
  properties: VariantNodeProperties;
};

export type VariantNodeProperties = {
  visible?: boolean;
  materialMapping?: MaterialMapping;
  model?: pc.Asset;
};

export class Variant {
  public constructor(
    public name: string,
    public thumbnailSource: string | undefined,
    private _isActiveByDefault: boolean,
    private _variantNodes: VariantNode[],
  ) {
    if (_isActiveByDefault) {
      this.activate();
    }
  }

  public get active() {
    return this._variantNodes.every(({ node, properties }) => {
      const { visible, model, materialMapping } = properties;

      const visibilityMatch = visible === undefined || visible === node.enabled;
      const modelMatch = model === undefined || model.id === node.model?.asset;
      const materialMappingMatch =
        materialMapping === undefined ||
        deepEqual(materialMapping, node.model?.mapping);

      return visibilityMatch && modelMatch && materialMappingMatch;
    });
  }

  public activate(): void {
    this._variantNodes.forEach(({ node, properties }) => {
      if (properties.model !== undefined && node.model !== undefined) {
        debug("Set node mesh", node.name, properties.model);

        if (node.model.asset !== properties.model.id) {
          // HACK: prevent the anim-component from being reset when changing model by
          // temporarily removing it from the entity. When resetting the anim-component,
          // its state-graph is restored from an asset. But we've constructed the graph
          // dynamically, and that graph would be lost.
          const animComponent = node.anim;
          delete node.anim;

          node.model.asset = properties.model;
          node.anim = animComponent;
        }
      }
      if (properties.visible !== undefined) {
        debug("Set node visibility", node.name, properties.visible);
        node.enabled = properties.visible;
      }
      if (
        properties.materialMapping !== undefined &&
        node.model !== undefined
      ) {
        debug("Set node materials", node.name, properties.materialMapping);

        // TODO: Applying materials even when the variant-node is already
        // active may cause different behavior than in UE. For example,
        // if a mesh-component in UE lacks override-materials and its mesh
        // is replaced via a mesh variant, the new mesh will use its own materials.
        // But if the materials of the mesh-component are changed via a material variant
        // before changing the mesh, the new mesh will use the changed (overridden) materials.
        // In our case, since materials are applied after all other variants, and every time
        // something changes, meshes that are switched via mesh variants will always get
        // the overridden materials. Do we want to change this to match UE?
        node.model.mapping = properties.materialMapping;
      }
    });

    // Update lightmaps for all affected nodes, in case materials or models have changed.
    this._variantNodes.forEach(({ node }) => {
      const nodeLightmap = node.script?.NodeLightmap;
      if (!nodeLightmap) {
        return;
      }

      // TODO: If the mesh has been replaced by a variant, the lightmap sometimes look
      // different than in Unreal (for the same configuration).
      // It's expected that the result should look "wrong" since the displayed lightmap
      // belongs to another mesh, but it should still look the same as in Unreal.
      // Some configurations look correct, others have subtle differences and other still
      // are completely different. We may wish to investigate this issue later if this is
      // an important use-case.
      nodeLightmap.applyLightmapToModel();
    });
  }
}
