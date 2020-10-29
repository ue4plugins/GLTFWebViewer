import * as pc from "@animech-public/playcanvas";
import Debug from "debug";
import { OrbitCamera } from "../scripts";
import { ExtensionParser } from "./ExtensionParser";
import { ExtensionRegistry } from "./ExtensionRegistry";

const debug = Debug("PlayerCamera");

const cameraModes = ["firstPerson", "thirdPerson"] as const;

type NodeExtensionData = {
  mode: typeof cameraModes[number];
  focus: number;
  maxDistance: number;
  minDistance: number;
  maxPitch: number;
  minPitch: number;
  maxYaw: number;
  minYaw: number;
  rotationSensitivity: number;
  rotationInertia: number;
  dollySensitivity: number;
  dollyDuration: number;
};

type OrbitCameraScriptFocusMap = {
  script: OrbitCamera;
  node: number;
};

export class PlayerCameraExtensionParser implements ExtensionParser {
  private _focusNodes: OrbitCameraScriptFocusMap[] = [];

  public get name() {
    return "EPIC_player_cameras";
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
    debug("Post parse player camera");

    this._focusNodes.forEach(
      ({ script, node: nodeIndex }) =>
        (script.focusEntity = container.nodes[nodeIndex] ?? null),
    );
  }

  private _cameraPostParse(
    camera: pc.CameraComponent,
    extensionData: NodeExtensionData,
  ) {
    debug("Parse player camera", camera, extensionData);

    if (!cameraModes.includes(extensionData.mode)) {
      debug(`Invalid camera mode '${extensionData.mode}'`);
      return;
    }

    const script = camera.entity.script ?? camera.entity.addComponent("script");
    const orbitCameraScript = script.create(OrbitCamera, {
      enabled: false, // This is enabled later for the active camera
    });

    // TODO: Assign mode once modes have been added to the orbit camera script

    orbitCameraScript.pitchAngleMax = extensionData.maxPitch;
    orbitCameraScript.pitchAngleMin = extensionData.minPitch;
    orbitCameraScript.yawAngleMax = extensionData.maxYaw;
    orbitCameraScript.yawAngleMin = extensionData.minYaw;
    orbitCameraScript.distanceMax = extensionData.maxDistance;
    orbitCameraScript.distanceMin = extensionData.minDistance;
    orbitCameraScript.distanceSensitivity = extensionData.dollySensitivity;
    orbitCameraScript.orbitSensitivity = extensionData.rotationSensitivity;
    orbitCameraScript.inertiaFactor = extensionData.rotationInertia;
    orbitCameraScript.dollyDuration = extensionData.dollyDuration;

    debug("Added orbit camera script", camera, orbitCameraScript);

    this._focusNodes.push({
      script: orbitCameraScript,
      node: extensionData.focus,
    });
  }
}
