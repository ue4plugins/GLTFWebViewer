import { Playable, AnimationTargetsMap, MapStringToNumber } from "../types";
import { AnimationTarget } from "./AnimationTarget";
import { AnimationCurve, AnimationCurveType } from "./AnimationCurve";
import { AnimationSession } from "./AnimationSession";
import { AnimationClipSnapshot } from "./AnimationClipSnapshot";
import { AnimationEventCallback } from "./AnimationEvent";
import { AnimationKeyable, AnimationKeyableType } from "./AnimationKeyable";

type AnyContext = any; // eslint-disable-line
type AnyParameter = any; // eslint-disable-line

export class AnimationClip implements Playable {
  public name = "clip" + AnimationClip.count.toString();
  public duration = 0;
  public animCurvesMap: Record<string, AnimationCurve> = {};
  public animCurves: AnimationCurve[] = [];
  public session: AnimationSession;

  public constructor(public root?: pc.GraphNode) {
    this.name = "clip" + AnimationClip.count.toString();
    this.duration = 0;
    this.animCurvesMap = {}; // a map for easy query
    this.animCurves = [];
    if (root) {
      this.constructFromRoot(root);
    }
    this.session = new AnimationSession(this);
  }

  public static count = 0;

  public get isPlaying() {
    return this.session.isPlaying;
  }

  public set isPlaying(isPlaying: boolean) {
    this.session.isPlaying = isPlaying;
  }

  public get loop() {
    return this.session.loop;
  }

  public set loop(loop) {
    this.session.loop = loop;
  }

  public get bySpeed() {
    return this.session.bySpeed;
  }

  public set bySpeed(bySpeed) {
    this.session.bySpeed = bySpeed;
  }

  public copy(clip: AnimationClip): AnimationClip {
    this.name = clip.name;
    this.duration = clip.duration;

    // copy curves
    this.animCurves.length = 0;
    this.animCurvesMap = {};

    for (let i = 0, len = clip.animCurves.length; i < len; i += 1) {
      const curve = clip.animCurves[i];
      this.addCurve(curve.clone());
    }

    return this;
  }

  public clone() {
    return new AnimationClip().copy(this);
  }

  public updateDuration() {
    this.duration = 0;
    for (let i = 0, len = this.animCurves.length; i < len; i += 1) {
      const curve = this.animCurves[i];
      this.duration = Math.max(this.duration, curve.duration);
    }
  }
  public showAt(
    time: number,
    fadeDir: number,
    fadeBegTime: number,
    fadeEndTime: number,
    fadeTime: number,
  ) {
    this.session.showAt(time, fadeDir, fadeBegTime, fadeEndTime, fadeTime);
  }

  public blendToTarget(snapshot: AnimationClipSnapshot, p: number) {
    this.session.blendToTarget(snapshot, p);
  }
  public updateToTarget(snapshot: AnimationClipSnapshot) {
    this.session.updateToTarget(snapshot);
  }

  public getAnimTargets(): AnimationTargetsMap {
    /** @type {AnimationTargetsMap} */
    const animTargets: AnimationTargetsMap = {};
    for (let i = 0, len = this.animCurves.length; i < len; i += 1) {
      const curve = this.animCurves[i];
      const curveTarget = curve.getAnimTargets();
      animTargets[curve.name] = curveTarget[curve.name];
    }
    return animTargets;
  }

  public resetSession() {
    this.session.playable = this;
    this.session.animTargets = this.getAnimTargets();
    this.session.isPlaying = true;
    this.session.begTime = 0;
    this.session.endTime = this.duration;
    this.session.curTime = 0;
    this.session.bySpeed = 1;
    this.session.loop = true;
  }

  public play() {
    this.session.play(this);
  }

  public stop() {
    this.session.stop();
  }

  public pause() {
    this.session.pause();
  }

  public resume() {
    this.session.resume();
  }

  public fadeIn(duration: number) {
    this.session.fadeIn(duration, this);
  }

  public fadeOut(duration: number) {
    this.session.fadeOut(duration);
  }

  public fadeTo(toClip: AnimationClip, duration: number) {
    this.session.fadeTo(toClip, duration);
  }

