export const removeIllegalChars = (fileName: string) =>
  fileName.replace(/([^a-z0-9]+)/gi, "");
