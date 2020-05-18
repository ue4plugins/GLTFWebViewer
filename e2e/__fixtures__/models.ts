import { GltfFile } from "../../src/playcanvas";

export type TestModel = GltfFile & {
  multipleAngles?: boolean;
};

export const models: TestModel[] = [
  // {
  //   filePath: "assets/gltf/AlfaRomeo/glTF/AlfaRomeo.gltf",
  //   name: "AlfaRomeo",
  //   description: "unpacked",
  //   multipleAngles: true,
  // },
  // {
  //   filePath: "assets/gltf/AntiqueCamera/glTF-Binary/AntiqueCamera.glb",
  //   name: "AntiqueCamera",
  //   description: "binary",
  //   multipleAngles: true,
  // },
  {
    filePath: "assets/gltf/DamagedHelmet/glTF-Embedded/DamagedHelmet.gltf",
    name: "DamagedHelmet",
    description: "embedded",
    multipleAngles: true,
  },
  {
    filePath: "assets/gltf/FlightHelmet/glTF/FlightHelmet.gltf",
    name: "FlightHelmet",
    description: "unpacked",
    multipleAngles: true,
  },
  // {
  //   filePath: "assets/gltf/FuturisticTruck/glTF/FuturisticTruck.gltf",
  //   name: "FuturisticTruck",
  //   description: "unpacked",
  //   multipleAngles: true,
  // },
  // {
  //   filePath: "assets/gltf/Hoverbike/glTF/Hoverbike.gltf",
  //   name: "Hoverbike",
  //   description: "unpacked",
  //   multipleAngles: true,
  // },
  // {
  //   filePath: "assets/gltf/WaterBottle/glTF-Draco/WaterBottle.gltf",
  //   name: "WaterBottle",
  //   description: "draco",
  //   multipleAngles: true,
  // },
  // {
  //   filePath: "assets/gltf/ZIS101A/glTF/ZIS101A.gltf",
  //   name: "ZIS101A",
  //   description: "unpacked",
  //   multipleAngles: true,
  // },
];
