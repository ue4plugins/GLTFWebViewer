import * as Hammer from "hammerjs";
import * as pc from "@animech-public/playcanvas";
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

export const orbitCameraScriptName = "OrbitCamera";

export class OrbitCamera extends pc.ScriptType {
  /**
   * Inertia Factor. Higher value means that the camera will continue moving after the user has stopped dragging. 0 is fully responsive.
   */
  public inertiaFactor = 0.07;
  /**
   * How fast the camera moves around the orbit. Higher is faster.
   */
  public orbitSensitivity = 0.3;
  /**
   * How fast the camera moves in and out. Higher is faster.
   */
  public distanceSensitivity = 0.5;
  /**
   * Factor to use when calculating near clip based on the camera distance from a focused object.
   */
  public nearClipFactor?: number;
  /**
   * Factor to use when calculating far clip based on the camera distance from a focused object.
   */
  public farClipFactor?: number;
  /**
   * Wether or not to allow panning.
   */
  public allowPan?: boolean;

  private _cameraComponent!: pc.CameraComponent;
  private _distanceMin = 0;
  private _distanceMax = 0;
  private _pitchAngleMax = 90;
  private _pitchAngleMin = -90;
  private _distance = 0;
  private _pitch = 0;
  private _yaw = 0;
  private _targetDistance = 0;
  private _targetPitch = 0;
  private _targetYaw = 0;
  private _pivotPoint = new pc.Vec3();
  private _focusEntity?: pc.Entity;
  private _lookButtonDown = false;
  private _panButtonDown = false;
  private _lastMousePos = new pc.Vec2();
  private _lastMouseDelta = new pc.Vec2();
  private _lastStartDistance = 0;
  private _zoomAnimFrame = 0;
  private _hammer?: HammerManager;

  public constructor(args: { app: pc.Application; entity: pc.Entity }) {
    super(args);
  }

  /**
   * Max distance. Setting this at 0 will give an infinite distance limit.
   */
  public get distanceMax() {
    return this._distanceMax;
  }
  public set distanceMax(value: number) {
    this._distanceMax = value;
    this._targetDistance = this._clampDistance(this._distance);
  }

  /**
   * Min distance.
   */
  public get distanceMin() {
    return this._distanceMin;
  }
  public set distanceMin(value: number) {
    this._distanceMin = value;
    this._targetDistance = this._clampDistance(this._distance);
  }

  /**
   * Max pitch angle (degrees).
   */
  public get pitchAngleMax() {
    return this._pitchAngleMax;
  }
  public set pitchAngleMax(value: number) {
    this._pitchAngleMax = value;
    this._targetPitch = this._clampPitchAngle(this._pitch);
  }

  /**
   * Min pitch angle (degrees).
   */
  public get pitchAngleMin() {
    return this._pitchAngleMin;
  }
  public set pitchAngleMin(value: number) {
    this._pitchAngleMin = value;
    this._targetPitch = this._clampPitchAngle(this._pitch);
  }

  /**
   * Property to get and set the distance between the pivot point and camera.
   * Clamped between this.distanceMin and this.distanceMax.
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

  /**
   * Property to get and set the focus entity that the camera orbits around. Used if this.focus() is
   * called with empty argument.
   */
  public get focusEntity(): pc.Entity | undefined {
    return this._focusEntity;
  }
  public set focusEntity(value: pc.Entity | undefined) {
    this._focusEntity = value;
  }

