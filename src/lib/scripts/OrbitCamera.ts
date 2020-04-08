import pc from "playcanvas";
import { PreventableEvent } from "../PreventableEvent";

function easeInQuad(t: number, b: number, c: number, d: number) {
  return c * (t /= d) * t + b;
}

type KeyDownEvent = { event: PreventableEvent; key: number };
type MouseWheelEvent = { event: PreventableEvent; wheel: number };
type MouseDownEvent = { event: PreventableEvent; button: number };
type MouseUpEvent = { event: PreventableEvent; button: number };
type MouseMoveEvent = {
  dy: number;
  dx: number;
  x: number;
  y: number;
};

export class OrbitCamera extends pc.ScriptType {
  public distanceMax = 0;
  public distanceMin = 0;
  public pitchAngleMax = 90;
  public pitchAngleMin = -90;
  public inertiaFactor = 0;
  public focusEntity?: pc.Entity;
  public frameOnStart = false;
  public orbitSensitivity = 0.3;
  public distanceSensitivity = 0.5;

  private _modelsAabb = new pc.BoundingBox();

  private _pivotPoint = new pc.Vec3();
  private _targetDistance = 0;
  private _targetPitch = 0;
  private _targetYaw = 0;

  private _distance = 0;
  private _pitch = 0;
  private _yaw = 0;

  private lookButtonDown = false;
  private panButtonDown = false;
  private lastPoint = new pc.Vec2();
  private fromWorldPoint = new pc.Vec3();
  private toWorldPoint = new pc.Vec3();
  private worldDiff = new pc.Vec3();
  private animFrame = 0;

  private distanceBetween = new pc.Vec3();
  private quatWithoutYaw = new pc.Quat();
  private yawOffset = new pc.Quat();

  public constructor(args: { app: pc.Application; entity: pc.Entity }) {
    super(args);
  }

  /**
   * Property to get and set the distance between the pivot point and camera.
   * Clamped between this.distanceMin and this.distanceMax
   */
  public get distance() {
    return this._targetDistance;
  }

  public set distance(value: number) {
    this._targetDistance = this._clampDistance(value);
  }

  /**
   * Property to get and set the pitch of the camera around the pivot point (degrees).
   * Clamped between this.pitchAngleMin and this.pitchAngleMax.
   * When set at 0, the camera angle is flat, looking along the horizon.
   */
  public get pitch() {
    return this._targetPitch;
  }

  public set pitch(value: number) {
    this._targetPitch = this._clampPitchAngle(value);
  }

  /**
   * Property to get and set the yaw of the camera around the pivot point (degrees).
   */
  public get yaw() {
    return this._targetYaw;
  }

  public set yaw(value: number) {
    // Ensure that the yaw takes the shortest route by making sure that
    // the difference between the targetYaw and the actual is 180 degrees
    // in either direction
    const diff = value - this._yaw;
    const remainder = diff % 360;
    if (remainder > 180) {
      this._targetYaw = this._yaw - (360 - remainder);
    } else if (remainder < -180) {
      this._targetYaw = this._yaw + (360 + remainder);
    } else {
      this._targetYaw = this._yaw + remainder;
    }
  }

  /**
   * Property to get and set the world position of the pivot point that the camera orbits around.
   */
  public get pivotPoint() {
    return this._pivotPoint;
  }

  public set pivotPoint(value: pc.Vec3) {
    this._pivotPoint.copy(value);
  }

