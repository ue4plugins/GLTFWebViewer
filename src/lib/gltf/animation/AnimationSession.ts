import pc from "playcanvas";
import {
  Playable,
  AnimationTargetsMap,
  Blendable,
  BlendValue,
  AnimationInput,
} from "../types";
import { AnimationClipSnapshot } from "./AnimationClipSnapshot";
import { AnimationKeyable, AnimationKeyableType } from "./AnimationKeyable";
import { AnimationEvent, AnimationEventCallback } from "./AnimationEvent";
import { AnimationCurve, AnimationCurveType } from "./AnimationCurve";
import { AnimationClip } from "./AnimationClip";
import { AnimationTarget } from "./AnimationTarget";

type CacheKeyIdx = any; // eslint-disable-line
type CacheValue = any; // eslint-disable-line
type AnyContext = any; // eslint-disable-line
type AnyParameter = any; // eslint-disable-line

export class AnimationSession {
  private _cacheKeyIdx?: CacheKeyIdx;
  private _cacheValue?: CacheValue;
  private _cacheBlendValues: Record<
    string,
    AnimationClipSnapshot | AnimationKeyable | null
  > = {};

  public begTime = -1;
  public endTime = -1;
  public curTime = 0;
  public accTime = 0;
  public bySpeed = -1;
  public isPlaying = false;
  public loop = false;
  public animTargets: AnimationTargetsMap = {};
  public animEvents: AnimationEvent[] = [];
  public blendables: Record<string, Blendable> = {};
  public blendWeights: Record<string, number> = {};

  // fade related
  public fadeBegTime = -1;
  public fadeEndTime = -1;
  public fadeTime = -1;
  public fadeDir = 0; // 1 is in, -1 is out
  public fadeSpeed = 1;

  public constructor(
    public playable?: Playable,
    targets?: AnimationTargetsMap,
  ) {
    this.allocateCache();
    this.animTargets = targets ?? this.playable?.getAnimTargets() ?? {};
  }

  public onTimer(dt: number) {
    this.curTime += this.bySpeed * dt;
    this.accTime += this.bySpeed * dt;

    const isValidTime =
      this.curTime < this.begTime || this.curTime > this.endTime;

    const notPlayingOrLooping = !this.isPlaying || (!this.loop && isValidTime);

    if (notPlayingOrLooping) {
      // not in range
      this.invokeByTime(this.curTime);
      this.stop();
      this.invokeByName("stop");
      return;
    }

    // round time to duration
    const duration = this.endTime - this.begTime;

    if (this.curTime > this.endTime) {
      // loop start
      this.invokeByTime(this.curTime);
      this.curTime -= duration;
      for (let i = 0; i < this.animEvents.length; i += 1) {
        this.animEvents[i].triggered = false;
      }
    }

    if (this.curTime < this.begTime) {
      this.curTime += duration;
    }

    if (this.fadeDir) {
      this.fadeTime += dt; // (this.bySpeed * dt);
      if (this.fadeTime >= this.fadeEndTime) {
        if (this.fadeDir === 1) {
          // fadein completed
          this.fadeDir = 0;
          this.fadeBegTime = -1;
          this.fadeEndTime = -1;
          this.fadeTime = -1;
        } else if (this.fadeDir === -1) {
          // fadeout completed
          this.stop();
          return;
        }
      }
    }

    this.showAt(
      this.curTime,
      this.fadeDir,
      this.fadeBegTime,
      this.fadeEndTime,
      this.fadeTime,
    );
    this.invokeByTime(this.curTime);
  }

  public static _allocatePlayableCache(playable: Playable) {
    if (!playable) {
      return null;
    }

    if (playable instanceof AnimationCurve) {
      return new AnimationKeyable(playable.keyableType);
    } else if (playable instanceof AnimationClip) {
      const snapshot = new AnimationClipSnapshot();
      for (let i = 0, len = playable.animCurves.length; i < len; i += 1) {
        const cname = playable.animCurves[i].name;
        snapshot.curveKeyable[cname] = new AnimationKeyable(
          playable.animCurves[i].keyableType,
        );
        snapshot.curveNames.push(cname);
      }
      return snapshot;
    }
    return null;
  }

