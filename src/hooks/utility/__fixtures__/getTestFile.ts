import path from "path";
import { readFile } from "fs-extra";

export async function getTestFile(filePath: string, options?: BlobPropertyBag) {
  const buffer = await readFile(path.join(__dirname, filePath));
  return new Blob([buffer], options);
}
