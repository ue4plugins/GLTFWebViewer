import { AnimationCurveMap, MapStringToNumber } from "../types";
import { AnimationKeyable } from "./AnimationKeyable";
import { AnimationCurveType } from "./AnimationCurve";

export class AnimationClipSnapshot {
  public curveKeyable: Record<string, AnimationKeyable> = {};
  public curveNames: string[] = [];
  public time = -1;
  public _cacheKeyIdx: MapStringToNumber = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public value: any; // SingleDOF | undefined;

  copy(shot: AnimationClipSnapshot) {
    if (!shot) {
      return this;
    }

    this.curveKeyable = {};
    this.curveNames = [];
    for (let i = 0; i < shot.curveNames.length; i += 1) {
      const cname = shot.curveNames[i];
      this.curveKeyable[cname] = new AnimationKeyable().copy(
        shot.curveKeyable[cname],
      );
      this.curveNames.push(cname);
    }
    return this;
  }

  clone() {
    const cloned = new AnimationClipSnapshot().copy(this);
    return cloned;
  }

  static linearBlend(
    shot1: AnimationClipSnapshot,
    shot2: AnimationClipSnapshot,
    p: number,
  ): AnimationClipSnapshot {
    if (p === 0) {
      return shot1;
    }
    if (p === 1) {
      return shot2;
    }

    const resShot = new AnimationClipSnapshot();
    resShot.copy(shot1);
    for (let i = 0; i < shot2.curveNames.length; i += 1) {
      const cname = shot2.curveNames[i];
      if (shot1.curveKeyable[cname] && shot2.curveKeyable[cname]) {
        const resKey = AnimationKeyable.linearBlend(
          shot1.curveKeyable[cname],
          shot2.curveKeyable[cname],
          p,
        );
        if (resKey) {
          resShot.curveKeyable[cname] = resKey;
        }
      } else if (shot1.curveKeyable[cname]) {
        resShot.curveKeyable[cname] = shot1.curveKeyable[cname];
      } else if (shot2.curveKeyable[cname]) {
        resShot.curveKeyable[cname] = shot2.curveKeyable[cname];
      }
    }
    return resShot;
  }

  static linearBlendExceptStep(
    shot1: AnimationClipSnapshot,
    shot2: AnimationClipSnapshot,
    p: number,
    animCurveMap: AnimationCurveMap,
  ): AnimationClipSnapshot {
    if (p === 0) {
      return shot1;
    }
    if (p === 1) {
      return shot2;
    }

    const resShot = new AnimationClipSnapshot();
    resShot.copy(shot1);
    for (let i = 0; i < shot2.curveNames.length; i += 1) {
      const cname = shot2.curveNames[i];
      if (shot1.curveKeyable[cname] && shot2.curveKeyable[cname]) {
        if (
          animCurveMap[cname] &&
          animCurveMap[cname].type === AnimationCurveType.STEP
        ) {
          if (p > 0.5) {
            resShot.curveKeyable[cname] = shot2.curveKeyable[cname];
          } else {
            resShot.curveKeyable[cname] = shot1.curveKeyable[cname];
          }
        } else {
          const resKey = AnimationKeyable.linearBlend(
            shot1.curveKeyable[cname],
            shot2.curveKeyable[cname],
            p,
          );
          if (resKey) {
            resShot.curveKeyable[cname] = resKey;
          }
        }
      } else if (shot1.curveKeyable[cname]) {
        resShot.curveKeyable[cname] = shot1.curveKeyable[cname];
      } else if (shot2.curveKeyable[cname]) {
        resShot.curveKeyable[cname] = shot2.curveKeyable[cname];
      }
    }
    return resShot;
  }
}
