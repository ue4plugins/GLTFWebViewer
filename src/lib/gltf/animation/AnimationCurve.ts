import {
  Playable,
  AnimationCurveMap,
  AnimationTargetsMap,
  SingleDOF,
} from "../types";
import { AnimationKeyable, AnimationKeyableType } from "./AnimationKeyable";
import { AnimationSession } from "./AnimationSession";
import { AnimationTarget } from "./AnimationTarget";
import { AnimationEventCallback } from "./AnimationEvent";

type AnyContext = any; // eslint-disable-line
type AnyParameter = any; // eslint-disable-line

export enum AnimationCurveType {
  LINEAR,
  STEP,
  CUBIC,
  CUBICSPLINE_GLTF,
}

export class AnimationCurve implements Playable {
  public name = "curve" + AnimationCurve.count.toString();
  public type = AnimationCurveType.LINEAR;
  public keyableType = AnimationKeyableType.NUM;
  public tension = 0.5;
  public animTargets: AnimationTarget[] = [];
  public animCurves: AnimationCurve[] = [];
  public animCurvesMap: AnimationCurveMap = {};
  public duration = 0;
  public animKeys: AnimationKeyable[] = [];
  public session: AnimationSession;

  constructor() {
    AnimationCurve.count += 1;
    this.session = new AnimationSession(this);
  }

  static count = 0;

  get isPlaying() {
    if (this.session) {
      return this.session.isPlaying;
    }
    return false;
  }

  set isPlaying(isPlaying: boolean) {
    if (this.session) {
      this.session.isPlaying = isPlaying;
    }
  }

  get loop() {
    if (this.session) {
      return this.session.loop;
    }
    return false;
  }

  set loop(loop: boolean) {
    if (this.session) {
      this.session.loop = loop;
    }
  }

  get bySpeed() {
    if (this.session) {
      return this.session.bySpeed;
    }
    return 0;
  }

  set bySpeed(bySpeed: number) {
    if (this.session) {
      this.session.bySpeed = bySpeed;
    }
  }

  public copy(curve: AnimationCurve) {
    this.name = curve.name;
    this.type = curve.type;
    this.keyableType = curve.keyableType;
    this.tension = curve.tension;
    this.duration = curve.duration;

    this.animTargets = [];
    for (let i = 0; i < curve.animTargets.length; i += 1) {
      this.animTargets.push(curve.animTargets[i].clone());
    }

    this.animKeys = [];
    for (let i = 0; i < curve.animKeys.length; i += 1) {
      const key = new AnimationKeyable();
      key.copy(curve.animKeys[i]);
      this.animKeys.push(key);
    }
    return this;
  }

  public clone() {
    return new AnimationCurve().copy(this);
  }

  public addTarget(
    targetNode: string,
    targetPath: string,
    targetProp?: string | number,
  ) {
    const target = new AnimationTarget(targetNode, targetPath, targetProp);
    this.animTargets.push(target);
  }

  // eslint-disable-next-line
  public setTarget(targetNode: any, targetPath: string, targetProp?: string) {
    this.animTargets = [];
    this.addTarget(targetNode, targetPath, targetProp);
  }

  public clearTargets() {
    this.animTargets = [];
  }

  public resetSession() {
    if (this.session) {
      this.session.playable = this;
      this.session.animTargets = this.getAnimTargets();
      this.session.isPlaying = true;
      this.session.begTime = 0;
      this.session.endTime = this.duration;
      this.session.curTime = 0;
      this.session.bySpeed = 1;
      this.session.loop = true;
    }
  }

  public blendToTarget(keyable: AnimationKeyable, p: number) {
    if (this.session) {
      this.session.blendToTarget(keyable, p);
    }
  }

  public updateToTarget(keyable: AnimationKeyable) {
    if (this.session) {
      this.session.updateToTarget(keyable);
    }
  }

