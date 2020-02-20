export function nearestPow2(n: number): number {
  return Math.pow(2, Math.round(Math.log(n) / Math.log(2)));
}
