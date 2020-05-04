import "jest";
import { readFile } from "../readFile";
import { getTestFile } from "../__fixtures__/getTestFile";

describe("readFile", () => {
  it("should be able to read gltf as text", async () => {
    const file = await getTestFile("TestModel/TestModel.gltf", {
      type: "application/json",
    });

    const content = await readFile(file, "text");
    expect(typeof content).toBe("string");

    const object = JSON.parse(content!); // eslint-disable-line
    expect(object.asset).toBeDefined();
  });

  it("should be able to read image as dataURL", async () => {
    const file = await getTestFile(
      "TestModel/images/roughness_metallic_0.jpg",
      { type: "image/jpeg" },
    );
    const content = await readFile(file, "dataURL");
    expect(typeof content).toBe("string");
    expect(content?.substring(0, 22)).toBe("data:image/jpeg;base64");
  });

  it("should be able to read binary as arrayBuffer", async () => {
    const file = await getTestFile("TestModel/TestModel.bin");
    const content = await readFile(file, "arrayBuffer");
    expect(content instanceof ArrayBuffer).toBe(true);
    expect(content?.byteLength).toBe(340472);
  });
});
