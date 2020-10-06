import * as pc from "@animech-public/playcanvas";
import Debug from "debug";
import { ExtensionParser } from "./ExtensionParser";
import { ExtensionRegistry } from "./ExtensionRegistry";

const debug = Debug("AnimationPlayback");

type AnimInteractionDataMap = {
  anim: pc.AnimTrack;
  data: AnimationPlayback;
};

export type AnimationPlayback = {
  loop?: boolean;
  autoPlay?: boolean;
  playRate?: number;
  startTime?: number;
};

export const animationPlaybackDefaults = {
  loop: true,
  autoPlay: true,
  playRate: 1,
  startTime: 0,
};

export class AnimationPlaybackExtensionParser implements ExtensionParser {
  private _animDatas: AnimInteractionDataMap[] = [];

  public get name() {
    return "EPIC_animation_playback";
  }

  public getPlaybackByAnimationIndex(
    container: pc.ContainerResource,
  ): (AnimationPlayback | undefined)[] {
    const { animations } = container;
    return animations.map(
      animationAsset =>
        this._animDatas.find(({ anim }) => animationAsset.resource === anim)
          ?.data,
    );
  }

  public register(registry: ExtensionRegistry) {
    registry.animation.add(this.name, {
      postParse: this._animationPostParse.bind(this),
    });
  }

  public unregister(registry: ExtensionRegistry) {
    registry.texture.remove(this.name);
  }

  public postParse() {
    // Ignore
  }

  private _animationPostParse(
    animTrack: pc.AnimTrack,
    extensionData: AnimationPlayback,
  ) {
    debug("Parse animation play data", animTrack, extensionData);

    this._animDatas.push({
      anim: animTrack,
      data: extensionData,
    });
  }
}
