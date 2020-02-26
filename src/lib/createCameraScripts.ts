/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import pc from "playcanvas";

export const createCameraScripts = (_app: pc.Application) => {
  type KeyboardInput = pc.ScriptType & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prototype: any;
  };

  const KeyboardInput = pc.createScript("keyboardInput") as KeyboardInput;

  // initialize code called once per entity
  KeyboardInput.prototype.initialize = function() {
    this.orbitCamera = this.entity.script.orbitCamera;
    this.app.keyboard.on(pc.EVENT_KEYDOWN, this.onKeyDown, this);
  };

  KeyboardInput.prototype.postInitialize = function() {
    if (this.orbitCamera) {
      this.startDistance = this.orbitCamera.distance;
      this.startYaw = this.orbitCamera.yaw;
      this.startPitch = this.orbitCamera.pitch;
      this.startPivotPosition = this.orbitCamera.pivotPoint.clone();
    }
  };

  // update code called every frame
  KeyboardInput.prototype.update = function(_dt: any) {
    // Do nothing
  };

  KeyboardInput.prototype.onKeyDown = function(event: {
    event: { isOverlayEvent: boolean };
    key: number;
  }) {
    if (event.event.isOverlayEvent === true) {
      return;
    }
    if (this.orbitCamera) {
      if (event.key === pc.KEY_SPACE) {
        this.orbitCamera.reset(
          this.startYaw,
          this.startPitch,
          this.startDistance,
        );
        this.orbitCamera.pivotPoint = this.startPivotPosition;
      }
    }
  };

  type MouseInput = pc.ScriptType & {
    app: pc.Application;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prototype: any;
    fromWorldPoint: pc.Vec3;
    toWorldPoint: pc.Vec3;
    worldDiff: pc.Vec3;
  };

  const MouseInput = pc.createScript("mouseInput") as MouseInput;

  MouseInput.attributes.add("orbitSensitivity", {
    type: "number",
    default: 0.3,
    title: "Orbit Sensitivity",
    description: "How fast the camera moves around the orbit. Higher is faster",
  });

  MouseInput.attributes.add("distanceSensitivity", {
    type: "number",
    default: 0.15,
    title: "Distance Sensitivity",
    description: "How fast the camera moves in and out. Higher is faster",
  });

  // initialize code called once per entity
  MouseInput.prototype.initialize = function() {
    this.orbitCamera = this.entity.script.orbitCamera;

    if (this.orbitCamera) {
      const self = this;
      const onMouseOut = function(e: any) {
        self.onMouseOut(e);
      };

      this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
      this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);
      this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
      this.app.mouse.on(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this);

      // Listen to when the mouse travels out of the window
      window.addEventListener("mouseout", onMouseOut, false);

      // Remove the listeners so if this entity is destroyed
      this.on("destroy", () => {
        this.app.mouse.off(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        this.app.mouse.off(pc.EVENT_MOUSEUP, this.onMouseUp, this);
        this.app.mouse.off(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
        this.app.mouse.off(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this);
        window.removeEventListener("mouseout", onMouseOut, false);
      });
    }

    // Disabling the context menu stops the browser displaying a menu when
    // you right-click the page
    // this.app.mouse.disableContextMenu();

    this.lookButtonDown = false;
    this.panButtonDown = false;
    this.lastPoint = new pc.Vec2();
  };

  MouseInput.fromWorldPoint = new pc.Vec3();
  MouseInput.toWorldPoint = new pc.Vec3();
  MouseInput.worldDiff = new pc.Vec3();

  MouseInput.prototype.pan = function(screenPoint: { x: any; y: any }) {
    const fromWorldPoint = MouseInput.fromWorldPoint;
    const toWorldPoint = MouseInput.toWorldPoint;
    const worldDiff = MouseInput.worldDiff;

    // For panning to work at any zoom level, we use screen point to world projection
    // to work out how far we need to pan the pivotEntity in world space
    const camera = this.entity.camera;
    const distance = this.orbitCamera.distance;

    camera.screenToWorld(
      screenPoint.x,
      screenPoint.y,
      distance,
      fromWorldPoint,
    );
    camera.screenToWorld(
      this.lastPoint.x,
      this.lastPoint.y,
      distance,
      toWorldPoint,
    );

    worldDiff.sub2(toWorldPoint, fromWorldPoint);

    this.orbitCamera.pivotPoint.add(worldDiff);
  };

  MouseInput.prototype.onMouseDown = function(event: {
    event: Event & { isOverlayEvent: boolean };
    button: any;
  }) {
    if (event.event.isOverlayEvent === true) {
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
  };

  MouseInput.prototype.onMouseUp = function(event: { button: any }) {
    switch (event.button) {
      case pc.MOUSEBUTTON_LEFT:
        this.lookButtonDown = false;
        break;

      case pc.MOUSEBUTTON_MIDDLE:
      case pc.MOUSEBUTTON_RIGHT:
        this.panButtonDown = false;
        break;
    }
  };

  MouseInput.prototype.onMouseMove = function(event: {
    dy: number;
    dx: number;
    x: any;
    y: any;
  }) {
    if (this.lookButtonDown) {
      this.orbitCamera.pitch -= event.dy * this.orbitSensitivity;
      this.orbitCamera.yaw -= event.dx * this.orbitSensitivity;
    } else if (this.panButtonDown) {
      this.pan(event);
    }

    this.lastPoint.set(event.x, event.y);
  };

  MouseInput.prototype.onMouseWheel = function(event: {
    event: Event & { isOverlayEvent: boolean; preventDefault: () => void };
    wheel: number;
  }) {
    if (event.event.isOverlayEvent === true) {
      return;
    }
    this.orbitCamera.distance -=
      event.wheel *
      this.distanceSensitivity *
      (this.orbitCamera.distance * 0.1);
    // event.event.preventDefault();
  };

  MouseInput.prototype.onMouseOut = function(_e: any) {
    this.lookButtonDown = false;
    this.panButtonDown = false;
  };

  type TouchInput = pc.ScriptType & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prototype: any;
    fromWorldPoint: pc.Vec3;
    toWorldPoint: pc.Vec3;
    worldDiff: pc.Vec3;
    pinchMidPoint: pc.Vec2;
  };

  const TouchInput = pc.createScript("touchInput") as TouchInput;

  TouchInput.attributes.add("orbitSensitivity", {
    type: "number",
    default: 0.4,
    title: "Orbit Sensitivity",
    description: "How fast the camera moves around the orbit. Higher is faster",
  });

  TouchInput.attributes.add("distanceSensitivity", {
    type: "number",
    default: 0.2,
    title: "Distance Sensitivity",
    description: "How fast the camera moves in and out. Higher is faster",
  });

  // initialize code called once per entity
  TouchInput.prototype.initialize = function() {
    this.orbitCamera = this.entity.script.orbitCamera;

    // Store the position of the touch so we can calculate the distance moved
    this.lastTouchPoint = new pc.Vec2();
    this.lastPinchMidPoint = new pc.Vec2();
    this.lastPinchDistance = 0;

    if (this.orbitCamera && this.app.touch) {
      // Use the same callback for the touchStart, touchEnd and touchCancel events as they
      // all do the same thing which is to deal the possible multiple touches to the screen
      this.app.touch.on(pc.EVENT_TOUCHSTART, this.onTouchStartEndCancel, this);
      this.app.touch.on(pc.EVENT_TOUCHEND, this.onTouchStartEndCancel, this);
      this.app.touch.on(pc.EVENT_TOUCHCANCEL, this.onTouchStartEndCancel, this);

      this.app.touch.on(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);

      this.on("destroy", () => {
        this.app.touch.off(
          pc.EVENT_TOUCHSTART,
          this.onTouchStartEndCancel,
          this,
        );
        this.app.touch.off(pc.EVENT_TOUCHEND, this.onTouchStartEndCancel, this);
        this.app.touch.off(
          pc.EVENT_TOUCHCANCEL,
          this.onTouchStartEndCancel,
          this,
        );
        this.app.touch.off(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
      });
    }
  };

  TouchInput.prototype.getPinchDistance = function(
    pointA: { x: number; y: number },
    pointB: { x: number; y: number },
  ) {
    // Return the distance between the two points
    const dx = pointA.x - pointB.x;
    const dy = pointA.y - pointB.y;

    return Math.sqrt(dx * dx + dy * dy);
  };

  TouchInput.prototype.calcMidPoint = function(
    pointA: { x: number; y: number },
    pointB: { x: number; y: number },
    result: {
      set: (arg0: number, arg1: number) => void;
      scale: (arg0: number) => void;
      x: any;
      y: any;
    },
  ) {
    result.set(pointB.x - pointA.x, pointB.y - pointA.y);
    result.scale(0.5);
    result.x += pointA.x;
    result.y += pointA.y;
  };

  TouchInput.prototype.onTouchStartEndCancel = function(event: {
    touches: any;
  }) {
    // We only care about the first touch for camera rotation. As the user touches the screen,
    // we stored the current touch position
    const touches = event.touches;
    if (touches.length === 1) {
      this.lastTouchPoint.set(touches[0].x, touches[0].y);
    } else if (touches.length === 2) {
      // If there are 2 touches on the screen, then set the pinch distance
      this.lastPinchDistance = this.getPinchDistance(touches[0], touches[1]);
      this.calcMidPoint(touches[0], touches[1], this.lastPinchMidPoint);
    }
  };

  TouchInput.fromWorldPoint = new pc.Vec3();
  TouchInput.toWorldPoint = new pc.Vec3();
  TouchInput.worldDiff = new pc.Vec3();

  TouchInput.prototype.pan = function(midPoint: { x: any; y: any }) {
    const fromWorldPoint = TouchInput.fromWorldPoint;
    const toWorldPoint = TouchInput.toWorldPoint;
    const worldDiff = TouchInput.worldDiff;

    // For panning to work at any zoom level, we use screen point to world projection
    // to work out how far we need to pan the pivotEntity in world space
    const camera = this.entity.camera;
    const distance = this.orbitCamera.distance;

    camera.screenToWorld(midPoint.x, midPoint.y, distance, fromWorldPoint);
    camera.screenToWorld(
      this.lastPinchMidPoint.x,
      this.lastPinchMidPoint.y,
      distance,
      toWorldPoint,
    );

    worldDiff.sub2(toWorldPoint, fromWorldPoint);

    this.orbitCamera.pivotPoint.add(worldDiff);
  };

  TouchInput.pinchMidPoint = new pc.Vec2();

  TouchInput.prototype.onTouchMove = function(event: { touches: any }) {
    const pinchMidPoint = TouchInput.pinchMidPoint;

    // We only care about the first touch for camera rotation. Work out the difference moved since the last event
    // and use that to update the camera target position
    const touches = event.touches;
    if (touches.length === 1) {
      const touch = touches[0];

      this.orbitCamera.pitch -=
        (touch.y - this.lastTouchPoint.y) * this.orbitSensitivity;
      this.orbitCamera.yaw -=
        (touch.x - this.lastTouchPoint.x) * this.orbitSensitivity;

      this.lastTouchPoint.set(touch.x, touch.y);
    } else if (touches.length === 2) {
      // Calculate the difference in pinch distance since the last event
      const currentPinchDistance = this.getPinchDistance(
        touches[0],
        touches[1],
      );
      const diffInPinchDistance = currentPinchDistance - this.lastPinchDistance;
      this.lastPinchDistance = currentPinchDistance;

      this.orbitCamera.distance -=
        diffInPinchDistance *
        this.distanceSensitivity *
        0.1 *
        (this.orbitCamera.distance * 0.1);

      // Calculate pan difference
      this.calcMidPoint(touches[0], touches[1], pinchMidPoint);
      this.pan(pinchMidPoint);
      this.lastPinchMidPoint.copy(pinchMidPoint);
    }
  };

  type OrbitCamera = pc.ScriptType & {
    prototype: any;
    distanceBetween: pc.Vec3;
    quatWithoutYaw: pc.Quat;
    yawOffset: pc.Quat;
  };

  const OrbitCamera = pc.createScript("orbitCamera") as OrbitCamera;

  OrbitCamera.attributes.add("distanceMax", {
    type: "number",
    default: 0,
    title: "Distance Max",
    description: "Setting this at 0 will give an infinite distance limit",
  });

  OrbitCamera.attributes.add("distanceMin", {
    type: "number",
    default: 0,
    title: "Distance Min",
  });

  OrbitCamera.attributes.add("pitchAngleMax", {
    type: "number",
    default: 90,
    title: "Pitch Angle Max (degrees)",
  });

  OrbitCamera.attributes.add("pitchAngleMin", {
    type: "number",
    default: -90,
    title: "Pitch Angle Min (degrees)",
  });

  OrbitCamera.attributes.add("inertiaFactor", {
    type: "number",
    default: 0,
    title: "Inertia Factor",
    description:
      "Higher value means that the camera will continue moving after the user has stopped dragging. 0 is fully responsive.",
  });

  OrbitCamera.attributes.add("focusEntity", {
    type: "entity",
    title: "Focus Entity",
    description:
      "Entity for the camera to focus on. If blank, then the camera will use the whole scene",
  });

  OrbitCamera.attributes.add("frameOnStart", {
    type: "boolean",
    default: false,
    title: "Frame on Start",
    description: 'Frames the entity or scene at the start of the application."',
  });

  // Property to get and set the distance between the pivot point and camera
  // Clamped between this.distanceMin and this.distanceMax
  Object.defineProperty(OrbitCamera.prototype, "distance", {
    get: function() {
      return this._targetDistance;
    },

    set: function(value) {
      this._targetDistance = this._clampDistance(value);
    },
  });

  // Property to get and set the pitch of the camera around the pivot point (degrees)
  // Clamped between this.pitchAngleMin and this.pitchAngleMax
  // When set at 0, the camera angle is flat, looking along the horizon
  Object.defineProperty(OrbitCamera.prototype, "pitch", {
    get: function() {
      return this._targetPitch;
    },

    set: function(value) {
      this._targetPitch = this._clampPitchAngle(value);
    },
  });

  // Property to get and set the yaw of the camera around the pivot point (degrees)
  Object.defineProperty(OrbitCamera.prototype, "yaw", {
    get: function() {
      return this._targetYaw;
    },

    set: function(value) {
      this._targetYaw = value;

      // Ensure that the yaw takes the shortest route by making sure that
      // the difference between the targetYaw and the actual is 180 degrees
      // in either direction
      const diff = this._targetYaw - this._yaw;
      const reminder = diff % 360;
      if (reminder > 180) {
        this._targetYaw = this._yaw - (360 - reminder);
      } else if (reminder < -180) {
        this._targetYaw = this._yaw + (360 + reminder);
      } else {
        this._targetYaw = this._yaw + reminder;
      }
    },
  });

  // Property to get and set the world position of the pivot point that the camera orbits around
  Object.defineProperty(OrbitCamera.prototype, "pivotPoint", {
    get: function() {
      return this._pivotPoint;
    },

    set: function(value) {
      this._pivotPoint.copy(value);
    },
  });

  // Moves the camera to look at an entity and all its children so they are all in the view
  OrbitCamera.prototype.focus = function(focusEntity: pc.Entity) {
    // Calculate an bounding box that encompasses all the models to frame in the camera view
    this._buildAabb(focusEntity, 0);

    const halfExtents = this._modelsAabb.halfExtents;

    let distance = Math.max(
      halfExtents.x,
      Math.max(halfExtents.y, halfExtents.z),
    );
    distance =
      distance / Math.tan(0.5 * this.entity.camera.fov * pc.math.DEG_TO_RAD);
    distance = distance * 2;

    this.distance = distance;

    if (this.entity.camera) {
      this.entity.camera.nearClip = distance * 0.002;
      this.entity.camera.farClip = distance * 5;
    }

    this._removeInertia();

    this._pivotPoint.copy(this._modelsAabb.center);
  };

  OrbitCamera.distanceBetween = new pc.Vec3();

  // Set the camera position to a world position and look at a world position
  // Useful if you have multiple viewing angles to swap between in a scene
  OrbitCamera.prototype.resetAndLookAtPoint = function(
    resetPoint: any,
    lookAtPoint: any,
  ) {
    this.pivotPoint.copy(lookAtPoint);
    this.entity.setPosition(resetPoint);

    this.entity.lookAt(lookAtPoint);

    const distance = OrbitCamera.distanceBetween;
    distance.sub2(lookAtPoint, resetPoint);
    this.distance = distance.length();

    this.pivotPoint.copy(lookAtPoint);

    const cameraQuat = this.entity.getRotation();
    this.yaw = this._calcYaw(cameraQuat);
    this.pitch = this._calcPitch(cameraQuat, this.yaw);

    this._removeInertia();
    this._updatePosition();
  };

  // Set camera position to a world position and look at an entity in the scene
  // Useful if you have multiple models to swap between in a scene
  OrbitCamera.prototype.resetAndLookAtEntity = function(
    resetPoint: any,
    entity: any,
  ) {
    this._buildAabb(entity, 0);
    this.resetAndLookAtPoint(resetPoint, this._modelsAabb.center);
  };

  // Set the camera at a specific, yaw, pitch and distance without inertia (instant cut)
  OrbitCamera.prototype.reset = function(yaw: any, pitch: any, distance: any) {
    this.pitch = pitch;
    this.yaw = yaw;
    this.distance = distance;

    this._removeInertia();
  };

  /////////////////////////////////////////////////////////////////////////////////////////////
  // Private methods

  OrbitCamera.prototype.initialize = function() {
    const self = this;
    const onWindowResize = function() {
      self._checkAspectRatio();
    };

    window.addEventListener("resize", onWindowResize, false);

    this._checkAspectRatio();

    // Find all the models in the scene that are under the focused entity
    this._modelsAabb = new pc.BoundingBox();
    this._buildAabb(this.focusEntity || this.app.root, 0);

    this.entity.lookAt(this._modelsAabb.center);

    this._pivotPoint = new pc.Vec3();
    this._pivotPoint.copy(this._modelsAabb.center);

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

    // Reapply the clamps if they are changed in the editor
    this.on("attr:distanceMin", (_value: any, _prev: any) => {
      this._targetDistance = this._clampDistance(this._distance);
    });

    this.on("attr:distanceMax", (_value: any, _prev: any) => {
      this._targetDistance = this._clampDistance(this._distance);
    });

    this.on("attr:pitchAngleMin", (_value: any, _prev: any) => {
      this._targetPitch = this._clampPitchAngle(this._pitch);
    });

    this.on("attr:pitchAngleMax", (_value: any, _prev: any) => {
      this._targetPitch = this._clampPitchAngle(this._pitch);
    });

    // Focus on the entity if we change the focus entity
    this.on("attr:focusEntity", (value: any, _prev: any) => {
      if (this.frameOnStart) {
        this.focus(value || this.app.root);
      } else {
        this.resetAndLookAtEntity(
          this.entity.getPosition(),
          value || this.app.root,
        );
      }
    });

    this.on("attr:frameOnStart", (value: any, _prev: any) => {
      if (value) {
        this.focus(this.focusEntity || this.app.root);
      }
    });

    this.on("destroy", function() {
      window.removeEventListener("resize", onWindowResize, false);
    });
  };

  OrbitCamera.prototype.update = function(dt: number) {
    // Add inertia, if any
    const t =
      this.inertiaFactor === 0 ? 1 : Math.min(dt / this.inertiaFactor, 1);
    this._distance = pc.math.lerp(this._distance, this._targetDistance, t);
    this._yaw = pc.math.lerp(this._yaw, this._targetYaw, t);
    this._pitch = pc.math.lerp(this._pitch, this._targetPitch, t);

    this._updatePosition();
  };

  OrbitCamera.prototype._updatePosition = function() {
    // Work out the camera position based on the pivot point, pitch, yaw and distance
    this.entity.setLocalPosition(0, 0, 0);
    this.entity.setLocalEulerAngles(this._pitch, this._yaw, 0);

    const position = this.entity.getPosition();
    position.copy(this.entity.forward);
    position.scale(-this._distance);
    position.add(this.pivotPoint);
    this.entity.setPosition(position);
  };

  OrbitCamera.prototype._removeInertia = function() {
    this._yaw = this._targetYaw;
    this._pitch = this._targetPitch;
    this._distance = this._targetDistance;
  };

  OrbitCamera.prototype._checkAspectRatio = function() {
    const height = this.app.graphicsDevice.height;
    const width = this.app.graphicsDevice.width;

    // Match the axis of FOV to match the aspect ratio of the canvas so
    // the focused entities is always in frame
    this.entity.camera.horizontalFov = height > width;
  };

  OrbitCamera.prototype._buildAabb = function(
    entity: { model: { meshInstances: any }; children: string | any[] },
    modelsAdded: number,
  ) {
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
      modelsAdded += this._buildAabb(entity.children[i], modelsAdded);
    }

    return modelsAdded;
  };

  OrbitCamera.prototype._calcYaw = function(quat: {
    transformVector: (arg0: pc.Vec3, arg1: pc.Vec3) => void;
  }) {
    const transformedForward = new pc.Vec3();
    quat.transformVector(pc.Vec3.FORWARD, transformedForward);

    return (
      Math.atan2(-transformedForward.x, -transformedForward.z) *
      pc.math.RAD_TO_DEG
    );
  };

  OrbitCamera.prototype._clampDistance = function(distance: number) {
    if (this.distanceMax > 0) {
      return pc.math.clamp(distance, this.distanceMin, this.distanceMax);
    } else {
      return Math.max(distance, this.distanceMin);
    }
  };

  OrbitCamera.prototype._clampPitchAngle = function(pitch: number) {
    // Negative due as the pitch is inversed since the camera is orbiting the entity
    return pc.math.clamp(pitch, -this.pitchAngleMax, -this.pitchAngleMin);
  };

  OrbitCamera.quatWithoutYaw = new pc.Quat();
  OrbitCamera.yawOffset = new pc.Quat();

  OrbitCamera.prototype._calcPitch = function(quat: any, yaw: number) {
    const quatWithoutYaw = OrbitCamera.quatWithoutYaw;
    const yawOffset = OrbitCamera.yawOffset;

    yawOffset.setFromEulerAngles(0, -yaw, 0);
    quatWithoutYaw.mul2(yawOffset, quat);

    const transformedForward = new pc.Vec3();

    quatWithoutYaw.transformVector(pc.Vec3.FORWARD, transformedForward);

    return (
      Math.atan2(transformedForward.y, -transformedForward.z) *
      pc.math.RAD_TO_DEG
    );
  };
};
