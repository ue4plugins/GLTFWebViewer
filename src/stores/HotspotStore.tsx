import React from "react";
import { computed, action } from "mobx";
import { HotspotProps } from "../components";

export class HotspotHandle {
  public x = 0;
  public y = 0;

  public constructor(
    private _store: HotspotStore,
    private _id: number,
    private _element: React.ReactElement<HotspotProps>,
  ) {}

  public get id() {
    return this._id;
  }

  public get element() {
    return this._element;
  }

  public close() {
    this._store.close(this._id);
  }

  public move(x: number, y: number) {
    this._store.move(this._id, x, y);
  }
}

export class HotspotStore {
  private _hotspots: Map<number, HotspotHandle> = new Map<
    number,
    HotspotHandle
  >();
  private _nextId = 0;

  // TODO: remove onChange
  public constructor(public onChange?: () => void) {}

  @action.bound
  public show(element: React.ReactElement<HotspotProps>): HotspotHandle {
    const id = (this._nextId += 1);
    console.log(id);
    const hotspot = new HotspotHandle(this, id, element);

    this._hotspots.set(id, hotspot);

    if (this.onChange) {
      this.onChange();
    }

    return hotspot;
  }

  @action.bound
  public move(id: number, x: number, y: number) {
    const hotspot = this._hotspots.get(id);
    if (!hotspot) {
      throw new Error("No hotspot with ID " + id);
    }

    hotspot.x = x;
    hotspot.y = y;

    if (this.onChange) {
      this.onChange();
    }
  }

  @action.bound
  public close(id: number): boolean {
    const deleted = this._hotspots.delete(id);

    if (this._hotspots.size === 0) {
      this._nextId = 0;
    }

    if (this.onChange) {
      this.onChange();
    }

    return deleted;
  }

  @action.bound
  public closeAll() {
    this._hotspots.clear();
    this._nextId = 0;
    if (this.onChange) {
      this.onChange();
    }
  }

  @computed
  public hotspots() {
    return Array.from(this._hotspots.values());
  }
}