  public allocateCache() {
    if (!this.playable) {
      return;
    }

    if (this.playable instanceof AnimationCurve) {
      this._cacheKeyIdx = 0;
    } else if (this.playable instanceof AnimationClip) {
      this._cacheKeyIdx = {};
    }

    this._cacheValue = AnimationSession._allocatePlayableCache(this.playable);
  }

  public clone() {
    let i, key;
    const cloned = new AnimationSession();

    cloned.begTime = this.begTime;
    cloned.endTime = this.endTime;
    cloned.curTime = this.curTime;
    cloned.accTime = this.accTime;
    cloned.bySpeed = this.bySpeed;
    cloned.loop = this.loop;
    cloned.isPlaying = this.isPlaying;

    // fading
    cloned.fadeBegTime = this.fadeBegTime;
    cloned.fadeEndTime = this.fadeEndTime;
    cloned.fadeTime = this.fadeTime;
    cloned.fadeDir = this.fadeDir; // 1 is in, -1 is out
    cloned.fadeSpeed = this.fadeSpeed;

    cloned.playable = this.playable;
    cloned.allocateCache(); // 1215

    // targets
    cloned.animTargets = {};
    for (key in this.animTargets) {
      if (!this.animTargets[key]) {
        continue;
      }
      const ttargets = this.animTargets[key];
      const ctargets = [];
      for (i = 0; i < ttargets.length; i += 1) {
        ctargets.push(ttargets[i].clone());
      }
      cloned.animTargets[key] = ctargets;
    }

    // events
    cloned.animEvents = [];
    for (i = 0; i < this.animEvents.length; i += 1) {
      cloned.animEvents.push(this.animEvents[i].clone());
    }

    // blending
    cloned.blendables = {};
    for (key in this.blendables) {
      if (this.blendables[key]) {
        cloned.blendables[key] = this.blendables[key];
        cloned._cacheBlendValues[key] = AnimationSession._allocatePlayableCache(
          this.blendables[key] as Playable,
        ); // 1226, only animationclip has a snapshot cache, otherwise null
      }
    }

    cloned.blendWeights = {};
    for (key in this.blendWeights) {
      if (this.blendWeights[key]) {
        cloned.blendWeights[key] = this.blendWeights[key];
      }
    }

    return cloned;
  }

  public setBlend(blendValue: BlendValue, weight: number, curveName: string) {
    if (blendValue instanceof AnimationClip) {
      if (!curveName || curveName === "") {
        curveName = "__default__";
      }
      this.blendables[curveName] = blendValue;
      this._cacheBlendValues[
        curveName
      ] = AnimationSession._allocatePlayableCache(blendValue); // 1226
      this.blendWeights[curveName] = weight;
      return;
    }

    // blendable is just a single DOF=================================
    let keyType;
    if (typeof blendValue === "number") {
      // 1 instanceof Number is false, don't know why
      keyType = AnimationKeyableType.NUM;
    } else if (blendValue instanceof pc.Vec3) {
      keyType = AnimationKeyableType.VEC;
    } else if (blendValue instanceof pc.Quat) {
      keyType = AnimationKeyableType.QUAT;
    }

    if (!curveName || curveName === "" || typeof keyType === "undefined") {
      // has to specify curveName
      return;
    }

    this.blendWeights[curveName] = weight;
    this.blendables[curveName] = new AnimationKeyable(keyType, 0, blendValue);
    this._cacheBlendValues[curveName] = null; // 1226, null if blendable is not animationclip
  }

  public unsetBlend(curveName: string) {
    if (!curveName || curveName === "") {
      curveName = "__default__";
    }

    // unset blendvalue
    if (this.blendables[curveName]) {
      delete this.blendables[curveName];
      delete this._cacheBlendValues[curveName]; // 1226
      delete this.blendWeights[curveName];
    }
  }

