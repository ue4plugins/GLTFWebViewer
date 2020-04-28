import { GltfFile } from "../../src/playcanvas";

export type TestModel = GltfFile & {
  multipleAngles?: boolean;
};

export const models: TestModel[] = [
  {
    path: "assets/gltf/2CylinderEngine/glTF-Binary/2CylinderEngine.glb",
    name: "2CylinderEngine-binary",
    description: "binary",
    multipleAngles: true,
  },
  // {
  //   path: "assets/gltf/2CylinderEngine/glTF-Draco/2CylinderEngine.gltf",
  //   name: "2CylinderEngine-draco",
  //   description: "draco",
  // },
  {
    path: "assets/gltf/2CylinderEngine/glTF-Embedded/2CylinderEngine.gltf",
    name: "2CylinderEngine-embedded",
    description: "embedded",
  },
  {
    path: "assets/gltf/2CylinderEngine/glTF/2CylinderEngine.gltf",
    name: "2CylinderEngine-unpacked",
    description: "unpacked",
  },
  {
    path: "assets/gltf/DamagedHelmet/glTF-Binary/DamagedHelmet.glb",
    name: "DamagedHelmet-binary",
    description: "binary",
    multipleAngles: true,
  },
  {
    path: "assets/gltf/DamagedHelmet/glTF-Embedded/DamagedHelmet.gltf",
    name: "DamagedHelmet-embedded",
    description: "embedded",
  },
  {
    path: "assets/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf",
    name: "DamagedHelmet-unpacked",
    description: "unpacked",
  },
  {
    path: "assets/gltf/Duck/glTF-Binary/Duck.glb",
    name: "Duck-binary",
    description: "binary",
    multipleAngles: true,
  },
  // {
  //   path: "assets/gltf/Duck/glTF-Draco/Duck.gltf",
  //   name: "Duck-draco",
  //   description: "draco",
  // },
  {
    path: "assets/gltf/Duck/glTF-Embedded/Duck.gltf",
    name: "Duck-embedded",
    description: "embedded",
  },
  {
    path: "assets/gltf/Duck/glTF/Duck.gltf",
    name: "Duck-unpacked",
    description: "unpacked",
  },
  {
    path: "assets/gltf/RealisticCarHd05/glTF/RealisticCarHd05.gltf",
    name: "RealisticCarHd05-unpacked",
    description: "unpacked",
    multipleAngles: true,
  },
];
