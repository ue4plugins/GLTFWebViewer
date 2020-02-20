import pc from "playcanvas";
import { Skin } from "../types";
import { GlTfParser } from "../GlTfParser";
import { getAccessorData } from "./getAccessorData";
// Specification:
//   https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#skin
export function translateSkin(
  data: Skin,
  { gltf, buffers, device, nodes }: GlTfParser,
) {
  let bindMatrix;
  const joints = data.joints;
  const numJoints = joints.length;
  const ibp = [];

  if (data.inverseBindMatrices && gltf.accessors) {
    const inverseBindMatrices = data.inverseBindMatrices;
    const ibmData = getAccessorData(
      gltf,
      gltf.accessors[inverseBindMatrices],
      buffers,
    );

    if (!ibmData) {
      return;
    }

    const ibmValues = [];
    for (let i = 0; i < numJoints; i += 1) {
      for (let j = 0; j < 16; j += 1) {
        ibmValues[j] = ibmData[i * 16 + j];
      }
      bindMatrix = new pc.Mat4();
      bindMatrix.set(ibmValues);
      ibp.push(bindMatrix);
    }
  } else {
    for (let i = 0; i < numJoints; i += 1) {
      bindMatrix = new pc.Mat4();
      ibp.push(bindMatrix);
    }
  }

  const boneNames = [];
  for (let i = 0; i < numJoints; i += 1) {
    boneNames[i] = nodes[joints[i]].name;
  }

  const skeleton = data.skeleton;
  const skin = new pc.Skin(device, ibp, boneNames);

  if (skeleton) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (skin as any).skeleton = nodes[skeleton];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (skin as any).bones = [];
  for (let i = 0; i < joints.length; i += 1) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (skin as any).bones[i] = nodes[joints[i]];
  }

  return skin;
}
