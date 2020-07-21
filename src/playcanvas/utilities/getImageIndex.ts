/**
 * Converts a glTF texture index to a glTF image index. This is required since
 * the textures array in pc.ContainerResource glTF images indices.
 */
export function getImageIndex(
  textureIndex: number,
  rootData: {
    textures?:
      | {
          source: number;
        }[]
      | undefined;
  },
): number | undefined {
  return rootData.textures?.[textureIndex]?.source;
}
