export function isDataURI(uri: string) {
  return /^data:.*,.*$/i.test(uri);
}