  public on(
    name: string,
    time: number,
    fnCallback: AnimationEventCallback,
    context: AnyContext,
    parameter: AnyParameter,
  ) {
    if (!name || !fnCallback) {
      return;
    }

    const event = new AnimationEvent(
      name,
      time,
      fnCallback,
      context,
      parameter,
    );
    let pos = 0;
    for (; pos < this.animEvents.length; pos += 1) {
      if (this.animEvents[pos].triggerTime > time) {
        break;
      }
    }

    if (pos >= this.animEvents.length) {
      this.animEvents.push(event);
    } else {
      this.animEvents.splice(pos, 0, event);
    }
  }

  public off(name: string, time: number, fnCallback: AnimationEventCallback) {
    let pos = 0;
    for (; pos < this.animEvents.length; pos += 1) {
      const event = this.animEvents[pos];
      if (!event) {
        continue;
      }
      if (event.name === name && event.fnCallback === fnCallback) {
        break;
      }

      if (event.triggerTime === time && event.fnCallback === fnCallback) {
        break;
      }
    }

    if (pos < this.animEvents.length) {
      this.animEvents.splice(pos, 1);
    }
  }

  public removeAllEvents() {
    this.animEvents = [];
  }

  public invokeByName(name: string) {
    for (let i = 0; i < this.animEvents.length; i += 1) {
      if (this.animEvents[i] && this.animEvents[i].name === name) {
        this.animEvents[i].invoke();
      }
    }
  }

  public invokeByTime(time: number) {
    for (let i = 0; i < this.animEvents.length; i += 1) {
      if (!this.animEvents[i]) {
        continue;
      }

      if (this.animEvents[i].triggerTime > time) {
        break;
      }

      if (!this.animEvents[i].triggered) {
        this.animEvents[i].invoke();
      }
    }
  }

  public blendToTarget(input: AnimationInput, p: number) {
    let cname, ctargets, blendUpdateNone;
    const eBlendType = { PARTIAL_BLEND: 0, FULL_UPDATE: 1, NONE: 2 };

    if (!input || p > 1 || p <= 0) {
      // p===0 remain prev
      return;
    }

    if (p === 1) {
      this.updateToTarget(input);
      return;
    }

    // playable is a curve, input is a AnimationKeyable, animTargets is an object {curvename:[]targets}
    if (
      this.playable instanceof AnimationCurve &&
      input instanceof AnimationKeyable
    ) {
      cname = this.playable.name;
      ctargets = this.animTargets[cname];
      if (!ctargets) {
        return;
      }

      // 10/10, if curve is step, let's not blend
      blendUpdateNone = eBlendType.PARTIAL_BLEND;
      if (this.playable.type === AnimationCurveType.STEP && this.fadeDir) {
        if (
          (this.fadeDir === -1 && p <= 0.5) ||
          (this.fadeDir === 1 && p > 0.5)
        ) {
          blendUpdateNone = eBlendType.FULL_UPDATE;
        } else {
          blendUpdateNone = eBlendType.NONE;
        }
      }

      for (let j = 0; j < ctargets.length; j += 1) {
        if (blendUpdateNone === eBlendType.PARTIAL_BLEND) {
          if (p) {
            ctargets[j].blendToTarget(input.value, p);
          }
        } else if (blendUpdateNone === eBlendType.FULL_UPDATE) {
          ctargets[j].updateToTarget(input.value);
        }
      }
      return;
    }

    // playable is a clip, input is a AnimationClipSnapshot, animTargets is an object {curvename1:[]targets, curvename2:[]targets, curvename3:[]targets}
    if (
      this.playable instanceof AnimationClip &&
      input instanceof AnimationClipSnapshot
    ) {
      for (let i = 0; i < input.curveNames.length; i += 1) {
        cname = input.curveNames[i];
        if (!cname) {
          continue;
        }

        blendUpdateNone = eBlendType.PARTIAL_BLEND;
        if (
          this.playable.animCurvesMap[cname] &&
          this.playable.animCurvesMap[cname].type === AnimationCurveType.STEP &&
          this.fadeDir
        ) {
          if (
            (this.fadeDir === -1 && p <= 0.5) ||
            (this.fadeDir === 1 && p > 0.5)
          ) {
            blendUpdateNone = eBlendType.FULL_UPDATE;
          } else {
            blendUpdateNone = eBlendType.NONE;
          }
        }

        ctargets = this.animTargets[cname];
        if (!ctargets) {
          continue;
        }

        for (let j = 0; j < ctargets.length; j += 1) {
          if (blendUpdateNone === eBlendType.PARTIAL_BLEND) {
            ctargets[j].blendToTarget(input.curveKeyable[cname].value, p);
          } else if (blendUpdateNone === eBlendType.FULL_UPDATE) {
            ctargets[j].updateToTarget(input.value);
          }
        }
      }
    }
  }

