import * as pc from "@animech-public/playcanvas";
import Debug from "debug";
import { OrbitCamera, OrbitCameraMode } from "../scripts";
import { ExtensionParser } from "./ExtensionParser";
import { ExtensionRegistry } from "./ExtensionRegistry";

const debug = Debug("CameraControl");

type NodeExtensionData = {
  mode: "freeLook" | "orbital";
  target: number;
  maxDistance: number;
  minDistance: number;
  maxPitch?: number;
  minPitch?: number;
  maxYaw?: number;
  minYaw?: number;
  rotationSensitivity: number;
  rotationInertia: number;
  dollySensitivity: number;
  dollyDuration: number;
};

type OrbitCameraScriptFocusMap = {
  script: OrbitCamera;
  node: number;
};

export class CameraControlExtensionParser implements ExtensionParser {
  private _focusNodes: OrbitCameraScriptFocusMap[] = [];

  public get name() {
    return "EPIC_camera_controls";
  }

  public register(registry: ExtensionRegistry) {
    registry.camera.add(this.name, {
      postParse: this._cameraPostParse.bind(this),
    });
  }

  public unregister(registry: ExtensionRegistry) {
    registry.camera.remove(this.name);
  }

  public postParse(container: pc.ContainerResource) {
    debug("Post parse camera control");

    this._focusNodes.forEach(
      ({ script, node: nodeIndex }) =>
        (script.focusEntity = container.nodes[nodeIndex] ?? null),
    );
  }

  private _cameraPostParse(
    camera: pc.CameraComponent,
    data: NodeExtensionData,
  ) {
    debug("Parse camera control", camera, data);

    const missingProperties = this._getMissingProperties(data, [
      "mode",
      "maxDistance",
      "minDistance",
      "rotationSensitivity",
      "rotationInertia",
      "dollySensitivity",
      "dollyDuration",
    ]);

    if (missingProperties.length > 0) {
      missingProperties.forEach(key =>
        debug(
          `Property '${key}' for camera control '${camera.entity.name}' is missing`,
        ),
      );
      return;
    }

    const cameraMode = this._parseOrbitCameraMode(data.mode);
    if (cameraMode === null) {
      debug(
        `Camera mode '${data.mode}' for camera control '${camera.entity.name}' is invalid`,
      );
      return;
    }

    const script = (
      camera.entity.script ?? camera.entity.addComponent("script")
    ).create(OrbitCamera, {
      enabled: false, // This is enabled later for the active camera
    });

    script.mode = cameraMode;
    script.pitchAngleMax = data.maxPitch ?? script.pitchAngleMax;
    script.pitchAngleMin = data.minPitch ?? script.pitchAngleMin;
    script.yawAngleMax = data.maxYaw ?? script.yawAngleMax;
    script.yawAngleMin = data.minYaw ?? script.yawAngleMin;
    script.distanceMax = data.maxDistance;
    script.distanceMin = data.minDistance;
    script.distanceSensitivity = data.dollySensitivity;
    script.orbitSensitivity = data.rotationSensitivity;
    script.inertiaFactor = data.rotationInertia;
    script.dollyDuration = data.dollyDuration;

    debug("Added orbit camera script", camera, script);

    this._focusNodes.push({
      script: script,
      node: data.target,
    });
  }

  private _getMissingProperties<T extends {}>(
    obj: T,
    properties: (keyof T)[],
  ): (keyof T)[] {
    return properties.filter(key => obj[key] === undefined);
  }

  private _parseOrbitCameraMode(
    cameraControlMode?: string,
  ): OrbitCameraMode | null {
    if (!cameraControlMode || cameraControlMode.length < 2) {
      return null;
    }

    const modeName = this._capitalizeFirstLetter(cameraControlMode);
    return OrbitCameraMode[modeName as keyof typeof OrbitCameraMode] ?? null;
  }

  private _capitalizeFirstLetter(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}
