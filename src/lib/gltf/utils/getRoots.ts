import { GlTf } from "../types";

export function getRoots(gltf: GlTf, nodes: pc.GraphNode[]) {
  const rootNodes: pc.GraphNode[] = [];
  if (gltf.scenes) {
    let sceneIndex = 0;
    if (gltf.scene) {
      sceneIndex = gltf.scene;
    }
    const gltfNodes = gltf.scenes[sceneIndex].nodes;
    if (gltfNodes) {
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[gltfNodes[i]];
        if (node) {
          rootNodes.push(nodes[gltfNodes[i]]);
        }
      }
    }
  } else {
    rootNodes.push(nodes[0]);
  }
  return rootNodes;
}
