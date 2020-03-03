const accessorSizes: Record<string, number> = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16,
};

export function getAccessorTypeSize(type: string) {
  return accessorSizes[type] ?? 3;
}
