export function readFile<
  T extends "text" | "arrayBuffer" | "dataURL",
  RT = T extends "text" | "dataURL"
    ? string | null
    : T extends "arrayBuffer"
    ? ArrayBuffer | null
    : never
>(blob: Blob, readAs: T) {
  return new Promise<RT>((resolve, reject) => {
    const reader = new FileReader();
    reader.onabort = () => reject("File reading was aborted");
    reader.onerror = () => reject("File reading has failed");
    reader.onload = () => resolve((reader.result as unknown) as RT);
    switch (readAs) {
      case "arrayBuffer": {
        reader.readAsArrayBuffer(blob);
        break;
      }
      case "dataURL": {
        reader.readAsDataURL(blob);
        break;
      }
      default: {
        reader.readAsText(blob);
        break;
      }
    }
  });
}
