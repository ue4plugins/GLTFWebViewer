export type Field<TMeta, TValue> = TMeta & {
  defaultValue: number;
  values: TValue[];
};
