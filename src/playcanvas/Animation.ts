export enum AnimationState {
  Loop = "LOOP",
  LoopReverse = "LOOP_REVERSE",
  Once = "ONCE",
  OnceReverse = "ONCE_REVERSE",
}

/**
 * Wrapper for pc.AnimComponentLayer assigned to a specific pc.Entity.
 */
export class Animation {
  public constructor(
    private _node: pc.Entity,
    private _layer: pc.AnimComponentLayer,
    private _index: number,
    private _defaultState?: AnimationState,
    autoPlay?: boolean,
    startTime?: number,
  ) {
    this._layer.pause();
    if (_defaultState && autoPlay) {
      this._layer.play(_defaultState);
      if (startTime !== undefined) {
        this._layer.activeStateCurrentTime = Math.min(
          startTime,
          this._layer.activeStateDuration,
        );
      }
    }
    console.log(
      _defaultState,
      autoPlay,
      startTime,
      this._layer.activeStateDuration,
    );
  }

  public get node() {
    return this._node;
  }

  public get index() {
    return this._index;
  }

  public get name() {
    return this._layer.name;
  }

  public get playable() {
    return this._layer.playable;
  }

  public get playing() {
    return this._layer.playing;
  }

  public get defaultState() {
    return this._defaultState;
  }

  public get activeState() {
    return this._layer.activeState;
  }

  public play(state: AnimationState) {
    const currentTime = (() => {
      switch (state) {
        case AnimationState.Loop:
        case AnimationState.Once:
          return 0;
        case AnimationState.LoopReverse:
          return (
            this._layer.activeStateCurrentTime % this._layer.activeStateDuration
          );
        case AnimationState.OnceReverse:
          return this._layer.activeStateCurrentTime;
      }
    })();
    this._layer.play(state);
    this._layer.activeStateCurrentTime = Math.min(
      currentTime,
      this._layer.activeStateDuration,
    );
  }

  public pause() {
    this._layer.pause();
  }
}
