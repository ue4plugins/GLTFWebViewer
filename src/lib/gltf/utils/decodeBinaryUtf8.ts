export function decodeBinaryUtf8(array: Uint8Array) {
  /* istanbul ignore next */
  if (typeof TextDecoder !== "undefined") {
    return new TextDecoder().decode(array);
  }
  let str = "";
  for (let i = 0, len = array.length; i < len; i += 1) {
    str += String.fromCharCode(array[i]);
  }
  return decodeURIComponent(escape(str));
}