  public addCurve(curve: AnimationCurve) {
    if (curve && curve.name) {
      this.animCurves.push(curve);
      this.animCurvesMap[curve.name] = curve;
      if (curve.duration > this.duration) {
        this.duration = curve.duration;
      }
    }
  }

  public removeCurve(name: string) {
    if (name) {
      const curve = this.animCurvesMap[name];
      if (curve) {
        const idx = this.animCurves.indexOf(curve);
        if (idx !== -1) {
          this.animCurves.splice(idx, 1);
        }
        delete this.animCurvesMap[name];
        this.updateDuration();
      }
    }
  }

  public removeAllCurves() {
    this.animCurves.length = 0;
    this.animCurvesMap = {};

    this.duration = 0;
  }

  public on(
    name: string,
    time: number,
    fnCallback: AnimationEventCallback,
    context: AnyContext,
    parameter: AnyParameter,
  ) {
    if (this.session) {
      this.session.on(name, time, fnCallback, context, parameter);
    }
    return this;
  }

  public off(name: string, time: number, fnCallback: AnimationEventCallback) {
    if (this.session) {
      this.session.off(name, time, fnCallback);
    }
    return this;
  }

  public removeAllEvents() {
    if (this.session) {
      this.session.removeAllEvents();
    }
    return this;
  }

