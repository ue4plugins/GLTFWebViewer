import { readFile } from "./readFile";

export async function createGltfWithBlobAssets(gltf: File, assets: File[]) {
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
    const re = new RegExp(
      `"(?:[^"]+)"\\s*:\\s*"(([^"]+[\\/\\\\])?${escapedName})",?`,
      "g",
    );
    // Do the replacement
    return gltf.replace(re, (match, g1) => match.replace(g1, assetUrlString));
  }, gltfContent);

  return new Blob([updatedGltf]);
}
