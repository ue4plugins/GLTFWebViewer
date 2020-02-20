// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function decodeBinaryUtf8(array: any) {
  if (typeof TextDecoder !== "undefined") {
    return new TextDecoder().decode(array);
  }
  let str = "";
  for (let i = 0, len = array.length; i < len; i += 1) {
    str += String.fromCharCode(array[i]);
  }
  return decodeURIComponent(escape(str));
}
