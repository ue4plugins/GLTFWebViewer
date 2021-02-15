import path from "path";
import { readFile } from "fs-extra";

export async function getTestFileBlob(
  filePath: string,
  options?: BlobPropertyBag,
) {
  const buffer = await readFile(path.join(__dirname, filePath));
  return new Blob([buffer], options);
}

export async function getTestFile(filePath: string, options?: BlobPropertyBag) {
  const blob = await getTestFileBlob(filePath, options);
  return new File([blob], path.basename(filePath));
}
