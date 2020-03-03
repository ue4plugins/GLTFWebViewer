/* eslint-disable @typescript-eslint/no-explicit-any */
import pc from "playcanvas";
import createDebug from "debug";
import { GlTfParser } from "../GlTfParser";
import { getRoots } from "./getRoots";

const debug = createDebug("createModel");

export function createModel({
  gltf,
  meshes,
  defaultMaterial,
  materials,
  nodes,
  skins,
}: GlTfParser) {
  if (!gltf.nodes) {
    console.warn("No nodes available");
    return;
  }

  const meshInstances: pc.MeshInstance[] = [];
  const skinInstances: pc.SkinInstance[] = [];
  const morphInstances: pc.MorphInstance[] = [];

  gltf.nodes.forEach((node, nodeIndex) => {
    if (typeof node.mesh !== "undefined") {
      const meshGroup = meshes[node.mesh] as Array<
        pc.Mesh & { morph: any; materialIndex: number }
      >;

      meshGroup.forEach(mesh => {
        let material: pc.Material;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { materialIndex } = mesh;
        if (typeof materialIndex === "undefined") {
          material = defaultMaterial;
        } else {
          material = materials[materialIndex];
        }
        debug("material", material);

        const meshInstance = new pc.MeshInstance(
          nodes[nodeIndex],
          mesh,
          material,
        );

        debug("meshInstance", meshInstance);
        meshInstances.push(meshInstance);

        if (mesh.morph) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const morphInstance = new (pc as any).MorphInstance(mesh.morph);
          (meshInstance as any).morphInstance = morphInstance;

          // HACK: need to force calculation of the morph's AABB due to a bug
          // in the engine. This is a private function and will be removed!
          morphInstance.updateBounds(meshInstance.mesh);
          const { weights } = mesh as any;
          if (weights) {
            weights.forEach((weight: any, weightIndex: any) => {
              morphInstance.setWeight(weightIndex, weight);
            });
          }

          debug("morphInstance", morphInstance);
          morphInstances.push(morphInstance);
        }

        if (typeof node.skin !== "undefined") {
          const skin = skins[node.skin];
          (mesh as any).skin = skin;
          const skinInstance = new pc.SkinInstance(skin);
          (skinInstance as any).bones = (skin as any).bones;
          (meshInstance as any).skinInstance = skinInstance;
          debug("skinInstance", skinInstance);
          skinInstances.push(skinInstance);
        }
      });
    }
  });

  const model = new pc.Model();
  const roots = getRoots(gltf, nodes);

  // eslint-disable-next-line
  if (roots.length === 1) {
    model.graph = roots[0];
  } else {
    model.graph = new pc.GraphNode();
    roots.forEach(function(root) {
      model.graph.addChild(root);
    });
  }
  debug("graph", model.graph);

  model.meshInstances = meshInstances;
  (model as any).morphInstances = morphInstances;
  (model as any).skinInstances = skinInstances;
  return model;
}
