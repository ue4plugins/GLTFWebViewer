import "jest";
import path from "path";
import pc from "playcanvas";
import { readFile } from "fs-extra";
import { GlTf } from "../../types";
import { getRoots } from "../getRoots";
import { translateNode } from "../translateNode";

async function getData() {
  const basePath = "./public/assets/models/TextureTransformTest/glTF";
  const buf = await readFile(
    path.join(basePath, "./TextureTransformTest.gltf"),
  );
  return JSON.parse(buf.toString()) as GlTf;
}

describe("getRoots", () => {
  it("should get the roots with scenes", async () => {
    const gltf = await getData();
    const nodes = gltf.nodes.map(translateNode);
    const roots = getRoots(gltf, nodes);
    expect(roots[0]).toBeInstanceOf(pc.GraphNode);
    expect(roots.length).toBe(6);
  });

  it("should get the root without scenes", async () => {
    const gltf = await getData();
    const nodes = gltf.nodes.map(translateNode);
    delete gltf.scenes;
    delete gltf.scene;
    const roots = getRoots(gltf, nodes);
    expect(roots[0]).toBeInstanceOf(pc.GraphNode);
    expect(roots.length).toBe(1);
  });
});
