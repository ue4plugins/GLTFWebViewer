export function hasNoUndefinedValues<T>(
  items: (T | undefined)[],
): items is T[] {
  return !items.some(item => item === undefined);
}
