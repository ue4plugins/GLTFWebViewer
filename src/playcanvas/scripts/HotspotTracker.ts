import pc from "@animech-public/playcanvas";

type HotspotTrackerHandleInternal = HotspotTrackerHandle & {
  setScreenPosition(screenPosition: pc.Vec3): void;
};

export type HotspotTrackerHandle = {
  readonly position: pc.Vec3;
  readonly screenPosition: pc.Vec3;
  setPosition(position: pc.Vec3): void;
  onUpdate(
    event: HotspotTrackerEventType,
    screenPos: pc.Vec3,
    worldPos: pc.Vec3,
  ): void;
};

export enum HotspotTrackerEventType {
  Start = "start",
  Track = "track",
  Stop = "stop",
}

export const hotspotTrackerScriptName = "HotspotTracker";

export class HotspotTracker extends pc.ScriptType {
  private _handles: HotspotTrackerHandleInternal[] = [];

  public constructor(args: { app: pc.Application; entity: pc.Entity }) {
    super(args);
  }

  public initialize() {
    // Ignore
  }

  public update() {
    this._handles.forEach(handle => {
      const screenPosition = this.getScreenPosition(handle.position);
      handle.setScreenPosition(screenPosition);
    });
  }

  public track(
    position: pc.Vec3,
    onUpdate: HotspotTrackerHandle["onUpdate"],
  ): HotspotTrackerHandle {
    const screenPosition = this.getScreenPosition(position);
    const internalPosition: pc.Vec3 = new pc.Vec3().copy(position);
    const self = this; // eslint-disable-line @typescript-eslint/no-this-alias

    const handle: HotspotTrackerHandleInternal = {
      onUpdate,
      position: internalPosition,
      screenPosition: screenPosition,
      setScreenPosition: function(pos: pc.Vec3) {
        if (!pos.equals(screenPosition)) {
          screenPosition.copy(pos);
          this.onUpdate(
            HotspotTrackerEventType.Track,
            screenPosition,
            this.position,
          );
        }
      },
      setPosition: function(pos: pc.Vec3) {
        internalPosition.copy(pos);
        const newScreenPosition = self.getScreenPosition(internalPosition);
        this.setScreenPosition(newScreenPosition);
      },
    };

    this._handles.push(handle);

    handle.onUpdate(
      HotspotTrackerEventType.Start,
      handle.screenPosition,
      handle.position,
    );

    return handle;
  }

  public untrack(handle: HotspotTrackerHandle) {
    this._handles = this._handles.filter(h => h !== handle);

    handle.onUpdate(
      HotspotTrackerEventType.Stop,
      handle.screenPosition,
      handle.position,
    );
  }

  public getScreenPosition(position: pc.Vec3): pc.Vec3 {
    const cameraComponent = this.entity.camera;
    if (cameraComponent) {
      return cameraComponent.worldToScreen(position);
    }
    return new pc.Vec3(0, 0, 0);
  }
}
