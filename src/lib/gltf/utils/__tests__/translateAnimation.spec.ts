import "jest";
import path from "path";
import { readFile } from "fs-extra";
import { translateAnimation } from "../translateAnimation";
import { toArrayBuffer } from "../toArrayBuffer";
import { GlTf } from "../../types";
import { translateNode } from "../translateNode";
import { AnimationClip } from "../../animation/AnimationClip";
import { AnimationSession } from "../../animation/AnimationSession";

const basePath = "./public/assets/models/AnimatedCube/glTF";

async function loadGltf(): Promise<GlTf> {
  return JSON.parse(
    (await readFile(path.join(basePath, "./AnimatedCube.gltf"))).toString(),
  );
}

async function loadBin(): Promise<ArrayBuffer> {
  return toArrayBuffer(
    await readFile(path.join(basePath, "./AnimatedCube.bin")),
  );
}

describe("translateAnimation", () => {
  it("should translate glTF animation to AnimationClip", async () => {
    expect.assertions(5);
    const gltf = await loadGltf();
    const nodes = gltf.nodes?.map(node => translateNode(node));
    const buffers = [await loadBin()];
    if (gltf.animations) {
      const aniClip = translateAnimation(gltf.animations[0], {
        gltf,
        nodes,
        buffers,
      });
      expect(aniClip).toBeInstanceOf(AnimationClip);
      expect(aniClip.name).toBe("animation_AnimatedCube");
      expect(aniClip.animCurves.length).toBe(1);
      expect(aniClip.animCurves[0].name).toBe("curve0");
      expect(aniClip.session).toBeInstanceOf(AnimationSession);
    }
  });
});
