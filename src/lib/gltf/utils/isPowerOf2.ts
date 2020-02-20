export function isPowerOf2(n: number): boolean {
  if (typeof n !== "number") {
    throw Error("Argument is not a number");
  }
  return (n & (n - 1)) === 0;
}
