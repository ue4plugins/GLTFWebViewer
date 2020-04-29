import path from "path";
import { useCallback, useState } from "react";
import { useDropzone, DropzoneRootProps } from "react-dropzone";
import { GltfFile } from "../playcanvas";

function isGltfFile(file: File) {
  return !!path.extname(file.name).match(/\.(gltf|glb)$/);
}

function readFile<
  T extends "text" | "arrayBuffer" | "dataURL" | "binaryString",
  RT = T extends "text"
    ? string | null
    : T extends "dataURL"
    ? string | null
    : T extends "binaryString"
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
      case "binaryString": {
        reader.readAsBinaryString(blob);
        break;
      }
      default: {
        reader.readAsText(blob);
        break;
      }
    }
  });
}

async function createGltfWithBlobAssets(gltf: File, assets: File[]) {
  const gltfContent = await readFile(gltf, "text");
  if (!gltfContent) {
    return undefined;
  }

  const updatedGltf = assets.reduce((gltf, asset) => {
    // Extract the guid part from the created asset url
    const urlParts = URL.createObjectURL(asset).split("/");
    const assetUrlString = urlParts[urlParts.length - 1];
    // Create an expression for matching asset references in the glTF file.
    // This expression will match full JSON strings containing the asset name.
    // The reason for this is that we want to also replace the directory name
    // if the asset is not placed in the same directory as the glTF file.
    const escapedName = asset.name.replace(/\./g, "\\.");
    const re = new RegExp(`"(?:[^"]+)"\\s*:\\s*"([^"]*${escapedName})",?`, "g");
    // Do the replacement
    return gltf.replace(re, (match, g1) => match.replace(g1, assetUrlString));
  }, gltfContent);

  return new Blob([updatedGltf]);
}

export const useDropModel = (
  onDropModel: (file: GltfFile) => void,
): [
  boolean,
  boolean,
  React.Dispatch<React.SetStateAction<boolean>>,
  (props?: DropzoneRootProps) => DropzoneRootProps,
] => {
  const [hasDropError, setHasDropError] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const gltf = acceptedFiles.find(isGltfFile);
      const assets = acceptedFiles.filter(f => !isGltfFile(f));
      if (!gltf) {
        console.error(
          "The dropped file type is not supported. Drop a gltf or glb file.",
        );
        setHasDropError(true);
        return;
      }

      console.log(assets);

      const gltfBlob: Blob | undefined =
        assets.length > 0 && path.extname(gltf.name) === ".gltf"
          ? await createGltfWithBlobAssets(gltf, assets)
          : gltf;

      if (!gltfBlob) {
        console.error("The dropped file could not be opened.");
        setHasDropError(true);
        return;
      }

      setHasDropError(false);

      onDropModel({
        name: path.basename(gltf.name, path.extname(gltf.name)),
        path: URL.createObjectURL(gltfBlob),
        blobFileName: gltf.name,
      });
    },
    [onDropModel],
  );

  const { getRootProps, isDragActive } = useDropzone({ onDrop });

  return [isDragActive, hasDropError, setHasDropError, getRootProps];
};
