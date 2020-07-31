import * as pc from "@animech-public/playcanvas";
import {
  hotspotTrackerScriptName,
  HotspotTracker,
  orbitCameraScriptName,
  OrbitCamera,
} from "./scripts";

export type CameraEntity = pc.Entity & {
  camera: pc.CameraComponent;
  script: pc.ScriptComponent & {
    [hotspotTrackerScriptName]: HotspotTracker;
  };
};

export type OrbitCameraEntity = CameraEntity & {
  script: CameraEntity["script"] & {
    [orbitCameraScriptName]: OrbitCamera;
  };
};

export function convertToCameraEntity(entity: pc.Entity): CameraEntity {
  const cameraComponent = entity.camera ?? entity.addComponent("camera");
  cameraComponent.clearColor = new pc.Color(0, 0, 0);

  const scriptComponent = entity.script ?? entity.addComponent("script");
  if (!scriptComponent.has(hotspotTrackerScriptName)) {
    scriptComponent.create(hotspotTrackerScriptName);
  }

  return entity as CameraEntity;
}

export function isOrbitCameraEntity(
  camera: CameraEntity,
): camera is OrbitCameraEntity {
  return camera.script?.has(orbitCameraScriptName) ?? false;
}