  public initialize() {
    const { camera } = this.entity;
    if (!camera) {
      throw new Error("Entity is missing camera component");
    }

    this._cameraComponent = camera;

    // Calculate the camera euler angle rotation around x and y axes
    // This allows us to place the camera at a particular rotation to begin with in the scene
    const cameraQuat = this.entity.getRotation();

    // Preset the camera
    this._targetYaw = this._yaw = this._calcYaw(cameraQuat);
    this._targetPitch = this._pitch = this._clampPitchAngle(
      this._calcPitch(cameraQuat, this._yaw),
    );
    this.entity.setLocalEulerAngles(this._pitch, this._yaw, 0);

    const distanceBetween = new pc.Vec3();
    distanceBetween.sub2(this.entity.getPosition(), this._pivotPoint);
    this._targetDistance = this._distance = this._clampDistance(
      distanceBetween.length(),
    );

    this._setUpMouseEvents();
    this._setUpTouchEvents();

    this.on("destroy", () => {
      this._tearDownMouseEvents();
      this._tearDownTouchEvents();
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
  public focus(focusEntity?: pc.Entity) {
    if (focusEntity) {
      this._focusEntity = focusEntity;
    } else if (this._focusEntity) {
      focusEntity = this._focusEntity;
    } else {
      throw new Error("No focusEntity is specified");
    }

    // Calculate an bounding box that encompasses all the models to frame in the camera view
    const aabb = this._buildAabb(focusEntity);
    const halfExtents = aabb.halfExtents;

    let distance = Math.max(
      halfExtents.x,
      Math.max(halfExtents.y, halfExtents.z),
    );
    distance =
      distance / Math.tan(0.5 * this._cameraComponent.fov * pc.math.DEG_TO_RAD);
    distance = distance * 2;

    this.distance = distance;

    if (this.nearClipFactor) {
      this._cameraComponent.nearClip = distance * this.nearClipFactor;
    }
    if (this.farClipFactor) {
      this._cameraComponent.farClip = distance * this.farClipFactor;
    }

    this._removeInertia();

    this._pivotPoint.copy(aabb.center);
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

    const distance = new pc.Vec3();
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
    const modelsAabb = this._buildAabb(entity);
    this.resetAndLookAtPoint(resetPoint, modelsAabb.center);
  }

  /**
   * Set the camera at a specific, yaw, pitch and distance without inertia (instant cut).
   * @param yaw
   * @param pitch
   * @param distance
   */
  public reset(yaw?: number, pitch?: number, distance?: number) {
    if (yaw !== undefined) {
      this.yaw = yaw;
    }
    if (pitch !== undefined) {
      this.pitch = pitch;
    }
    if (distance !== undefined) {
      this.distance = distance;
    }

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

  private _buildAabb(entity: pc.Entity) {
    const modelsAabb = new pc.BoundingBox();
    let modelsAdded = 0;

    if (entity.tags.has("ignoreBoundingBox")) {
      return modelsAabb;
    }

    if (entity.model) {
      const mi = entity.model.meshInstances;
      for (let i = 0; i < mi.length; i += 1) {
        if (modelsAdded === 0) {
          modelsAabb.copy(mi[i].aabb);
        } else {
          modelsAabb.add(mi[i].aabb);
        }

        modelsAdded += 1;
      }
    }

    for (let i = 0; i < entity.children.length; i += 1) {
      const childAabb = this._buildAabb(entity.children[i] as pc.Entity);
      if (modelsAdded === 0) {
        modelsAabb.copy(childAabb);
      } else {
        modelsAabb.add(childAabb);
      }

      modelsAdded += 1;
    }

    return modelsAabb;
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
    const quatWithoutYaw = new pc.Quat();
    const yawOffset = new pc.Quat();

    yawOffset.setFromEulerAngles(0, -yaw, 0);
    quatWithoutYaw.mul2(yawOffset, quat);

    const transformedForward = new pc.Vec3();

    quatWithoutYaw.transformVector(pc.Vec3.FORWARD, transformedForward);

    return (
      Math.atan2(transformedForward.y, -transformedForward.z) *
      pc.math.RAD_TO_DEG
    );
  }

  private _dolly(value: number) {
    if (this._zoomAnimFrame) {
      cancelAnimationFrame(this._zoomAnimFrame);
      this._zoomAnimFrame = 0;
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
      this.distance -= value * nextValue;
      if (elapsed >= duration) {
        return;
      }
      this._zoomAnimFrame = requestAnimationFrame(smoothZoom);
    };
    this._zoomAnimFrame = requestAnimationFrame(smoothZoom);
  }

  private _orbit(dx: number, dy: number) {
    this.pitch -= dy * this.orbitSensitivity;
    this.yaw -= dx * this.orbitSensitivity;
  }

  private _pan(x: number, y: number) {
    const fromWorldPoint = new pc.Vec3();
    const toWorldPoint = new pc.Vec3();
    const worldDiff = new pc.Vec3();

    // For panning to work at any zoom level, we use screen point to world projection
    // to work out how far we need to pan the pivotEntity in world space
    const distance = this.distance;

    this._cameraComponent.screenToWorld(x, y, distance, fromWorldPoint);
    this._cameraComponent.screenToWorld(
      this._lastMousePos.x,
      this._lastMousePos.y,
      distance,
      toWorldPoint,
    );

    worldDiff.sub2(toWorldPoint, fromWorldPoint);

    this.pivotPoint.add(worldDiff);
  }

  private _onKeyDown(event: KeyDownEvent) {
    if (event.event.prevent || !this.enabled) {
      return;
    }
    if (event.key === pc.KEY_SPACE && this._focusEntity) {
      this.reset(0, 0, 0);
      this.focus(this._focusEntity);
    }
  }

  private _onMouseOut() {
    if (!this.enabled) {
      return;
    }
    this._lookButtonDown = false;
    this._panButtonDown = false;
  }

  private _onMouseDown(event: MouseDownEvent) {
    if (event.event.prevent || !this.enabled) {
      return;
    }
    switch (event.button) {
      case pc.MOUSEBUTTON_LEFT:
        this._lookButtonDown = true;
        break;

      case pc.MOUSEBUTTON_RIGHT:
      case pc.MOUSEBUTTON_MIDDLE:
        this._panButtonDown = true;
        event.event.preventDefault();
        break;
    }
  }

  private _onMouseUp(event: MouseUpEvent) {
    if (!this.enabled) {
      return;
    }
    switch (event.button) {
      case pc.MOUSEBUTTON_LEFT:
        this._lookButtonDown = false;
        break;

      case pc.MOUSEBUTTON_MIDDLE:
      case pc.MOUSEBUTTON_RIGHT:
        this._panButtonDown = false;
        break;
    }
  }

  private _onMouseMove(event: MouseMoveEvent) {
    if (!this.enabled) {
      return;
    }
    if (this._lookButtonDown) {
      this._orbit(event.dx, event.dy);
    } else if (this._panButtonDown && this.allowPan) {
      this._pan(event.x, event.y);
    }

    this._lastMousePos.set(event.x, event.y);
  }

  private _onMouseWheel(event: MouseWheelEvent) {
    if (event.event.prevent || !this.enabled) {
      return;
    }

    this._dolly(event.wheel);

    event.event.preventDefault();
  }

  private _setUpMouseEvents() {
    // Disabling the context menu stops the browser displaying a menu when
    // you right-click the page
    this.app.mouse.disableContextMenu();

    this.app.keyboard.on(pc.EVENT_KEYDOWN, this._onKeyDown, this);
    this.app.mouse.on(pc.EVENT_MOUSEDOWN, this._onMouseDown, this);
    this.app.mouse.on(pc.EVENT_MOUSEUP, this._onMouseUp, this);
    this.app.mouse.on(pc.EVENT_MOUSEMOVE, this._onMouseMove, this);
    this.app.mouse.on(pc.EVENT_MOUSEWHEEL, this._onMouseWheel, this);
    window.addEventListener("mouseout", this._onMouseOut, false);
  }

  private _tearDownMouseEvents() {
    this.app.mouse.off(pc.EVENT_MOUSEDOWN, this._onMouseDown, this);
    this.app.mouse.off(pc.EVENT_MOUSEUP, this._onMouseUp, this);
    this.app.mouse.off(pc.EVENT_MOUSEMOVE, this._onMouseMove, this);
    this.app.mouse.off(pc.EVENT_MOUSEWHEEL, this._onMouseWheel, this);
    window.removeEventListener("mouseout", this._onMouseOut, false);
  }

  private _onTouchPinchStart(event: HammerInput) {
    if (!this.enabled) {
      return;
    }
    this._lastStartDistance = this.distance;
    event.preventDefault();
  }

  private _onTouchPinch(event: HammerInput) {
    if (!this.enabled) {
      return;
    }
    this.distance = this._lastStartDistance / event.scale;
  }

  private _onTouchPanStart(event: HammerInput) {
    if (!this.enabled) {
      return;
    }

    const { x, y } = event.center;
    const { deltaX, deltaY } = event;
    this._lastMousePos.set(x, y);
    this._lastMouseDelta.set(deltaX, deltaY);

    // Drag 1 pointer to orbit
    // Drag 2 pointers to pan
    this._lookButtonDown = event.pointers.length === 1;
    this._panButtonDown = event.pointers.length > 1;
  }

  private _onTouchPanEnd() {
    if (!this.enabled) {
      return;
    }
    this._lookButtonDown = false;
    this._panButtonDown = false;
  }

  private _onTouchPan(event: HammerInput) {
    if (!this.enabled) {
      return;
    }

    const { x, y } = event.center;
    const { deltaX, deltaY } = event;

    if (this._lookButtonDown) {
      const dx = deltaX - this._lastMouseDelta.x;
      const dy = deltaY - this._lastMouseDelta.y;
      this._orbit(dx, dy);
    } else if (this._panButtonDown && this.allowPan) {
      this._pan(x, y);
    }

    this._lastMouseDelta.set(deltaX, deltaY);
    this._lastMousePos.set(x, y);
  }

  private _setUpTouchEvents() {
    const pinch = new Hammer.Pinch();
    const pan = new Hammer.Pan({
      direction: Hammer.DIRECTION_ALL,
      pointers: 0,
    });
    pan.recognizeWith(pinch);

    this._hammer = new Hammer.Manager(this.app.graphicsDevice.canvas, {
      inputClass: Hammer.TouchInput,
    });
    this._hammer.add([pan, pinch]);

    this._hammer.on("pinchstart", this._onTouchPinchStart.bind(this));
    this._hammer.on("pinch", this._onTouchPinch.bind(this));
    this._hammer.on("panstart", this._onTouchPanStart.bind(this));
    this._hammer.on("panend", this._onTouchPanEnd.bind(this));
    this._hammer.on("pan", this._onTouchPan.bind(this));
  }

  private _tearDownTouchEvents() {
    if (this._hammer) {
      this._hammer.destroy();
      this._hammer = undefined;
    }
  }
}
