/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import pc from "playcanvas";
import createDebug from "debug";
import { Mesh } from "../types";
import { GlTfParser } from "../GlTfParser";
import { getAccessorData } from "./getAccessorData";
import { getPrimitiveType } from "./getPrimitiveType";

// TODO: Fix these when they have proper types
const pcMorphTarget = (pc as any).MorphTarget;
const pcMorph = (pc as any).Morph;

const pcMesh = pc.Mesh;
type pcMesh = pc.Mesh & {
  materialIndex?: number;
  morph?: typeof pcMorph;
};

type KeyNum =
  | Int8Array
  | Uint8Array
  | Int16Array
  | Uint16Array
  | Uint32Array
  | Float32Array
  | number[];

const debug = createDebug("translateMesh");

const calculateIndices = (numVertices: number) => {
  const dummyIndices = new Uint16Array(numVertices);
  for (let i = 0; i < numVertices; i += 1) {
    dummyIndices[i] = i;
  }
  return dummyIndices;
};

const getAttribute = (elements: any[], semantic: string) => {
  for (let i = 0; i < elements.length; i += 1) {
    if (elements[i].name === semantic) {
      return elements[i];
    }
  }
  return null;
};

// Specification:
//   https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#mesh
export function translateMesh(data: Mesh, resources: GlTfParser) {
  const { gltf } = resources;
  const meshes: pcMesh[] = [];

  const gltfAccessors = gltf.accessors!;
  const gltfBufferViews = gltf.bufferViews!;

  if (!gltfAccessors || !gltfBufferViews) {
    console.warn("Missing accessors and/or buffer views");
    return;
  }

  debug("gltf", gltf);

  data.primitives.forEach(primitive => {
    const { attributes } = primitive;

    let indices = null;
    const data: Record<string, KeyNum> = {};

    debug("primitive extensions", primitive.extensions);

    // Start by looking for compressed vertex data for this primitive
    if (primitive.extensions) {
      const extensions = primitive.extensions;
      const extDraco = extensions["KHR_draco_mesh_compression"];
      if (extDraco) {
        const bufferView = gltfBufferViews[extDraco.bufferView];
        const arrayBuffer = resources.buffers[bufferView.buffer];
        const byteOffset = bufferView["byteOffset"] ? bufferView.byteOffset : 0;
        const uint8Buffer = new Int8Array(
          arrayBuffer,
          byteOffset,
          bufferView.byteLength,
        );

        const decoderModule = resources.decoderModule;
        const buffer = new decoderModule.DecoderBuffer();
        buffer.Init(uint8Buffer, uint8Buffer.length);

        const decoder = new decoderModule.Decoder();
        const geometryType = decoder.GetEncodedGeometryType(buffer);

        let outputGeometry: any;
        let status: any;

        switch (geometryType) {
          case decoderModule.INVALID_GEOMETRY_TYPE:
            console.error("Invalid geometry type");
            break;
          case decoderModule.POINT_CLOUD:
            outputGeometry = new decoderModule.PointCloud();
            status = decoder.DecodeBufferToPointCloud(buffer, outputGeometry);
            break;
          case decoderModule.TRIANGULAR_MESH:
            outputGeometry = new decoderModule.Mesh();
            status = decoder.DecodeBufferToMesh(buffer, outputGeometry);
            break;
        }

        debug("draco status", status.ok());

        if (!status.ok() || outputGeometry.ptr === 0) {
          const errorMsg = status.error_msg();
          console.error(errorMsg);
        }

        const numPoints = outputGeometry.num_points();
        const numFaces = outputGeometry.num_faces();

        if (extDraco.attributes) {
          const extractAttribute = (uniqueId: string) => {
            const attribute = decoder.GetAttributeByUniqueId(
              outputGeometry,
              uniqueId,
            );

            const attributeData = new decoderModule.DracoFloat32Array();
            decoder.GetAttributeFloatForAllPoints(
              outputGeometry,
              attribute,
              attributeData,
            );

            const numValues = numPoints * attribute.num_components();
            const values = new Float32Array(numValues);

            for (let i = 0; i < numValues; i += 1) {
              values[i] = attributeData.GetValue(i);
            }

            decoderModule.destroy(attributeData);
            return values;
          };

          const dracoAttribs: Record<string, string> = extDraco.attributes;
          Object.entries(dracoAttribs).forEach(([key, val]) => {
            if (data[key]) {
              return;
            }
            const d = extractAttribute(val);
            if (d) {
              data[key] = d;
            }
          });
        }

        if (geometryType === decoderModule.TRIANGULAR_MESH) {
          const face = new decoderModule.DracoInt32Array();
          indices =
            numPoints > 65535
              ? new Uint32Array(numFaces * 3)
              : new Uint16Array(numFaces * 3);
          for (let i = 0; i < numFaces; i += 1) {
            decoder.GetFaceFromMesh(outputGeometry, i, face);
            indices[i * 3] = face.GetValue(0);
            indices[i * 3 + 1] = face.GetValue(1);
            indices[i * 3 + 2] = face.GetValue(2);
          }
          decoderModule.destroy(face);
        }

        decoderModule.destroy(outputGeometry);
        decoderModule.destroy(decoder);
        decoderModule.destroy(buffer);
      }
    }

    // Grab typed arrays for all vertex data

    Object.entries(attributes).forEach(([key, val]) => {
      if (data[key]) {
        return;
      }
      const accessor = gltfAccessors[val];
      const d = getAccessorData(gltf, accessor, resources.buffers);
      if (d) {
        data[key] = d;
      }
    });

    if (typeof primitive.indices !== "undefined" && indices === null) {
      const accessor = gltfAccessors[primitive.indices];
      indices = getAccessorData(gltf, accessor, resources.buffers);
    }

    const numVertices = data["POSITION"] ? data["POSITION"].length / 3 : 0;
    if (data["POSITION"] && data["NORMALS"]) {
      // pc.calculateNormals needs indices so generate some if none are present
      data["NORMALS"] = pc.calculateNormals(
        data["POSITION"] as any,
        (indices === null ? calculateIndices(numVertices) : indices) as any,
      );
    }
    debug("data", data);
    debug("numVertices", numVertices);

    const vertexDesc = [];
    if ("POSITION" in data) {
      vertexDesc.push({
        semantic: pc.SEMANTIC_POSITION,
        components: 3,
        type: pc.TYPE_FLOAT32,
      });
    }

    if ("NORMALS" in data) {
      vertexDesc.push({
        semantic: pc.SEMANTIC_NORMAL,
        components: 3,
        type: pc.TYPE_FLOAT32,
      });
    }

    if ("TANGENTS" in data) {
      vertexDesc.push({
        semantic: pc.SEMANTIC_TANGENT,
        components: 4,
        type: pc.TYPE_FLOAT32,
      });
    }

    if ("TEXCOORD_0" in data) {
      vertexDesc.push({
        semantic: pc.SEMANTIC_TEXCOORD0,
        components: 2,
        type: pc.TYPE_FLOAT32,
      });
    }

    if ("TEXTCOORD_1" in data) {
      vertexDesc.push({
        semantic: pc.SEMANTIC_TEXCOORD1,
        components: 2,
        type: pc.TYPE_FLOAT32,
      });
    }

    if ("COLORS" in data) {
      vertexDesc.push({
        semantic: pc.SEMANTIC_COLOR,
        components: 4,
        type: pc.TYPE_UINT8,
        normalize: true,
      });
    }

    if ("JOINTS" in data) {
      vertexDesc.push({
        semantic: pc.SEMANTIC_BLENDINDICES,
        components: 4,
        type: pc.TYPE_UINT8,
      });
    }

    if ("WEIGHTS" in data) {
      vertexDesc.push({
        semantic: pc.SEMANTIC_BLENDWEIGHT,
        components: 4,
        type: pc.TYPE_FLOAT32,
      });
    }

    debug("vertexDesc", vertexDesc);

    const vertexFormat = new pc.VertexFormat(resources.device, vertexDesc);
    const vertexBuffer = new pc.VertexBuffer(
      resources.device,
      vertexFormat,
      numVertices,
      pc.BUFFER_STATIC,
    );

    const vertexData = vertexBuffer.lock();
    const { elements } = vertexFormat as any;
    const vertexDataF32 = new Float32Array(vertexData);
    const vertexDataU8 = new Uint8Array(vertexData);

    Object.entries(data).forEach(([key, val]) => {
      switch (key) {
        case "POSITION": {
          const attr = getAttribute(elements, pc.SEMANTIC_POSITION);
          const dstOffset = attr.offset / 4;
          const dstStride = attr.stride / 4;
          for (let i = 0; i < numVertices; i += 1) {
            const dstIndex = dstOffset + i * dstStride;
            const srcIndex = i * 3;
            vertexDataF32[dstIndex] = val[srcIndex];
            vertexDataF32[dstIndex + 1] = val[srcIndex + 1];
            vertexDataF32[dstIndex + 2] = val[srcIndex + 2];
          }
          break;
        }

        case "NORMALS": {
          const attr = getAttribute(elements, pc.SEMANTIC_NORMAL);
          const dstOffset = attr.offset / 4;
          const dstStride = attr.stride / 4;
          for (let i = 0; i < numVertices; i += 1) {
            const dstIndex = dstOffset + i * dstStride;
            const srcIndex = i * 3;
            vertexDataF32[dstIndex] = val[srcIndex];
            vertexDataF32[dstIndex + 1] = val[srcIndex + 1];
            vertexDataF32[dstIndex + 2] = val[srcIndex + 2];
          }
          break;
        }

        case "TANGENTS": {
          const attr = getAttribute(elements, pc.SEMANTIC_TANGENT);
          const dstOffset = attr.offset / 4;
          const dstStride = attr.stride / 4;
          for (let i = 0; i < numVertices; i += 1) {
            const dstIndex = dstOffset + i * dstStride;
            const srcIndex = i * 4;
            vertexDataF32[dstIndex] = val[srcIndex];
            vertexDataF32[dstIndex + 1] = val[srcIndex + 1];
            vertexDataF32[dstIndex + 2] = val[srcIndex + 2];
            vertexDataF32[dstIndex + 3] = val[srcIndex + 3];
          }
          break;
        }

        case "TEXCOORD_0": {
          const attr = getAttribute(elements, pc.SEMANTIC_TEXCOORD0);
          const dstOffset = attr.offset / 4;
          const dstStride = attr.stride / 4;
          for (let i = 0; i < numVertices; i += 1) {
            const dstIndex = dstOffset + i * dstStride;
            const srcIndex = i * 2;
            vertexDataF32[dstIndex] = val[srcIndex];
            vertexDataF32[dstIndex + 1] = val[srcIndex + 1];
          }
          break;
        }

        case "TEXCOORD_1": {
          const attr = getAttribute(elements, pc.SEMANTIC_TEXCOORD1);
          const dstOffset = attr.offset / 4;
          const dstStride = attr.stride / 4;
          for (let i = 0; i < numVertices; i += 1) {
            const dstIndex = dstOffset + i * dstStride;
            const srcIndex = i * 2;
            vertexDataF32[dstIndex] = val[srcIndex];
            vertexDataF32[dstIndex + 1] = val[srcIndex + 1];
          }
          break;
        }

        case "COLORS": {
          const attr = getAttribute(elements, pc.SEMANTIC_COLOR);
          const dstOffset = attr.offset;
          const dstStride = attr.stride;
          const accessor = gltfAccessors[attributes.COLOR_0];
          for (let i = 0; i < numVertices; i += 1) {
            const dstIndex = dstOffset + i * dstStride;
            const srcIndex = accessor.type === "VEC4" ? i * 4 : i * 3;
            const [r, g, b, a] = val.slice(srcIndex);
            vertexDataU8[dstIndex] = Math.round(pc.math.clamp(r, 0, 1) * 255);
            vertexDataU8[dstIndex + 1] = Math.round(
              pc.math.clamp(g, 0, 1) * 255,
            );
            vertexDataU8[dstIndex + 2] = Math.round(
              pc.math.clamp(b, 0, 1) * 255,
            );
            vertexDataU8[dstIndex + 3] =
              accessor.type === "VEC4"
                ? Math.round(pc.math.clamp(a, 0, 1) * 255)
                : 255;
          }
          break;
        }
        case "JOINTS": {
          const attr = getAttribute(elements, pc.SEMANTIC_BLENDINDICES);
          const dstOffset = attr.offset;
          const dstStride = attr.stride;
          for (let i = 0; i < numVertices; i += 1) {
            const dstIndex = dstOffset + i * dstStride;
            const srcIndex = i * 4;
            vertexDataU8[dstIndex] = val[srcIndex];
            vertexDataU8[dstIndex + 1] = val[srcIndex + 1];
            vertexDataU8[dstIndex + 2] = val[srcIndex + 2];
            vertexDataU8[dstIndex + 3] = val[srcIndex + 3];
          }
          break;
        }

        case "WEIGHTS": {
          const attr = getAttribute(elements, pc.SEMANTIC_BLENDWEIGHT);
          const dstOffset = attr.offset / 4;
          const dstStride = attr.stride / 4;

          for (let i = 0; i < numVertices; i += 1) {
            const dstIndex = dstOffset + i * dstStride;
            const srcIndex = i * 4;
            vertexDataF32[dstIndex] = val[srcIndex];
            vertexDataF32[dstIndex + 1] = val[srcIndex + 1];
            vertexDataF32[dstIndex + 2] = val[srcIndex + 2];
            vertexDataF32[dstIndex + 3] = val[srcIndex + 3];
          }
          break;
        }
      }
    });

    debug("vertexDataF32", vertexDataF32);

    vertexBuffer.unlock();

    const mesh = new pc.Mesh() as pcMesh;
    mesh.vertexBuffer = vertexBuffer;

    // TODO: Improve typing
    const firstPrimitive: any = mesh.primitive[0];
    firstPrimitive.type = getPrimitiveType(primitive);
    firstPrimitive.base = 0;
    firstPrimitive.indexed = indices !== null;

    if (indices !== null) {
      let indexFormat;
      if (indices instanceof Uint8Array) {
        indexFormat = pc.INDEXFORMAT_UINT8;
      } else if (indices instanceof Uint16Array) {
        indexFormat = pc.INDEXFORMAT_UINT16;
      } else {
        indexFormat = pc.INDEXFORMAT_UINT32;
      }
      const numIndices = indices.length;
      const indexBuffer = new pc.IndexBuffer(
        resources.device,
        indexFormat,
        numIndices,
        pc.BUFFER_STATIC,
        indices,
      );
      mesh.indexBuffer[0] = indexBuffer;
      firstPrimitive.count = indices.length;
    } else {
      firstPrimitive.count = numVertices;
    }

    mesh.materialIndex = primitive.material;

    const accessor = gltfAccessors[attributes.POSITION];
    const min = accessor.min ?? [0, 0, 0];
    const max = accessor.max ?? [0, 0, 0];
    const aabb = new pc.BoundingBox(
      new pc.Vec3(
        (max[0] + min[0]) / 2,
        (max[1] + min[1]) / 2,
        (max[2] + min[2]) / 2,
      ),
      new pc.Vec3(
        (max[0] - min[0]) / 2,
        (max[1] - min[1]) / 2,
        (max[2] - min[2]) / 2,
      ),
    );
    mesh.aabb = aabb;

    if (primitive.targets) {
      const targets = primitive.targets.map(
        target =>
          new pcMorphTarget({
            deltaPositions: target.POSITION
              ? getAccessorData(
                  gltf,
                  gltfAccessors[target.POSITION],
                  resources.buffers,
                )
              : null,
            deltaNormals: target.NORMAL
              ? getAccessorData(
                  gltf,
                  gltfAccessors[target.NORMAL],
                  resources.buffers,
                )
              : null,
            deltaTangents: target.TANGENT
              ? getAccessorData(
                  gltf,
                  gltfAccessors[target.TANGENT],
                  resources.buffers,
                )
              : null,
          }),
      );
      mesh.morph = new pcMorph(targets);
    }

    meshes.push(mesh);
  });

  return meshes;
}
