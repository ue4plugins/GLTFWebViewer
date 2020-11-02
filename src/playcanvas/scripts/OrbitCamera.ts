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

export enum OrbitCameraMode {
  FirstPerson,
  ThirdPerson,
}

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
   * How long time (in seconds) to use for dolly-transitions. Lower is faster.
   */
  public dollyDuration = 0.2;
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

  private _mode = OrbitCameraMode.ThirdPerson;
  private _cameraComponent!: pc.CameraComponent;
  private _initialized = false;
  private _distanceMin = 0;
  private _distanceMax = 0;
  private _pitchAngleMax = 90;
  private _pitchAngleMin = -90;
  private _yawAngleMax = 360;
  private _yawAngleMin = 0;
  private _distance = 0;
  private _pitch = 0;
  private _yaw = 0;
  private _targetDistance = 0;
  private _targetPitch = 0;
  private _targetYaw = 0;
  private _focusEntity: pc.Entity | null = null;
  private _focusOffset = new pc.Vec3();
  private _focusPosition = new pc.Vec3();
  private _lastFocusDistance = this._distance;
  private _lastFocusPitch = this._pitch;
  private _lastFocusYaw = this._yaw;
  private _lastFocusOffset = new pc.Vec3();
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
   * Camera mode:
   * - FirstPerson allows the user to look around without moving the camera
   * - ThirdPerson allows the user to orbit the focused entity and zoom / dolly
   */
  public get mode() {
    return this._mode;
  }

  public set mode(value: OrbitCameraMode) {
    if (OrbitCameraMode[value] === undefined) {
      throw new Error(`Invalid camera mode '${value}'`);
    }

    if (this._mode !== value) {
      this._mode = value;
      this._setupCameraMode();
    }
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
   * Max yaw angle (degrees).
   */
  public get yawAngleMax() {
    return this._yawAngleMax;
  }
  public set yawAngleMax(value: number) {
    this._yawAngleMax = value;
    this._targetYaw = this._clampYawAngle(this._yaw);
  }

  /**
   * Min yaw angle (degrees).
   */
  public get yawAngleMin() {
    return this._yawAngleMin;
  }
  public set yawAngleMin(value: number) {
    this._yawAngleMin = value;
    this._targetYaw = this._clampYawAngle(this._yaw);
  }

  /**
   * Returns true if the current limits for yaw are less than 360 degrees apart.
   * If they are further apart, no limits will be enforced for yaw.
   */
  public get usesYawLimits() {
    return this._yawAngleMax - this._yawAngleMin < 360;
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
    this._targetYaw = this._clampYawAngle(value);
  }

  /**
   * Property to get and set the entity that the camera orbits around.
   */
  public get focusEntity(): pc.Entity | null {
    return this._focusEntity;
  }
  public set focusEntity(value: pc.Entity | null) {
    // Sanitize in case an undefined value is passed somehow
    value = value ?? null;

    if (value !== this._focusEntity) {
      this._focusEntity?.off("destroy", this._onEntityDestroyed, this);
      this._focusEntity = value;
      this._focusEntity?.on("destroy", this._onEntityDestroyed, this);
    }
  }

  public initialize() {
    const { camera } = this.entity;
    if (!camera) {
      throw new Error("Entity is missing camera component");
    }

    this._cameraComponent = camera;

    this._setUpMouseEvents();
    this._setUpTouchEvents();

    this.on("destroy", () => {
      this._tearDownMouseEvents();
      this._tearDownTouchEvents();
    });

    this._initialized = true;
    this._setupCameraMode();
  }

  public postUpdate(dt: number) {
    // Add inertia, if any
    const t =
      this.inertiaFactor === 0 ? 1 : Math.min(dt / this.inertiaFactor, 1);
    this._distance = pc.math.lerp(this._distance, this._targetDistance, t);
    this._yaw = pc.math.lerp(this._yaw, this._targetYaw, t);
    this._pitch = pc.math.lerp(this._pitch, this._targetPitch, t);

    if (this.mode === OrbitCameraMode.ThirdPerson) {
      this._updateFocusPosition();
    }

    this._updatePosition();
  }

  /**
   * Updates yaw angle while ensuring the shortest route is taken from
   * the current yaw angle to the requested angle.
   *
   * Note that the passed value may therefore not be used as-is, instead
   * an equivalent angle that is closer to the current angle may be substituted.
   * @param yaw Yaw angle
   */
  public setYawUsingShortestRoute(yaw: number) {
    // Ensure that the yaw takes the shortest route by making sure that
    // the difference between the targetYaw and the actual is 180 degrees
    // in either direction
    const diff = yaw - this._yaw;
    const remainder = diff % 360;
    if (remainder > 180) {
      this.yaw = this._yaw - (360 - remainder);
    } else if (remainder < -180) {
      this.yaw = this._yaw + (360 + remainder);
    } else {
      this.yaw = this._yaw + remainder;
    }
  }

  /**
   * Focuses on an entity.
   * @param focusEntity         Entity to focus. If no entity is passed in, the scene-root will be used.
   * @param options.frameModels Uses the center of the bounding-box as focus-point, and moves the camera to a suitable distance.
   */
  public focus(
    focusEntity: pc.Entity | null,
    options: {
      frameModels?: boolean;
      lookAtEntity?: boolean;
      offset?: pc.Vec3;
    } = {},
  ) {
    if (this.mode !== OrbitCameraMode.ThirdPerson) {
      console.warn(
        "focus() can only be used when the ThirdPerson mode is active",
      );
      return;
    }

    const { frameModels, lookAtEntity, offset } = options;

    if (!focusEntity) {
      focusEntity = this.app.root;
    }

    this.focusEntity = focusEntity;
    this._focusOffset.copy(offset ?? pc.Vec3.ZERO);

    const aabb = frameModels ? this._buildAabb(focusEntity) : null;
    if (aabb) {
      // Add offset to keep center of bounding-box focused
      this._focusOffset.add(aabb.center).sub(focusEntity.getPosition());
    }

    this._updateFocusPosition();

    this.distance = aabb
      ? this._calcDistanceForBoundingBox(aabb)
      : this.entity.getPosition().distance(this._focusPosition);

    if (lookAtEntity) {
      this.entity.lookAt(this._focusPosition, pc.Vec3.UP);

      const cameraQuat = this.entity.getRotation();
      this.yaw = this._calcYaw(cameraQuat);
      this.pitch = this._calcPitch(cameraQuat, this.yaw);
    }

    if (this.nearClipFactor) {
      this._cameraComponent.nearClip = this.distance * this.nearClipFactor;
    }
    if (this.farClipFactor) {
      this._cameraComponent.farClip = this.distance * this.farClipFactor;
    }

    this._lastFocusDistance = this.distance;
    this._lastFocusPitch = this.pitch;
    this._lastFocusYaw = this.yaw;
    this._lastFocusOffset.copy(this._focusOffset);

    this._removeInertia();
    this._updatePosition();
  }

  /**
   * Set the camera position to a world position and look at a world position.
   * Useful if you have multiple viewing angles to swap between in a scene.`
   * Note that the scene-root will become the focused entity.
   * @param resetPoint
   * @param lookAtPoint
   */
  public resetAndLookAtPoint(resetPoint: pc.Vec3, lookAtPoint: pc.Vec3) {
    if (this.mode !== OrbitCameraMode.ThirdPerson) {
      console.warn(
        "resetAndLookAtPoint() can only be used when the ThirdPerson mode is active",
      );
      return;
    }

    this.entity.setPosition(resetPoint);

    this.focus(null, {
      lookAtEntity: true,
      offset: lookAtPoint,
    });
  }

  /**
   * Set camera position to a world position and look at an entity in the scene.
   * Useful if you have multiple models to swap between in a scene.
   * @param resetPoint
   * @param entity
   */
  public resetAndLookAtEntity(resetPoint: pc.Vec3, entity: pc.Entity) {
    if (this.mode !== OrbitCameraMode.ThirdPerson) {
      console.warn(
        "resetAndLookAtEntity() can only be used when the ThirdPerson mode is active",
      );
      return;
    }

    this.entity.setPosition(resetPoint);

    this.focus(entity, {
      frameModels: true,
      lookAtEntity: true,
    });
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

  private _onEntityDestroyed(entity: pc.Entity) {
    if (this._focusEntity === entity) {
      this._focusEntity = null;
    }
  }

  private _calcDistanceForBoundingBox(aabb: pc.BoundingBox): number {
    const halfExtents = aabb.halfExtents;
    const fov = this._cameraComponent.fov;

    // Determine the distance needed to frame the bounding-box in the camera view
    let distance = Math.max(
      halfExtents.x,
      Math.max(halfExtents.y, halfExtents.z),
    );
    distance = distance / Math.tan(0.5 * fov * pc.math.DEG_TO_RAD);
    distance = distance * 2;

    return distance;
  }

  private _updatePosition() {
    if (this.mode === OrbitCameraMode.FirstPerson) {
      this.entity.setEulerAngles(this._pitch, this._yaw, 0);
    } else if (this.mode === OrbitCameraMode.ThirdPerson) {
      // Work out the camera position based on the pivot point, pitch, yaw and distance
      this.entity.setLocalPosition(0, 0, 0);
      this.entity.setEulerAngles(this._pitch, this._yaw, 0);

      const position = this.entity.getPosition();
      position.copy(this.entity.forward);
      position.scale(-this._distance);
      position.add(this._focusPosition);
      this.entity.setPosition(position);
    }
  }

  private _updateFocusPosition() {
    if (!this._focusEntity) {
      return;
    }

    this._focusPosition
      .copy(this._focusEntity.getPosition())
      .add(this._focusOffset);
  }

  private _removeInertia() {
    this._yaw = this._targetYaw;
    this._pitch = this._targetPitch;
    this._distance = this._targetDistance;
  }

  private _buildAabb(entity: pc.Entity): pc.BoundingBox | null {
    let modelsAabb: pc.BoundingBox | null = null;

    if (entity.tags.has("ignoreBoundingBox")) {
      return modelsAabb;
    }

    if (entity.model) {
      const mi = entity.model.meshInstances;
      for (let i = 0; i < mi.length; i += 1) {
        if (!modelsAabb) {
          modelsAabb = mi[i].aabb.clone();
        } else {
          modelsAabb.add(mi[i].aabb);
        }
      }
    }

    for (let i = 0; i < entity.children.length; i += 1) {
      const childAabb = this._buildAabb(entity.children[i] as pc.Entity);
      if (!childAabb) {
        continue;
      }

      if (!modelsAabb) {
        modelsAabb = childAabb.clone();
      } else {
        modelsAabb.add(childAabb);
      }
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
    return pc.math.clamp(pitch, this.pitchAngleMin, this.pitchAngleMax);
  }

  private _clampYawAngle(yaw: number) {
    return this.usesYawLimits
      ? pc.math.clamp(yaw, this.yawAngleMin, this.yawAngleMax)
      : yaw;
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

    if (this.mode !== OrbitCameraMode.ThirdPerson) {
      return;
    }

    const curValue = this.distance;
    const targetValue = this.distanceSensitivity * (this.distance * 0.1);

    const start = Date.now();
    const duration = this.dollyDuration * 1000;
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
    if (this.mode !== OrbitCameraMode.ThirdPerson) {
      return;
    }

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

    this._focusOffset.add(worldDiff);
  }

  private _setupCameraMode() {
    if (!this._initialized) {
      return;
    }

    if (this.mode === OrbitCameraMode.FirstPerson) {
      const cameraQuat = this.entity.getRotation();
      this.yaw = this._calcYaw(cameraQuat);
      this.pitch = this._calcPitch(cameraQuat, this.yaw);

      this._lastFocusDistance = this.distance;
      this._lastFocusPitch = this.pitch;
      this._lastFocusYaw = this.yaw;
      this._lastFocusOffset.copy(pc.Vec3.ZERO);

      this._removeInertia();
      this._updatePosition();
    } else if (this.mode === OrbitCameraMode.ThirdPerson) {
      this.focus(this._focusEntity, {
        lookAtEntity: true,
      });
    }
  }

  private _onKeyDown(event: KeyDownEvent) {
    if (event.event.prevent || !this.enabled) {
      return;
    }

    if (
      event.key === pc.KEY_SPACE &&
      (this._focusEntity || this.mode === OrbitCameraMode.FirstPerson)
    ) {
      this._focusOffset.copy(this._lastFocusOffset);
      this.reset(
        this._lastFocusYaw,
        this._lastFocusPitch,
        this._lastFocusDistance,
      );
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
    if (!this.enabled || this.mode !== OrbitCameraMode.ThirdPerson) {
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
