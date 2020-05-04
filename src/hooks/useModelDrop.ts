import path from "path";
import { useCallback, useState } from "react";
import { useDropzone, DropzoneRootProps } from "react-dropzone";
import { GltfFile } from "../playcanvas";
import { createGltfWithBlobAssets } from "./utility";

function isGltfFile(file: File) {
  return !!path.extname(file.name).match(/\.(gltf|glb)$/);
}

export const useModelDrop = (
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
