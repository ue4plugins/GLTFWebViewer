import * as pc from "@animech-public/playcanvas";
import Debug from "debug";
import { OrbitCamera } from "../scripts";
import { ExtensionParser } from "./ExtensionParser";
import { ExtensionRegistry } from "./ExtensionRegistry";

const debug = Debug("OrbitCamera");

type NodeExtensionData = {
  name: string;
  focus: number;
  maxDistance: number;
  minDistance: number;
  maxAngle: number;
  minAngle: number;
};

type OrbitCameraScriptFocusMap = {
  script: OrbitCamera;
  node: number;
};

export class OrbitCameraExtensionParser implements ExtensionParser {
  private _focusNodes: OrbitCameraScriptFocusMap[] = [];

  public get name() {
    return "EPIC_orbital_cameras";
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
    debug("Post parse orbit camera");

    this._focusNodes.forEach(
      ({ script, node: nodeIndex }) =>
        (script.focusEntity = container.nodes[nodeIndex]),
    );
  }

  private _cameraPostParse(
    camera: pc.CameraComponent,
    extensionData: NodeExtensionData,
  ) {
    debug("Parse orbit camera", camera, extensionData);

    const script = camera.entity.script ?? camera.entity.addComponent("script");
    const orbitCameraScript = script.create(OrbitCamera, {
      enabled: false, // This is enabled later for the active camera
    });
    orbitCameraScript.pitchAngleMax = extensionData.maxAngle;
    orbitCameraScript.pitchAngleMin = extensionData.minAngle;
    orbitCameraScript.distanceMax = extensionData.maxDistance;
    orbitCameraScript.distanceMin = extensionData.minDistance;

    debug("Added orbit camera script", camera, orbitCameraScript);

    this._focusNodes.push({
      script: orbitCameraScript,
      node: extensionData.focus,
    });
  }
}
