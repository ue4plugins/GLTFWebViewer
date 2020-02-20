import pc from "playcanvas";
import { Node as GlTfNode } from "../types";
import { GlTfParser } from "../GlTfParser";

// Specification:
//   https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#node
const tempMat = new pc.Mat4();
const tempVec = new pc.Vec3();

let nodeCounter = 0;

export function translateNode(data: GlTfNode, _res: GlTfParser) {
  const entity = new pc.GraphNode();

  if (typeof data.name === "string") {
    entity.name = data.name;
  } else {
    entity.name = "Node " + nodeCounter;
    nodeCounter += 1;
  }

  // Parse transformation properties
  if (data.matrix) {
    tempMat.data.set(data.matrix);
    tempMat.getTranslation(tempVec);
    entity.setLocalPosition(tempVec);
    tempMat.getEulerAngles(tempVec);
    entity.setLocalEulerAngles(tempVec);
    tempMat.getScale(tempVec);
    entity.setLocalScale(tempVec);
  }

  if (data.rotation) {
    const r = data.rotation;
    entity.setLocalRotation(r[0], r[1], r[2], r[3]);
  }

  if (data.translation) {
    const t = data.translation;
    entity.setLocalPosition(t[0], t[1], t[2]);
  }

  if (data.scale) {
    const s = data.scale;
    entity.setLocalScale(s[0], s[1], s[2]);
  }

  // TODO: The loader has been temporarily switch from using Entities to GraphNodes
  // in the hierarchy. Therefore, camera loading is disabled for now.
  /*
      if (data.hasOwnProperty('camera')) {
          var gltf = resources.gltf;
          var camera = gltf.cameras[data.camera];
          var options = {};
          if (camera.type === 'perspective') {
              options.type = pc.PROJECTION_PERSPECTIVE;
              if (camera.hasOwnProperty('perspective')) {
                  var perspective = camera.perspective;
                  if (perspective.hasOwnProperty('aspectRatio')) {
                      options.aspectRatio = perspective.aspectRatio;
                  }
                  options.fov = perspective.yfov;
                  if (perspective.hasOwnProperty('zfar')) {
                      options.farClip = perspective.zfar;
                  }
                  options.nearClip = perspective.znear;
              }
          } else if (camera.type === 'orthographic') {
              options.type = pc.PROJECTION_ORTHOGRAPHIC;
              if (camera.hasOwnProperty('orthographic')) {
                  var orthographic = camera.orthographic;
                  options.aspectRatio = orthographic.xmag / orthographic.ymag;
                  options.orthoHeight = orthographic.ymag * 0.5;
                  options.farClip = orthographic.zfar;
                  options.nearClip = orthographic.znear;
              }
          }
          entity.addComponent('camera', options);
          // Diable loaded cameras by default and leave it to the application to enable them
          entity.camera.enabled = false;
      }
      */
  return entity;
}
