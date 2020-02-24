import pc from "playcanvas";
import createDebug from "debug";
import { AnimationClip } from "../animation/AnimationClip";
import {
  AnimationCurve,
  AnimationCurveType,
} from "../animation/AnimationCurve";
import {
  AnimationKeyableType,
  AnimationKeyable,
} from "../animation/AnimationKeyable";
import { Animation } from "../types";
import { GlTfParser } from "../GlTfParser";
import { ensureKeyType } from "./ensureKeyType";
import { getAccessorData } from "./getAccessorData";

const debug = createDebug("translateAnimation");

// Specification:
//   https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#animation
export function translateAnimation(
  data: Animation,
  { gltf, nodes, buffers }: GlTfParser,
) {
  const clip = new AnimationClip();
  clip.loop = true;
  if (data.name) {
    clip.name = data.name;
  }

  const { accessors } = gltf;
  if (!accessors) {
    throw new Error("Missing glTF accessors");
  }

  data.channels.forEach(channel => {
    const sampler = data.samplers[channel.sampler];
    const times = getAccessorData(gltf, accessors[sampler.input], buffers);
    const values = getAccessorData(gltf, accessors[sampler.output], buffers);

    if (!values || !times) {
      return;
    }

    let numCurves = values.length / times.length;
    let time, value, inTangent, outTangent;
    const target = channel.target;

    debug("target", target);
    debug("numCurves", numCurves);

    if (!target || typeof target.node === "undefined") {
      return;
    }

    const path = target.path;
    let curve: AnimationCurve;
    let keyType: AnimationKeyableType;
    // Animation for the same root, organized in one AnimationComponent
    const entity = nodes[target.node];

    if (path === "weights") {
      for (let i = 0; i < numCurves; i += 1) {
        curve = new AnimationCurve();
        keyType = AnimationKeyableType.NUM;
        curve.keyableType = keyType;
        curve.addTarget("model", path, i.toString());
        if (sampler.interpolation === "CUBIC") {
          curve.type = AnimationCurveType.CUBIC;
        } else if (sampler.interpolation === "STEP") {
          curve.type = AnimationCurveType.STEP;
        }
        for (let j = 0; j < times.length; j += 1) {
          time = times[j];
          value = values[numCurves * j + i];
          curve.insertKey(keyType, time, value);
        }
        debug("curve", curve);
        clip.addCurve(curve);
      }
    } else {
      // translation, rotation or scale
      const valuesContainTangents = sampler.interpolation === "CUBICSPLINE";
      if (valuesContainTangents) {
        numCurves /= 3;
      }

      switch (Math.round(numCurves)) {
        case 1:
          keyType = AnimationKeyableType.NUM;
          break;
        case 3:
          keyType = AnimationKeyableType.VEC;
          break;
        case 4:
          keyType = AnimationKeyableType.QUAT;
          break;
        default:
          console.warn(
            "Unexpected amount of curves per keyframe: " + numCurves,
          );
          keyType = AnimationKeyableType.NUM;
      }

      let targetPath = path;
      switch (path) {
        case "translation":
          ensureKeyType(keyType, AnimationKeyableType.VEC);
          targetPath = "localPosition";
          break;
        case "scale":
          ensureKeyType(keyType, AnimationKeyableType.VEC);
          targetPath = "localScale";
          break;
        case "rotation":
          ensureKeyType(keyType, AnimationKeyableType.QUAT);
          targetPath = "localRotation";
          break;
      }

      curve = new AnimationCurve();
      curve.keyableType = keyType;
      curve.setTarget(entity, targetPath);
      if (sampler.interpolation === "CUBIC") {
        curve.type = AnimationCurveType.CUBIC;
      } else if (sampler.interpolation === "STEP") {
        curve.type = AnimationCurveType.STEP;
      } else if (sampler.interpolation === "CUBICSPLINE") {
        curve.type = AnimationCurveType.CUBICSPLINE_GLTF;
      }

      // glTF animation keys can be assumed to be serialized in time
      // order so no need to use AnimationCurve#insertKey (which does
      // extra work to insert a key at the correct index).
      let keyable: AnimationKeyable;
      const keyables: AnimationKeyable[] = [];
      if (valuesContainTangents) {
        for (let i = 0; i < times.length; i += 1) {
          time = times[i];
          switch (keyType) {
            case AnimationKeyableType.VEC:
              inTangent = new pc.Vec3(
                values[9 * i + 0],
                values[9 * i + 1],
                values[9 * i + 2],
              );
              value = new pc.Vec3(
                values[9 * i + 3],
                values[9 * i + 4],
                values[9 * i + 5],
              );
              outTangent = new pc.Vec3(
                values[9 * i + 6],
                values[9 * i + 7],
                values[9 * i + 8],
              );
              break;
            case AnimationKeyableType.QUAT:
              inTangent = new pc.Quat(
                values[12 * i + 0],
                values[12 * i + 1],
                values[12 * i + 2],
                values[12 * i + 3],
              );
              value = new pc.Quat(
                values[12 * i + 4],
                values[12 * i + 5],
                values[12 * i + 6],
                values[12 * i + 7],
              );
              outTangent = new pc.Quat(
                values[12 * i + 8],
                values[12 * i + 9],
                values[12 * i + 10],
                values[12 * i + 11],
              );
              break;
            default:
            case AnimationKeyableType.NUM:
              inTangent = values[3 * i];
              value = values[3 * i + 1];
              outTangent = values[3 * i + 2];
          }
          keyable = new AnimationKeyable(keyType, time, value);
          keyable.inTangent = inTangent;
          keyable.outTangent = outTangent;
          debug("keyable", keyable);
          keyables.push(keyable);
        }
      } else {
        for (let i = 0; i < times.length; i += 1) {
          time = times[i];
          switch (keyType) {
            case AnimationKeyableType.VEC:
              value = new pc.Vec3(
                values[3 * i + 0],
                values[3 * i + 1],
                values[3 * i + 2],
              );
              break;
            case AnimationKeyableType.QUAT:
              value = new pc.Quat(
                values[4 * i + 0],
                values[4 * i + 1],
                values[4 * i + 2],
                values[4 * i + 3],
              );
              break;
            default:
            case AnimationKeyableType.NUM:
              value = values[i];
          }
          keyable = new AnimationKeyable(keyType, time, value);
          keyables.push(keyable);
        }
      }
      curve.animKeys = keyables;
      if (time !== undefined) {
        curve.duration = time;
      }
      debug("addCurve", curve);
      clip.addCurve(curve);
    }
  });

  debug("clip", clip);

  // if (data.extras && processAnimationExtras) {
  //   processAnimationExtras(clip, data.extras);
  // }
  return clip;
}
