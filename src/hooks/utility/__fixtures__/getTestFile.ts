import path from "path";
import fs from "fs-extra";

export async function getTestFile(filePath: string, options?: BlobPropertyBag) {
  const buffer = await fs.readFile(path.join(__dirname, filePath));
  return new Blob([buffer], options);
}