  public initialize() {
    // Find all the models in the scene that are under the focused entity
    this._buildAabb(this.focusEntity || this.app.root, 0);

    this.entity.lookAt(this._modelsAabb.center, 0, 0);

    this.pivotPoint = this._modelsAabb.center;

    // Calculate the camera euler angle rotation around x and y axes
    // This allows us to place the camera at a particular rotation to begin with in the scene
    const cameraQuat = this.entity.getRotation();

    // Preset the camera
    this._yaw = this._calcYaw(cameraQuat);
    this._pitch = this._clampPitchAngle(this._calcPitch(cameraQuat, this._yaw));
    this.entity.setLocalEulerAngles(this._pitch, this._yaw, 0);

    this._distance = 0;

    this._targetYaw = this._yaw;
    this._targetPitch = this._pitch;

    // If we have ticked focus on start, then attempt to position the camera where it frames
    // the focused entity and move the pivot point to entity's position otherwise, set the distance
    // to be between the camera position in the scene and the pivot point
    if (this.frameOnStart) {
      this.focus(this.focusEntity || this.app.root);
    } else {
      const distanceBetween = new pc.Vec3();
      distanceBetween.sub2(this.entity.getPosition(), this._pivotPoint);
      this._distance = this._clampDistance(distanceBetween.length());
    }

    this._targetDistance = this._distance;

    // // Reapply the clamps if they are changed in the editor
    // this.on("attr:distanceMin", (_value: any, _prev: any) => {
    //   this._targetDistance = this._clampDistance(this._distance);
    // });

    // this.on("attr:distanceMax", (_value: any, _prev: any) => {
    //   this._targetDistance = this._clampDistance(this._distance);
    // });

    // this.on("attr:pitchAngleMin", (_value: any, _prev: any) => {
    //   this._targetPitch = this._clampPitchAngle(this._pitch);
    // });

    // this.on("attr:pitchAngleMax", (_value: any, _prev: any) => {
    //   this._targetPitch = this._clampPitchAngle(this._pitch);
    // });

    // // Focus on the entity if we change the focus entity
    // this.on("attr:focusEntity", (value: any, _prev: any) => {
    //   if (this.frameOnStart) {
    //     this.focus(value || this.app.root);
    //   } else {
    //     this.resetAndLookAtEntity(
    //       this.entity.getPosition(),
    //       value || this.app.root,
    //     );
    //   }
    // });

    // this.on("attr:frameOnStart", (value: any, _prev: any) => {
    //   if (value) {
    //     this.focus(this.focusEntity || this.app.root);
    //   }
    // });

    this.app.keyboard.on(pc.EVENT_KEYDOWN, this._onKeyDown, this);
    this.app.mouse.on(pc.EVENT_MOUSEDOWN, this._onMouseDown, this);
    this.app.mouse.on(pc.EVENT_MOUSEUP, this._onMouseUp, this);
    this.app.mouse.on(pc.EVENT_MOUSEMOVE, this._onMouseMove, this);
    this.app.mouse.on(pc.EVENT_MOUSEWHEEL, this._onMouseWheel, this);
    window.addEventListener("mouseout", this._onMouseOut, false);

    this.on("destroy", () => {
      this.app.mouse.off(pc.EVENT_MOUSEDOWN, this._onMouseDown, this);
      this.app.mouse.off(pc.EVENT_MOUSEUP, this._onMouseUp, this);
      this.app.mouse.off(pc.EVENT_MOUSEMOVE, this._onMouseMove, this);
      this.app.mouse.off(pc.EVENT_MOUSEWHEEL, this._onMouseWheel, this);
      window.removeEventListener("mouseout", this._onMouseOut, false);
    });
  }

  public update(dt: number) {
    // Add inertia, if any
    const t =
      this.inertiaFactor === 0 ? 1 : Math.min(dt / this.inertiaFactor, 1);
    this._distance = pc.math.lerp(this._distance, this._targetDistance, t);
    this._yaw = pc.math.lerp(this._yaw, this._targetYaw, t);
    this._pitch = pc.math.lerp(this._pitch, this._targetPitch, t);

    this._updatePosition();
  }

