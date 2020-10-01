import * as pc from "@animech-public/playcanvas";
import Debug from "debug";
import { ExtensionParser } from "./ExtensionParser";
import { ExtensionRegistry } from "./ExtensionRegistry";

const debug = Debug("AnimationPlayData");

type AnimInteractionDataMap = {
  anim: pc.AnimTrack;
  data: AnimationPlayData;
};

export type AnimationPlayData = {
  looping?: boolean;
  playing?: boolean;
  playRate?: number;
  position?: number;
};

export const animationPlayDataDefaults = {
  looping: true,
  playing: true, // TODO
  playRate: 1,
  position: 0,
};

export class AnimationPlayDataExtensionParser implements ExtensionParser {
  private _animDatas: AnimInteractionDataMap[] = [];

  public get name() {
    return "EPIC_animation_play_data";
  }

  public getPlayDataByAnimationIndex(
    container: pc.ContainerResource,
  ): (AnimationPlayData | undefined)[] {
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
    extensionData: AnimationPlayData,
  ) {
    debug("Parse animation play data", animTrack, extensionData);

    this._animDatas.push({
      anim: animTrack,
      data: extensionData,
    });
  }
}