  public getSubClip(tmBeg: number, tmEnd: number): AnimationClip {
    const subClip = new AnimationClip();
    subClip.name = this.name + "_sub";
    subClip.root = this.root;

    for (let i = 0, len = this.animCurves.length; i < len; i += 1) {
      const curve = this.animCurves[i];
      const subCurve = curve.getSubCurve(tmBeg, tmEnd);
      subClip.addCurve(subCurve);
    }

    return subClip;
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public eval_cache(
    time: number,
    cacheKeyIdx: MapStringToNumber | null,
    cacheValue: AnimationClipSnapshot,
  ): AnimationClipSnapshot | undefined {
    // 1226
    if (!cacheValue) {
      if (!cacheKeyIdx) {
        return;
      }
      const ret = this.eval(0);
      ret._cacheKeyIdx = cacheKeyIdx;
      return ret;
    }

    const snapshot = cacheValue;
    snapshot.time = time;

    for (let i = 0, len = this.animCurves.length; i < len; i += 1) {
      const curve = this.animCurves[i];
      const ki = cacheKeyIdx ? cacheKeyIdx[curve.name] : 0;
      const kv = cacheValue
        ? cacheValue.curveKeyable[curve.name]
        : new AnimationKeyable(curve.keyableType);
      const keyable = curve.eval_cache(time, ki, kv); // 0210
      if (keyable) {
        if (cacheKeyIdx && keyable._cacheKeyIdx) {
          cacheKeyIdx[curve.name] = keyable._cacheKeyIdx;
        }
        snapshot.curveKeyable[curve.name] = keyable;
      }
    }
    if (cacheKeyIdx) {
      snapshot._cacheKeyIdx = cacheKeyIdx;
    }
    return snapshot;
  }

  public eval(time: number): AnimationClipSnapshot {
    const snapshot = new AnimationClipSnapshot();
    snapshot.time = time;

    for (let i = 0, len = this.animCurves.length; i < len; i += 1) {
      const curve = this.animCurves[i];
      const keyable = curve.eval(time);
      if (keyable) {
        snapshot.curveKeyable[curve.name] = keyable;
        snapshot.curveNames.push(curve.name); // 1226
      }
    }
    return snapshot;
  }

  /**
   * @param {pc.GraphNode} root
   */

  public constructFromRoot(root: pc.GraphNode) {
    if (!root) {
      return;
    }

    // scale
    const curveScale = new AnimationCurve();
    curveScale.keyableType = AnimationKeyableType.VEC;
    curveScale.name = root.name + ".localScale";
    curveScale.setTarget(root as pc.Entity, "localScale");
    this.addCurve(curveScale);

    // translate
    const curvePos = new AnimationCurve();
    curvePos.keyableType = AnimationKeyableType.VEC;
    curvePos.name = root.name + ".localPosition";
    curvePos.setTarget(root as pc.Entity, "localPosition");
    this.addCurve(curvePos);

    // rotate
    const curveRotQuat = new AnimationCurve();
    curveRotQuat.name = root.name + ".localRotation.quat";
    curveRotQuat.keyableType = AnimationKeyableType.QUAT;
    curveRotQuat.setTarget(root as pc.Entity, "localRotation");
    this.addCurve(curveRotQuat);

    // children
    for (let i = 0; i < root.children.length; i += 1) {
      if (root.children[i]) {
        this.constructFromRoot(root.children[i]);
      }
    }
  }

  /*
  //this animation clip's target will now to root
  //Note that animationclip's original target may be on different scale from new root, for "localPosition", this needs to be adjusted
  //Example: animation clip is made under AS scale,
  //         AS will never change no matter how many times this animation clip is transferred, because it is bound with how it is made
  //         when it is transferred to a new root, which is under RS scale, define standard scale SS=1,
  //thus
  //         standardPos = curvePos / AS;          converting curvePos from AS to SS
  //         newRootPos = standardPos * RS;        converting position under SS to new RS
  //thus
  //         target.vScale = RS / AS;              how to update curve pos to target
  //         newRootPos = curvePos * target.vScale
  //
  //given animation clip, it maybe transferred multiple times, and its original AS is unknown, to recover AS, we have
  //                      RS (scale of current root in scene) and
  //                      vScale (scale of animation curve's value update to target)
  //thus
  //         AS = RS / vScale;
  //
  //to transfer again to a new root with scale NS
  //
  //         standardPos = curvePos / AS = curvePos * vScale / RS
  //         newTargetPos = standardPos * NS = curvePos * vScale * NS / RS
  //
  //thus
  //         newTarget.vScale = NS / AS = vScale * NS / RS;
  //
  */

  /**
   * @param {pc.GraphNode} root
   */

  public transferToRoot(root: pc.GraphNode) {
    const cScale = new pc.Vec3();
    const dictTarget: Record<string, AnimationTarget> = {};
    AnimationTarget.constructTargetNodes(root, null, dictTarget); // contains localScale information

    for (let i = 0, len = this.animCurves.length; i < len; i += 1) {
      const curve = this.animCurves[i];
      if (curve.animTargets.length === 0) {
        continue;
      }

      // ctrl-drag target root is specified as "model"
      // link targetNode to root properly
      if (curve.animTargets[0].targetNode.toString() === "model") {
        curve.animTargets[0].targetNode = root;
      }

      const ctarget = curve.animTargets[0];
      const atarget = dictTarget[ctarget.targetNode.name];
      if (atarget) {
        // match by target name
        AnimationTarget.getLocalScale(ctarget.targetNode, cScale);
        ctarget.targetNode = atarget.targetNode; // atarget contains scale information
        if (atarget.vScale) {
          ctarget.vScale = cScale.clone();
          if (atarget.vScale.x) {
            ctarget.vScale.x /= atarget.vScale.x;
          }
          if (atarget.vScale.y) {
            ctarget.vScale.y /= atarget.vScale.y;
          }
          if (atarget.vScale.z) {
            ctarget.vScale.z /= atarget.vScale.z;
          }
        }
      } // else // not found
      // console.warn("transferToRoot: " + ctarget.targetNode.name + "in animation clip " + this.name + " has no transferred target under " + root.name);
    }
  }

  // blend related
  public updateCurveNameFromTarget() {
    for (let i = 0, len = this.animCurves.length; i < len; i += 1) {
      const curve = this.animCurves[i];
      if (!curve.animTargets || curve.animTargets.length < 1) {
        continue;
      }

      // change name to target string
      const oldName = curve.name; // backup before change
      const newName = curve.animTargets[0].toString();
      if (oldName === newName) {
        // no need to change name
        continue;
      }

      curve.name = newName;
      delete this.animCurvesMap[oldName];
      this.animCurvesMap[newName] = curve;
    }
  }

  public removeEmptyCurves() {
    for (let i = 0, len = this.animCurves.length; i < len; i += 1) {
      const curve = this.animCurves[i];
      if (!curve || !curve.animKeys || curve.animKeys.length === 0) {
        this.removeCurve(curve.name);
      }
    }
  }

  /**
   * @param {AnimationCurveType} type
   */

  public setInterpolationType(type: AnimationCurveType) {
    for (let i = 0, len = this.animCurves.length; i < len; i += 1) {
      const curve = this.animCurves[i];
      if (curve) {
        curve.type = type;
      }
    }
  }
}
