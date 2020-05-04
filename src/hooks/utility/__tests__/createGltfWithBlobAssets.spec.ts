import "jest";
import { getTestFile } from "../__fixtures__/getTestFile";
import { readFile, createGltfWithBlobAssets } from "..";

function blobToFile(blob: Blob, name: string) {
  return new File([blob], name);
}

const testGuid = "d9031d07-b017-4aa8-af51-f6bc461f37a4";

describe("createGltfWithBlobAssets", () => {
  beforeAll(() => {
    // eslint-disable-next-line
    (global as any).URL.createObjectURL = jest.fn(
      () => `http://domain.com/${testGuid}`,
    );
  });

  it("should return gltf with object URL references", async () => {
    const gltf = blobToFile(
      await getTestFile("TestModel/TestModel.gltf", {
        type: "application/json",
      }),
      "TestModel.gltf",
    );

    const assets = [
      blobToFile(
        await getTestFile("TestModel/TestModel.bin", {
          type: "application/octet-stream",
        }),
        "TestModel.bin",
      ),
      blobToFile(
        await getTestFile("TestModel/images/roughness_metallic_0.jpg", {
          type: "image/jpeg",
        }),
        "roughness_metallic_0.jpg",
      ),
      blobToFile(
        await getTestFile("TestModel/images/roughness_metallic_1.jpg", {
          type: "image/jpeg",
        }),
        "roughness_metallic_1.jpg",
      ),
    ];

    const outputFile = await createGltfWithBlobAssets(gltf, assets);
    expect(outputFile).toBeDefined();

    const content = await readFile(outputFile!, "text"); // eslint-disable-line
    expect(typeof content).toBe("string");

    const object = JSON.parse(content!); // eslint-disable-line

    // Ensures that reference to asset in same directory work
    expect(object?.buffers[0]?.uri).toBe(testGuid);

    // Ensures that reference to asset in sub directory work
    expect(object?.images[0]?.uri).toBe(testGuid);
    expect(object?.images[1]?.uri).toBe(testGuid);
  });

  it("should return undefined for invalid/empty gltf file", async () => {
    const gltf = blobToFile(new Blob([]), "TestModel.gltf");
    const outputFile = await createGltfWithBlobAssets(gltf, []);
    expect(outputFile).toBeUndefined();
  });
});
