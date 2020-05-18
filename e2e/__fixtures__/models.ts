import { GltfFile } from "../../src/playcanvas";

export type TestModel = GltfFile & {
  multipleAngles?: boolean;
};

export const models: TestModel[] = [
  // {
  //   filePath: "assets/gltf/AlfaRomeo/glTF/AlfaRomeo.gltf",
  //   name: "Alfa Romeo Stradale 1967",
  //   multipleAngles: true,
  // },
  // {
  //   filePath: "assets/gltf/AntiqueCamera/glTF-Binary/AntiqueCamera.glb",
  //   name: "Antique Camera",
  //   multipleAngles: true,
  // },
  {
    filePath: "assets/gltf/DamagedHelmet/glTF-Embedded/DamagedHelmet.gltf",
    name: "Damaged Helmet",
    multipleAngles: true,
  },
  // {
  //   filePath: "assets/gltf/FlightHelmet/glTF/FlightHelmet.gltf",
  //   name: "Flight Helmet",
  //   multipleAngles: true,
  // },
  // {
  //   filePath: "assets/gltf/FuturisticTruck/glTF/FuturisticTruck.gltf",
  //   name: "Futuristic Truck",
  //   multipleAngles: true,
  // },
  {
    filePath: "assets/gltf/HoverBike/glTF/Hoverbike.gltf",
    name: 'Hover Bike - "The Rocket"',
    multipleAngles: true,
  },
  // {
  //   filePath: "assets/gltf/WaterBottle/glTF-Draco/WaterBottle.gltf",
  //   name: "Water Bottle",
  //   multipleAngles: true,
  // },
  // {
  //   filePath: "assets/gltf/ZIS101A/glTF/ZIS101A.gltf",
  //   name: "ZIS-101A Sport (1938)",
  //   multipleAngles: true,
  // },
];
