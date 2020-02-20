import { BlendValue } from "../types";
import { AnimationClip } from "./AnimationClip";
import { AnimationSession } from "./AnimationSession";

export class AnimationComponent {
  public name = "";
  public animClipsMap: Record<string, AnimationClip> = {};
  public animClips: AnimationClip[] = [];
  public curClip = "";
  public animSessions: Record<string, AnimationSession> = {};

  public clipCount(): number {
    return this.animClips.length;
  }

  /**
   * @returns {AnimationClip}
   */

  public getCurrentClip(): AnimationClip {
    return this.animClipsMap[this.curClip];
  }

  public clipAt(index: number) {
    if (this.animClips.length <= index) {
      return;
    }
    return this.animClips[index];
  }

  public addClip(clip: AnimationClip) {
    if (clip && clip.name) {
      this.animClips.push(clip);
      this.animClipsMap[clip.name] = clip;
    }
  }

  public removeClip(name: string) {
    const clip = this.animClipsMap[name];
    if (clip) {
      const idx = this.animClips.indexOf(clip);
      if (idx !== -1) {
        this.animClips.splice(idx, 1);
      }
      delete this.animClipsMap[name];
    }

    if (this.curClip === name) {
      this.curClip = "";
    }
  }

  public playClip(name: string) {
    const clip = this.animClipsMap[name];
    if (clip) {
      this.curClip = name;
      clip.play();
    }
  }

  public stopClip() {
    const session = this.animSessions[this.curClip];
    if (session) {
      session.stop();
    }
    const clip = this.animClipsMap[this.curClip];
    if (clip) {
      clip.stop();
    }
    this.curClip = "";
  }

  public crossFadeToClip(name: string, duration: number) {
    const fromClip = this.animClipsMap[this.curClip];
    const toClip = this.animClipsMap[name];

    if (fromClip && toClip) {
      fromClip.fadeOut(duration);
      toClip.fadeIn(duration);
      this.curClip = name;
    } else if (fromClip) {
      fromClip.fadeOut(duration);
      this.curClip = "";
    } else if (toClip) {
      toClip.fadeIn(duration);
      this.curClip = name;
    }
  }

  // blend related
  public setBlend(blendValue: BlendValue, weight: number, curveName: string) {
    const curClip = this.getCurrentClip();
    if (curClip && curClip.session) {
      curClip.session.setBlend(blendValue, weight, curveName);
    }
  }

  public unsetBlend(curveName: string) {
    const curClip = this.getCurrentClip();
    if (curClip && curClip.session) {
      curClip.session.unsetBlend(curveName);
    }
  }

  // APIs for sessions =================================================
  public getCurrentSession() {
    return this.animSessions[this.curClip];
  }

  public playSession(name: string) {
    const session = this.animSessions[name];
    if (session) {
      session.play();
      this.curClip = name;
    }
  }

  public stopSession() {
    const session = this.animSessions[this.curClip];
    if (session) {
      session.stop();
    }
    const clip = this.animClipsMap[this.curClip];
    if (clip) {
      clip.stop();
    }
    this.curClip = "";
  }

  /**
   * @param {String} name
   * @param {number} duration
   */

  public crossFadeToSession(name: string, duration: number) {
    const fromSession = this.animSessions[this.curClip];
    const toSession = this.animSessions[name];

    if (fromSession && this.animSessions[name]) {
      fromSession.fadeOut(duration);
      toSession.fadeIn(duration);
      this.curClip = name;
    } else if (fromSession) {
      fromSession.fadeOut(duration);
      this.curClip = "";
    } else if (toSession) {
      toSession.fadeIn(duration);
      this.curClip = name;
    }
  }

  /**
   * @param {BlendValue} blendValue
   * @param {number} weight
   * @param {String} curveName
   */

  public setBlendSession(
    blendValue: BlendValue,
    weight: number,
    curveName: string,
  ) {
    const curSession = this.animSessions[this.curClip];
    if (curSession) {
      curSession.setBlend(blendValue, weight, curveName);
    }
  }

  /**
   * @param {String} curveName
   */

  public unsetBlendSession(curveName: string) {
    const curSession = this.animSessions[this.curClip];
    if (curSession) {
      curSession.unsetBlend(curveName);
    }
  }

  /**
   * @param {String} substr
   */

  public playSubstring(substr: string) {
    const n = this.animClips.length;
    for (let i = 0; i < n; i += 1) {
      const clip = this.animClips[i];
      if (clip.isPlaying) {
        clip.pause();
      }
      if (clip.name.indexOf(substr) !== -1) {
        clip.play();
      }
    }
  }

  public pauseAll() {
    const n = this.animClips.length;
    for (let i = 0; i < n; i += 1) {
      const clip = this.animClips[i];
      if (clip.isPlaying) {
        clip.pause();
      }
    }
  }
}