  public getAnimTargets(): AnimationTargetsMap {
    /** @type {AnimationTargetsMap} */
    const result: AnimationTargetsMap = {};
    result[this.name] = this.animTargets; // an array []
    return result;
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

  public removeAllEvents(): AnimationCurve {
    if (this.session) {
      this.session.removeAllEvents();
    }
    return this;
  }

  public fadeIn(duration: number) {
    if (!this.session) {
      this.session = new AnimationSession(this);
    }
    this.session.fadeIn(duration, this);
  }

  public fadeOut(duration: number) {
    if (this.session) {
      this.session.fadeOut(duration);
    }
  }

  public play() {
    if (!this.session) {
      this.session = new AnimationSession(this);
    }
    this.session.play(this);
  }

  public resume() {
    if (this.session) {
      this.session.resume();
    }
  }

  public stop() {
    if (this.session) {
      this.session.pause();
    }
  }

  public showAt(
    time: number,
    fadeDir: number,
    fadeBegTime: number,
    fadeEndTime: number,
    fadeTime: number,
  ) {
    if (this.session) {
      this.session.showAt(time, fadeDir, fadeBegTime, fadeEndTime, fadeTime);
    }
  }

  public setAnimKeys(animKeys: AnimationKeyable[]) {
    this.animKeys = animKeys;
  }

  public insertKey(type: AnimationKeyableType, time: number, value: SingleDOF) {
    if (this.keyableType !== type) {
      return;
    }

    let pos = 0;
    while (pos < this.animKeys.length && this.animKeys[pos].time < time) {
      pos += 1;
    }

    // replace if existed at time
    if (pos < this.animKeys.length && this.animKeys[pos].time === time) {
      this.animKeys[pos].value = value;
      return;
    }

    const keyable = new AnimationKeyable(type, time, value);

    // append at the back
    if (pos >= this.animKeys.length) {
      this.animKeys.push(keyable);
      this.duration = time;
      return;
    }

    // insert at pos
    this.animKeys.splice(pos, 0, keyable);
  }

  public insertKeyable(keyable: AnimationKeyable) {
    if (!keyable || this.keyableType !== keyable.type) {
      return;
    }

    const time = keyable.time;
    let pos = 0;
    while (pos < this.animKeys.length && this.animKeys[pos].time < time) {
      pos += 1;
    }

    // replace if existed at time
    if (pos < this.animKeys.length && this.animKeys[pos].time === time) {
      this.animKeys[pos] = keyable;
      return;
    }

    // append at the back
    if (pos >= this.animKeys.length) {
      this.animKeys.push(keyable);
      this.duration = time;
      return;
    }

    // insert at pos
    this.animKeys.splice(pos, 0, keyable);
  }

  public removeKey(index: number) {
    if (index <= this.animKeys.length) {
      if (index === this.animKeys.length - 1) {
        this.duration = index - 1 >= 0 ? this.animKeys[index - 1].time : 0;
      }
      this.animKeys.splice(index, 1);
    }
  }

  public removeAllKeys() {
    this.animKeys = [];
    this.duration = 0;
  }

  public shiftKeyTime(time: number) {
    for (let i = 0; i < this.animKeys.length; i += 1) {
      this.animKeys[i].time += time;
    }
  }

  public getSubCurve(tmBeg: number, tmEnd: number) {
    const subCurve = new AnimationCurve();
    subCurve.type = this.type;
    subCurve.name = this.name + "_sub";
    subCurve.keyableType = this.keyableType;
    subCurve.animTargets = this.animTargets;
    subCurve.tension = this.tension;

    subCurve.animTargets = [];
    for (let i = 0; i < this.animTargets.length; i += 1) {
      subCurve.animTargets.push(this.animTargets[i].clone());
    }

    let tmFirst = -1;
    for (let i = 0; i < this.animKeys.length; i += 1) {
      if (this.animKeys[i].time >= tmBeg && this.animKeys[i].time <= tmEnd) {
        if (tmFirst < 0) {
          tmFirst = this.animKeys[i].time;
        }

        const key = new AnimationKeyable().copy(this.animKeys[i]);
        key.time -= tmFirst;
        subCurve.animKeys.push(key);
      }
    }

    subCurve.duration = tmFirst === -1 ? 0 : tmEnd - tmFirst;
    return subCurve;
  }

  public evalLINEAR(time: number) {
    if (!this.animKeys || this.animKeys.length === 0) {
      return;
    }

    // 1. find the interval [key1, key2]
    let key1: AnimationKeyable | undefined;
    let key2: AnimationKeyable | undefined;
    let resKey: AnimationKeyable | undefined = new AnimationKeyable();
    for (let i = 0; i < this.animKeys.length; i += 1) {
      if (this.animKeys[i].time === time) {
        resKey.copy(this.animKeys[i]);
        return resKey;
      }

      if (this.animKeys[i].time > time) {
        key2 = this.animKeys[i];
        break;
      }
      key1 = this.animKeys[i];
    }

    if (!key1 && !key2) {
      return;
    }

    // 2. only found one boundary
    if (!key1 || !key2) {
      const copyKey = (key1 || key2) as AnimationKeyable;
      resKey.copy(copyKey);
      resKey.time = time;
      return resKey;
    }

    // 3. both found then interpolate
    const p = (time - key1.time) / (key2.time - key1.time);
    resKey = AnimationKeyable.linearBlend(key1, key2, p);
    if (resKey) {
      resKey.time = time;
    }
    return resKey;
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public evalLINEAR_cache(
    time: number,
    cacheKeyIdx: number,
    cacheValue: AnimationKeyable,
  ) {
    if (!this.animKeys || this.animKeys.length === 0) {
      return;
    }

    // 1. find the interval [key1, key2]
    let resKey: AnimationKeyable | undefined = cacheValue; // new AnimationKeyable();
    let key1: AnimationKeyable | undefined;
    let key2: AnimationKeyable | undefined;

    let begIdx = 0;
    if (cacheKeyIdx) {
      begIdx = cacheKeyIdx;
    }
    let i = begIdx;

    for (let c = 0; c < this.animKeys.length; c += 1) {
      i = (begIdx + c) % this.animKeys.length;
      if (this.animKeys[i].time === time) {
        resKey.copy(this.animKeys[i]);
        resKey._cacheKeyIdx = i;
        return resKey;
      }

      if (i === 0 && this.animKeys[i].time > time) {
        // earlier than first
        key1 = undefined;
        key2 = this.animKeys[i];
        break;
      }

      if (i === this.animKeys.length - 1 && this.animKeys[i].time < time) {
        // later than last
        key1 = this.animKeys[i];
        key2 = undefined;
        break;
      }
      if (
        this.animKeys[i].time > time &&
        (i - 1 < 0 || this.animKeys[i - 1].time < time)
      ) {
        key1 = this.animKeys[i - 1];
        key2 = this.animKeys[i];
        break;
      }
    }

    if (!key1 && !key2) {
      return;
    }

    // 2. only found one boundary
    if (!key1 || !key2) {
      const copyKey = (key1 || key2) as AnimationKeyable;
      resKey.copy(copyKey);
      resKey.time = time;
      resKey._cacheKeyIdx = i;
      return resKey;
    }

    // 3. both found then interpolate
    const p = (time - key1.time) / (key2.time - key1.time);
    resKey = AnimationKeyable.linearBlend(key1, key2, p, resKey);
    if (resKey) {
      resKey.time = time;
      resKey._cacheKeyIdx = i;
    }
    return resKey;
  }

  public evalSTEP(time: number) {
    if (!this.animKeys || this.animKeys.length === 0) {
      return;
    }

    let key = this.animKeys[0];
    for (let i = 1; i < this.animKeys.length; i += 1) {
      if (this.animKeys[i].time <= time) {
        key = this.animKeys[i];
      } else {
        break;
      }
    }
    const resKey = new AnimationKeyable();
    resKey.copy(key);
    resKey.time = time;
    return resKey;
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public evalSTEP_cache(
    time: number,
    cacheKeyIdx: number,
    cacheValue: AnimationKeyable,
  ) {
    if (!this.animKeys || this.animKeys.length === 0) {
      return;
    }

    let begIdx = 0;
    if (cacheKeyIdx) {
      begIdx = cacheKeyIdx;
    }
    let i = begIdx;

    let key = this.animKeys[i];
    for (let c = 1; c < this.animKeys.length; c += 1) {
      i = (begIdx + c) % this.animKeys.length;

      if (i === 0 && this.animKeys[i].time > time) {
        // earlier than first
        key = this.animKeys[i];
        break;
      }

      if (i === this.animKeys.length - 1 && this.animKeys[i].time <= time) {
        // later than last
        key = this.animKeys[i];
        break;
      }

      if (
        this.animKeys[i].time <= time &&
        (i + 1 >= this.animKeys.length || this.animKeys[i + 1].time > time)
      ) {
        key = this.animKeys[i];
        break;
      }
    }
    const resKey = cacheValue; // new AnimationKeyable();
    resKey.copy(key);
    resKey.time = time;
    resKey._cacheKeyIdx = i;
    return resKey;
  }

  public evalCUBIC(time: number): AnimationKeyable | undefined {
    if (!this.animKeys || this.animKeys.length === 0) {
      return;
    }

    // 1. find interval [key1, key2] enclosing time
    // key0, key3 are for tangent computation
    let key0: AnimationKeyable | undefined;
    let key1: AnimationKeyable | undefined;
    let key2: AnimationKeyable | undefined;
    let key3: AnimationKeyable | undefined;
    let resKey: AnimationKeyable | undefined = new AnimationKeyable();

    for (let i = 0; i < this.animKeys.length; i += 1) {
      if (this.animKeys[i].time === time) {
        resKey.copy(this.animKeys[i]);
        return resKey;
      }
      if (this.animKeys[i].time > time) {
        key2 = this.animKeys[i];
        if (i + 1 < this.animKeys.length) {
          key3 = this.animKeys[i + 1];
        }
        break;
      }
      key1 = this.animKeys[i];
      if (i - 1 >= 0) {
        key0 = this.animKeys[i - 1];
      }
    }

    if (!key1 && !key2) {
      return;
    }

    // 2. only found one boundary
    if (!key1 || !key2) {
      const copyKey = (key1 || key2) as AnimationKeyable;
      resKey.copy(copyKey);
      resKey.time = time;
      return resKey;
    }

    // 3. curve interpolation
    if (
      key0 &&
      key3 &&
      (key1.type === AnimationKeyableType.NUM ||
        key1.type === AnimationKeyableType.VEC)
    ) {
      resKey = AnimationCurve.cubicCardinal(
        key0,
        key1,
        key2,
        key3,
        time,
        this.tension,
      );
      if (resKey) {
        resKey.time = time;
      }
      return resKey;
    }
    return; // quaternion or combo
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public evalCUBIC_CACHE(
    time: number,
    cacheKeyIdx: number,
    cacheValue: AnimationKeyable,
  ): AnimationKeyable | undefined {
    if (!this.animKeys || this.animKeys.length === 0) {
      return;
    }

    let begIdx = 0;
    if (cacheKeyIdx) {
      begIdx = cacheKeyIdx;
    }
    let i = begIdx;

    // 1. find interval [key1, key2] enclosing time
    // key0, key3 are for tangent computation
    let key0: AnimationKeyable | undefined;
    let key1: AnimationKeyable | undefined;
    let key2: AnimationKeyable | undefined;
    let key3: AnimationKeyable | undefined;
    let resKey: AnimationKeyable | undefined = cacheValue; // new AnimationKeyable();
    for (let c = 0; c < this.animKeys.length; c += 1) {
      i = (begIdx + c) % this.animKeys.length;

      if (this.animKeys[i].time === time) {
        resKey.copy(this.animKeys[i]);
        resKey._cacheKeyIdx = i;
        return resKey;
      }

      if (i === 0 && this.animKeys[i].time > time) {
        // earlier than first
        key0 = undefined;
        key1 = undefined;
        key2 = this.animKeys[i];
        if (i + 1 < this.animKeys.length) {
          key3 = this.animKeys[i + 1];
        }
        break;
      }

      if (i === this.animKeys.length - 1 && this.animKeys[i].time < time) {
        // later than last
        if (i - 1 > 0) {
          key0 = this.animKeys[i - 1];
        }
        key1 = this.animKeys[i];
        key2 = undefined;
        key3 = undefined;
        break;
      }

      if (
        this.animKeys[i].time > time &&
        (i - 1 < 0 || this.animKeys[i - 1].time < time)
      ) {
        if (i - 2 > 0) {
          key0 = this.animKeys[i - 2];
        }
        key1 = this.animKeys[i - 1];
        key2 = this.animKeys[i];
        if (i + 1 < this.animKeys.length) {
          key3 = this.animKeys[i + 1];
        }
        break;
      }
    }

    if (!key1 && !key2) {
      return;
    }

    // 2. only found one boundary
    if (!key1 || !key2) {
      const copyKey = (key1 || key2) as AnimationKeyable;
      resKey.copy(copyKey);
      resKey.time = time;
      resKey._cacheKeyIdx = i;
      return resKey;
    }

    // 3. curve interpolation
    if (
      key1.type === AnimationKeyableType.NUM ||
      key1.type === AnimationKeyableType.VEC
    ) {
      resKey = AnimationCurve.cubicCardinal(
        key0,
        key1,
        key2,
        key3,
        time,
        this.tension,
      );
      if (resKey) {
        resKey.time = time;
        resKey._cacheKeyIdx = i;
      }
      return resKey;
    }
    return;
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public evalCUBICSPLINE_GLTF(time: number): AnimationKeyable | undefined {
    if (!this.animKeys || this.animKeys.length === 0) {
      return;
    }

    // 1. find the interval [key1, key2]
    const resKey = new AnimationKeyable();
    let key1, key2;
    for (let i = 0; i < this.animKeys.length; i += 1) {
      if (this.animKeys[i].time === time) {
        resKey.copy(this.animKeys[i]);
        return resKey;
      }

      if (this.animKeys[i].time > time) {
        key2 = this.animKeys[i];
        break;
      }
      key1 = this.animKeys[i];
    }

    if (!key1 && !key2) {
      return;
    }

    // 2. only found one boundary
    if (!key1 || !key2) {
      const copyKey = (key1 || key2) as AnimationKeyable;
      resKey.copy(copyKey);
      resKey.time = time;
      return resKey;
    }

    // 3. both found then interpolate
    const p = (time - key1.time) / (key2.time - key1.time);
    const g = key2.time - key1.time;
    if (this.keyableType === AnimationKeyableType.NUM) {
      const v1 = key1.value as number;
      const v2 = key2.value as number;
      const ot1 = key1.outTangent as number;
      const ot2 = key2.outTangent as number;
      resKey.value = AnimationCurve.cubicHermite(g * ot1, v1, g * ot2, v2, p);
    } else if (this.keyableType === AnimationKeyableType.VEC) {
      const v1 = key1.value as pc.Vec3;
      const v2 = key2.value as pc.Vec3;
      const ot1 = key1.outTangent as pc.Vec3;
      const ot2 = key2.outTangent as pc.Vec3;

      const vx = AnimationCurve.cubicHermite(
        g * ot1.x,
        v1.x,
        g * ot2.x,
        v2.x,
        p,
      );
      if (vx) {
        (resKey.value as pc.Vec3).x = vx;
      }
      const vy = AnimationCurve.cubicHermite(
        g * ot1.y,
        v1.y,
        g * ot2.y,
        v2.y,
        p,
      );
      if (vy) {
        (resKey.value as pc.Vec3).y = vy;
      }
      const vz = AnimationCurve.cubicHermite(
        g * ot1.z,
        v1.z,
        g * ot2.z,
        v2.z,
        p,
      );
      if (vz) {
        (resKey.value as pc.Vec3).z = vz;
      }
    } else if (this.keyableType === AnimationKeyableType.QUAT) {
      const v1 = key1.value as pc.Quat;
      const v2 = key2.value as pc.Quat;
      const ot1 = key1.outTangent as pc.Quat;
      const ot2 = key2.outTangent as pc.Quat;
      (resKey.value as pc.Quat).w = AnimationCurve.cubicHermite(
        g * ot1.w,
        v1.w,
        g * ot2.w,
        v2.w,
        p,
      );
      (resKey.value as pc.Quat).x = AnimationCurve.cubicHermite(
        g * ot1.x,
        v1.x,
        g * ot2.x,
        v2.x,
        p,
      );
      (resKey.value as pc.Quat).y = AnimationCurve.cubicHermite(
        g * ot1.y,
        v1.y,
        g * ot2.y,
        v2.y,
        p,
      );
      (resKey.value as pc.Quat).z = AnimationCurve.cubicHermite(
        g * ot1.z,
        v1.z,
        g * ot2.z,
        v2.z,
        p,
      );
      (resKey.value as pc.Quat).normalize();
    }

    resKey.time = time;
    return resKey;
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public evalCUBICSPLINE_GLTF_cache(
    time: number,
    cacheKeyIdx: number,
    cacheValue: AnimationKeyable,
  ): AnimationKeyable | undefined {
    if (!this.animKeys || this.animKeys.length === 0) {
      return;
    }

    let begIdx = 0;
    if (cacheKeyIdx) {
      begIdx = cacheKeyIdx;
    }
    let i = begIdx;

    // 1. find the interval [key1, key2]
    const resKey = cacheValue; // new AnimationKeyable(); 1215
    let key1, key2;
    for (let c = 0; c < this.animKeys.length; c += 1) {
      i = (begIdx + c) % this.animKeys.length;

      if (this.animKeys[i].time === time) {
        resKey.copy(this.animKeys[i]);
        resKey._cacheKeyIdx = i;
        return resKey;
      }

      if (i === 0 && this.animKeys[i].time > time) {
        // earlier than first
        key1 = null;
        key2 = this.animKeys[i];
        break;
      }

      if (i === this.animKeys.length - 1 && this.animKeys[i].time < time) {
        // later than last
        key1 = this.animKeys[i];
        key2 = null;
        break;
      }

      if (
        this.animKeys[i].time > time &&
        (i - 1 < 0 || this.animKeys[i - 1].time < time)
      ) {
        key1 = this.animKeys[i - 1];
        key2 = this.animKeys[i];
        break;
      }
    }

    if (!key1 && !key2) {
      return;
    }

    // 2. only found one boundary
    if (!key1 || !key2) {
      const copyKey = (key1 || key2) as AnimationKeyable;
      resKey.copy(copyKey);
      resKey.time = time;
      resKey._cacheKeyIdx = i;
      return resKey;
    }

    // 3. both found then interpolate
    const p = (time - key1.time) / (key2.time - key1.time);
    const g = key2.time - key1.time;
    if (this.keyableType === AnimationKeyableType.NUM) {
      const v1 = key1.value as number;
      const v2 = key2.value as number;
      const ot1 = key1.outTangent as number;
      const ot2 = key2.outTangent as number;
      resKey.value = AnimationCurve.cubicHermite(g * ot1, v1, g * ot2, v2, p);
    } else if (this.keyableType === AnimationKeyableType.VEC) {
      const v1 = key1.value as pc.Vec3;
      const v2 = key2.value as pc.Vec3;
      const ot1 = key1.outTangent as pc.Vec3;
      const it2 = key2.inTangent as pc.Vec3;
      (resKey.value as pc.Vec3).x = AnimationCurve.cubicHermite(
        g * ot1.x,
        v1.x,
        g * it2.x,
        v2.x,
        p,
      );
      (resKey.value as pc.Vec3).y = AnimationCurve.cubicHermite(
        g * ot1.y,
        v1.y,
        g * it2.y,
        v2.y,
        p,
      );
      (resKey.value as pc.Vec3).z = AnimationCurve.cubicHermite(
        g * ot1.z,
        v1.z,
        g * it2.z,
        v2.z,
        p,
      );
    } else if (this.keyableType === AnimationKeyableType.QUAT) {
      const v1 = key1.value as pc.Quat;
      const v2 = key2.value as pc.Quat;
      const ot1 = key1.outTangent as pc.Quat;
      const it2 = key2.inTangent as pc.Quat;
      (resKey.value as pc.Quat).w = AnimationCurve.cubicHermite(
        g * ot1.w,
        v1.w,
        g * it2.w,
        v2.w,
        p,
      );
      (resKey.value as pc.Quat).x = AnimationCurve.cubicHermite(
        g * ot1.x,
        v1.x,
        g * it2.x,
        v2.x,
        p,
      );
      (resKey.value as pc.Quat).y = AnimationCurve.cubicHermite(
        g * ot1.y,
        v1.y,
        g * it2.y,
        v2.y,
        p,
      );
      (resKey.value as pc.Quat).z = AnimationCurve.cubicHermite(
        g * ot1.z,
        v1.z,
        g * it2.z,
        v2.z,
        p,
      );
      (resKey.value as pc.Quat).normalize();
    }

    resKey.time = time;
    resKey._cacheKeyIdx = i;
    return resKey;
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public eval_cache(
    time: number,
    cacheKeyIdx: number,
    cacheValue: AnimationKeyable,
  ): AnimationKeyable | undefined {
    if (!this.animKeys || this.animKeys.length === 0) {
      return;
    }

    switch (this.type) {
      case AnimationCurveType.LINEAR:
        return this.evalLINEAR_cache(time, cacheKeyIdx, cacheValue);
      case AnimationCurveType.STEP:
        return this.evalSTEP_cache(time, cacheKeyIdx, cacheValue);
      case AnimationCurveType.CUBIC:
        if (this.keyableType === AnimationKeyableType.QUAT) {
          return this.evalLINEAR_cache(time, cacheKeyIdx, cacheValue);
        }
        return this.evalCUBIC_CACHE(time, cacheKeyIdx, cacheValue);
      case AnimationCurveType.CUBICSPLINE_GLTF: // 10/15, keyable contains (inTangent, value, outTangent)
        return this.evalCUBICSPLINE_GLTF_cache(time, cacheKeyIdx, cacheValue);
    }
  }

  public eval(time: number): AnimationKeyable | undefined {
    if (!this.animKeys || this.animKeys.length === 0) {
      return;
    }

    switch (this.type) {
      case AnimationCurveType.LINEAR:
        return this.evalLINEAR(time);
      case AnimationCurveType.STEP:
        return this.evalSTEP(time);
      case AnimationCurveType.CUBIC:
        if (this.keyableType === AnimationKeyableType.QUAT) {
          return this.evalLINEAR(time);
        }
        return this.evalCUBIC(time);
      case AnimationCurveType.CUBICSPLINE_GLTF: // 10/15, keyable contains (inTangent, value, outTangent)
        return this.evalCUBICSPLINE_GLTF(time);
    }
  }

  static cubicHermite(
    t1: number,
    v1: number,
    t2: number,
    v2: number,
    p: number,
  ): number {
    // basis
    const p2 = p * p;
    const p3 = p2 * p;
    const h0 = 2 * p3 - 3 * p2 + 1;
    const h1 = -2 * p3 + 3 * p2;
    const h2 = p3 - 2 * p2 + p;
    const h3 = p3 - p2;

    // interpolation
    return v1 * h0 + v2 * h1 + t1 * h2 + t2 * h3;
  }

  static cubicCardinal(
    key0: AnimationKeyable | undefined,
    key1: AnimationKeyable | undefined,
    key2: AnimationKeyable | undefined,
    key3: AnimationKeyable | undefined,
    time: number,
    tension: number,
    cacheValue?: AnimationKeyable,
  ): AnimationKeyable | undefined {
    let m1, m2;

    if (!key1 || !key2 || key1.type !== key2.type) {
      return;
    }

    if (
      key1.type !== AnimationKeyableType.NUM &&
      key1.type !== AnimationKeyableType.VEC
    ) {
      return;
    }

    const p = (time - key1.time) / (key2.time - key1.time);
    let resKey;
    if (cacheValue) {
      resKey = cacheValue;
    } else {
      resKey = new AnimationKeyable(key1.type);
    }

    // adjust for non-unit-interval
    const factor = tension * (key2.time - key1.time);
    if (key1.type === AnimationKeyableType.NUM) {
      const v1 = key1.value as number;
      const v2 = key2.value as number;
      m1 = (factor * (v2 - v1)) / (key2.time - key1.time);
      if (key0) {
        const v0 = key0.value as number;
        m1 = (2 * factor * (v2 - v0)) / (key2.time - key0.time);
      }

      m2 = (factor * (v2 - v1)) / (key2.time - key1.time);
      if (key3) {
        const v3 = key3.value as number;
        m2 = (2 * factor * (v3 - v1)) / (key3.time - key1.time);
      }
      resKey.value = AnimationCurve.cubicHermite(m1, v1, m2, v2, p);
    }

    // each element in vector, direct x, y, z, w
    if (key1.type === AnimationKeyableType.VEC) {
      const v1 = key1.value as pc.Vec3;
      const v2 = key2.value as pc.Vec3;
      resKey.value = v1.clone();
      const props = ["x", "y", "z", "w"];
      for (let i = 0; i < props.length; i += 1) {
        const pr = props[i] as keyof pc.Vec3;
        if (!resKey.value[pr]) {
          continue;
        }
        m1 =
          (factor * ((v2[pr] as number) - (v1[pr] as number))) /
          (key2.time - key1.time);
        if (key0) {
          const v0 = key0.value as pc.Vec3;
          m1 =
            (2 * factor * ((v2[pr] as number) - (v0[pr] as number))) /
            (key2.time - key0.time);
        }

        m2 =
          (factor * ((v2[pr] as number) - (v1[pr] as number))) /
          (key2.time - key1.time);
        if (key3) {
          const v3 = key3.value as pc.Vec3;
          m2 =
            (2 * factor * ((v3[pr] as number) - (v1[pr] as number))) /
            (key3.time - key1.time);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (resKey.value as any)[pr] = AnimationCurve.cubicHermite(
          m1,
          v1[pr] as number,
          m2,
          v2[pr] as number,
          p,
        );
      }
    }
    return resKey;
  }
}
