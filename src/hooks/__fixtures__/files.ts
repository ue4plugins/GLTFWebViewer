import { getTestFile } from "./getTestFile";

export function getInvalidFiles() {
  return [
    new File([JSON.stringify({ test: true })], "test.json", {
      type: "application/json",
    }),
  ];
}
export function getEmptyGltfFiles() {
  return [new File([], "TestModel.gltf"), new File([], "TestImage1.jpg")];
}

export async function getUnpackedFiles() {
  return [
    await getTestFile("TestModelUnpacked/TestModel.gltf"),
    await getTestFile("TestModelUnpacked/TestModel.bin"),
    await getTestFile("TestModelUnpacked/images/roughness_metallic_0.jpg"),
    await getTestFile("TestModelUnpacked/images/roughness_metallic_1.jpg"),
  ];
}

export async function getEmbeddedFiles() {
  return [await getTestFile("TestModelEmbedded/TestModel.gltf")];
}

export async function getBinaryFiles() {
  return [await getTestFile("TestModelBinary/TestModel.glb")];
}
