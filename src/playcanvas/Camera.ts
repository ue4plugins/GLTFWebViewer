import {
  hotspotTrackerScriptName,
  HotspotTracker,
  orbitCameraScriptName,
  OrbitCamera as OrbitCameraScript,
} from "./scripts";

export type CameraEntity = pc.Entity & {
  camera: pc.CameraComponent;
  script: pc.ScriptComponent & {
    [hotspotTrackerScriptName]: HotspotTracker;
  };
};

export type OrbitCameraEntity = CameraEntity & {
  script: CameraEntity["script"] & {
    [orbitCameraScriptName]: OrbitCameraScript;
  };
};

export function convertToCameraEntity(entity: pc.Entity): CameraEntity {
  const script = entity.script ?? entity.addComponent("script");
  if (!script.has(hotspotTrackerScriptName)) {
    script.create(hotspotTrackerScriptName);
  }
  return entity as CameraEntity;
}

export function isOrbitCameraEntity(
  camera: CameraEntity,
): camera is OrbitCameraEntity {
  return camera.script?.has(orbitCameraScriptName) ?? false;
}