  public updateToTarget(input: AnimationInput) {
    let cname: string;
    let ctargets: AnimationTarget[];

    if (!input) {
      return;
    }

    // playable is a curve, input is a AnimationKeyable
    if (
      this.playable instanceof AnimationCurve &&
      input instanceof AnimationKeyable
    ) {
      cname = this.playable.name;
      ctargets = this.animTargets[cname];
      if (!ctargets) {
        return;
      }

      for (let j = 0; j < ctargets.length; j += 1) {
        ctargets[j].updateToTarget(input.value);
      }
      return;
    }

    // playable is a clip, input is a AnimationClipSnapshot
    if (
      this.playable instanceof AnimationClip &&
      input instanceof AnimationClipSnapshot
    ) {
      for (let i = 0; i < input.curveNames.length; i += 1) {
        cname = input.curveNames[i];
        if (!cname) {
          continue;
        }
        ctargets = this.animTargets[cname];
        if (!ctargets) {
          continue;
        }

        for (let j = 0; j < ctargets.length; j += 1) {
          if (input.curveKeyable[cname]) {
            ctargets[j].updateToTarget(input.curveKeyable[cname].value);
          }
        }
      }
    }
  }

  public showAt(
    time: number,
    fadeDir: number,
    fadeBegTime: number,
    fadeEndTime: number,
    fadeTime: number,
  ) {
    if (!this.playable) {
      return;
    }
    let p;
    let input = this.playable.eval_cache(
      time,
      this._cacheKeyIdx,
      this._cacheValue,
    );
    if (input) {
      this._cacheKeyIdx = input._cacheKeyIdx;
    }
    // blend related==========================================================
    // blend animations first
    Object.keys(this.blendables).forEach(bname => {
      p = this.blendWeights[bname];
      const blendClip = this.blendables[bname];
      if (
        blendClip &&
        blendClip instanceof AnimationClip &&
        typeof p === "number"
      ) {
        const blendInput = blendClip.eval_cache(
          this.accTime % blendClip.duration,
          null,
          this._cacheBlendValues[bname] as AnimationClipSnapshot,
        );
        if (this.playable && blendInput) {
          input = AnimationClipSnapshot.linearBlendExceptStep(
            input,
            blendInput,
            p,
            this.playable.animCurvesMap,
          );
        }
      }
    });

    // blend custom bone second
    Object.keys(this.blendables).forEach(cname => {
      p = this.blendWeights[cname];
      const blendkey = this.blendables[cname];
      if (
        !blendkey ||
        !input.curveKeyable[cname] ||
        blendkey instanceof AnimationClip
      ) {
        return true;
      }
      const resKey = AnimationKeyable.linearBlend(
        input.curveKeyable[cname],
        blendkey as AnimationKeyable,
        p,
      );
      input.curveKeyable[cname] = resKey;
      return true;
    });

    if (fadeDir === 0 || fadeTime < fadeBegTime || fadeTime > fadeEndTime) {
      this.updateToTarget(input);
    } else {
      p = (fadeTime - fadeBegTime) / (fadeEndTime - fadeBegTime);
      if (fadeDir === -1) {
        p = 1 - p;
      }

      if (this.fadeSpeed < 1 && fadeDir === -1) {
        // fadeOut from non-100%
        p *= this.fadeSpeed;
      }

      this.blendToTarget(input, p);
    }
  }