  /**
   * Moves the camera to look at an entity and all its children so they are all in the view.
   * @param focusEntity
   */
  public focus(focusEntity: pc.Entity) {
    // Calculate an bounding box that encompasses all the models to frame in the camera view
    this._buildAabb(focusEntity, 0);

    const halfExtents = this._modelsAabb.halfExtents;

    let distance = Math.max(
      halfExtents.x,
      Math.max(halfExtents.y, halfExtents.z),
    );
    distance =
      distance /
      Math.tan(0.5 * (this.entity.camera?.fov || 45) * pc.math.DEG_TO_RAD);
    distance = distance * 2;

    this.distance = distance;

    if (this.entity.camera) {
      this.entity.camera.nearClip = distance * 0.002;
      this.entity.camera.farClip = distance * 5;
    }

    this._removeInertia();

    this._pivotPoint.copy(this._modelsAabb.center);
  }

  /**
   * Set the camera position to a world position and look at a world position.
   * Useful if you have multiple viewing angles to swap between in a scene.
   * @param resetPoint
   * @param lookAtPoint
   */
  public resetAndLookAtPoint(resetPoint: pc.Vec3, lookAtPoint: pc.Vec3) {
    this.pivotPoint.copy(lookAtPoint);
    this.entity.setPosition(resetPoint);

    this.entity.lookAt(lookAtPoint, 0, 0);

    const distance = this.distanceBetween;
    distance.sub2(lookAtPoint, resetPoint);
    this.distance = distance.length();

    this.pivotPoint.copy(lookAtPoint);

    const cameraQuat = this.entity.getRotation();
    this.yaw = this._calcYaw(cameraQuat);
    this.pitch = this._calcPitch(cameraQuat, this.yaw);

    this._removeInertia();
    this._updatePosition();
  }

  /**
   * Set camera position to a world position and look at an entity in the scene.
   * Useful if you have multiple models to swap between in a scene.
   * @param resetPoint
   * @param entity
   */
  public resetAndLookAtEntity(resetPoint: pc.Vec3, entity: pc.Entity) {
    this._buildAabb(entity, 0);
    this.resetAndLookAtPoint(resetPoint, this._modelsAabb.center);
  }

  /**
   * Set the camera at a specific, yaw, pitch and distance without inertia (instant cut).
   * @param yaw
   * @param pitch
   * @param distance
   */
  public reset(yaw: number, pitch: number, distance: number) {
    this.pitch = pitch;
    this.yaw = yaw;
    this.distance = distance;

    this._removeInertia();
  }

  private _updatePosition() {
    // Work out the camera position based on the pivot point, pitch, yaw and distance
    this.entity.setLocalPosition(0, 0, 0);
    this.entity.setLocalEulerAngles(this._pitch, this._yaw, 0);

    const position = this.entity.getPosition();
    position.copy(this.entity.forward);
    position.scale(-this._distance);
    position.add(this.pivotPoint);
    this.entity.setPosition(position);
  }

  private _removeInertia() {
    this._yaw = this._targetYaw;
    this._pitch = this._targetPitch;
    this._distance = this._targetDistance;
  }

  private _buildAabb(entity: pc.Entity, modelsAdded: number) {
    let i = 0;

    if (entity.model) {
      const mi = entity.model.meshInstances;
      for (i = 0; i < mi.length; i += 1) {
        if (modelsAdded === 0) {
          this._modelsAabb.copy(mi[i].aabb);
        } else {
          this._modelsAabb.add(mi[i].aabb);
        }

        modelsAdded += 1;
      }
    }

    for (i = 0; i < entity.children.length; i += 1) {
      modelsAdded += this._buildAabb(
        entity.children[i] as pc.Entity,
        modelsAdded,
      );
    }

    return modelsAdded;
  }

  private _calcYaw(quat: pc.Quat) {
    const transformedForward = new pc.Vec3();
    quat.transformVector(pc.Vec3.FORWARD, transformedForward);

    return (
      Math.atan2(-transformedForward.x, -transformedForward.z) *
      pc.math.RAD_TO_DEG
    );
  }

  private _clampDistance(distance: number) {
    if (this.distanceMax > 0) {
      return pc.math.clamp(distance, this.distanceMin, this.distanceMax);
    } else {
      return Math.max(distance, this.distanceMin);
    }
  }

