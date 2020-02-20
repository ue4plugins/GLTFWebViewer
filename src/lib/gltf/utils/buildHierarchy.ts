/* eslint-disable */
import { GlTfParser } from "../GlTfParser";

export function buildHierarchy({ gltf, nodes }: GlTfParser) {
  if (!gltf.nodes) {
    console.warn("No nodes available");
    return;
  }

  gltf.nodes.forEach((node, idx) => {
    if (node.children) {
      node.children.forEach(childIdx => {
        const child = nodes[childIdx];
        // If this triggers, a node in the glTF has more than one parent which is wrong
        if (child.parent) {
          child.parent.removeChild(child);
        }
        const parent = nodes[idx];
        parent.addChild(child);
      });
    }
  });
}
