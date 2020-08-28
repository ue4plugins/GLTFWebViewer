import Debug from "debug";
import { deepEqual } from "../utilities";
import { VariantSet } from "./VariantSet";

const debug = Debug("VariantSetManager");

export type VariantId = number;
export type VariantSetState = VariantId[];
export type GlobalVariantSetState = ReadonlyArray<VariantSetState>;

export type OnStateChangeCallback = (value: VariantSetState) => void;
export type OnGlobalStateChangeCallback = (
  state: GlobalVariantSetState,
) => void;

export class VariantSetManager {
  private _state: GlobalVariantSetState;
  private _stateCallbacks: OnStateChangeCallback[][];
  private _globalStateCallbacks: OnGlobalStateChangeCallback[] = [];

  public constructor(private _variantSets: VariantSet[]) {
    this._stateCallbacks = _variantSets.map(_ => []);
    this._state = this._evalGlobalState();
  }

  public get globalState(): GlobalVariantSetState {
    return this._state;
  }

  public get variantSets(): VariantSet[] {
    return this._variantSets;
  }

  public getName(variantSetId: number): string | undefined {
    return this._variantSets[variantSetId]?.name;
  }

  public getVariantIds(variantSetId: number): VariantId[] {
    return this._variantSets[variantSetId]?.variants.map((_, i) => i) ?? [];
  }

  public getVariantNames(variantSetId: number): string[] {
    return (
      this._variantSets[variantSetId]?.variants.map(variant => variant.name) ??
      []
    );
  }

  public getVariantThumbnails(variantSetId: number): (string | undefined)[] {
    return (
      this._variantSets[variantSetId]?.variants.map(
        variant => variant.thumbnailSource,
      ) ?? []
    );
  }

  public getState(variantSetId: number): VariantSetState | undefined {
    return this.globalState[variantSetId];
  }

  public activate(variantSetId: number, variantId: VariantId) {
    debug("Activate variant", variantId, "for variant set", variantSetId);

    if (this._state[variantSetId] === undefined) {
      throw new Error(`Invalid variant set ${variantSetId}`);
    }

    const variant = this._variantSets[variantSetId]?.variants[variantId];
    if (variant === undefined) {
      throw new Error(
        `Invalid variant ${variantId} for variant set ${variantSetId}`,
      );
    }

    // Activate the variant
    variant.activate();

    // Evaluate new global state after activation since the triggered variant
    // might affect other variants
    const newState = this._evalGlobalState();

    // Trigger callbacks for all updated variant sets
    newState.forEach((newVariantSetState, variantSetId) => {
      if (!deepEqual(this._state[variantSetId], newVariantSetState)) {
        debug(
          "State for variant set",
          variantSetId,
          "changed from",
          this._state[variantSetId],
          "to",
          newVariantSetState,
        );
        this._onStateChange(variantSetId, newVariantSetState);
      }
    });

    // Update global state
    this._state = newState;

    // Trigger global state callbacks
    this._onGlobalStateChange();
  }

  public onStateChange(variantSetId: number, callback: OnStateChangeCallback) {
    const callbacks = this._stateCallbacks[variantSetId];
    if (callbacks === undefined) {
      throw new Error(`Invalid variant set ${variantSetId}`);
    }

    if (callbacks.indexOf(callback) > -1) {
      return;
    }

    callbacks.push(callback);
  }

  public offStateChange(variantSetId: number, callback: OnStateChangeCallback) {
    const callbacks = this._stateCallbacks[variantSetId];
    if (callbacks === undefined) {
      throw new Error(`Invalid variant set ${variantSetId}`);
    }

    const index = callbacks.indexOf(callback);
    if (index === -1) {
      return;
    }

    callbacks.splice(index, 1);
  }

  public onGlobalStateChange(callback: OnGlobalStateChangeCallback) {
    const callbacks = this._globalStateCallbacks;
    if (callbacks.indexOf(callback) > -1) {
      return;
    }

    callbacks.push(callback);
  }

  public offGlobalStateChange(callback: OnGlobalStateChangeCallback) {
    const callbacks = this._globalStateCallbacks;
    const index = callbacks.indexOf(callback);
    if (index === -1) {
      return;
    }

    callbacks.splice(index, 1);
  }

  private _onStateChange(variantSetId: number, state: VariantSetState) {
    const callbacks = this._stateCallbacks[variantSetId];
    callbacks.forEach(callback => callback(state));
  }

  private _onGlobalStateChange() {
    const callbacks = this._globalStateCallbacks;
    callbacks.forEach(callback => callback(this.globalState));
  }

  private _evalGlobalState(): GlobalVariantSetState {
    return this._variantSets.map(set =>
      set.variants.reduce<VariantSetState>((acc, variant, variantId) => {
        if (variant.active) {
          acc.push(variantId);
        }
        return acc;
      }, []),
    );
  }
}