  private _clampPitchAngle(pitch: number) {
    // Negative due as the pitch is inversed since the camera is orbiting the entity
    return pc.math.clamp(pitch, -this.pitchAngleMax, -this.pitchAngleMin);
  }

  private _calcPitch(quat: pc.Quat, yaw: number) {
    const quatWithoutYaw = this.quatWithoutYaw;
    const yawOffset = this.yawOffset;

    yawOffset.setFromEulerAngles(0, -yaw, 0);
    quatWithoutYaw.mul2(yawOffset, quat);

    const transformedForward = new pc.Vec3();

    quatWithoutYaw.transformVector(pc.Vec3.FORWARD, transformedForward);

    return (
      Math.atan2(transformedForward.y, -transformedForward.z) *
      pc.math.RAD_TO_DEG
    );
  }

  private _onKeyDown(event: KeyDownEvent) {
    if (event.event.prevent) {
      return;
    }
    if (event.key === pc.KEY_SPACE) {
      // TODO
      this.reset(20, 20, 20);
      this.pivotPoint = new pc.Vec3();
    }
  }

  private _onMouseOut() {
    this.lookButtonDown = false;
    this.panButtonDown = false;
  }

  private _onMouseDown(event: MouseDownEvent) {
    if (event.event.prevent === true) {
      return;
    }
    switch (event.button) {
      case pc.MOUSEBUTTON_LEFT:
        this.lookButtonDown = true;
        break;

      case pc.MOUSEBUTTON_RIGHT:
      case pc.MOUSEBUTTON_MIDDLE:
        this.panButtonDown = true;
        event.event.preventDefault();
        break;
    }
  }

  private _onMouseUp(event: MouseUpEvent) {
    switch (event.button) {
      case pc.MOUSEBUTTON_LEFT:
        this.lookButtonDown = false;
        break;

      case pc.MOUSEBUTTON_MIDDLE:
      case pc.MOUSEBUTTON_RIGHT:
        this.panButtonDown = false;
        break;
    }
  }

  private _onMouseMove(event: MouseMoveEvent) {
    if (this.lookButtonDown) {
      this.orbit(event);
    } else if (this.panButtonDown) {
      this.pan(event);
    }

    this.lastPoint.set(event.x, event.y);
  }

  public orbit(event: MouseMoveEvent) {
    this.pitch -= event.dy * this.orbitSensitivity;
    this.yaw -= event.dx * this.orbitSensitivity;
  }

  public pan(event: MouseMoveEvent) {
    const fromWorldPoint = this.fromWorldPoint;
    const toWorldPoint = this.toWorldPoint;
    const worldDiff = this.worldDiff;

    // For panning to work at any zoom level, we use screen point to world projection
    // to work out how far we need to pan the pivotEntity in world space
    const camera = this.entity.camera;
    const distance = this.distance;

    if (camera) {
      camera.screenToWorld(event.x, event.y, distance, fromWorldPoint);
      camera.screenToWorld(
        this.lastPoint.x,
        this.lastPoint.y,
        distance,
        toWorldPoint,
      );
    }

    worldDiff.sub2(toWorldPoint, fromWorldPoint);

    this.pivotPoint.add(worldDiff);
  }

  private _onMouseWheel(event: MouseWheelEvent) {
    if (event.event.prevent === true) {
      return;
    }

    if (this.animFrame) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = 0;
    }

    const curValue = this.distance;
    const targetValue = this.distanceSensitivity * (this.distance * 0.1);

    const start = Date.now();
    const duration = 200;
    const smoothZoom = () => {
      const elapsed = Date.now() - start;
      const nextValue =
        easeInQuad(
          elapsed,
          curValue,
          targetValue > curValue
            ? targetValue - curValue
            : curValue - targetValue,
          duration,
        ) * 0.01;
      this.distance -= event.wheel * nextValue;
      if (elapsed >= duration) {
        return;
      }
      this.animFrame = requestAnimationFrame(smoothZoom);
    };
    this.animFrame = requestAnimationFrame(smoothZoom);

    event.event.preventDefault();
  }
}