  public play(
    playable?: Playable,
    animTargets?: AnimationTargetsMap,
  ): AnimationSession {
    let i: number;

    if (playable) {
      this.playable = playable;
      this.allocateCache();
    }

    if (
      !(this.playable instanceof AnimationClip) &&
      !(this.playable instanceof AnimationCurve)
    ) {
      return this;
    }

    if (this.isPlaying) {
      // already playing
      return this;
    }

    this.begTime = 0;
    this.endTime = this.playable.duration;
    this.curTime = 0;
    this.accTime = 0;
    this.isPlaying = true;
    if (playable && this !== playable.session) {
      this.bySpeed = playable.bySpeed;
      this.loop = playable.loop;
    }

    if (
      !animTargets &&
      playable &&
      typeof playable.getAnimTargets === "function"
    ) {
      this.animTargets = playable.getAnimTargets();
    } else if (animTargets) {
      this.animTargets = animTargets;
    }

    // reset events
    for (i = 0; i < this.animEvents.length; i += 1) {
      this.animEvents[i].triggered = false;
    }

    const app = pc.Application.getApplication();
    if (!app) {
      return this;
    }

    app.on("update", this.onTimer.bind(this));
    this.showAt(
      this.curTime,
      this.fadeDir,
      this.fadeBegTime,
      this.fadeEndTime,
      this.fadeTime,
    );
    return this;
  }

  public stop() {
    const app = pc.Application.getApplication();
    if (!app) {
      return this;
    }

    app.off("update", this.onTimer);
    this.curTime = 0;
    this.isPlaying = false;
    this.fadeBegTime = -1;
    this.fadeEndTime = -1;
    this.fadeTime = -1;
    this.fadeDir = 0;
    this.fadeSpeed = 1;
    return this;
  }

  public pause() {
    const app = pc.Application.getApplication();
    if (!app) {
      return this;
    }
    app.off("update", this.onTimer);
    this.isPlaying = false;
    return this;
  }

  public resume() {
    if (!this.isPlaying) {
      this.isPlaying = true;
      const app = pc.Application.getApplication();
      if (!app) {
        return;
      }
      app.on("update", this.onTimer);
    }
  }

  public fadeOut(duration: number) {
    if (this.fadeDir === 0) {
      // fade out from normal playing session
      this.fadeSpeed = 1;
    } else if (this.fadeDir === 1) {
      // fade out from session in the middle of fading In
      this.fadeSpeed =
        (this.fadeTime - this.fadeBegTime) /
        (this.fadeEndTime - this.fadeBegTime);
    }
    // fade out from seesion that is fading out
    else {
      return;
    } //

    if (typeof duration !== "number") {
      duration = 0;
    }

    this.fadeBegTime = this.curTime;
    this.fadeTime = this.fadeBegTime;
    this.fadeEndTime = this.fadeBegTime + duration;
    this.fadeDir = -1;
  }

  public fadeIn(duration: number, playable?: Playable) {
    if (this.isPlaying) {
      this.stop();
    }
    this.fadeSpeed = 0;
    this.curTime = 0;
    if (typeof duration !== "number") {
      duration = 0;
    }

    this.fadeBegTime = this.curTime;
    this.fadeTime = this.fadeBegTime;
    this.fadeEndTime = this.fadeBegTime + duration;
    this.fadeDir = 1;
    if (playable) {
      this.playable = playable;
      this.allocateCache();
    }
    this.play(playable);
  }

  public fadeTo(playable: Playable, duration: number) {
    this.fadeOut(duration);
    const session = new AnimationSession();
    session.fadeIn(duration, playable);
    return session;
  }

  public fadeToSelf(duration: number) {
    const session = this.clone();
    const app = pc.Application.getApplication();
    if (!app) {
      return;
    }
    app.off("update", this.onTimer);
    session.fadeOut(duration);

    this.stop();
    this.fadeIn(duration);
  }
}
