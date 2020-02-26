/* eslint-disable @typescript-eslint/no-explicit-any */
import pc from "playcanvas";
import { SingleDOF } from "../types";
import { AnimationKeyable } from "./AnimationKeyable";

export class AnimationTarget {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public vScale?: any; // pc.Vec3

  public constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public targetNode: pc.Entity | pc.GraphNode,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public targetPath?: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public targetProp?: any,
  ) {}

  public toString() {
    if (typeof this.targetNode === "string") {
      return this.targetNode;
    }
    let str =
      typeof this.targetNode === "string"
        ? this.targetNode
        : this.targetNode?.name ?? "";
    if (this.targetPath) {
      str += `_${this.targetPath}`;
    }
    if (this.targetProp) {
      str += `_${this.targetProp}`;
    }
    return str;
  }

  public copy(target: AnimationTarget) {
    if (target) {
      this.targetNode = target.targetNode;
      this.targetPath = target.targetPath;
      this.targetProp = target.targetProp;
    }
    return this;
  }

  public clone() {
    const cloned = new AnimationTarget(
      this.targetNode,
      this.targetPath,
      this.targetProp,
    );
    return cloned;
  }

  public blendToTarget(value: SingleDOF, p: number) {
    if (typeof value === "undefined" || p > 1 || p <= 0) {
      // p===0 remain prev
      return;
    }

    // target needs scaling for retargetting
    if (this.targetPath === "localPosition" && this.vScale) {
      if (value instanceof pc.Vec3) {
        value.x *= this.vScale.x;
        value.y *= this.vScale.y;
        value.z *= this.vScale.z;
      } else if (
        this.targetProp &&
        this.vScale &&
        typeof value === "number" &&
        typeof this.vScale[this.targetProp] === "number"
      ) {
        value = (value as number) * (this.vScale[this.targetProp] as number);
      }
    }

    if (p === 1) {
      this.updateToTarget(value);
      return;
    }

    const targetNode = this.targetNode as any;
    const targetPath = this.targetPath as any;
    const targetProp = this.targetProp as any;

    // p*cur + (1-p)*prev
    if (targetNode && targetPath && targetNode[targetPath] !== undefined) {
      let blendValue: SingleDOF;
      if (targetProp && targetProp in targetNode[targetPath]) {
        blendValue = AnimationKeyable.linearBlendValue(
          targetNode[targetPath][targetProp],
          value,
          p,
        ) as typeof value;
        targetNode[targetPath][targetProp] = blendValue;
      } else {
        blendValue = AnimationKeyable.linearBlendValue(
          targetNode[targetPath],
          value,
          p,
        ) as typeof value;
        targetNode[targetPath] = blendValue;
      }

      // special wrapping for eulerangles
      if (this.targetPath === "localEulerAngles") {
        let vec3 = new pc.Vec3();
        if (["x", "y", "z"].includes(this.targetProp)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (vec3 as any)[this.targetProp] = blendValue as number;
        } else {
          vec3 = blendValue as pc.Vec3;
        }
        this.targetNode.setLocalEulerAngles(vec3);
      }

      // execute update target
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof (this.targetNode as any)._dirtifyLocal === "function") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.targetNode as any)._dirtifyLocal();
      }
    }

    /* /special wrapping for morph weights
    if (this.targetNode && this.targetPath === "weights" && this.targetNode.model)
    {
        var meshInstances = this.targetNode.model.meshInstances;
        for (var m = 0; m < meshInstances.length; m++)
        {
            var morphInstance = meshInstances[m].morphInstance;
            if (!morphInstance) continue;
            morphInstance.setWeight(this.targetProp, keyable.value);
        }
    }*/
  }

  public updateToTarget(value: SingleDOF) {
    if (typeof value === "undefined") {
      return;
    }
    // target needs scaling for retargetting
    if (this.targetPath === "localPosition" && this.vScale) {
      if (value instanceof pc.Vec3) {
        value.x *= this.vScale.x;
        value.y *= this.vScale.y;
        value.z *= this.vScale.z;
      } else if (
        typeof value === "number" &&
        typeof this.vScale[this.targetProp] === "number"
      ) {
        value *= this.vScale[this.targetProp];
      }
    }

    const targetNode = this.targetNode as any;
    const targetPath = this.targetPath as any;
    const targetProp = this.targetProp as any;

    if (targetNode && targetNode[targetPath] !== undefined) {
      if (targetProp in targetNode[targetPath]) {
        targetNode[targetPath][targetProp] = value;
      } else {
        targetNode[targetPath] = value;
      }

      // special wrapping for eulerangles
      if (targetPath === "localEulerAngles") {
        let vec3 = new pc.Vec3();
        if (["x", "y", "z"].includes(targetProp)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (vec3 as any)[targetProp] = value;
        } else {
          vec3 = value as pc.Vec3;
        }
        targetNode.setLocalEulerAngles(vec3);
      }

      // execute update target
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof targetNode._dirtifyLocal === "function") {
        targetNode._dirtifyLocal();
      }
    }

    // special wrapping for morph weights
    if (targetNode && targetPath === "weights" && targetNode.model) {
      const { model } = targetNode as pc.Entity;
      if (!model) {
        return;
      }
      const meshInstances = model.meshInstances;
      for (let m = 0; m < meshInstances.length; m += 1) {
        const morphInstance = (meshInstances[m] as any).morphInstance;
        if (!morphInstance) {
          continue;
        }
        morphInstance.setWeight(this.targetProp, value);
      }
    }
  }

  public static constructTargetNodes(
    root: pc.GraphNode,
    vec3Scale: pc.Vec3 | null | undefined,
    output: Record<string, AnimationTarget>,
  ) {
    if (!root) {
      return;
    }

    const vScale = vec3Scale || new pc.Vec3(1, 1, 1);
    const rootTargetNode = new AnimationTarget(root);
    if (root.localScale) {
      rootTargetNode.vScale = new pc.Vec3(
        root.localScale.x * vScale.x,
        root.localScale.y * vScale.y,
        root.localScale.z * vScale.z,
      );
    }

    output[rootTargetNode.targetNode.name] = rootTargetNode;
    for (let i = 0; i < root.children.length; i += 1) {
      AnimationTarget.constructTargetNodes(
        root.children[i],
        rootTargetNode.vScale,
        output,
      );
    }
  }

  public static getLocalScale(node: pc.GraphNode, localScale: pc.Vec3) {
    localScale.set(1, 1, 1);
    if (!node) {
      return;
    }
    while (node) {
      if (node.localScale) {
        localScale.mul(node.localScale);
      }
      node = node.parent;
    }
  }
}
