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
    private _autoPlay = false,
    private _initialStartTime?: number,
  ) {
    this._layer.pause();
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

  public get defaultState() {
    return this._defaultState;
  }

  public get activeState() {
    return this._layer.activeState;
  }

  public init() {
    // Only animations with a default state and start time have to
    // be initialized
    if (!this.defaultState || (!this._autoPlay && !this._initialStartTime)) {
      return;
    }

    this.play(this.defaultState, this._initialStartTime);

    // Non-auto played animations have to play for one frame
    // to get to their start time frame
    if (!this._autoPlay) {
      requestAnimationFrame(() => this.pause());
    }
  }

  public play(state: AnimationState, startTime?: number) {
    const currentTime = startTime ?? this._getStartTime(state);
    this._layer.play(state);
    this._layer.activeStateCurrentTime = Math.min(
      currentTime,
      this._layer.activeStateDuration,
    );
  }

  public pause() {
    this._layer.pause();
  }

  private _getStartTime(state: AnimationState) {
    return (() => {
      switch (state) {
        case AnimationState.Loop:
        case AnimationState.Once:
          return this._layer.activeStateCurrentTime >=
            this._layer.activeStateDuration
            ? 0
            : this._layer.activeStateCurrentTime;
        case AnimationState.LoopReverse:
          return (
            this._layer.activeStateCurrentTime % this._layer.activeStateDuration
          );
        case AnimationState.OnceReverse:
          return this._layer.activeStateCurrentTime;
      }
    })();
  }
}
